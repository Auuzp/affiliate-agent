/**
 * ==============================================================================
 * Smart Queue & 24/7 Staggered Jitter Worker
 * Handles Rate Limits, Anti-Spam Jitter, and Golden Hour Cron Jobs
 * ==============================================================================
 */

const cron = require('node-cron');
const socialPublisher = require('./social-publisher');

class QueueWorkerService {
  constructor() {
    this.queue = [];
    this.isWorkerRunning = false;
    this.workerInterval = null;

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

    // 1. Telegram Job (ยิงทันทีเพื่อจับลูกค้าเรียลไทม์)
    if (this.dailyCounts.telegram < this.dailyLimits.telegram) {
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
    if (this.dailyCounts.twitter < this.dailyLimits.twitter) {
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
    if (this.dailyCounts.facebook < this.dailyLimits.facebook) {
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
   * ระบบ Cron 3 เวลาทองคำ (23:55, 11:50, 20:00)
   */
  initCronJobs() {
    // 1. รอบดึก 23:55 น. (ดักโค้ดลดเที่ยงคืน)
    cron.schedule('55 23 * * *', () => {
      console.log('⏰ [Cron Golden Hour] 23:55 น. ทริกเกอร์รอบโค้ดลดเที่ยงคืน & Double Day / Payday');
      this.triggerGoldenHourPush('midnight_2355');
    });

    // 2. รอบพักเที่ยง 11:50 น. (Flash Sale รอบเที่ยง)
    cron.schedule('50 11 * * *', () => {
      console.log('🍱 [Cron Golden Hour] 11:50 น. ทริกเกอร์รอบพักเที่ยง Flash Sale 12:00');
      this.triggerGoldenHourPush('lunch_1150');
    });

    // 3. รอบหัวค่ำ 20:00 น. (ดีลนาทีทองพักผ่อน)
    cron.schedule('00 20 * * *', () => {
      console.log('✨ [Cron Golden Hour] 20:00 น. ทริกเกอร์รอบนาทีทองหัวค่ำ');
      this.triggerGoldenHourPush('evening_2000');
    });

    console.log('[QueueWorker] 3 Golden Hours Cron Jobs initialized (23:55, 11:50, 20:00)');
  }

  async triggerGoldenHourPush(period) {
    const titles = {
      midnight_2355: '⏰ อีก 5 นาที! โค้ดลดเที่ยงคืน & Double Day เริ่มปล่อยแล้ว',
      lunch_1150: '🍱 พักเที่ยงนี้ช้อปคุ้ม! Flash Sale 12:00 น. เริ่มแล้ว',
      evening_2000: '✨ ดีลเด็ดนาทีทองหัวค่ำ ลดสูงสุด 80% ปิดรอบวันนี้'
    };

    const caption = `${titles[period] || '🔥 ดีลเด็ด Shopee'}\n\nใครกำลังรอกดของในตะกร้า เตรียมตัวเลยครับ Shopee แจกโค้ดลดสูงสุด 50% และโค้ดส่งฟรีไม่อั้น!\n\n👇 พิกัดกดเก็บโค้ดลดพิเศษและดีลลับ แปะไว้ให้ใน "คอมเมนต์แรก" เรียบร้อยครับ จิ้มด่วนก่อนโค้ดหมด!`;
    const comment = `🛒 พิกัดกดรับโค้ดและช้อปร้านแท้ตรงนี้ครับ 👉 https://shopee.co.th?sub1=fb_page_${period}\n\n#ShopeeAffiliate #คอมมิชชั่น (ได้รับค่าตอบแทนเมื่อสั่งซื้อผ่านลิงก์)`;
    const bannerUrl = 'https://down-th.img.susercontent.com/file/th-11134207-7ras9-m3zrfvaxfop6d8.jpg';

    // 1. ส่งเข้า Telegram
    await socialPublisher.sendToTelegram(
      caption,
      bannerUrl,
      '👉 เก็บโค้ดลดตรงนี้',
      `https://shopee.co.th?sub1=tg_${period}`
    );

    // 2. ส่งเข้า Facebook Page อัตโนมัติ (ผ่าน Make.com Relay)
    await socialPublisher.sendToFacebookPage(caption, bannerUrl, comment);
    console.log(`[QueueWorker] Golden hour ${period} dispatched to Telegram & Facebook Page`);
  }
}

module.exports = new QueueWorkerService();
