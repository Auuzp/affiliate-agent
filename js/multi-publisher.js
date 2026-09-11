/**
 * Multi-Channel Publisher Engine
 * ระบบส่งโพสต์อัตโนมัติ 3 ช่องทาง: Telegram, Facebook Page, X (Twitter)
 */

class MultiChannelPublisher {
  constructor() {
    this.loadCredentials();
  }

  loadCredentials() {
    // Telegram
    this.telegram = {
      enabled: localStorage.getItem('aff_tg_enabled') === 'true',
      botToken: localStorage.getItem('aff_tg_bot_token') || '',
      channelId: localStorage.getItem('aff_tg_channel_id') || ''
    };

    // Facebook Page
    this.facebook = {
      enabled: localStorage.getItem('aff_fb_enabled') !== 'false',
      pageId: localStorage.getItem('aff_fb_page_id') || '106756152526353',
      accessToken: localStorage.getItem('aff_fb_access_token') || ''
    };

    // X (Twitter) / Universal Webhook
    this.twitter = {
      enabled: localStorage.getItem('aff_tw_enabled') === 'true',
      webhookUrl: localStorage.getItem('aff_tw_webhook_url') || '', // Make.com / Zapier / Direct API
      bearerToken: localStorage.getItem('aff_tw_bearer_token') || ''
    };
  }

  saveCredentials(data) {
    if (data.telegram) {
      this.telegram = { ...this.telegram, ...data.telegram };
      localStorage.setItem('aff_tg_enabled', this.telegram.enabled ? 'true' : 'false');
      localStorage.setItem('aff_tg_bot_token', this.telegram.botToken);
      localStorage.setItem('aff_tg_channel_id', this.telegram.channelId);
    }

    if (data.facebook) {
      this.facebook = { ...this.facebook, ...data.facebook };
      localStorage.setItem('aff_fb_enabled', this.facebook.enabled ? 'true' : 'false');
      localStorage.setItem('aff_fb_page_id', this.facebook.pageId);
      localStorage.setItem('aff_fb_access_token', this.facebook.accessToken);
    }

    if (data.twitter) {
      this.twitter = { ...this.twitter, ...data.twitter };
      localStorage.setItem('aff_tw_enabled', this.twitter.enabled ? 'true' : 'false');
      localStorage.setItem('aff_tw_webhook_url', this.twitter.webhookUrl);
      localStorage.setItem('aff_tw_bearer_token', this.twitter.bearerToken);
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

    // 1. Telegram Channel (ส่งรูป + Inline Keyboard Button ใต้ภาพ)
    if (this.telegram.enabled && this.telegram.botToken && this.telegram.channelId) {
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
          success: true,
          message: `โพสต์พร้อมปุ่ม Inline Button สำเร็จ (Message ID: ${tgRes.result?.message_id || 'OK'})`
        };
      } catch (err) {
        results.telegram = { success: false, message: err.message };
      }
    }

    // 2. Facebook Page (โพสต์ภาพไม่มีลิงก์ ➡️ ยิง First Comment แปะลิงก์ทันที)
    if (this.facebook.enabled && this.facebook.pageId && this.facebook.accessToken) {
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
          success: true,
          message: `โพสต์ภาพและยิง First Comment สำเร็จ (Post ID: ${fbRes.postId || 'OK'})`
        };
      } catch (err) {
        results.facebook = { success: false, message: err.message };
      }
    }

    // 3. X (Twitter / Webhook) (ทวีตหลัก Hook+ภาพ ➡️ ยิง Thread Reply)
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
          success: true,
          message: 'ยิงทวีตหลักและ Thread Reply สำเร็จ'
        };
      } catch (err) {
        results.twitter = { success: false, message: err.message };
      }
    }

    return results;
  }

  /**
   * ยิงเข้า Telegram พร้อม Inline Keyboard Button ใต้รูปภาพ
   */
  async sendToTelegram(caption, imageUrl, buttonText = '👉 สั่งซื้อตรงนี้', buttonUrl = '') {
    const endpoint = `https://api.telegram.org/bot${this.telegram.botToken}/sendPhoto`;
    
    // ตัดคำ Caption ไม่ให้เกิน 1,020 ตัวอักษร เพื่อป้องกัน Error 400 จาก Telegram (จำกัดที่ 1,024 ตัวอักษร)
    let cleanCaption = (caption || '').trim();
    if (cleanCaption.length > 1020) {
      cleanCaption = cleanCaption.slice(0, 1017) + '...';
    }

    const bodyPayload = {
      chat_id: this.telegram.channelId,
      photo: imageUrl,
      caption: cleanCaption
    };

    // แนบปุ่ม Inline Keyboard Button เมื่อมี URL
    if (buttonUrl) {
      bodyPayload.reply_markup = {
        inline_keyboard: [
          [{ text: buttonText, url: buttonUrl }]
        ]
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.description || 'Telegram send failed');
    return data;
  }

  /**
   * ยิงเข้า Facebook Page (โพสต์ภาพ ➡️ ส่ง First Comment ปักลิงก์)
   */
  async sendToFacebookPage(message, imageUrl, firstComment = '') {
    // 1. โพสต์ภาพและแคปชัน (ไม่มีลิงก์ เพื่อป้องกันการลดการมองเห็น)
    const photoEndpoint = `https://graph.facebook.com/v19.0/${this.facebook.pageId}/photos`;
    const photoResponse = await fetch(photoEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: imageUrl,
        caption: message,
        access_token: this.facebook.accessToken
      })
    });

    const photoData = await photoResponse.json();
    if (photoData.error) throw new Error(photoData.error.message || 'Facebook photo post failed');
    
    const targetPostId = photoData.post_id || photoData.id;

    // 2. ยิง First Comment ปักลิงก์ Affiliate ทันที (รองรับทั้งเพจแบบคลาสสิกและ New Page Experience)
    let commentData = null;
    if (targetPostId && firstComment) {
      const candidateIds = [];
      // สำหรับ New Page Experience: ดึงเฉพาะตัวเลขหลังเครื่องหมาย _ (Underscore)
      if (typeof targetPostId === 'string' && targetPostId.includes('_')) {
        const purePostId = targetPostId.split('_').pop();
        if (purePostId) candidateIds.push(purePostId);
      }
      candidateIds.push(targetPostId);
      if (photoData.id && !candidateIds.includes(photoData.id)) {
        candidateIds.push(photoData.id);
      }

      for (const idToTry of candidateIds) {
        try {
          const commentEndpoint = `https://graph.facebook.com/v19.0/${idToTry}/comments`;
          const commentResponse = await fetch(commentEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: firstComment,
              access_token: this.facebook.accessToken
            })
          });
          commentData = await commentResponse.json();
          if (commentData && commentData.id && !commentData.error) {
            console.log(`[Facebook] First comment posted successfully using ID: ${idToTry}`);
            break;
          } else {
            console.warn(`[Facebook] First comment with ID ${idToTry} returned:`, commentData?.error?.message || commentData);
          }
        } catch (cErr) {
          console.warn(`[Facebook] First comment attempt failed with ID ${idToTry}:`, cErr.message);
        }
      }
    }

    return {
      postId: targetPostId,
      commentId: commentData?.id || null
    };
  }

  /**
   * ยิงเข้า X (Twitter) (ทวีตหลัก ➡️ Thread Reply แปะลิงก์)
   */
  async sendToTwitter(mainTweet, imageUrl, threadReply = '') {
    if (this.twitter.webhookUrl) {
      // ส่งผ่าน Webhook โดยส่งทั้งทวีตหลักและข้อความ Thread Reply
      const response = await fetch(this.twitter.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'twitter',
          main_tweet: mainTweet,
          thread_reply: threadReply,
          text: mainTweet,
          image: imageUrl,
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error(`Webhook Error (${response.status})`);
      return true;
    } else {
      // ส่งผ่าน Backend Proxy Server เพื่อหลีกเลี่ยง CORS Restriction ของ Browser 100%
      try {
        const response = await fetch('/api/twitter/tweet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mainTweet,
            threadReply,
            imageUrl,
            bearerToken: this.twitter.bearerToken
          })
        });
        if (response.ok) return true;
        const data = await response.json();
        throw new Error(data.error || 'Twitter dispatch failed');
      } catch (err) {
        console.warn('Backend twitter proxy error:', err.message);
        throw err;
      }
    }
  }
}

window.MultiChannelPublisher = MultiChannelPublisher;
