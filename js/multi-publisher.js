/**
 * Multi-Channel Publisher Engine
 * ระบบส่งโพสต์อัตโนมัติ 3 ช่องทาง: Telegram, Facebook Page, X (Twitter)
 */

class MultiChannelPublisher {
  constructor() {
    this.loadCredentials();
  }

  loadCredentials() {
    // Purge legacy credentials from client-side localStorage (Security Guard)
    localStorage.removeItem('aff_tg_bot_token');
    localStorage.removeItem('aff_fb_access_token');
    localStorage.removeItem('aff_tw_bearer');
    localStorage.removeItem('aff_tw_bearer_token');
    localStorage.removeItem('aff_tw_webhook');
    localStorage.removeItem('aff_tw_webhook_url');

    // Telegram
    this.telegram = {
      enabled: localStorage.getItem('aff_tg_enabled') !== 'false',
      channelId: localStorage.getItem('aff_tg_channel_id') || ''
    };

    // Facebook Page
    this.facebook = {
      enabled: localStorage.getItem('aff_fb_enabled') !== 'false',
      pageId: localStorage.getItem('aff_fb_page_id') || '106756152526353'
    };

    // X (Twitter)
    this.twitter = {
      enabled: localStorage.getItem('aff_tw_enabled') !== 'false'
    };
  }

  saveCredentials(data) {
    if (data.telegram) {
      this.telegram.enabled = data.telegram.enabled !== false;
      if (data.telegram.channelId) this.telegram.channelId = data.telegram.channelId;
      localStorage.setItem('aff_tg_enabled', this.telegram.enabled ? 'true' : 'false');
      if (data.telegram.channelId) localStorage.setItem('aff_tg_channel_id', this.telegram.channelId);
    }

    if (data.facebook) {
      this.facebook.enabled = data.facebook.enabled !== false;
      if (data.facebook.pageId) this.facebook.pageId = data.facebook.pageId;
      localStorage.setItem('aff_fb_enabled', this.facebook.enabled ? 'true' : 'false');
      if (data.facebook.pageId) localStorage.setItem('aff_fb_page_id', this.facebook.pageId);
    }

    if (data.twitter) {
      this.twitter.enabled = data.twitter.enabled !== false;
      localStorage.setItem('aff_tw_enabled', this.twitter.enabled ? 'true' : 'false');
    }
  }

  /**
   * ยิงโพสต์ออกไปยังแพลตฟอร์มแบบ Platform-Native Anti-Suppression
   * - Telegram: รูปภาพ + Inline Keyboard Button
   * - Facebook: รูปภาพ + แคปชันเล่าปัญหา (ไม่มีลิงก์) ➡️ ยิง First Comment แปะลิงก์
   * - X (Twitter): ทวีตหลัก Hook+ภาพ (ไม่มีลิงก์) ➡️ ยิง Thread Reply แปะลิงก์
   */
  async broadcastPost(post) {
    const results = {
      telegram: { success: false, message: 'ไม่ได้เปิดใช้งาน' },
      facebook: { success: false, message: 'ไม่ได้เปิดใช้งาน' },
      twitter: { success: false, message: 'ไม่ได้เปิดใช้งาน' }
    };

    // 1. Telegram Channel (ส่งผ่าน Server Endpoint: /api/telegram/post)
    if (this.telegram.enabled) {
      try {
        const tgData = post.telegram || {
          caption: post.caption,
          imageUrl: post.deal?.imageUrl,
          buttonText: '👉 สั่งซื้อร้านแท้ / รับโค้ดตรงนี้',
          buttonUrl: post.affiliateUrl
        };

        const tgRes = await this.sendToTelegram(
          tgData.caption,
          tgData.imageUrl,
          tgData.buttonText,
          tgData.buttonUrl
        );

        results.telegram = {
          success: tgRes.success,
          message: tgRes.success ? 'โพสต์ Telegram สำเร็จ (ผ่าน Server-Side Env)' : (tgRes.error || 'ล้มเหลว')
        };
      } catch (err) {
        results.telegram = { success: false, message: err.message };
      }
    }

    // 2. Facebook Page (ส่งผ่าน Server Endpoint: /api/facebook/post)
    if (this.facebook.enabled) {
      try {
        const fbData = post.facebook || {
          caption: post.caption,
          imageUrl: post.deal?.imageUrl,
          firstComment: `🛒 พิกัดร้านแท้/โค้ดลดพิเศษ จิ้มตรงนี้ได้เลยครับ 👉 ${post.affiliateUrl}\n\n#ShopeeAffiliate #คอมมิชชั่น`
        };

        const fbRes = await this.sendToFacebookPage(
          fbData.caption,
          fbData.imageUrl,
          fbData.firstComment
        );

        results.facebook = {
          success: fbRes.success,
          message: fbRes.success ? 'โพสต์ Facebook Page สำเร็จ (ผ่าน Server-Side Env)' : (fbRes.error || 'ล้มเหลว')
        };
      } catch (err) {
        results.facebook = { success: false, message: err.message };
      }
    }

    // 3. X (Twitter / Webhook) (ส่งผ่าน Server Endpoint: /api/twitter/tweet)
    if (this.twitter.enabled) {
      try {
        const xData = post.twitter || {
          mainTweet: (post.caption || '').slice(0, 220),
          imageUrl: post.deal?.imageUrl,
          threadReply: `พิกัดร้านศูนย์แท้ 100% สั่งตรงนี้เลยครับ 👉 ${post.affiliateUrl}\n\n#ShopeeAffiliate #ของดีบอกต่อ`
        };

        const twRes = await this.sendToTwitter(
          xData.mainTweet,
          xData.imageUrl,
          xData.threadReply
        );

        results.twitter = {
          success: twRes.success,
          message: twRes.success ? 'ยิงทวีตหลักและ Thread Reply สำเร็จ (ผ่าน Server-Side Env)' : (twRes.error || 'ล้มเหลว')
        };
      } catch (err) {
        results.twitter = { success: false, message: err.message };
      }
    }

    return results;
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

  /**
   * ส่ง Telegram ผ่าน Server-Side Proxy (ไม่ถือ Bot Token ฝั่ง Client)
   */
  async sendToTelegram(caption, imageUrl, buttonText = '👉 สั่งซื้อตรงนี้', buttonUrl = '') {
    const secureCaption = this.ensureAffiliateDisclosure(caption, 1020);
    const response = await fetch('/api/telegram/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: secureCaption,
        imageUrl,
        buttonText,
        buttonUrl
      })
    });

    const data = await response.json();
    if (!data.success && data.error) throw new Error(data.error);
    return data;
  }

  /**
   * ส่ง Facebook Page ผ่าน Server-Side Proxy (ไม่ถือ Page Access Token ฝั่ง Client)
   */
  async sendToFacebookPage(caption, imageUrl, firstComment = '') {
    const secureCaption = this.ensureAffiliateDisclosure(caption);
    const response = await fetch('/api/facebook/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: secureCaption,
        imageUrl,
        firstComment
      })
    });

    const data = await response.json();
    if (!data.success && data.error) throw new Error(data.error);
    return data;
  }

  /**
   * ส่ง X (Twitter) ผ่าน Server-Side Proxy (ไม่ถือ Bearer Token ฝั่ง Client)
   */
  async sendToTwitter(mainTweet, imageUrl, threadReply = '') {
    const secureTweet = this.ensureAffiliateDisclosure(mainTweet, 280);
    const response = await fetch('/api/twitter/tweet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mainTweet: secureTweet,
        threadReply,
        imageUrl
      })
    });

    const data = await response.json();
    if (!data.success && data.error) throw new Error(data.error);
    return data;
  }
}

window.MultiChannelPublisher = MultiChannelPublisher;
