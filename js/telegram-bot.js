/**
 * Telegram Interactive Deal Finder & Auto-Reply Bot Engine
 * ระบบบอทตอบแชตอัตโนมัติ 24 ชม. เมื่อมีผู้ใช้สอบถามหาสินค้าใน Telegram
 * ค้นหาและส่งภาพจริง Shopee CDN + ราคาพิเศษ + ลิงก์รับเงิน Shopee Affiliate ทันที
 */

class TelegramDealBot {
  constructor(agent, publisher) {
    this.agent = agent;
    this.publisher = publisher;
    this.isPolling = false;
    this.pollingTimer = null;
    this.lastOffset = parseInt(localStorage.getItem('aff_tg_last_offset') || '0', 10);
    this.onInquiryCallback = null;
    this.botToken = localStorage.getItem('aff_tg_bot_token') || '';
    this.channelId = localStorage.getItem('aff_tg_channel_id') || '';
  }

  setCredentials(token, channelId) {
    this.botToken = (token || '').trim();
    this.channelId = (channelId || '').trim();
  }

  setInquiryListener(callback) {
    this.onInquiryCallback = callback;
  }

  /**
   * เริ่มต้นการทำงานของบอทรับข้อความ (Polling Mode)
   */
  start() {
    if (this.isPolling) return;
    this.botToken = localStorage.getItem('aff_tg_bot_token') || this.botToken;
    if (!this.botToken) {
      throw new Error('กรุณาระบุ Telegram Bot Token ในหน้าตั้งค่าก่อนเปิดใช้งานบอท');
    }

    this.isPolling = true;
    this.pollUpdates();
  }

  /**
   * หยุดการทำงานของบอท
   */
  stop() {
    this.isPolling = false;
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /**
   * ดึงข้อความอัปเดตจาก Telegram Bot API (getUpdates)
   */
  async pollUpdates() {
    if (!this.isPolling || !this.botToken) return;

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${this.lastOffset}&limit=20&timeout=8`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
          for (const update of data.result) {
            // อัปเดต offset เพื่อไม่ให้ประมวลผลข้อความซ้ำ
            this.lastOffset = update.update_id + 1;
            localStorage.setItem('aff_tg_last_offset', this.lastOffset.toString());

            // ตรวจสอบว่าเป็นข้อความแชต
            const message = update.message || update.channel_post;
            if (message && message.text) {
              await this.handleIncomingMessage(message);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[TelegramBot] Polling connection notice:', err.message);
    }

    // ทำงานรอบถัดไป
    if (this.isPolling) {
      this.pollingTimer = setTimeout(() => this.pollUpdates(), 1500);
    }
  }

  /**
   * ประมวลผลข้อความที่ได้รับ และส่งลิงก์สินค้าตอบกลับทันที
   */
  async handleIncomingMessage(message) {
    const rawText = (message.text || '').trim();
    const chatId = message.chat.id;
    const sender = message.from?.first_name || message.chat.title || 'เพื่อนสมาชิก';
    const isBot = message.from?.is_bot || false;

    // ข้ามข้อความที่บอทส่งเอง
    if (isBot) return;

    console.log(`[TelegramBot] รับข้อความจาก ${sender}: "${rawText}"`);

    // 1. ตรวจสอบคำสั่งทักทาย หรือเริ่มต้น
    if (rawText === '/start' || rawText === '/help') {
      const welcomeMsg = `👋 สวัสดีครับคุณ ${sender}! ผม "น้องดีลลี่ (Dealy)" ผู้ช่วยช้อปปิ้งส่วนตัวและดีลเด็ด Shopee ครับ ✨\n\n🔎 คุณกำลังมองหาสินค้าอะไร หรืออยากได้คำแนะนำแบบไหน พิมพ์คุยกับน้องดีลลี่ได้เลยครับ เช่น:\n• "พาวเวอร์แบงค์ชาร์จไว พกขึ้นเครื่องบินได้"\n• "แก้วเก็บความเย็นไม่มีไอน้ำเกาะโต๊ะ"\n• "หาของขวัญวันเกิดให้แฟนผู้ชาย งบ 500-1000"\n• "พัดลมพกพาแบตอึดๆ"\n\nน้องดีลลี่พร้อมหาของแท้ ราคาพิเศษ และตอบทุกข้อสงสัยให้ทันทีเลยครับ! 🚀`;
      await this.sendMessage(chatId, welcomeMsg);
      if (this.onInquiryCallback) {
        this.onInquiryCallback({
          user: sender,
          query: rawText,
          reply: 'ส่งข้อความต้อนรับและคำแนะนำการใช้งาน (น้องดีลลี่ AI)',
          time: new Date().toLocaleTimeString('th-TH')
        });
      }
      return;
    }

    // 2. ค้นหาสินค้าที่ใกล้เคียงที่สุดจากคลัง Shopee (ดึง 3 อันดับแรกเพื่อให้ LLM เลือกตัวที่ดีที่สุด)
    const matches = this.agent.searchMatchingDeals(rawText, 3);

    // 3. ใช้สมองกล AI LLM ตอบคำถามและป้ายยาอย่างชาญฉลาด
    const chatResult = await this.agent.chatWithLLM(rawText, matches, sender);
    const replyText = chatResult.text;
    const deal = chatResult.deal;

    if (deal && deal.imageUrl) {
      // ส่งรูปสินค้าจริงพร้อมข้อความตอบกลับจาก AI
      if (replyText.length <= 1000) {
        await this.sendPhoto(chatId, deal.imageUrl, replyText);
      } else {
        // หากข้อความยาวเกินลิมิตรูปภาพของ Telegram ให้ส่งรูปก่อนแล้วตามด้วยข้อความแชต
        await this.sendPhoto(chatId, deal.imageUrl, `🛍️ แนะนำ: ${deal.title.slice(0, 50)}... (฿${deal.salePrice})`);
        await this.sendMessage(chatId, replyText);
      }

      // บันทึกแจ้งเตือนลงหน้า Dashboard
      if (this.onInquiryCallback) {
        this.onInquiryCallback({
          user: sender,
          query: rawText,
          matchedDeal: deal,
          reply: `[${chatResult.modelUsed}] ตอบ: "${replyText.slice(0, 30)}..." + ส่งรูปจริง Shopee CDN`,
          affiliateUrl: chatResult.affiliateUrl,
          time: new Date().toLocaleTimeString('th-TH')
        });
      }
    } else {
      // ตอบเป็นข้อความแชต
      await this.sendMessage(chatId, replyText);

      if (this.onInquiryCallback) {
        this.onInquiryCallback({
          user: sender,
          query: rawText,
          reply: `[${chatResult.modelUsed}] ตอบกลับข้อความแชตสำเร็จ`,
          time: new Date().toLocaleTimeString('th-TH')
        });
      }
    }
  }

  /**
   * ส่งรูปภาพ + แคปชัน
   */
  async sendPhoto(chatId, photoUrl, caption) {
    const endpoint = `https://api.telegram.org/bot${this.botToken}/sendPhoto`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: caption
      })
    });
    return response.json();
  }

  /**
   * ส่งข้อความธรรมดา
   */
  async sendMessage(chatId, text) {
    const endpoint = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });
    return response.json();
  }
}

window.TelegramDealBot = TelegramDealBot;
