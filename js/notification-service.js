/**
 * Push Notification & Golden Hours Automation Service
 * ระบบแจ้งเตือนดึงคนกลับมาช้อปใน 3 ช่วงเวลาทอง (23:55, 11:50, 20:00)
 * พร้อม Deep Link เด้งเข้าแอป Shopee ทันที และบรอดแคสต์เข้า Telegram
 */

class NotificationService {
  constructor(agent, publisher) {
    this.agent = agent;
    this.publisher = publisher;

    this.isEnabled = localStorage.getItem('aff_push_enabled') !== 'false'; // default on
    this.broadcastTg = localStorage.getItem('aff_push_tg_broadcast') !== 'false'; // default on
    this.soundEnabled = localStorage.getItem('aff_push_sound') !== 'false';
    this.permission = ('Notification' in window) ? Notification.permission : 'unsupported';
    
    this.timerInterval = null;
    this.lastTriggeredDateHour = ''; // ป้องกันส่งซ้ำในนาทีเดียวกัน

    // กำหนด 3 ช่วงเวลาทอง (Golden Hours)
    this.goldenHours = [
      {
        id: 'midnight_code',
        timeStr: '23:55',
        hour: 23,
        minute: 55,
        title: '⏰ อีก 5 นาที! โค้ดลดเที่ยงคืน & Double Day / Payday เริ่มปล่อยแล้ว',
        body: 'เตรียมกดโค้ดลด 50%, โค้ดส่งฟรี 0.- และ Flash Sale ลดฟ้าผ่า 90% ก่อนโค้ดหมด! แตะเพื่อเปิดแอป Shopee ทันที',
        subId: 'push_midnight_2355',
        defaultUrl: 'https://shopee.co.th/m/mid-month-sale',
        icon: 'https://cf.shopee.co.th/file/th-50009109-847ef2542a172782b7b5e40dae3bbaee_xhdpi',
        tag: 'shopee_midnight_2355'
      },
      {
        id: 'lunch_flash',
        timeStr: '11:50',
        hour: 11,
        minute: 50,
        title: '🍱 เที่ยงนี้กินข้าวแล้วมาช้อป! Flash Sale 12:00 น. เริ่มแล้ว',
        body: 'โค้ดส่งฟรีรอบเที่ยงวัน + ขบวนดีลอาหาร ขนม ของใช้ลดราคาพิเศษประจำวัน แตะเปิดแอป Shopee เพื่อดูดีล',
        subId: 'push_lunch_1150',
        defaultUrl: 'https://shopee.co.th/flash_sale',
        icon: 'https://cf.shopee.co.th/file/th-50009109-b1d5d2b7c4d51cb4eeec28646b9be20d_xhdpi',
        tag: 'shopee_lunch_1150'
      },
      {
        id: 'evening_deals',
        timeStr: '20:00',
        hour: 20,
        minute: 0,
        title: '✨ พักผ่อนหัวค่ำกับดีลเด็ดนาทีทอง (Golden Hour 20:00)',
        body: 'ส่องไอเทมยอดฮิตลดราคาพิเศษประจำค่ำคืนนี้ สินค้าแบรนด์แท้ลดสูงสุด 80% คืนนี้เท่านั้น! แตะเพื่อช้อป',
        subId: 'push_evening_2000',
        defaultUrl: 'https://shopee.co.th',
        icon: 'https://cf.shopee.co.th/file/th-50009109-847ef2542a172782b7b5e40dae3bbaee_xhdpi',
        tag: 'shopee_evening_2000'
      }
    ];

    this.onTickCallbacks = [];
    this.onNotificationCallbacks = [];

    this.init();
  }

  init() {
    this.startClock();
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      alert('เบราว์เซอร์นี้ไม่รองรับ Web Notifications');
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  setEnabled(enabled) {
    this.isEnabled = Boolean(enabled);
    localStorage.setItem('aff_push_enabled', this.isEnabled ? 'true' : 'false');
  }

  setTelegramBroadcast(enabled) {
    this.broadcastTg = Boolean(enabled);
    localStorage.setItem('aff_push_tg_broadcast', this.broadcastTg ? 'true' : 'false');
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = Boolean(enabled);
    localStorage.setItem('aff_push_sound', this.soundEnabled ? 'true' : 'false');
  }

  onTick(cb) {
    if (typeof cb === 'function') this.onTickCallbacks.push(cb);
  }

  onNotification(cb) {
    if (typeof cb === 'function') this.onNotificationCallbacks.push(cb);
  }

  startClock() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    // ตรวจสอบทุก 10 วินาที
    this.timerInterval = setInterval(() => {
      this.checkScheduledHours();
      this.emitTick();
    }, 10000);

    this.emitTick();
  }

  emitTick() {
    const nextInfo = this.getNextGoldenHour();
    this.onTickCallbacks.forEach(cb => {
      try { cb(nextInfo); } catch (e) { console.error(e); }
    });
  }

  /**
   * ตรวจสอบว่าถึง 1 ใน 3 ช่วงเวลาทองหรือไม่
   */
  checkScheduledHours() {
    if (!this.isEnabled) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const dateKey = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}_${currentHour}:${currentMinute}`;

    if (this.lastTriggeredDateHour === dateKey) return;

    for (const gh of this.goldenHours) {
      if (currentHour === gh.hour && currentMinute === gh.minute) {
        this.lastTriggeredDateHour = dateKey;
        this.triggerGoldenHourAlert(gh);
        break;
      }
    }
  }

  /**
   * คำนวณเวลาที่เหลือก่อนถึง Golden Hour ถัดไป
   */
  getNextGoldenHour() {
    const now = new Date();
    let minDiffMs = Infinity;
    let nextGh = null;

    for (const gh of this.goldenHours) {
      const target = new Date();
      target.setHours(gh.hour, gh.minute, 0, 0);
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
      const diff = target - now;
      if (diff < minDiffMs) {
        minDiffMs = diff;
        nextGh = { ...gh, targetDate: target };
      }
    }

    if (!nextGh) return null;

    const totalSec = Math.floor(minDiffMs / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    return {
      next: nextGh,
      remainingText: `${hours} ชม. ${minutes} นาที ${seconds} วิ`,
      hours,
      minutes,
      seconds
    };
  }

  /**
   * ส่งเสียงแจ้งเตือนอย่างไพเราะผ่าน Web Audio API (ไม่ต้องโหลดไฟล์ภายนอก)
   */
  playNotificationSound() {
    if (!this.soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Double chime sound
      playTone(587.33, 0, 0.2); // D5
      playTone(880.00, 0.15, 0.35); // A5
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * ยิงการแจ้งเตือน Golden Hour (ทั้ง Browser Push และ Telegram Broadcast)
   */
  async triggerGoldenHourAlert(gh, isTest = false) {
    // คัดเลือกดีลตัวท็อปในคลังเพื่อใช้รูปภาพสินค้าความละเอียดสูงและลิงก์จริง
    const topDeals = (typeof window !== 'undefined' && window.TRENDING_DEALS_DATABASE) ? window.TRENDING_DEALS_DATABASE : [];
    const featuredDeal = topDeals.length > 0 ? topDeals[Math.floor(Math.random() * Math.min(topDeals.length, 6))] : null;

    const productImageUrl = (featuredDeal && featuredDeal.imageUrl) ? featuredDeal.imageUrl : gh.icon;
    const itemUrl = (featuredDeal && (featuredDeal.defaultUrl || featuredDeal.offerUrl)) ? (featuredDeal.defaultUrl || featuredDeal.offerUrl) : gh.defaultUrl;

    const linkData = this.agent ? this.agent.generateDeepLink(itemUrl, gh.subId) : null;
    const targetUrl = linkData ? linkData.affiliateUrl : itemUrl;
    const deepLink = linkData ? linkData.deepLink : `shopeeth://open?url=${encodeURIComponent(targetUrl)}`;
    const bridgeUrl = linkData ? linkData.bridgeUrl : targetUrl;

    // 1. เล่นเสียงแจ้งเตือน
    this.playNotificationSound();

    // 2. ส่ง Web Notification (หากมีสิทธิ์)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(gh.title, {
          body: gh.body,
          icon: productImageUrl,
          tag: gh.tag,
          requireInteraction: true,
          data: {
            url: bridgeUrl,
            deepLink: deepLink
          }
        });

        notif.onclick = function(event) {
          event.preventDefault();
          window.focus();
          window.open(bridgeUrl, '_blank');
          notif.close();
        };
      } catch (err) {
        console.warn('Notification display failed:', err);
      }
    }

    // 3. ส่งเข้า Telegram Channel อัตโนมัติ (หากเปิดใช้งาน)
    let tgSent = false;
    if (this.broadcastTg && this.publisher && this.publisher.telegram.enabled && this.publisher.telegram.botToken) {
      try {
        const dealHighlight = featuredDeal ? `\n\n🛍️ ดีลพิเศษประจำรอบ: "${featuredDeal.title.slice(0, 50)}..." ลดเหลือ ฿${featuredDeal.salePrice?.toLocaleString()}.-` : '';
        const tgCaption = `⚡ ${gh.title}\n\n${gh.body}${dealHighlight}\n\n🛒 สั่งซื้อ/เก็บโค้ดเปิดในแอป Shopee ทันที 👉 ${targetUrl}`;
        const buttonText = featuredDeal ? `👉 สั่งซื้อร้านแท้ (฿${featuredDeal.salePrice?.toLocaleString()}.-)` : '👉 แตะรับโค้ด & ช้อปด่วน';
        await this.publisher.sendToTelegram(tgCaption, productImageUrl, buttonText, targetUrl);
        tgSent = true;
      } catch (tgErr) {
        console.warn('Failed to broadcast Golden Hour to Telegram:', tgErr);
      }
    }

    // 4. แจ้งเตือน Callback UI
    const eventData = {
      goldenHour: gh,
      isTest,
      timestamp: new Date().toLocaleTimeString('th-TH'),
      targetUrl,
      deepLink,
      subId: gh.subId,
      tgSent
    };

    this.onNotificationCallbacks.forEach(cb => {
      try { cb(eventData); } catch (e) { console.error(e); }
    });

    return eventData;
  }
}

window.NotificationService = NotificationService;
