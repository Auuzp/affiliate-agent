/**
 * ==============================================================================
 * Smart Queue & 24/7 Staggered Jitter Worker
 * Handles Rate Limits, Anti-Spam Jitter, and Golden Hour Cron Jobs
 * ==============================================================================
 */

const cron = require('node-cron');
const socialPublisher = require('./social-publisher');
const geminiAI = require('./gemini-ai');
const shopeeGraphQL = require('./shopee-graphql');
const { SHOP_OFFERS_DATABASE } = require('../js/deals-db');
const { SHOPEE_PRODUCT_OFFERS } = require('../js/product-offers-db');

class QueueWorkerService {
  constructor() {
    this.queue = [];
    this.isWorkerRunning = false;
    this.workerInterval = null;
    this.dealRotationIndex = 0;

    // โควตาสูงสุดรายวัน
    this.dailyLimits = {
      telegram: 10,
      twitter: 8,
      facebook: 5
    };

    this.dailyCounts = {
      telegram: 0,
      twitter: 0,
      facebook: 0,
      date: new Date().toDateString()
    };

    this.initCronJobs();
    this.startWorker();
  }

  resetDailyCountersIfNeeded() {
    const today = new Date().toDateString();
    if (this.dailyCounts.date !== today) {
      this.dailyCounts = {
        telegram: 0,
        twitter: 0,
        facebook: 0,
        date: today
      };
      console.log('[QueueWorker] Daily counters reset for new day:', today);
    }
  }

  /**
   * เพิ่มดีลเข้าคิว Staggered Jitter (Telegram ทันที ➡️ X 5-10m ➡️ FB 12-18m)
   */
  enqueueDeal(post) {
    this.resetDailyCountersIfNeeded();
    const now = Date.now();
    const jobsCreated = [];

    const pendingTg = this.queue.filter(j => j.platform === 'telegram' && j.status === 'pending').length;
    const pendingTw = this.queue.filter(j => j.platform === 'twitter' && j.status === 'pending').length;
    const pendingFb = this.queue.filter(j => j.platform === 'facebook' && j.status === 'pending').length;

    // 1. Telegram Job (ยิงทันทีเพื่อจับลูกค้าเรียลไทม์)
    if ((this.dailyCounts.telegram + pendingTg) < this.dailyLimits.telegram) {
      const tgJob = {
        id: `job-tg-${now}`,
        platform: 'telegram',
        post: post,
        scheduledAt: now,
        status: 'pending'
      };
      this.queue.push(tgJob);
      jobsCreated.push(tgJob);
    } else {
      console.warn('[QueueWorker] Telegram daily quota reached');
    }

    // 2. Twitter / X Job (หน่วงเบาๆ 5 - 10 วินาที)
    if ((this.dailyCounts.twitter + pendingTw) < this.dailyLimits.twitter) {
      const twitterJitterMs = (5 + Math.floor(Math.random() * 5)) * 1000;
      const twJob = {
        id: `job-tw-${now}`,
        platform: 'twitter',
        post: post,
        scheduledAt: now + twitterJitterMs,
        status: 'pending'
      };
      this.queue.push(twJob);
      jobsCreated.push(twJob);
    }

    // 3. Facebook Page Job (หน่วงเบาๆ 15 - 30 วินาที ไม่ต้องรอนาน)
    if ((this.dailyCounts.facebook + pendingFb) < this.dailyLimits.facebook) {
      const fbJitterMs = (15 + Math.floor(Math.random() * 15)) * 1000;
      const fbJob = {
        id: `job-fb-${now}`,
        platform: 'facebook',
        post: post,
        scheduledAt: now + fbJitterMs,
        status: 'pending'
      };
      this.queue.push(fbJob);
      jobsCreated.push(fbJob);
    }

    console.log(`[QueueWorker] Enqueued ${jobsCreated.length} jobs for "${post.deal.title.slice(0, 30)}..."`);
    return jobsCreated;
  }

  startWorker() {
    if (this.isWorkerRunning) return;
    this.isWorkerRunning = true;

    // รันตรวจเช็กคิวทุกๆ 5 วินาที
    this.workerInterval = setInterval(() => {
      this.processQueue();
    }, 5000);

    console.log('[QueueWorker] Background queue worker active 24/7');
  }

  async processQueue() {
    if (this.queue.length === 0) return;

    const now = Date.now();
    const readyJobs = this.queue.filter(j => j.status === 'pending' && j.scheduledAt <= now);

    for (const job of readyJobs) {
      job.status = 'processing';
      try {
        console.log(`[QueueWorker] Executing job ${job.id} on ${job.platform.toUpperCase()}...`);
        const result = await socialPublisher.broadcastSinglePost(job.platform, job.post);

        job.status = result.success ? 'completed' : 'failed';
        if (result.success) {
          this.dailyCounts[job.platform]++;
        }
      } catch (err) {
        console.error(`[QueueWorker] Job ${job.id} failed:`, err.message);
        job.status = 'failed';
      }
    }

    // เก็บเฉพาะคิวที่ยัง pending หรือเพิ่งเสร็จไม่นาน
    this.queue = this.queue.filter(j => j.status === 'pending');
  }

  flushQueueNow() {
    const pending = this.queue.filter(j => j.status === 'pending');
    pending.forEach(j => {
      j.scheduledAt = Date.now();
    });
    this.processQueue();
    return { flushedCount: pending.length };
  }

  clearQueue() {
    const count = this.queue.length;
    this.queue = [];
    return { clearedCount: count };
  }

  getStats() {
    this.resetDailyCountersIfNeeded();
    return {
      pendingJobs: this.queue.filter(j => j.status === 'pending').length,
      queueList: this.queue.map(j => ({
        id: j.id,
        platform: j.platform,
        dealTitle: j.post.deal.title,
        scheduledInSec: Math.max(0, Math.round((j.scheduledAt - Date.now()) / 1000)),
        subId: j.post[j.platform]?.subId
      })),
      dailyUsage: { ...this.dailyCounts },
      dailyLimits: { ...this.dailyLimits }
    };
  }

  /**
   * ระบบ Cron อัตโนมัติ 24 ชม. ฝั่ง Backend (ไม่ต้องเปิดบราวเซอร์ทิ้งไว้)
   */
  initCronJobs() {
    this.dealRotationIndex = 0;

    // 1. รอบดึก 23:55 น. (ดักโค้ดลดเที่ยงคืน & Double Day / Payday)
    cron.schedule('55 23 * * *', () => {
      console.log('⏰ [Cron 24/7 Backend] 23:55 น. ทริกเกอร์รอบโค้ดลดเที่ยงคืน & Double Day');
      this.triggerAutonomousDealPublish('midnight_2355');
    });

    // 2. รอบพักเที่ยง 11:50 น. (Flash Sale รอบเที่ยง 12:00)
    cron.schedule('50 11 * * *', () => {
      console.log('🍱 [Cron 24/7 Backend] 11:50 น. ทริกเกอร์รอบพักเที่ยง Flash Sale 12:00');
      this.triggerAutonomousDealPublish('lunch_1150');
    });

    // 3. รอบบ่าย 15:30 น. (Flash Sale รอบบ่าย)
    cron.schedule('30 15 * * *', () => {
      console.log('☕ [Cron 24/7 Backend] 15:30 น. ทริกเกอร์รอบพักเบรกบ่าย');
      this.triggerAutonomousDealPublish('afternoon_1530');
    });

    // 4. รอบหัวค่ำ 20:00 น. (ดีลนาทีทองพักผ่อนหลังเลิกงาน)
    cron.schedule('00 20 * * *', () => {
      console.log('✨ [Cron 24/7 Backend] 20:00 น. ทริกเกอร์รอบนาทีทองหัวค่ำ');
      this.triggerAutonomousDealPublish('evening_2000');
    });

    console.log('[QueueWorker] 24/7 Autonomous Backend Cron initialized (23:55, 11:50, 15:30, 20:00)');
  }

  async triggerAutonomousDealPublish(period) {
    try {
      const allDeals = [
        ...(SHOP_OFFERS_DATABASE || []),
        ...(SHOPEE_PRODUCT_OFFERS || [])
      ];
      if (allDeals.length === 0) return;

      // หมุนเวียนเลือกดีลตัวท็อปในคลังโดยอัตโนมัติ
      const deal = allDeals[this.dealRotationIndex % allDeals.length];
      this.dealRotationIndex++;

      const defaultUrl = deal.defaultUrl || deal.offerUrl || 'https://shopee.co.th';

      // สร้าง Short Links แยก Sub-ID อัตโนมัติสำหรับรอบเวลานี้
      const [tgLink, fbLink, xLink] = await Promise.all([
        shopeeGraphQL.generateShortLink(defaultUrl, [`tg_${period}`]),
        shopeeGraphQL.generateShortLink(defaultUrl, [`fb_${period}`]),
        shopeeGraphQL.generateShortLink(defaultUrl, [`x_${period}`])
      ]);

      const urls = {
        tg: tgLink.shortLink || tgLink.deepLinkUrl,
        fb: fbLink.shortLink || fbLink.deepLinkUrl,
        x: xLink.shortLink || xLink.deepLinkUrl
      };

      // AI Copywriting
      const postPayload = await geminiAI.generateMultiPlatformPost(deal, urls);

      // นำเข้าคิวหน่วงเวลา Staggered Jitter Queue บนเซิร์ฟเวอร์
      const jobs = this.enqueueDeal(postPayload);
      console.log(`[QueueWorker 24/7 Autonomous] Enqueued ${jobs.length} jobs for deal "${deal.title.slice(0, 30)}..." (${period})`);

    } catch (err) {
      console.error('[QueueWorker Autonomous Error]:', err.message);
    }
  }
}

module.exports = new QueueWorkerService();
