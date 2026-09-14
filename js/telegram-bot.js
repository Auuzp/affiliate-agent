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
    this.onInquiryCallback = null;
    // Purge legacy client-side Telegram bot token for security
    localStorage.removeItem('aff_tg_bot_token');
    this.channelId = localStorage.getItem('aff_tg_channel_id') || '';
  }

  setCredentials(token, channelId) {
    // ป้องกันการบันทึก bot token ใน browser client
    localStorage.removeItem('aff_tg_bot_token');
    if (channelId) {
      this.channelId = channelId.trim();
      localStorage.setItem('aff_tg_channel_id', this.channelId);
    }
  }

  setInquiryListener(callback) {
    this.onInquiryCallback = callback;
  }

  /**
   * เริ่มต้นการทำงานของบอทรับข้อความ (รวมศูนย์บน Server-Side เพื่อป้องกัน 409 Conflict)
   */
  start() {
    this.isPolling = true;
    console.log('[TelegramBot Client] บอททำงานผ่าน Server-side Webhook/Polling (ปลอด 409 Conflict)');
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
   * ส่งรูปภาพ + แคปชัน (ผ่าน Server-Side Proxy ปลอดภัย 100%)
   */
  async sendPhoto(chatId, photoUrl, caption) {
    // ตัดความยาวไม่ให้เกิน 1,020 ตัวอักษร เพื่อป้องกัน Error 400 จาก Telegram API
    let cleanCaption = (caption || '').trim();
    if (cleanCaption.length > 1020) {
      cleanCaption = cleanCaption.slice(0, 1017) + '...';
    }
    const response = await fetch('/api/telegram/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: cleanCaption,
        imageUrl: photoUrl
      })
    });
    return response.json();
  }

  /**
   * ส่งข้อความธรรมดา (ผ่าน Server-Side Proxy ปลอดภัย 100%)
   */
  async sendMessage(chatId, text) {
    const response = await fetch('/api/telegram/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: text,
        imageUrl: null
      })
    });
    return response.json();
  }
}

window.TelegramDealBot = TelegramDealBot;
