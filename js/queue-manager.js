/**
 * Smart Queue & Rate Limit Manager
 * ป้องกันการโพสต์พร้อมกัน (Simultaneous Broadcast) โดยใส่ Delay/Jitter 5-15 นาที
 * และควบคุมโควตาความถี่ต่อวัน: Telegram 5-10/วัน, X 6-8/วัน, Facebook 3-5/วัน
 */

class QueueManager {
  constructor(publisher) {
    this.publisher = publisher;

    // โควตารายวันเริ่มต้น (จะถูก sync กับค่าจริงบน Server)
    this.dailyLimits = {
      telegram: 10,
      twitter: 8,
      facebook: 5
    };

    this.counts = {
      telegram: 0,
      twitter: 0,
      facebook: 0
    };

    this.queue = [];
    this.timer = null;
    this.onUpdateCallbacks = [];

    // ล้างค่าเก่าที่เคยเก็บใน localStorage ออกเพื่อความปลอดภัยและความถูกต้อง
    localStorage.removeItem('aff_queue_date');
    localStorage.removeItem('aff_count_tg');
    localStorage.removeItem('aff_count_tw');
    localStorage.removeItem('aff_count_fb');

    this.startStatsSync();
  }

  /**
   * ตัวช่วยต่อท้ายข้อความเปิดเผย Affiliate Disclosure (#ad) ป้องกันการลบออก
   */
  ensureAffiliateDisclosure(text, maxLength = null) {
    const disclosure = '#ad มีค่าคอมมิชชันจากการซื้อผ่านลิงก์นี้';
    let str = (text || '').trim();
    if (!str.includes('#ad')) {
      const suffix = '\n\n' + disclosure;
      if (maxLength && (str.length + suffix.length) > maxLength) {
        str = str.slice(0, maxLength - suffix.length - 3) + '...' + suffix;
      } else {
        str = str + suffix;
      }
    }
    return str;
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
      pendingCount: this.queue.length,
      queue: this.queue.slice(0, 10)
    };
  }

  /**
   * เริ่มรอบดึงข้อมูลคิวและโควตาจาก Node.js Server แบบเรียลไทม์
   */
  startStatsSync() {
    if (this.timer) clearInterval(this.timer);
    this.syncServerStats();
    this.timer = setInterval(() => {
      this.syncServerStats();
    }, 5000); // ซิงก์สถานะคิวทุก 5 วินาที
  }

  /**
   * ดึงสถานะคิวและการใช้งานโควตาจาก Server
   */
  async syncServerStats() {
    try {
      const res = await fetch('/api/queue/stats');
      if (!res.ok) return;
      const data = await res.json();

      if (data.dailyUsage) {
        this.counts = {
          telegram: data.dailyUsage.telegram || 0,
          twitter: data.dailyUsage.twitter || 0,
          facebook: data.dailyUsage.facebook || 0
        };
      }

      if (data.dailyLimits) {
        this.dailyLimits = { ...data.dailyLimits };
      }

      if (Array.isArray(data.queueList)) {
        this.queue = data.queueList.map(j => ({
          id: j.id,
          platform: j.platform,
          dealTitle: j.dealTitle,
          status: 'pending',
          scheduledAt: Date.now() + (j.scheduledInSec * 1000)
        }));
      }

      this.emitUpdate();
    } catch (e) {
      // Backend offline หรือกำลังเชื่อมต่อ
    }
  }

  /**
   * ส่งดีลเข้าคิว Staggered Jitter บน Server (รัน 24 ชม. แม้ปิด Browser)
   * บังคับแนบ Affiliate Disclosure (#ad) ในทุกแพลตฟอร์ม
   */
  async enqueueDeal(post) {
    if (!post || !post.deal) return [];

    // บังคับแนบ Affiliate Disclosure ก่อนส่งเข้าคิวเสมอ
    const securePost = { ...post };

    if (securePost.telegram) {
      securePost.telegram.caption = this.ensureAffiliateDisclosure(securePost.telegram.caption, 1020);
    }
    if (securePost.facebook) {
      securePost.facebook.caption = this.ensureAffiliateDisclosure(securePost.facebook.caption);
    }
    if (securePost.twitter) {
      securePost.twitter.mainTweet = this.ensureAffiliateDisclosure(securePost.twitter.mainTweet, 280);
    }
    if (securePost.caption) {
      securePost.caption = this.ensureAffiliateDisclosure(securePost.caption);
    }

    try {
      const res = await fetch('/api/queue/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: securePost })
      });

      if (res.ok) {
        const data = await res.json();
        await this.syncServerStats();
        return data.jobs || [];
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn('[QueueManager] Enqueue failed on server:', errData.error);
      }
    } catch (e) {
      console.warn('[QueueManager] Server connection error on enqueue:', e.message);
    }

    return [];
  }

  /**
   * สั่งให้ Server ยิงคิวทั้งหมดทันที (Flush Queue)
   */
  async flushNow() {
    try {
      const res = await fetch('/api/queue/flush', { method: 'POST' });
      if (res.ok) {
        await this.syncServerStats();
      }
    } catch (e) {
      console.warn('[QueueManager] Flush failed:', e);
    }
  }

  /**
   * สั่งล้างคิวบน Server
   */
  async clearQueue() {
    try {
      const res = await fetch('/api/queue/clear', { method: 'POST' });
      if (res.ok) {
        await this.syncServerStats();
      }
    } catch (e) {
      console.warn('[QueueManager] Clear failed:', e);
    }
  }
}

window.QueueManager = QueueManager;
