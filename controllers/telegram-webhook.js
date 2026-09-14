/**
 * ==============================================================================
 * Telegram 24/7 Webhook Controller & AI Shopper Assistant
 * Endpoint: POST /webhook/telegram
 * ==============================================================================
 */

const axios = require('axios');
const geminiAI = require('../services/gemini-ai');
const shopeeGraphQL = require('../services/shopee-graphql');
const { SHOP_OFFERS_DATABASE } = require('../js/deals-db');
const { SHOPEE_PRODUCT_OFFERS } = require('../js/product-offers-db');

class TelegramWebhookController {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || 'affiliate_pilot_secure_secret_2026';
  }

  /**
   * จัดการข้อความที่ส่งมาจาก Telegram Cloud เข้า Webhook
   */
  async handleWebhook(req, res) {
    // 1. ตอบ 200 OK ให้ Telegram ทันที เพื่อป้องกันการ Re-deliver
    res.status(200).send({ ok: true });

    // 2. ตรวจสอบ Secret Token เพื่อความปลอดภัย
    const incomingSecret = req.headers['x-telegram-bot-api-secret-token'];
    if (this.webhookSecret && incomingSecret && incomingSecret !== this.webhookSecret) {
      console.warn('[Telegram Webhook] Invalid secret token received');
      return;
    }

    const update = req.body;
    if (!update || !update.message) return;

    const msg = update.message;
    const chatId = msg.chat.id;
    const text = (msg.text || '').trim();
    const senderName = msg.from ? (msg.from.first_name || msg.from.username || 'คุณลูกค้า') : 'คุณลูกค้า';

    if (!text) return;

    console.log(`[Telegram Webhook] Received message from ${senderName} (${chatId}): "${text}"`);

    // จัดการคำสั่ง /start
    if (text === '/start') {
      const welcomeText = `สวัสดีครับคุณ ${senderName}! 👋 ยินดีต้อนรับสู่ **Shopee Deals AI Assistant** 🛍️✨\n\nน้องดีลลี่สามารถช่วยค้นหาดีลลดแรง โค้ดลับ และสินค้าของแท้ราคาโปรโมชั่นให้คุณได้ตลอด 24 ชั่วโมง!\n\n💡 **วิธีใช้งาน:**\nพิมพ์ชื่อสินค้าที่ต้องการได้เลยครับ เช่น:\n• *"ขอพาวเวอร์แบงค์ชาร์จไว"*\n• *"หาแก้วเก็บความเย็น Tyeso"*\n• *"มีสว่านไร้สายดีลเด็ดไหม"*`;
      await this.sendReply(chatId, welcomeText);
      return;
    }

    try {
      // 3. ค้นหาสินค้าที่ตรงกับความต้องการ
      const candidateDeals = await this.findMatchingDeals(text);

      // 4. ให้ AI สร้างข้อความสนทนาที่เป็นมิตร
      const aiResponse = await geminiAI.chatWithCustomer(text, candidateDeals, senderName);

      if (aiResponse.deal) {
        // สร้าง Deep Link เฉพาะของ Telegram Bot (sub1=telegram_bot)
        const linkRes = await shopeeGraphQL.generateShortLink(
          aiResponse.deal.defaultUrl || aiResponse.deal.offerUrl || 'https://shopee.co.th',
          ['telegram_bot']
        );
        const buttonUrl = linkRes.shortLink || linkRes.deepLinkUrl;

        // ตอบกลับแบบรูปภาพพร้อมปุ่มกด Inline Button
        await this.sendPhotoReply(
          chatId,
          aiResponse.deal.imageUrl,
          aiResponse.text,
          `👉 สั่งซื้อร้านแท้ (฿${aiResponse.deal.salePrice.toLocaleString()}.-)`,
          buttonUrl
        );
      } else {
        await this.sendReply(chatId, aiResponse.text);
      }

    } catch (err) {
      console.error('[Telegram Webhook] Error processing message:', err.message);
      await this.sendReply(chatId, `ขออภัยครับคุณ ${senderName} ตอนนี้น้องดีลลี่กำลังอัปเดตระบบดีลสักครู่ ลองพิมพ์ใหม่อีกครั้งนะครับ 🙏`);
    }
  }

  /**
   * ค้นหาสินค้าจากคำค้นหาของผู้ใช้
   */
  async findMatchingDeals(query) {
    const q = (query || '').toLowerCase().trim();
    const allDeals = [
      ...(SHOP_OFFERS_DATABASE || []),
      ...(SHOPEE_PRODUCT_OFFERS || [])
    ];

    if (!q) return [allDeals[0]];

    const words = q.split(/\s+/).filter(w => w.length > 1);
    const matched = allDeals.filter(d => {
      const text = `${d.title || ''} ${d.shopName || ''} ${d.categoryName || ''}`.toLowerCase();
      return words.some(w => text.includes(w));
    });

    return matched.length > 0 ? matched : [allDeals[0]];
  }

  /**
   * ส่งข้อความธรรมดา
   */
  async sendReply(chatId, text) {
    if (!this.botToken) return;
    try {
      await axios.post(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      });
    } catch (err) {
      console.error('[Telegram Send Error]:', err.message);
    }
  }

  /**
   * ส่งข้อความพร้อมรูปภาพและปุ่ม Inline Keyboard Button
   */
  async sendPhotoReply(chatId, photoUrl, caption, buttonText, buttonUrl) {
    if (!this.botToken) return;
    try {
      await axios.post(`https://api.telegram.org/bot${this.botToken}/sendPhoto`, {
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: buttonText,
                url: buttonUrl
              }
            ]
          ]
        }
      });
    } catch (err) {
      console.error('[Telegram Photo Error]:', err.message);
      // Fallback ส่งเป็นข้อความธรรมดาหากรูปภาพมีปัญหา
      await this.sendReply(chatId, `${caption}\n\n🛒 สั่งซื้อที่นี่: ${buttonUrl}`);
    }
  }

  /**
   * คำสั่งเรียก setWebhook ของ Telegram Bot API อัตโนมัติ
   */
  async setTelegramWebhook(publicBaseUrl) {
    if (!this.botToken) {
      return { success: false, error: 'TELEGRAM_BOT_TOKEN not configured' };
    }

    const webhookUrl = `${publicBaseUrl.replace(/\/$/, '')}/webhook/telegram`;
    const payload = {
      url: webhookUrl,
      secret_token: this.webhookSecret,
      allowed_updates: ['message', 'callback_query']
    };

    try {
      const res = await axios.post(`https://api.telegram.org/bot${this.botToken}/setWebhook`, payload);
      return { success: true, webhookUrl, result: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  }

  /**
   * รวมศูนย์ Polling ไว้ที่ Server จุดเดียว (ป้องกัน 409 Conflict จากการเปิดหลายเบราว์เซอร์)
   */
  startServerPolling() {
    if (!this.botToken || this.isPollingActive) return;
    this.isPollingActive = true;
    let lastOffset = 0;
    console.log('[Telegram Central Polling] Active on backend server (Zero browser conflicts)');

    const poll = async () => {
      if (!this.isPollingActive) return;
      try {
        const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${lastOffset}&limit=20&timeout=10`;
        const res = await axios.get(url, { timeout: 15000 });
        if (res.data && res.data.ok && Array.isArray(res.data.result)) {
          for (const update of res.data.result) {
            lastOffset = update.update_id + 1;
            const fakeReq = { body: update, headers: { 'x-telegram-bot-api-secret-token': this.webhookSecret } };
            const fakeRes = { status: () => ({ send: () => {} }) };
            await this.handleWebhook(fakeReq, fakeRes);
          }
        }
      } catch (err) {
        if (err.response?.status === 409) {
          console.warn('[Telegram Polling] 409 Conflict: Webhook or another instance active. Backing off 10s...');
          await new Promise(r => setTimeout(r, 10000));
        } else {
          console.warn('[Telegram Polling Notice]:', err.message);
          await new Promise(r => setTimeout(r, 5000));
        }
      }
      setTimeout(poll, 2000);
    };

    poll();
  }
}

module.exports = new TelegramWebhookController();
