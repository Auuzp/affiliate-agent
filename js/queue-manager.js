/**
 * Smart Queue & Rate Limit Manager
 * ป้องกันการโพสต์พร้อมกัน (Simultaneous Broadcast) โดยใส่ Delay/Jitter 5-15 นาที
 * และควบคุมโควตาความถี่ต่อวัน: Telegram 5-10/วัน, X 6-8/วัน, Facebook 3-5/วัน
 */

class QueueManager {
  constructor(publisher) {
    this.publisher = publisher;

    // โควตารายวันสูงสุดตามอัลกอริทึม
    this.dailyLimits = {
      telegram: 10, // 5-10 ดีล/วัน
      twitter: 8,   // 6-8 ทวีต/วัน
      facebook: 5   // 3-5 โพสต์/วัน
    };

    // ระยะห่างขั้นต่ำระหว่างโพสต์ (มิลลิวินาที)
    this.minIntervals = {
      telegram: 45 * 60 * 1000, // 45 นาที
      twitter: 60 * 60 * 1000,  // 1 ชั่วโมง
      facebook: 120 * 60 * 1000 // 2 ชั่วโมง
    };

    this.queue = [];
    this.isProcessing = false;
    this.timer = null;
    this.onUpdateCallbacks = [];

    this.loadState();
    this.startWorker();
  }

  loadState() {
    const todayKey = this.getTodayKey();
    const storedDate = localStorage.getItem('aff_queue_date');

    if (storedDate !== todayKey) {
      // รีเซ็ตโควตารายวันเมื่อขึ้นวันใหม่
      localStorage.setItem('aff_queue_date', todayKey);
      this.counts = { telegram: 0, twitter: 0, facebook: 0 };
      this.saveCounts();
    } else {
      this.counts = {
        telegram: parseInt(localStorage.getItem('aff_count_tg') || '0', 10),
        twitter: parseInt(localStorage.getItem('aff_count_tw') || '0', 10),
        facebook: parseInt(localStorage.getItem('aff_count_fb') || '0', 10)
      };
    }
  }

  saveCounts() {
    localStorage.setItem('aff_count_tg', this.counts.telegram.toString());
    localStorage.setItem('aff_count_tw', this.counts.twitter.toString());
    localStorage.setItem('aff_count_fb', this.counts.facebook.toString());
  }

  getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  onUpdate(cb) {
    if (typeof cb === 'function') this.onUpdateCallbacks.push(cb);
  }

  emitUpdate() {
    const stats = this.getStats();
    this.onUpdateCallbacks.forEach(cb => {
      try { cb(stats); } catch (e) { console.error(e); }
    });
  }

  getStats() {
    return {
      counts: { ...this.counts },
      limits: { ...this.dailyLimits },
      pendingCount: this.queue.filter(q => q.status === 'pending').length,
      queue: this.queue.slice(0, 10)
    };
  }

  /**
   * จัดคิวหน่วงเวลาแบบ Staggered Jitter
   * Telegram ยิงทันที ➡️ X เว้น 5-10 นาที ➡️ Facebook เว้น 10-15 นาที
   */
  enqueueDeal(post) {
    const now = Date.now();
    const scheduledJobs = [];

    const pendingTg = this.queue.filter(q => q.platform === 'telegram' && (q.status === 'pending' || q.status === 'processing')).length;
    const pendingTw = this.queue.filter(q => q.platform === 'twitter' && (q.status === 'pending' || q.status === 'processing')).length;
    const pendingFb = this.queue.filter(q => q.platform === 'facebook' && (q.status === 'pending' || q.status === 'processing')).length;

    // 1. Telegram: ส่งทันที (หากผลรวมเสร็จแล้ว + รอดำเนินการ ยังไม่เกินโควตา)
    if (this.publisher.telegram.enabled && (this.counts.telegram + pendingTg) < this.dailyLimits.telegram) {
      const tgJob = {
        id: 'job_tg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        platform: 'telegram',
        post: post,
        dealTitle: post.deal.title,
        scheduledAt: now,
        status: 'pending'
      };
      this.queue.push(tgJob);
      scheduledJobs.push(tgJob);
    }

    // 2. X (Twitter): หน่วงเวลาแบบสุ่ม 5-10 นาที
    if (this.publisher.twitter.enabled && (this.counts.twitter + pendingTw) < this.dailyLimits.twitter) {
      const xJitterMs = (5 + Math.floor(Math.random() * 6)) * 60 * 1000; // 5-10 นาที
      const xJob = {
        id: 'job_tw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        platform: 'twitter',
        post: post,
        dealTitle: post.deal.title,
        scheduledAt: now + xJitterMs,
        status: 'pending'
      };
      this.queue.push(xJob);
      scheduledJobs.push(xJob);
    }

    // 3. Facebook Page: หน่วงเวลาสุ่ม 12-18 นาที
    if (this.facebookEnabled() && (this.counts.facebook + pendingFb) < this.dailyLimits.facebook) {
      const fbJitterMs = (12 + Math.floor(Math.random() * 7)) * 60 * 1000; // 12-18 นาที
      const fbJob = {
        id: 'job_fb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        platform: 'facebook',
        post: post,
        dealTitle: post.deal.title,
        scheduledAt: now + fbJitterMs,
        status: 'pending'
      };
      this.queue.push(fbJob);
      scheduledJobs.push(fbJob);
    }

    this.emitUpdate();
    return scheduledJobs;
  }

  facebookEnabled() {
    return this.publisher.facebook.enabled && this.publisher.facebook.pageId && this.publisher.facebook.accessToken;
  }

  startWorker() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.processQueue();
    }, 5000); // ตรวจคิวทุก 5 วินาที
  }

  /**
   * ตัวประมวลผลคิวเมื่อถึงเวลา
   */
  async processQueue() {
    if (this.isProcessing) return;
    const now = Date.now();

    const readyJob = this.queue.find(q => q.status === 'pending' && q.scheduledAt <= now);
    if (!readyJob) {
      this.emitUpdate();
      return;
    }

    this.isProcessing = true;
    readyJob.status = 'processing';

    try {
      if (readyJob.platform === 'telegram') {
        const tgData = readyJob.post.telegram || {
          caption: readyJob.post.caption,
          imageUrl: readyJob.post.deal.imageUrl,
          buttonText: '👉 สั่งซื้อตรงนี้',
          buttonUrl: readyJob.post.affiliateUrl
        };
        await this.publisher.sendToTelegram(tgData.caption, tgData.imageUrl, tgData.buttonText, tgData.buttonUrl);
        this.counts.telegram++;
        readyJob.status = 'completed';
        readyJob.completedAt = new Date().toLocaleTimeString('th-TH');
      } else if (readyJob.platform === 'twitter') {
        const xData = readyJob.post.twitter || {
          mainTweet: (readyJob.post.caption || '').slice(0, 220),
          imageUrl: readyJob.post.deal.imageUrl,
          threadReply: 'พิกัดร้านแท้ 👉 ' + readyJob.post.affiliateUrl
        };
        await this.publisher.sendToTwitter(xData.mainTweet, xData.imageUrl, xData.threadReply);
        this.counts.twitter++;
        readyJob.status = 'completed';
        readyJob.completedAt = new Date().toLocaleTimeString('th-TH');
      } else if (readyJob.platform === 'facebook') {
        const fbData = readyJob.post.facebook || {
          caption: readyJob.post.caption,
          imageUrl: readyJob.post.deal.imageUrl,
          firstComment: '🛒 พิกัดร้านแท้ 👉 ' + readyJob.post.affiliateUrl
        };
        await this.publisher.sendToFacebookPage(fbData.caption, fbData.imageUrl, fbData.firstComment);
        this.counts.facebook++;
        readyJob.status = 'completed';
        readyJob.completedAt = new Date().toLocaleTimeString('th-TH');
      }
      this.saveCounts();
    } catch (err) {
      console.warn(`[Queue Worker] Failed to send job ${readyJob.id}:`, err);
      readyJob.status = 'failed';
      readyJob.error = err.message;
    } finally {
      this.isProcessing = false;
      this.emitUpdate();
    }
  }

  /**
   * ส่งคิวทั้งหมดทันที (Flush Queue) สำหรับกรณีที่ผู้ใช้ต้องการบังคับส่ง
   */
  async flushNow() {
    const now = Date.now();
    this.queue.forEach(q => {
      if (q.status === 'pending') {
        q.scheduledAt = now - 1000;
      }
    });
    await this.processQueue();
  }

  /**
   * เคลียร์คิวที่ค้างอยู่
   */
  clearQueue() {
    this.queue = [];
    this.emitUpdate();
  }
}

window.QueueManager = QueueManager;
