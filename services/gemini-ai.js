/**
 * ==============================================================================
 * Gemini AI Copywriting & Conversational Shopping Assistant Service
 * Models: gemini-2.5-flash (Google AI Studio)
 * ==============================================================================
 */

const axios = require('axios');

class GeminiAIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = 'gemini-2.5-flash';
  }

  /**
   * สกัด Pain Point และปัญหาในชีวิตประจำวันจากชื่อและสเปกสินค้า
   */
  extractPainPoint(deal) {
    const title = (deal.title || '').toLowerCase();
    const feat = Array.isArray(deal.features) ? deal.features.join(' ').toLowerCase() : '';

    if (title.includes('powerbank') || title.includes('พาวเวอร์แบงค์') || title.includes('eloop') || title.includes('แบต')) {
      return {
        hook: 'วิกฤตแบต 1% นอกบ้าน สแกนจ่ายเงินไม่ได้ รถไฟฟ้าคนแน่น',
        problem: 'แบตหมดกลางทาง ขอยืมสายใครก็ไม่ได้ พาวเวอร์แบงค์เก่าก็หนักจนปวดแขน'
      };
    }
    if (title.includes('tyeso') || title.includes('แก้ว') || feat.includes('สแตนเลส')) {
      return {
        hook: 'โต๊ะทำงานเปียก กาแฟจืด น้ำแข็งละลายหมดตั้งแต่สาย',
        problem: 'แก้วเดิมเก็บความเย็นไม่ได้ น้ำเกาะรอบแก้วจนเลอะเอกสารสำคัญ'
      };
    }
    if (title.includes('osuka') || title.includes('สว่าน') || title.includes('บล็อก') || feat.includes('brushless')) {
      return {
        hook: 'ขันน็อตจนมือพอง น็อตขึ้นสนิมถอดยังไงก็ไม่ออก',
        problem: 'งานช่างรอบบ้านกินเวลาไปครึ่งวัน สว่านไม่มีแรง แบตหมดไว'
      };
    }
    if (title.includes('carplay') || feat.includes('ไร้สาย')) {
      return {
        hook: 'สายชาร์จในรถพันกันยุ่งเหยิง ก้มดูมือถือจนเกือบชน',
        problem: 'ขึ้นรถแล้วต้องมานั่งเสียบสายทุกรอบ แผนที่ไม่ขึ้นจอรถ เสี่ยงอุบัติเหตุ'
      };
    }

    return {
      hook: `ไอเทมแก้ปัญหาชีวิตประจำวัน ยอดสั่งซื้อแล้ว ${deal.soldCount || 'ถล่มทลาย'}`,
      problem: `เบื่อกับของเดิมๆ ที่พังง่าย ซื้อมาแล้วไม่ตรงปก ใช้ไม่ทน`
    };
  }

  /**
   * สุ่ม 1 ใน 5 สไตล์การเขียน (Dynamic Tone of Voice)
   */
  getRandomTone() {
    const tones = [
      { id: 'storytelling', name: 'Storytelling ปัญหาชีวิตจริง' },
      { id: 'unboxing', name: 'Real Unboxing รีวิวจริงแกะกล่อง' },
      { id: 'secret_deal', name: 'Secret Deal เตือนเพื่อนอย่าพลาด' },
      { id: 'funny_review', name: 'Humorous ชงมุกขำๆ ป้ายยา' },
      { id: 'qa_guide', name: 'Q&A Guide ถามตอบคลายข้อสงสัย' }
    ];
    return tones[Math.floor(Math.random() * tones.length)];
  }

  /**
   * สร้างคอนเทนต์แยก 3 แพลตฟอร์มตามอัลกอริทึม
   */
  async generateMultiPlatformPost(deal, urls) {
    const tone = this.getRandomTone();
    const painPoint = this.extractPainPoint(deal);

    // หากมี Gemini API Key ให้ใช้ AI สด
    if (this.apiKey && this.apiKey.trim().length > 0) {
      try {
        const aiResult = await this.callGeminiAPI(deal, tone, painPoint);
        if (aiResult) {
          return this.formatPayloads(deal, tone, urls, aiResult);
        }
      } catch (err) {
        console.warn('[Gemini AI] API call failed, falling back to smart copywriter:', err.message);
      }
    }

    // Fallback Smart Copywriting Engine
    const smartContent = this.generateSmartCopy(deal, tone, painPoint);
    return this.formatPayloads(deal, tone, urls, smartContent);
  }

  async callGeminiAPI(deal, tone, painPoint) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const prompt = `
คุณคือนักเขียนแคปชันสายป้ายยา Shopee Affiliate มือโปร
สินค้า: "${deal.title}" (ร้าน ${deal.shopName || 'Shopee'})
ราคาปกติ: ฿${deal.originalPrice} ลดเหลือ: ฿${deal.salePrice}
Pain Point: "${painPoint.hook}"
โทน: "${tone.name}"

กฎสำคัญ:
1. ห้ามก๊อปสเปกมาวางทื่อๆ ให้เล่า Pain Point ในชีวิตจริง
2. สำหรับ Facebook และ Twitter: ห้ามใส่ลิงก์ในโพสต์หลัก (กันลด Reach)
3. ส่งออกเป็น JSON รูปแบบ:
{
  "tgText": "แคปชันกระชับลง Telegram พร้อมราคาและจุดเด่น (ไม่ต้องใส่ลิงก์ยาว)",
  "fbText": "แคปชันเล่าเรื่องลง Facebook Page ไร้ลิงก์ภายนอก มี Hook ดึงดูด บอกให้ดูพิกัดในคอมเมนต์แรก",
  "xText": "ทวีตสั้นลง X ไม่เกิน 200 ตัวอักษร ไร้ลิงก์ภายนอก มี Hook และแฮชแท็ก"
}
`;

    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
    }, { timeout: 10000 });

    const rawText = response.data.candidates[0].content.parts[0].text;
    return JSON.parse(rawText);
  }

  generateSmartCopy(deal, tone, painPoint) {
    const hook = painPoint.hook;
    const priceStr = `฿${deal.salePrice.toLocaleString()}.- (จากปกติ ฿${deal.originalPrice.toLocaleString()}.-)`;

    const tgText = `🔥 [ดีลเด็ดลดแรง] ${deal.title}\n\n⚡ ปัญหาที่หลายคนเจอ: "${hook}"\n✨ ตัวนี้จบปัญหาได้จริง ของแท้ 100% จาก ${deal.shopName}\n🏷️ พิเศษเพียง ${priceStr}\n\nกดปุ่มสั่งซื้อที่ปุ่มด้านล่างได้เลยครับ 👇`;

    const fbText = `ใครเคยเจอปัญหานี้บ้าง? 😭\n\n"${hook}"\n\nบอกเลยว่าไอเทมนี้ตอบโจทย์มาก ได้ของแท้จากร้าน ${deal.shopName} ยอดขายไปแล้ว ${deal.soldCount || 'ถล่มทลาย'} คุณภาพคุ้มราคามาก\n\n💰 ตอนนี้จัดโปรลดเหลือ ${priceStr}\n\n👇 พิกัดร้านศูนย์แท้และโค้ดลดพิเศษ แปะไว้ให้ใน "คอมเมนต์แรก" เรียบร้อยครับ จิ้มได้เลย!`;

    const xText = `เหนื่อยใจกับปัญหาเดิมๆ "${hook}" 😩\nตัวนี้แก้ตรงจุดมาก ของแท้ศูนย์ ${deal.shopName} ลดเหลือ ${priceStr} แล้ว!\n\n👇 พิกัดร้านแท้ จิ้มในเธรดด้านล่างได้เลยครับ 🧵\n#ShopeeTH #ของดีบอกต่อ #ป้ายยาช้อปปี้`;

    return { tgText, fbText, xText };
  }

  formatPayloads(deal, tone, urls, content) {
    const complianceNotice = '#ShopeeAffiliate #คอมมิชชั่น (ได้รับค่าตอบแทนเมื่อสั่งซื้อผ่านลิงก์)';

    return {
      deal,
      tone: tone.id,
      timestamp: new Date().toLocaleTimeString('th-TH'),
      caption: content.fbText,
      affiliateUrl: urls.tg,

      telegram: {
        caption: content.tgText,
        imageUrl: deal.imageUrl,
        buttonText: `👉 สั่งซื้อร้านแท้ / รับโค้ด (฿${deal.salePrice.toLocaleString()}.-)`,
        buttonUrl: urls.tg,
        subId: 'tg_deal'
      },

      facebook: {
        caption: content.fbText,
        imageUrl: deal.imageUrl,
        firstComment: `🛒 พิกัดร้านแท้/โค้ดลดพิเศษ จิ้มตรงนี้ได้เลยครับ 👉 ${urls.fb}\n\n${complianceNotice}`,
        subId: 'fb_page'
      },

      twitter: {
        mainTweet: content.xText,
        imageUrl: deal.imageUrl,
        threadReply: `พิกัดร้านศูนย์แท้ 100% สั่งตรงนี้เลยครับ 👉 ${urls.x}\n\n${complianceNotice}`,
        subId: 'x_thread'
      }
    };
  }

  /**
   * Telegram Conversational AI Assistant (ตอบคำถามลูกค้าอัตโนมัติ 24 ชม.)
   */
  async chatWithCustomer(userQuery, candidateDeals, senderName = 'คุณลูกค้า') {
    const primaryDeal = candidateDeals && candidateDeals.length > 0 ? candidateDeals[0] : null;

    if (!primaryDeal) {
      return {
        text: `สวัสดีครับคุณ ${senderName} ✨ น้องดีลลี่พร้อมช่วยค้นหาสินค้าและโค้ดลด Shopee ของแท้ราคาโปรโมชั่นครับ! คุณลูกค้ากำลังมองหาสินค้าประเภทไหนอยู่ พิมพ์บอกได้เลยนะครับ เช่น "ขอพาวเวอร์แบงค์", "แก้วเก็บความเย็น", หรือ "สว่านไร้สาย" 🛍️`,
        deal: null
      };
    }

    if (this.apiKey) {
      try {
        const prompt = `
คุณคือ "น้องดีลลี่ (Dealy)" ผู้ช่วยช้อปปิ้งส่วนตัว AI ประจำช่อง Shopee Affiliate
ผู้ใช้ (${senderName}) ถามว่า: "${userQuery}"
สินค้าที่ตรงที่สุดในคลัง: "${primaryDeal.title}" จากร้าน ${primaryDeal.shopName}
ราคา: ฿${primaryDeal.salePrice} (ลด ${primaryDeal.discount}) ยอดขาย ${primaryDeal.soldCount}

ตอบกลับอย่างเป็นมิตร สุภาพ มีพลัง ดึงจุดเด่นของสินค้านี้ 1-2 ข้อ ไม่เกิน 3-4 ประโยค และเชิญชวนให้กดปุ่มสั่งซื้อด้านล่างเพื่อรับโปรโมชั่น
`;
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6 }
        }, { timeout: 8000 });

        return {
          text: response.data.candidates[0].content.parts[0].text,
          deal: primaryDeal
        };
      } catch (err) {
        console.warn('[Gemini Chat] API error, using smart response:', err.message);
      }
    }

    // Default friendly response
    const text = `น้องดีลลี่หาพิกัดให้แล้วครับคุณ ${senderName}! 🎉\n\nแนะนำตัวนี้เลยครับ: **"${primaryDeal.title}"**\nจากร้านทางการ **${primaryDeal.shopName}** ยอดขายไปแล้วกว่า ${primaryDeal.soldCount}\n\n💰 พิเศษตอนนี้ลดเหลือเพียง **฿${primaryDeal.salePrice.toLocaleString()}.-** (${primaryDeal.discount})\n\nกดดูรายละเอียดหรือสั่งซื้อที่ปุ่มด้านล่างนี้ได้ทันทีเลยครับ 👇`;

    return { text, deal: primaryDeal };
  }
}

module.exports = new GeminiAIService();
