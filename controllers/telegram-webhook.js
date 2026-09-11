/**
 * ==============================================================================
 * Telegram 24/7 Webhook Controller & AI Shopper Assistant
 * Endpoint: POST /webhook/telegram
 * ==============================================================================
 */

const axios = require('axios');
const geminiAI = require('../services/gemini-ai');
const shopeeGraphQL = require('../services/shopee-graphql');

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
    const q = query.toLowerCase();

    // ตัวอย่างสินค้าตัวท็อปในระบบ
    const sampleDeals = [
      {
        id: 'eloop-e29',
        title: 'Eloop E29 แบตสำรอง 30000mAh ชาร์จเร็ว PD 20W / QC 3.0',
        shopName: 'Eloop & Orsen Official Store',
        salePrice: 479,
        originalPrice: 890,
        discount: 'ลด 46%',
        soldCount: '4.8 หมื่นชิ้น',
        imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81zth-mqilmuwfdnnxe6',
        defaultUrl: 'https://shopee.co.th/product/153497201/21443658213'
      },
      {
        id: 'tyeso-cup',
        title: 'Tyeso แก้วเก็บความเย็น สแตนเลส 304 แท้ มีหูหิ้ว 600ml / 900ml',
        shopName: 'Tyeso Official Thailand',
        salePrice: 189,
        originalPrice: 350,
        discount: 'ลด 46%',
        soldCount: '8.2 หมื่นชิ้น',
        imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-7ras9-m3zrfvaxfop6d8',
        defaultUrl: 'https://shopee.co.th/product/153497201/18293746501'
      },
      {
        id: 'osuka-drill',
        title: 'OSUKA สว่านกระแทกไร้สาย บล็อกแบตเตอรี่ Brushless ไร้แปลงถ่าน 128V',
        shopName: 'OSUKA Power Tools Official',
        salePrice: 1290,
        originalPrice: 2490,
        discount: 'ลด 48%',
        soldCount: '2.5 หมื่นชิ้น',
        imageUrl: 'https://down-th.img.susercontent.com/file/5928c055fb720f085bb7d4e471bae3df',
        defaultUrl: 'https://shopee.co.th/product/153497201/19283746512'
      },
      {
        id: 'fashion-tee',
        title: 'Rosa Mute Minimal Oversize T-Shirt เสื้อยืดมินิมอล ทรงเกาหลี',
        shopName: 'Rosa Mute Official',
        salePrice: 250,
        originalPrice: 490,
        discount: 'ลด 49%',
        soldCount: '3.4 หมื่นชิ้น',
        imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-825zu-mm8cvyazrojm14',
        defaultUrl: 'https://shopee.co.th/product/153497201/22334455667'
      }
    ];

    const matched = sampleDeals.filter(d => {
      const text = `${d.title} ${d.shopName}`.toLowerCase();
      return q.split(' ').some(word => word.length > 2 && text.includes(word));
    });

    return matched.length > 0 ? matched : [sampleDeals[0]];
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
}

module.exports = new TelegramWebhookController();
