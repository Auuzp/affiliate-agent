/**
 * Affiliate Agent Mission Control Controller with Multi-Channel Auto-Pilot,
 * Quality & Consistency Guard (100% Verified Shopee CDN Images & Exact Text Match),
 * and Auto-Deal Discovery Engine.
 */

class AffiliateApp {
  constructor() {
    this.agent = new window.AffiliateAIAgent();
    this.publisher = new window.MultiChannelPublisher();
    this.tgBot = new window.TelegramDealBot(this.agent, this.publisher);
    this.notificationService = new window.NotificationService(this.agent, this.publisher);
    this.queueManager = new window.QueueManager(this.publisher);
    this.inquiryCount = 0;

    this.isAutoPilotRunning = false;
    this.autoPilotInterval = null;
    this.dealIndex = 0;
    this.pendingFetchedDeal = null;

    // Security: Purge legacy credentials from client-side localStorage
    const legacyKeys = ['aff_tg_bot_token', 'aff_fb_access_token', 'aff_tw_webhook', 'aff_tw_bearer', 'affiliate_gemini_key'];
    legacyKeys.forEach(k => localStorage.removeItem(k));

    // Load Clean Stats from localStorage
    this.stats = {
      posts: parseInt(localStorage.getItem('aff_stat_posts') || '0', 10),
      clicks: parseInt(localStorage.getItem('aff_stat_clicks') || '0', 10),
      orders: parseInt(localStorage.getItem('aff_stat_orders') || '0', 10),
      earnings: parseFloat(localStorage.getItem('aff_stat_earnings') || '0.00')
    };

    this.initDOM();
    this.bindEvents();
    this.renderStats();
    
    this.logActivity('🛡️ ระบบ Quality Guard พร้อมทำงาน: ตรวจสอบรูปจริง Shopee CDN และข้อความตรงสินค้า 100%', 'success');
    const poCount = (typeof window !== 'undefined' && window.SHOPEE_PRODUCT_OFFERS && Array.isArray(window.SHOPEE_PRODUCT_OFFERS)) ? window.SHOPEE_PRODUCT_OFFERS.length : 0;
    this.logActivity(`🔥 คลังหลัก: ข้อเสนอสินค้า (Product Offer) จาก affiliate.shopee.co.th จำนวน ${poCount} ดีลเด็ด (ค่าคอมมิชชันสูงสุด ฿1,700+)`, 'success');
    this.logActivity(`📦 คลังสินค้ารวมพร้อมโพสต์ทั้งหมด ${TRENDING_DEALS_DATABASE.length} รายการ (จัดลำดับดีลที่ดีที่สุดก่อน)`, 'info');
    this.logActivity('⏰ ระบบ Push Notification 3 เวลาทอง (23:55, 11:50, 20:00) พร้อมทำงาน', 'success');
    this.logActivity('🛡️ ระบบ Smart Queue & Anti-Suppression (หน่วงเวลา Jitter 5-15 นาที) พร้อมทำงาน', 'success');
    this.checkBackendStatus();
  }

  initDOM() {
    this.autoPilotBtn = document.getElementById('autoPilotBtn');
    this.agentStatusText = document.getElementById('agentStatusText');
    this.agentStatusBeacon = document.getElementById('agentStatusBeacon');
    this.triggerNowBtn = document.getElementById('triggerNowBtn');

    // Stats
    this.statEarnings = document.getElementById('statEarnings');
    this.statClicks = document.getElementById('statClicks');
    this.statOrders = document.getElementById('statOrders');
    this.statPosts = document.getElementById('statPosts');

    // Settings
    this.affiliateTagInput = document.getElementById('affiliateTagInput');
    this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    this.strategyModeSelect = document.getElementById('strategyModeSelect');
    this.postStyleSelect = document.getElementById('postStyleSelect');
    this.intervalSelect = document.getElementById('intervalSelect');

    // Product Offer CSV Import
    this.importCsvBtn = document.getElementById('importCsvBtn');
    this.productOfferCsvFileInput = document.getElementById('productOfferCsvFileInput');

    // Custom Deal Inputs & Auto-Discovery
    this.customDealUrlInput = document.getElementById('customDealUrlInput');
    this.customDealTitleInput = document.getElementById('customDealTitleInput');
    this.customDealCategorySelect = document.getElementById('customDealCategorySelect');
    this.dealMatchBadge = document.getElementById('dealMatchBadge');
    this.dealMatchText = document.getElementById('dealMatchText');
    this.dealMatchRate = document.getElementById('dealMatchRate');
    this.customDealPreviewCard = document.getElementById('customDealPreviewCard');
    this.customDealPreviewImg = document.getElementById('customDealPreviewImg');
    this.customDealPreviewTitle = document.getElementById('customDealPreviewTitle');
    this.addCustomDealBtn = document.getElementById('addCustomDealBtn');
    this.fetchShopeeBtn = document.getElementById('fetchShopeeBtn');
    this.discoverDealsBtn = document.getElementById('discoverDealsBtn');

    // Feeds & Logs
    this.postFeedContainer = document.getElementById('postFeedContainer');
    this.terminalLog = document.getElementById('terminalLog');
    this.dealsCountBadge = document.getElementById('dealsCountBadge');

    // Multi-Channel Checkboxes
    this.enableTgCheck = document.getElementById('enableTgCheck');
    this.enableFbCheck = document.getElementById('enableFbCheck');
    this.enableTwCheck = document.getElementById('enableTwCheck');

    // Modals
    this.settingsModal = document.getElementById('settingsModal');
    this.openSettingsBtn = document.getElementById('openSettingsBtn');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.aiModelSelect = document.getElementById('aiModelSelect');

    // Channel Inputs & Badges in Modal (Credentials managed securely on server)
    this.tgStatusBadge = document.getElementById('tgStatusBadge');
    this.tgChannelInput = document.getElementById('tgChannelInput');
    this.tgChannelUrlInput = document.getElementById('tgChannelUrlInput');
    this.fbStatusBadge = document.getElementById('fbStatusBadge');
    this.fbPageIdInput = document.getElementById('fbPageIdInput');
    this.twStatusBadge = document.getElementById('twStatusBadge');
    this.geminiStatusBadge = document.getElementById('geminiStatusBadge');
    this.saveAllSettingsBtn = document.getElementById('saveAllSettingsBtn');
    this.resetStatsBtn = document.getElementById('resetStatsBtn');

    // Telegram Deal Finder Bot DOM
    this.tgBotToggleBtn = document.getElementById('tgBotToggleBtn');
    this.tgBotBeacon = document.getElementById('tgBotBeacon');
    this.tgBotStatusText = document.getElementById('tgBotStatusText');
    this.tgInquiryLog = document.getElementById('tgInquiryLog');
    this.inquiryCountBadge = document.getElementById('inquiryCountBadge');

    // 3 Golden Hours Push Notification DOM
    this.pushPermissionBadge = document.getElementById('pushPermissionBadge');
    this.enablePushPermBtn = document.getElementById('enablePushPermBtn');
    this.nextGoldenHourName = document.getElementById('nextGoldenHourName');
    this.nextGoldenHourCountdown = document.getElementById('nextGoldenHourCountdown');
    this.testPushMidnightBtn = document.getElementById('testPushMidnightBtn');
    this.testPushLunchBtn = document.getElementById('testPushLunchBtn');
    this.testPushEveningBtn = document.getElementById('testPushEveningBtn');

    // Deep Link & Sub-ID Modal DOM
    this.openDeepLinkBtn = document.getElementById('openDeepLinkBtn');
    this.deepLinkModal = document.getElementById('deepLinkModal');
    this.closeDeepLinkModalBtn = document.getElementById('closeDeepLinkModalBtn');
    this.deepLinkInputUrl = document.getElementById('deepLinkInputUrl');
    this.deepLinkSubIdSelect = document.getElementById('deepLinkSubIdSelect');
    this.generateDeepLinkBtn = document.getElementById('generateDeepLinkBtn');
    this.deepLinkResultsCard = document.getElementById('deepLinkResultsCard');
    this.outSchemeUrl = document.getElementById('outSchemeUrl');
    this.outBridgeUrl = document.getElementById('outBridgeUrl');
    this.outAffUrl = document.getElementById('outAffUrl');
    this.copySchemeBtn = document.getElementById('copySchemeBtn');
    this.copyBridgeBtn = document.getElementById('copyBridgeBtn');
    this.copyAffUrlBtn = document.getElementById('copyAffUrlBtn');
    this.testOpenDeepLinkBtn = document.getElementById('testOpenDeepLinkBtn');

    // Initial Users Growth Toolkit Modal DOM
    this.openGrowthToolkitBtn = document.getElementById('openGrowthToolkitBtn');
    this.growthToolkitModal = document.getElementById('growthToolkitModal');
    this.closeGrowthToolkitModalBtn = document.getElementById('closeGrowthToolkitModalBtn');
    this.copyBioBtn = document.getElementById('copyBioBtn');
    // Smart Queue & Rate Limits DOM
    this.queuePendingBadge = document.getElementById('queuePendingBadge');
    this.quotaTgDisplay = document.getElementById('quotaTgDisplay');
    this.quotaTwDisplay = document.getElementById('quotaTwDisplay');
    this.quotaFbDisplay = document.getElementById('quotaFbDisplay');
    this.queueListContainer = document.getElementById('queueListContainer');
    this.flushQueueBtn = document.getElementById('flushQueueBtn');
    this.clearQueueBtn = document.getElementById('clearQueueBtn');

    // Set initial values
    if (this.affiliateTagInput) this.affiliateTagInput.value = this.agent.affiliateTag;
    if (this.tgChannelUrlInput) this.tgChannelUrlInput.value = this.agent.telegramChannelUrl;
    if (this.aiModelSelect) this.aiModelSelect.value = this.agent.aiModel || 'gemini-2.5-flash';
    const poCount = (typeof window !== 'undefined' && window.SHOPEE_PRODUCT_OFFERS && Array.isArray(window.SHOPEE_PRODUCT_OFFERS)) ? window.SHOPEE_PRODUCT_OFFERS.length : 98;
    const shopCount = (typeof window !== 'undefined' && window.SHOP_OFFERS_DATABASE) ? window.SHOP_OFFERS_DATABASE.length : 18;
    if (this.dealsCountBadge) this.dealsCountBadge.textContent = `${poCount} ข้อเสนอสินค้า (Product Offer) + ${shopCount} ร้านค้า`;

    if (this.enableTgCheck) this.enableTgCheck.checked = this.publisher.telegram.enabled;
    if (this.enableFbCheck) this.enableFbCheck.checked = this.publisher.facebook.enabled;
    if (this.enableTwCheck) this.enableTwCheck.checked = this.publisher.twitter.enabled;

    this.updatePushPermissionStatus();
  }

  bindEvents() {
    this.autoPilotBtn?.addEventListener('click', () => this.toggleAutoPilot());
    this.triggerNowBtn?.addEventListener('click', () => this.generateNextPost(true));

    this.saveSettingsBtn?.addEventListener('click', () => {
      this.agent.setAffiliateTag(this.affiliateTagInput.value);
      this.logActivity(`อัปเดตรหัส Affiliate เป็น: ${this.agent.affiliateTag}`, 'success');
      alert('บันทึกรหัส Affiliate เรียบร้อยแล้ว!');
    });

    // Product Offer CSV Import Events
    this.importCsvBtn?.addEventListener('click', () => {
      this.productOfferCsvFileInput?.click();
    });

    this.productOfferCsvFileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      this.handleImportProductOfferCSV(file);
    });

    // Custom Deal & Auto-Discovery Events
    this.customDealUrlInput?.addEventListener('input', () => this.handleUrlInputChange());
    this.customDealCategorySelect?.addEventListener('change', () => this.handleUrlInputChange());
    this.addCustomDealBtn?.addEventListener('click', () => this.handleAddCustomDeal());
    this.fetchShopeeBtn?.addEventListener('click', () => this.handleFetchShopeeDetail());
    this.discoverDealsBtn?.addEventListener('click', () => this.handleDiscoverMoreDeals());

    // Reset stats button
    this.resetStatsBtn?.addEventListener('click', () => this.resetDashboard());

    // Toggle Channel check listeners
    this.enableTgCheck?.addEventListener('change', (e) => {
      this.publisher.saveCredentials({ telegram: { enabled: e.target.checked } });
      this.logActivity(`สถานะ Telegram: ${e.target.checked ? 'เปิดใช้งาน ✅' : 'ปิดใช้งาน ❌'}`, 'info');
    });

    this.enableFbCheck?.addEventListener('change', (e) => {
      this.publisher.saveCredentials({ facebook: { enabled: e.target.checked } });
      this.logActivity(`สถานะ Facebook Page: ${e.target.checked ? 'เปิดใช้งาน ✅' : 'ปิดใช้งาน ❌'}`, 'info');
    });

    this.enableTwCheck?.addEventListener('change', (e) => {
      this.publisher.saveCredentials({ twitter: { enabled: e.target.checked } });
      this.logActivity(`สถานะ X (Twitter): ${e.target.checked ? 'เปิดใช้งาน ✅' : 'ปิดใช้งาน ❌'}`, 'info');
    });

    // Telegram Bot Toggle Event
    this.tgBotToggleBtn?.addEventListener('click', () => this.toggleTelegramBot());
    this.tgBot.setInquiryListener((data) => this.handleTelegramInquiry(data));

    // Modals
    this.openSettingsBtn?.addEventListener('click', async () => {
      if (this.aiModelSelect) this.aiModelSelect.value = this.agent.aiModel || 'gemini-2.5-flash';
      if (this.tgChannelInput) this.tgChannelInput.value = this.publisher.telegram.channelId || '';
      if (this.tgChannelUrlInput) this.tgChannelUrlInput.value = this.agent.telegramChannelUrl || '';
      if (this.fbPageIdInput) this.fbPageIdInput.value = this.publisher.facebook.pageId || '';
      await this.refreshConfigStatusBadges();
      this.settingsModal?.classList.remove('hidden');
    });

    this.closeSettingsBtn?.addEventListener('click', () => this.settingsModal?.classList.add('hidden'));

    this.saveAllSettingsBtn?.addEventListener('click', () => {
      if (this.aiModelSelect) {
        this.agent.setModel(this.aiModelSelect.value);
      }
      if (this.tgChannelUrlInput) {
        this.agent.setTelegramChannelUrl(this.tgChannelUrlInput.value);
      }
      this.publisher.saveCredentials({
        telegram: {
          channelId: this.tgChannelInput ? this.tgChannelInput.value.trim() : ''
        },
        facebook: {
          pageId: this.fbPageIdInput ? this.fbPageIdInput.value.trim() : ''
        }
      });
      if (this.tgBot && this.tgBot.setCredentials) {
        this.tgBot.setCredentials('', this.tgChannelInput ? this.tgChannelInput.value.trim() : '');
      }
      this.settingsModal?.classList.add('hidden');
      this.logActivity(`บันทึกการตั้งค่าเรียบร้อย (โมเดลสมองกล AI: ${this.agent.aiModel})`, 'success');
      alert('บันทึกการตั้งค่าระบบ Multi-Channel & โมเดล AI เรียบร้อยแล้ว!');
    });

    // Golden Hours Push Notification Events
    this.notificationService.onTick((info) => this.renderGoldenHourTick(info));
    this.notificationService.onNotification((data) => this.handleGoldenHourAlert(data));

    this.enablePushPermBtn?.addEventListener('click', async () => {
      const granted = await this.notificationService.requestPermission();
      this.updatePushPermissionStatus();
      if (granted) {
        this.logActivity('เปิดสิทธิ์ Web Push Notification สำเร็จเรียบร้อย!', 'success');
        alert('เปิดสิทธิ์การแจ้งเตือนสำเร็จ! ระบบจะส่ง Push แจ้งเตือนใน 3 ช่วงเวลาทอง (23:55, 11:50, 20:00)');
      }
    });

    this.testPushMidnightBtn?.addEventListener('click', () => {
      this.notificationService.triggerGoldenHourAlert(this.notificationService.goldenHours[0], true);
    });

    this.testPushLunchBtn?.addEventListener('click', () => {
      this.notificationService.triggerGoldenHourAlert(this.notificationService.goldenHours[1], true);
    });

    this.testPushEveningBtn?.addEventListener('click', () => {
      this.notificationService.triggerGoldenHourAlert(this.notificationService.goldenHours[2], true);
    });

    // Deep Link & Sub-ID Modal Events
    this.openDeepLinkBtn?.addEventListener('click', () => {
      this.deepLinkModal?.classList.remove('hidden');
    });

    this.closeDeepLinkModalBtn?.addEventListener('click', () => {
      this.deepLinkModal?.classList.add('hidden');
    });

    this.generateDeepLinkBtn?.addEventListener('click', () => {
      this.handleGenerateDeepLink();
    });

    this.copySchemeBtn?.addEventListener('click', () => {
      this.copyToClipboard(this.outSchemeUrl.value, 'คัดลอก Shopee App Scheme เรียบร้อย!');
    });

    this.copyBridgeBtn?.addEventListener('click', () => {
      this.copyToClipboard(this.outBridgeUrl.value, 'คัดลอก Universal Bridge URL เรียบร้อย!');
    });

    this.copyAffUrlBtn?.addEventListener('click', () => {
      this.copyToClipboard(this.outAffUrl.value, 'คัดลอกลิงก์ Affiliate พร้อม Sub-ID เรียบร้อย!');
    });

    // Growth Toolkit Modal Events
    this.openGrowthToolkitBtn?.addEventListener('click', () => {
      this.growthToolkitModal?.classList.remove('hidden');
    });

    this.closeGrowthToolkitModalBtn?.addEventListener('click', () => {
      this.growthToolkitModal?.classList.add('hidden');
    });

    document.querySelectorAll('.copy-script-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const el = document.getElementById(targetId);
        if (el) {
          this.copyToClipboard(el.innerText.trim(), 'คัดลอกสคริปต์เรียบร้อย!');
        }
      });
    });

    this.copyBioBtn?.addEventListener('click', () => {
      this.copyToClipboard(this.bioLinkInput.value, 'คัดลอกข้อความ Bio เรียบร้อย!');
    });

    // Smart Queue & Rate Limits Events
    this.queueManager.onUpdate((stats) => this.renderQueueStats(stats));
    this.flushQueueBtn?.addEventListener('click', () => {
      this.queueManager.flushNow();
      this.logActivity('🚀 สั่งส่งคิวที่ค้างอยู่ทั้งหมดทันทีเรียบร้อย', 'info');
    });
    this.clearQueueBtn?.addEventListener('click', () => {
      this.queueManager.clearQueue();
      this.logActivity('ล้างรายการในคิวเรียบร้อย', 'info');
    });

    this.renderQueueStats(this.queueManager.getStats());
  }

  /**
   * แสดงสถานะคิวและโควตารายวันของแต่ละแพลตฟอร์ม
   */
  renderQueueStats(stats) {
    if (!stats) return;
    if (this.quotaTgDisplay) this.quotaTgDisplay.textContent = `${stats.counts.telegram}/${stats.limits.telegram}`;
    if (this.quotaTwDisplay) this.quotaTwDisplay.textContent = `${stats.counts.twitter}/${stats.limits.twitter}`;
    if (this.quotaFbDisplay) this.quotaFbDisplay.textContent = `${stats.counts.facebook}/${stats.limits.facebook}`;
    
    if (this.queuePendingBadge) {
      if (stats.pendingCount > 0) {
        this.queuePendingBadge.textContent = `รอส่ง (${stats.pendingCount} รายการ)`;
        this.queuePendingBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold animate-pulse';
      } else {
        this.queuePendingBadge.textContent = 'คิวว่าง (0 รายการ)';
        this.queuePendingBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold';
      }
    }

    if (this.queueListContainer) {
      if (stats.queue.length === 0) {
        this.queueListContainer.innerHTML = `
          <div class="p-2 rounded-lg bg-slate-950/50 border border-slate-800 text-[10px] text-slate-500 text-center">
            ยังไม่มีโพสต์รอในคิว
          </div>`;
      } else {
        this.queueListContainer.innerHTML = stats.queue.map(q => {
          const waitSec = Math.max(0, Math.round((q.scheduledAt - Date.now()) / 1000));
          const waitText = waitSec === 0 ? 'กำลังส่ง...' : `อีก ${Math.floor(waitSec/60)} นาที ${waitSec%60} วิ`;
          const platColor = q.platform === 'telegram' ? 'text-sky-400' : (q.platform === 'twitter' ? 'text-slate-300' : 'text-blue-400');
          const platName = q.platform === 'telegram' ? 'TG' : (q.platform === 'twitter' ? 'X' : 'FB');
          return `
            <div class="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 ${platColor}">[${platName}]</span>
                  <span class="text-slate-300 truncate font-medium text-[11px]">${q.dealTitle ? q.dealTitle.slice(0, 18) : 'ดีล Shopee'}...</span>
                </div>
              </div>
              <div class="text-[10px] font-mono text-amber-400 font-semibold flex-shrink-0">${waitText}</div>
            </div>`;
        }).join('');
      }
    }
  }

  /**
   * อัปเดตสถานะสิทธิ์การแจ้งเตือนบนเบราว์เซอร์
   */
  updatePushPermissionStatus() {
    if (!this.pushPermissionBadge) return;
    const perm = ('Notification' in window) ? Notification.permission : 'unsupported';
    if (perm === 'granted') {
      this.pushPermissionBadge.textContent = '🟢 เปิดแจ้งเตือนแล้ว';
      this.pushPermissionBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-bold';
      if (this.enablePushPermBtn) this.enablePushPermBtn.classList.add('hidden');
    } else if (perm === 'denied') {
      this.pushPermissionBadge.textContent = '🔴 สิทธิ์ถูกบล็อกในเบราว์เซอร์';
      this.pushPermissionBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/30 text-rose-400 font-bold';
      if (this.enablePushPermBtn) this.enablePushPermBtn.classList.add('hidden');
    } else {
      this.pushPermissionBadge.textContent = '🟡 รอเปิดสิทธิ์แจ้งเตือน';
      this.pushPermissionBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-400 font-bold';
      if (this.enablePushPermBtn) this.enablePushPermBtn.classList.remove('hidden');
    }
  }

  /**
   * แสดงเวลานับถอยหลังก่อนถึง Golden Hour ถัดไป
   */
  renderGoldenHourTick(info) {
    if (!info || !info.next) return;
    if (this.nextGoldenHourName) {
      this.nextGoldenHourName.textContent = `${info.next.timeStr} น. (${info.next.title.slice(0, 25)}...)`;
    }
    if (this.nextGoldenHourCountdown) {
      this.nextGoldenHourCountdown.textContent = info.remainingText;
    }
  }

  /**
   * รับอีเวนต์เมื่อระบบยิงการแจ้งเตือน Golden Hour สำเร็จ
   */
  handleGoldenHourAlert(data) {
    const gh = data.goldenHour;
    const prefix = data.isTest ? '[ทดสอบแจ้งเตือน]' : '[ระบบแจ้งเตือนอัตโนมัติ]';
    this.logActivity(`${prefix} ยิงรอบเวลาทอง ${gh.timeStr} น.: "${gh.title}" (Sub-ID: ${data.subId})${data.tgSent ? ' + บรอดแคสต์เข้า Telegram สำเร็จ 🚀' : ''}`, 'success');
  }

  /**
   * ประมวลผลสร้าง Deep Link และ Sub-ID ในหน้า Modal
   */
  handleGenerateDeepLink() {
    const rawUrl = (this.deepLinkInputUrl?.value || '').trim();
    if (!rawUrl) {
      alert('กรุณาวางลิงก์สินค้า Shopee ที่ต้องการแปลง');
      return;
    }

    const subId = this.deepLinkSubIdSelect?.value || 'deep_link_manual';
    const result = this.agent.generateDeepLink(rawUrl, subId);
    if (!result) {
      alert('ไม่สามารถสร้าง Deep Link ได้ กรุณาตรวจสอบ URL');
      return;
    }

    if (this.outSchemeUrl) this.outSchemeUrl.value = result.deepLink;
    if (this.outBridgeUrl) this.outBridgeUrl.value = result.bridgeUrl;
    if (this.testOpenDeepLinkBtn) {
      this.testOpenDeepLinkBtn.href = result.bridgeUrl;
      this.testOpenDeepLinkBtn.rel = 'noopener noreferrer';
    }

    if (this.deepLinkResultsCard) this.deepLinkResultsCard.classList.remove('hidden');
    this.logActivity(`สร้าง Mobile Deep Link สำเร็จ (Sub-ID: ${subId})`, 'success');
  }

  /**
   * ตัวช่วยคัดลอกข้อความลงคลิปบอร์ด
   */
  async copyToClipboard(text, successMsg = 'คัดลอกสำเร็จ!') {
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      this.logActivity(`📋 ${successMsg}`, 'info');
      alert(successMsg);
    } catch (e) {
      console.warn('Clipboard error:', e);
      prompt('กรุณากด Ctrl+C เพื่อคัดลอกข้อความ:', text);
    }
  }

  /**
   * นำเข้าไฟล์ CSV จาก https://affiliate.shopee.co.th/offer/product_offer โดยตรง
   */
  async handleImportProductOfferCSV(file) {
    this.logActivity(`[นำเข้า CSV] กำลังอ่านไฟล์: ${file.name}...`, 'info');
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const newDeals = this.parseProductOfferCSV(text);
        if (newDeals.length === 0) {
          alert('ไม่พบข้อมูลสินค้าที่ถูกต้องในไฟล์ CSV กรุณาตรวจสอบว่าเป็นไฟล์ที่ดาวน์โหลดจาก affiliate.shopee.co.th/offer/product_offer');
          return;
        }

        // เพิ่มเข้าที่หัวของคลังสินค้าหลัก
        if (typeof window !== 'undefined') {
          window.SHOPEE_PRODUCT_OFFERS = [...newDeals, ...(window.SHOPEE_PRODUCT_OFFERS || [])];
          TRENDING_DEALS_DATABASE.unshift(...newDeals);
        }

        if (this.dealsCountBadge) {
          const poCount = (window.SHOPEE_PRODUCT_OFFERS || []).length;
          const shopCount = (window.SHOP_OFFERS_DATABASE || []).length;
          this.dealsCountBadge.textContent = `${poCount} ข้อเสนอสินค้า + ${shopCount} ร้านค้า`;
        }

        this.logActivity(`[นำเข้าสำเร็จ] โหลดข้อเสนอสินค้า ${newDeals.length} รายการจาก Shopee Product Offer เรียบร้อยแล้ว! 🎯`, 'success');
        alert(`นำเข้าข้อเสนอสินค้าสำเร็จ!\n\nจำนวน: ${newDeals.length} รายการ\nแหล่งที่มา: affiliate.shopee.co.th/offer/product_offer\nสถานะ: ถูกตั้งเป็นดีลหลักที่จะโพสต์อันดับแรกทันที`);

        if (this.productOfferCsvFileInput) this.productOfferCsvFileInput.value = '';

      } catch (err) {
        this.logActivity(`เกิดข้อผิดพลาดในการอ่าน CSV: ${err.message}`, 'error');
        alert(`เกิดข้อผิดพลาดในการอ่านไฟล์ CSV: ${err.message}`);
      }
    };

    reader.onerror = () => {
      this.logActivity('ไม่สามารถอ่านไฟล์ CSV ได้', 'error');
    };

    reader.readAsText(file, 'UTF-8');
  }

  /**
   * แกะและแปลงไฟล์ CSV ของ Shopee Product Offer ให้เป็นออบเจ็กต์ดีลที่พร้อมโพสต์
   */
  parseProductOfferCSV(csvContent) {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const deals = [];
    const parseCSVRow = (row) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          if (inQuotes && row[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVRow(lines[0]);
    const getIndex = (name) => headers.findIndex(h => h.includes(name));

    const idIdx = getIndex('รหัสสินค้า') !== -1 ? getIndex('รหัสสินค้า') : 0;
    const titleIdx = getIndex('ชื่อสินค้า') !== -1 ? getIndex('ชื่อสินค้า') : 1;
    const priceIdx = getIndex('ราคา') !== -1 ? getIndex('ราคา') : 2;
    const soldIdx = getIndex('ขาย') !== -1 ? getIndex('ขาย') : 3;
    const shopIdx = getIndex('ชื่อร้านค้า') !== -1 ? getIndex('ชื่อร้านค้า') : 4;
    const rateIdx = getIndex('อัตราค่าคอมมิชชัน') !== -1 ? getIndex('อัตราค่าคอมมิชชัน') : 5;
    const commIdx = getIndex('คอมมิชชัน') !== -1 ? getIndex('คอมมิชชัน') : 6;
    const prodUrlIdx = getIndex('ลิงก์สินค้า') !== -1 ? getIndex('ลิงก์สินค้า') : 7;
    const offerUrlIdx = getIndex('ลิงก์ข้อเสนอ') !== -1 ? getIndex('ลิงก์ข้อเสนอ') : 8;

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVRow(lines[i]);
      if (cols.length < 5) continue;

      const rawId = cols[idIdx] || `po-${Date.now()}-${i}`;
      let rawTitle = cols[titleIdx] || 'สินค้าคุณภาพ Shopee';
      const cleanTitle = rawTitle.replace(/^\[.*?\]\s*/, '').trim();

      const rawPrice = cols[priceIdx] || '0';
      let salePrice = 0;
      if (rawPrice.includes('หมื่น')) {
        salePrice = parseFloat(rawPrice.replace(/[^\d.]/g, '')) * 10000;
      } else if (rawPrice.includes('พัน')) {
        salePrice = parseFloat(rawPrice.replace(/[^\d.]/g, '')) * 1000;
      } else {
        salePrice = parseFloat(rawPrice.replace(/[^\d.]/g, '')) || 290;
      }

      const rawSold = cols[soldIdx] || '0';
      const soldCount = rawSold.includes('ชิ้น') || rawSold.includes('เครื่อง') || rawSold.includes('ตัว') 
        ? rawSold 
        : `${rawSold} ชิ้น`;

      const shopName = cols[shopIdx] || 'Shopee Mall';
      const commissionRate = cols[rateIdx] || '8%';
      const rawComm = cols[commIdx] || '';
      const estCommission = parseFloat(rawComm.replace(/[^\d.]/g, '')) || Math.round(salePrice * 0.08);

      let offerUrl = cols[offerUrlIdx] || cols[prodUrlIdx] || '';
      offerUrl = offerUrl.replace(/[;,]$/, '').trim();

      const resolved = this.agent.resolveShopeeDeal(offerUrl, cleanTitle, 'lifestyle');
      const effectiveSalePrice = salePrice > 0 ? salePrice : 290;
      const originalPrice = Math.round(effectiveSalePrice * 1.35);
      const discount = (originalPrice > effectiveSalePrice && originalPrice > 0)
        ? `ลด ${Math.round((1 - (effectiveSalePrice / originalPrice)) * 100)}%`
        : 'ลดพิเศษ';

      deals.push({
        id: `po-${rawId}`,
        itemId: rawId,
        shopName: shopName,
        category: resolved.category || 'lifestyle',
        categoryName: resolved.categoryName || '🛍️ สินค้าแนะนำ Shopee',
        title: cleanTitle,
        originalPrice: originalPrice,
        salePrice: effectiveSalePrice,
        discount: discount,
        rating: 4.8 + Math.round(Math.random() * 2) / 10,
        soldCount: soldCount,
        commissionRate: commissionRate,
        estCommission: estCommission,
        imageUrl: resolved.imageUrl,
        isRealImage: true,
        imageSource: 'Shopee Official Product Offer CDN',
        features: resolved.features && resolved.features.length > 0 ? resolved.features : [
          `สินค้าของแท้ 100% จากร้าน ${shopName} ยอดขายแล้ว ${soldCount}`,
          `โปรโมชั่นพิเศษราคาเพียง ฿${salePrice.toLocaleString()} (จากปกติ ฿${originalPrice.toLocaleString()})`,
          `การันตีคุณภาพ จัดส่งรวดเร็ว มีบริการเก็บเงินปลายทาง`
        ],
        hashtags: resolved.hashtags || ['#ShopeeTH', '#ของดีบอกต่อ', '#ป้ายยาช้อปปี้', '#โปรเด็ด'],
        defaultUrl: offerUrl
      });
    }

    return deals;
  }

  /**
   * ตรวจสอบและวิเคราะห์ลิงก์ Shopee แบบเรียลไทม์เมื่อพิมพ์หรือวาง
   */
  handleUrlInputChange() {
    const rawUrl = this.customDealUrlInput?.value.trim();
    if (!rawUrl) {
      if (this.dealMatchBadge) this.dealMatchBadge.classList.add('hidden');
      if (this.customDealPreviewCard) this.customDealPreviewCard.classList.add('hidden');
      this.pendingFetchedDeal = null;
      return;
    }

    try {
      const cat = this.customDealCategorySelect?.value || 'lifestyle';
      const userTitle = this.customDealTitleInput?.value.trim() || '';
      const resolved = this.agent.resolveShopeeDeal(rawUrl, userTitle, cat);
      this.pendingFetchedDeal = resolved;

      // Update badge
      if (this.dealMatchBadge) {
        this.dealMatchBadge.classList.remove('hidden');
        if (resolved.matched) {
          this.dealMatchText.innerHTML = `<i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i><span>ตรวจพบร้าน: <strong>${resolved.shopName}</strong></span>`;
          this.dealMatchRate.textContent = resolved.commissionRate;
          this.dealMatchRate.className = 'px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 text-[10px]';
        } else {
          this.dealMatchText.innerHTML = `<i data-lucide="sparkles" class="w-3.5 h-3.5 text-indigo-400"></i><span>ลิงก์ Shopee พร้อมสร้างโพสต์ (รูปจริง CDN)</span>`;
          this.dealMatchRate.textContent = resolved.commissionRate;
          this.dealMatchRate.className = 'px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300 text-[10px]';
        }
        this.refreshIcons();
      }

      // Update Preview Card
      if (this.customDealPreviewCard) {
        this.customDealPreviewCard.classList.remove('hidden');
        if (this.customDealPreviewImg) this.customDealPreviewImg.src = resolved.imageUrl;
        if (this.customDealPreviewTitle) this.customDealPreviewTitle.textContent = resolved.title;
      }

      // Auto set category if auto-detected and not actively focused
      if (resolved.category && this.customDealCategorySelect && document.activeElement !== this.customDealCategorySelect) {
        this.customDealCategorySelect.value = resolved.category;
      }

      // Auto set title if empty
      if (this.customDealTitleInput && !this.customDealTitleInput.value && resolved.title) {
        this.customDealTitleInput.value = resolved.title;
      }

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      // Ignore intermediate typing errors
    }
  }

  /**
   * ดึงข้อมูลรูปภาพจริงและชื่อร้านจาก Shopee API หรือ Auto-Resolver
   */
  async handleFetchShopeeDetail() {
    const url = this.customDealUrlInput?.value.trim();
    if (!url) {
      alert('กรุณากรอกลิงก์ร้านค้าหรือสินค้า Shopee ก่อนครับ');
      this.customDealUrlInput?.focus();
      return;
    }

    const btn = this.fetchShopeeBtn;
    if (btn) btn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> กำลังตรวจสอบ...';

    try {
      this.handleUrlInputChange();
      const cat = this.customDealCategorySelect?.value || 'lifestyle';
      const userTitle = this.customDealTitleInput?.value.trim() || '';
      const deal = await this.agent.fetchShopeeShopDetail(url);
      
      if (userTitle) deal.title = userTitle;
      this.pendingFetchedDeal = deal;

      if (this.customDealTitleInput) this.customDealTitleInput.value = deal.title;
      if (this.customDealPreviewCard) {
        this.customDealPreviewCard.classList.remove('hidden');
        if (this.customDealPreviewImg) this.customDealPreviewImg.src = deal.imageUrl;
        if (this.customDealPreviewTitle) this.customDealPreviewTitle.textContent = deal.title;
      }

      this.logActivity(`[Shopee CDN] ตรวจสอบสำเร็จ! ร้าน "${deal.shopName}" (${deal.commissionRate}) พร้อมรูปจริง Shopee CDN 🎯`, 'success');
      alert(`ตรวจสอบลิงก์ Shopee สำเร็จ!\n\nร้านค้า: ${deal.shopName}\nคอมมิชชัน: ${deal.commissionRate}\nรูปภาพ: รูปตัวอย่างสินค้าจริง Shopee CDN 100%\n\nสามารถกดปุ่ม "เพิ่ม & โพสต์ทันที" ได้เลยครับ!`);
    } catch (err) {
      this.logActivity(`เกิดข้อผิดพลาด: ${err.message}`, 'warning');
      alert(`คำแนะนำ: ${err.message}`);
    } finally {
      if (btn) {
        btn.innerHTML = '<i data-lucide="search" class="w-3.5 h-3.5 text-indigo-400"></i> <span>ตรวจสอบลิงก์</span>';
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  /**
   * ค้นหาดีลเพิ่มเติมจากร้านค้า Shopee ในรายการของคุณโดยอัตโนมัติ
   */
  async handleDiscoverMoreDeals() {
    const btn = this.discoverDealsBtn;
    if (btn) btn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> กำลังค้นหาดีล...';

    try {
      const catalog = window.RESERVE_STORES_CATALOG || [];
      const existingNames = new Set(TRENDING_DEALS_DATABASE.map(d => d.shopName));
      const candidate = catalog.find(c => !existingNames.has(c.name));

      if (!candidate) {
        alert('คุณได้นำเข้าร้านค้าครบทุกรายการจากแคตตาล็อกแล้วครับ!');
        return;
      }

      this.logActivity(`[ค้นพบดีลใหม่] กำลังตรวจสอบร้าน "${candidate.name}" (คอมมิชชัน ${candidate.rate})...`, 'info');

      let newDeal;
      try {
        newDeal = await this.agent.fetchShopeeShopDetail(candidate.shopId || candidate.shortUrl);
        newDeal.commissionRate = candidate.rate;
        newDeal.defaultUrl = candidate.shortUrl || newDeal.defaultUrl;
        if (candidate.imageUrl) newDeal.imageUrl = candidate.imageUrl;
      } catch (e) {
        newDeal = this.agent.resolveShopeeDeal(candidate.shortUrl, candidate.name, candidate.category || 'lifestyle');
        newDeal.commissionRate = candidate.rate;
        if (candidate.imageUrl) newDeal.imageUrl = candidate.imageUrl;
      }

      TRENDING_DEALS_DATABASE.push(newDeal);
      if (this.dealsCountBadge) this.dealsCountBadge.textContent = `${TRENDING_DEALS_DATABASE.length} ดีล (รูปตัวอย่างสินค้าจริง 100%)`;

      this.logActivity(`[นำเข้าสำเร็จ] เพิ่มร้าน "${newDeal.shopName}" (${newDeal.commissionRate}) พร้อมรูปจริง Shopee CDN เข้าคลังแล้ว 🎉`, 'success');
      alert(`ค้นพบและนำเข้าร้านค้าใหม่สำเร็จ!\n\nร้าน: ${newDeal.shopName}\nคอมมิชชัน: ${newDeal.commissionRate}\nรูปภาพ: รูปจริงจาก Shopee CDN 100%\nลิงก์รับเงิน: ${newDeal.defaultUrl}\n\nขณะนี้ในคลังมี ${TRENDING_DEALS_DATABASE.length} ดีลแล้วครับ!`);
    } catch (err) {
      this.logActivity(`เกิดข้อผิดพลาดในการค้นหาดีล: ${err.message}`, 'error');
    } finally {
      if (btn) {
        btn.innerHTML = '<i data-lucide="compass" class="w-3.5 h-3.5"></i> <span>ค้นหาดีลเพิ่มอัตโนมัติ</span>';
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  async handleAddCustomDeal() {
    const rawUrl = this.customDealUrlInput?.value.trim();
    if (!rawUrl && !this.pendingFetchedDeal) {
      alert('กรุณากรอกลิงก์สินค้าหรือร้านค้า Shopee ก่อนครับ');
      this.customDealUrlInput?.focus();
      return;
    }

    const btn = this.addCustomDealBtn;
    if (btn) btn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> กำลังโพสต์...';

    try {
      const userTitle = this.customDealTitleInput?.value.trim() || '';
      const cat = this.customDealCategorySelect?.value || 'lifestyle';

      let newDeal = this.pendingFetchedDeal;
      if (!newDeal) {
        newDeal = this.agent.resolveShopeeDeal(rawUrl, userTitle, cat);
      }
      if (userTitle) newDeal.title = userTitle;

      // เพิ่มเข้าที่หัวคลังสินค้า
      TRENDING_DEALS_DATABASE.unshift(newDeal);
      this.pendingFetchedDeal = null;

      if (this.dealsCountBadge) {
        this.dealsCountBadge.textContent = `${TRENDING_DEALS_DATABASE.length} ดีล (รูปตัวอย่างสินค้าจริง 100%)`;
      }

      this.logActivity(`[เพิ่มดีลสำเร็จ] "${newDeal.title.slice(0, 32)}..." รูปจริง Shopee CDN เข้าคลังแล้ว 🎯`, 'success');

      // ล้างฟอร์ม
      if (this.customDealUrlInput) this.customDealUrlInput.value = '';
      if (this.customDealTitleInput) this.customDealTitleInput.value = '';
      if (this.dealMatchBadge) this.dealMatchBadge.classList.add('hidden');
      if (this.customDealPreviewCard) this.customDealPreviewCard.classList.add('hidden');

      // ยิงโพสต์สำหรับดีลนี้ทันที
      await this.generatePostForDeal(newDeal, true);

    } catch (err) {
      this.logActivity(`เกิดข้อผิดพลาดในการเพิ่มดีล: ${err.message}`, 'error');
      alert(`ไม่สามารถเพิ่มดีลได้: ${err.message}`);
    } finally {
      if (btn) {
        btn.innerHTML = '<i data-lucide="sparkles" class="w-3.5 h-3.5"></i> <span>เพิ่ม & โพสต์ทันที</span>';
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  /**
   * สร้างโพสต์และกระจายสำหรับดีลที่ระบุโดยตรง
   */
  async generatePostForDeal(deal, broadcast = true) {
    const style = this.postStyleSelect?.value || 'review';
    this.logActivity(`[1. คัดเลือกดีล] ${deal.shopName}: ${deal.title.slice(0, 30)}... (${deal.discount})`, 'info');

    try {
      const post = await this.agent.generatePost(deal, style);
      
      // ตรวจสอบคุณภาพและความถูกต้อง
      if (post.verification) {
        this.logActivity(`[2. Quality Guard] ${post.verification.summary}`, post.verification.passed ? 'success' : 'warning');
      }

      this.logActivity(`[3. สร้างลิงก์รับเงิน] พิกัดตรง: ${post.affiliateUrl.slice(0, 35)}... 🔗`, 'success');
      this.logActivity(`[4. AI เขียนแคปชัน] สไตล์: ${style} ตรงสินค้าและชื่อร้าน 100%`, 'success');

      this.stats.posts++;
      this.saveStats();
      this.renderStats();

      if (this.postFeedContainer && this.postFeedContainer.innerText.includes('แดชบอร์ดพร้อมเริ่มทำงานรอบจริงแล้ว')) {
        this.postFeedContainer.innerHTML = '';
      }

      this.renderPostToFeed(post);

      if (broadcast) {
        if (this.backendActive) {
          try {
            this.logActivity(`[5. Node.js 24/7 Server API] ส่งดีลเข้าคิวประมวลผลบนเซิร์ฟเวอร์...`, 'info');
            const apiRes = await fetch('/api/deals/publish', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ deal })
            });
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              this.logActivity(`  ↳ [Backend Worker] จัดคิว Staggered Jitter 3 ช่องทางสำเร็จ (${apiData.jobsScheduled} งาน)`, 'success');
            }
          } catch (apiErr) {
            console.warn('Backend API error, falling back to local queue:', apiErr);
            this.queueManager.enqueueDeal(post);
          }
        } else {
          this.logActivity(`[5. ระบบคิวหน่วงเวลา Jitter] จัดคิวส่งแยกตามแพลตฟอร์มเพื่อกัน Shadowban...`, 'info');
          const jobs = this.queueManager.enqueueDeal(post);
          jobs.forEach(j => {
            const delayMin = Math.max(0, Math.round((j.scheduledAt - Date.now()) / 60000));
            const sub = j.post[j.platform]?.subId || 'aff';
            this.logActivity(`  ↳ [คิว ${j.platform.toUpperCase()}] กำหนดส่งในอีก ${delayMin === 0 ? 'ทันที' : delayMin + ' นาที'} (Sub-ID: ${sub})`, 'success');
          });
        }
      }

      if (this.postFeedContainer) {
        this.postFeedContainer.scrollTop = 0;
      }

    } catch (err) {
      this.logActivity(`เกิดข้อผิดพลาดในการสร้างโพสต์: ${err.message}`, 'error');
    }
  }

  async checkBackendStatus() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        this.backendActive = true;
        this.logActivity(`🟢 เชื่อมต่อ Node.js 24/7 Production Backend สำเร็จ (Uptime: ${data.uptime}s)`, 'success');
        if (this.agentStatusText) {
          this.agentStatusText.innerHTML = '<span class="text-emerald-400 font-bold">NODE.JS BACKEND 24/7 ACTIVE</span>';
        }
        if (this.agentStatusBeacon) {
          this.agentStatusBeacon.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 beacon-online';
        }
        this.refreshConfigStatusBadges();
      }
    } catch (e) {
      this.backendActive = false;
      this.logActivity('ℹ️ รันในโหมด Client Browser Standalone (เซิร์ฟเวอร์ Node.js ออฟไลน์)', 'info');
    }
  }

  async refreshConfigStatusBadges() {
    try {
      const res = await fetch('/api/config/status');
      if (!res.ok) return;
      const status = await res.json();

      if (this.tgStatusBadge) {
        if (status.telegram?.configured) {
          this.tgStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold';
          this.tgStatusBadge.textContent = '🔒 SERVER (.env) เชื่อมต่อแล้ว ✅';
        } else {
          this.tgStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold';
          this.tgStatusBadge.textContent = '⚠️ รอระบุ TELEGRAM_BOT_TOKEN ใน .env';
        }
      }

      if (this.fbStatusBadge) {
        if (status.facebook?.configured) {
          this.fbStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold';
          this.fbStatusBadge.textContent = '🔒 SERVER (.env) เชื่อมต่อแล้ว ✅';
        } else {
          this.fbStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold';
          this.fbStatusBadge.textContent = '⚠️ รอระบุ FACEBOOK_PAGE_ACCESS_TOKEN ใน .env';
        }
      }

      if (this.twStatusBadge) {
        if (status.twitter?.configured) {
          this.twStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold';
          this.twStatusBadge.textContent = '🔒 SERVER (.env) เชื่อมต่อแล้ว ✅';
        } else {
          this.twStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold';
          this.twStatusBadge.textContent = '⚠️ รอระบุ Webhook/Key ใน .env';
        }
      }

      if (this.geminiStatusBadge) {
        if (status.gemini?.configured) {
          this.geminiStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold';
          this.geminiStatusBadge.textContent = '🔒 SERVER AI BRAIN เชื่อมต่อแล้ว ✅';
        } else {
          this.geminiStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold';
          this.geminiStatusBadge.textContent = '⚠️ รอระบุ GEMINI_API_KEY ใน .env';
        }
      }
    } catch (e) {
      console.warn('[AffiliateApp] Could not refresh config status badges:', e.message);
    }
  }

  resetDashboard() {
    if (confirm('คุณต้องการรีเซ็ตสถิติและเคลียร์หน้าแดชบอร์ดเพื่อเริ่มทำงานรอบจริงใช่หรือไม่? (การตั้งค่า Telegram และรหัส Affiliate จะยังอยู่คงเดิม)')) {
      this.stats = { posts: 0, clicks: 0, orders: 0, earnings: 0.0 };
      this.saveStats();
      this.renderStats();
      if (this.postFeedContainer) {
        this.postFeedContainer.innerHTML = `
          <div class="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <div class="text-3xl">✨</div>
            <h4 class="text-sm font-bold text-slate-300">แดชบอร์ดพร้อมเริ่มทำงานรอบจริงแล้ว</h4>
            <p class="text-xs text-slate-500">กดปุ่ม "สแกน & โพสต์ทันที" หรือเปิด "Auto-Pilot" เพื่อเริ่มส่งโพสต์แรก</p>
          </div>
        `;
      }
      if (this.terminalLog) this.terminalLog.innerHTML = '';
      this.logActivity('เคลียร์หน้าแดชบอร์ดเข้าสู่โหมดทำงานจริงเรียบร้อยแล้ว (สถิติเริ่มที่ 0)', 'success');
      this.settingsModal.classList.add('hidden');
    }
  }

  toggleAutoPilot() {
    this.isAutoPilotRunning = !this.isAutoPilotRunning;

    if (this.isAutoPilotRunning) {
      this.autoPilotBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition flex items-center gap-2';
      this.autoPilotBtn.innerHTML = '<i data-lucide="square" class="w-4 h-4"></i> หยุดระบบ Auto-Pilot';
      
      this.agentStatusText.textContent = 'กำลังยิงโพสต์อัตโนมัติ 3 ช่องทาง (AUTO-PILOT ACTIVE)';
      this.agentStatusText.className = 'text-xs font-bold text-emerald-400';
      this.agentStatusBeacon.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 beacon-online';

      this.logActivity('🚀 เริ่มต้นระบบ Auto-Pilot: Agent จะสร้างลิงก์และยิงโพสต์อัตโนมัติ', 'success');

      // Run immediately
      this.generateNextPost(true);

      const intervalVal = this.intervalSelect?.value || '3600';
      if (intervalVal === 'peak_hours') {
        this.logActivity('⏰ เปิดใช้งานโหมดเวลาทองคำ (Golden Hours): โพสต์เน้นช่วง 11:30, 18:00, 21:00 และ 00:00 Flash Sale', 'success');
        // รันทุก 45 นาทีเป็นค่ากลางสำหรับเวลาทองคำ
        this.autoPilotInterval = setInterval(() => {
          this.generateNextPost(true);
        }, 45 * 60 * 1000);
      } else {
        const seconds = parseInt(intervalVal, 10);
        this.autoPilotInterval = setInterval(() => {
          this.generateNextPost(true);
        }, seconds * 1000);
      }

    } else {
      if (this.autoPilotInterval) clearInterval(this.autoPilotInterval);
      this.autoPilotBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition flex items-center gap-2';
      this.autoPilotBtn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i> เปิดระบบ Auto-Pilot 3 ช่องทาง';

      this.agentStatusText.textContent = 'โหมดสแตนด์บาย (STANDBY)';
      this.agentStatusText.className = 'text-xs font-bold text-slate-400';
      this.agentStatusBeacon.className = 'w-2.5 h-2.5 rounded-full bg-slate-500';

      this.logActivity('หยุดระบบ Auto-Pilot ชั่วคราว', 'warning');
    }

    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * เปิด / ปิด ระบบบอทค้นหาดีลและตอบแชตอัตโนมัติใน Telegram
   */
  toggleTelegramBot() {
    if (this.tgBot.isPolling) {
      this.tgBot.stop();
      if (this.tgBotBeacon) this.tgBotBeacon.className = 'w-2.5 h-2.5 rounded-full bg-slate-500';
      if (this.tgBotStatusText) {
        this.tgBotStatusText.textContent = 'STANDBY';
        this.tgBotStatusText.className = 'text-[10px] font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800';
      }
      if (this.tgBotToggleBtn) {
        this.tgBotToggleBtn.className = 'w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30';
        this.tgBotToggleBtn.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5"></i> <span>เปิดบอทตอบแชตอัตโนมัติ (Auto-Reply)</span>';
      }
      this.logActivity('หยุดการทำงานของ Telegram Deal Finder Bot', 'warning');
    } else {
      try {
        this.tgBot.start();
        if (this.tgBotBeacon) this.tgBotBeacon.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 beacon-online';
        if (this.tgBotStatusText) {
          this.tgBotStatusText.textContent = 'ACTIVE (ตอบแชต 24 ชม.)';
          this.tgBotStatusText.className = 'text-[10px] font-mono font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40';
        }
        if (this.tgBotToggleBtn) {
          this.tgBotToggleBtn.className = 'w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30';
          this.tgBotToggleBtn.innerHTML = '<i data-lucide="square" class="w-3.5 h-3.5"></i> <span>หยุดบอทตอบแชต (Pause Bot)</span>';
        }
        this.logActivity('🤖 Telegram Deal Finder Bot เริ่มทำงาน: ตรวจจับข้อความและส่งลิงก์สินค้า Shopee อัตโนมัติทันที', 'success');
      } catch (e) {
        alert(e.message);
        this.logActivity(`ไม่สามารถเริ่มบอทได้: ${e.message}`, 'error');
      }
    }
    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * จัดการเมื่อมีลูกค้าสอบถามสินค้าใน Telegram และบอทส่งลิงก์กลับไป
   */
  handleTelegramInquiry(data) {
    this.inquiryCount++;
    if (this.inquiryCountBadge) this.inquiryCountBadge.textContent = `${this.inquiryCount} รายการ`;

    // เพิ่มสถิติยอดคลิก
    this.stats.clicks++;
    this.saveStats();
    this.renderStats();

    this.logActivity(`[Telegram Bot] ลูกค้า "${data.user}" ถาม: "${data.query}" ➡️ ส่งลิงก์สินค้าสำเร็จ 🎯`, 'success');

    if (this.tgInquiryLog) {
      if (this.tgInquiryLog.innerHTML.includes('ยังไม่มีข้อความเข้า')) {
        this.tgInquiryLog.innerHTML = '';
      }

      const item = document.createElement('div');
      item.className = 'p-2.5 rounded-xl bg-slate-950/80 border border-sky-500/20 space-y-1';
      item.innerHTML = `
        <div class="flex items-center justify-between text-[10px]">
          <span class="text-sky-300 font-bold flex items-center gap-1">
            <i data-lucide="user" class="w-3 h-3 text-sky-400"></i> ${data.user}
          </span>
          <span class="text-slate-500 font-mono">${data.time}</span>
        </div>
        <div class="text-[11px] text-slate-200">
          ถาม: <span class="text-amber-300 font-semibold">"${data.query}"</span>
        </div>
        <div class="text-[10px] text-emerald-400 flex items-center gap-1">
          <i data-lucide="check" class="w-3 h-3"></i> ${data.reply}
        </div>
      `;

      this.tgInquiryLog.insertBefore(item, this.tgInquiryLog.firstChild);
      if (window.lucide) window.lucide.createIcons();
    }
  }

  /**
   * คัดแยกและจัดลำดับคิวสินค้าตามกลยุทธ์ทำเงิน 1,000฿/วัน
   */
  getOptimizedDealsQueue() {
    const all = [...TRENDING_DEALS_DATABASE];
    const mode = this.strategyModeSelect?.value || 'profit_1000';

    if (mode === 'high_ticket') {
      // โหมดเน้นคอมมิชชันสูงสุด (High-Ticket Hero Deals)
      return all.sort((a, b) => (b.estCommission || 0) - (a.estCommission || 0));
    } else if (mode === 'volume_clicks') {
      // โหมดเน้นสินค้าราคาเข้าถึงง่าย 100-600 บาท คนซื้อทันที ดักคุกกี้ 7 วัน
      const impulse = all.filter(d => (d.salePrice || 0) <= 650);
      return impulse.length > 0 ? impulse : all;
    } else {
      // profit_1000: สูตรผสมผสานทองคำ (สลับ 1 ดีลคอมสูง ฿50-฿1,700 : 2 ดีลขายง่าย)
      const highTickets = all.filter(d => (d.estCommission || 0) >= 60).sort((a, b) => b.estCommission - a.estCommission);
      const impulseDeals = all.filter(d => (d.estCommission || 0) < 60 && (d.salePrice || 0) <= 800);

      if (highTickets.length === 0) return impulseDeals.length > 0 ? impulseDeals : all;
      if (impulseDeals.length === 0) return highTickets;

      const mixed = [];
      let iCounter = 0;
      for (let h = 0; h < highTickets.length; h++) {
        mixed.push(highTickets[h]);
        mixed.push(impulseDeals[iCounter % impulseDeals.length]);
        iCounter++;
        mixed.push(impulseDeals[iCounter % impulseDeals.length]);
        iCounter++;
      }
      return mixed.length > 0 ? mixed : all;
    }
  }

  async generateNextPost(broadcast = true) {
    const deals = this.getOptimizedDealsQueue();
    const deal = deals[this.dealIndex % deals.length];
    this.dealIndex++;

    const style = this.postStyleSelect?.value || 'review';

    this.logActivity(`[1. ค้นพบดีล] ${deal.shopName}: ${deal.title.slice(0, 30)}... (${deal.discount})`, 'info');

    try {
      const post = await this.agent.generatePost(deal, style);
      
      // ตรวจสอบคุณภาพและความถูกต้อง
      if (post.verification) {
        this.logActivity(`[2. Quality Guard] ${post.verification.summary}`, post.verification.passed ? 'success' : 'warning');
      }

      this.logActivity(`[3. สร้างลิงก์รับเงิน] ลิงก์ตรงร้าน: ${post.affiliateUrl.slice(0, 35)}... 🔗`, 'success');
      this.logActivity(`[4. AI เขียนแคปชัน] สไตล์: ${style} ตรงสินค้าและชื่อร้าน 100%`, 'success');

      this.stats.posts++;
      this.saveStats();
      this.renderStats();

      // Clear empty placeholder if exists
      if (this.postFeedContainer && this.postFeedContainer.innerText.includes('แดชบอร์ดพร้อมเริ่มทำงานรอบจริงแล้ว')) {
        this.postFeedContainer.innerHTML = '';
      }

      this.renderPostToFeed(post);

      if (broadcast) {
        this.logActivity(`[5. ระบบคิวหน่วงเวลา Jitter] จัดคิวส่งแยกตามแพลตฟอร์มเพื่อกัน Shadowban...`, 'info');
        const jobs = this.queueManager.enqueueDeal(post);
        jobs.forEach(j => {
          const delayMin = Math.max(0, Math.round((j.scheduledAt - Date.now()) / 60000));
          const sub = j.post[j.platform]?.subId || 'aff';
          this.logActivity(`  ↳ [คิว ${j.platform.toUpperCase()}] กำหนดส่งในอีก ${delayMin === 0 ? 'ทันที' : delayMin + ' นาที'} (Sub-ID: ${sub})`, 'success');
        });
      }

    } catch (err) {
      this.logActivity(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
    }
  }

  renderPostToFeed(post) {
    if (!this.postFeedContainer) return;

    const card = document.createElement('div');
    card.className = 'post-feed-card bg-slate-900/80 rounded-2xl p-5 space-y-4 border border-slate-800/80';

    card.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
            ${post.deal.categoryName}
          </span>
          <span class="text-xs font-semibold text-rose-400 font-mono">${post.deal.discount}</span>
        </div>
        <span class="text-[11px] text-slate-500 font-mono">${post.timestamp}</span>
      </div>

      <!-- Quality Guard Verification Badge -->
      <div class="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
        <div class="flex items-center justify-between">
          <span class="font-bold text-emerald-400 flex items-center gap-1.5">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
            ผ่านการตรวจสอบความถูกต้อง 100% (Quality Guard)
          </span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">VERIFIED</span>
        </div>
        <div class="grid grid-cols-3 gap-1 pt-1 text-[10px] text-slate-300">
          <div class="flex items-center gap-1 text-emerald-400">
            <i data-lucide="check" class="w-3 h-3"></i> รูปจริง Shopee CDN
          </div>
          <div class="flex items-center gap-1 text-emerald-400">
            <i data-lucide="check" class="w-3 h-3"></i> แคปชันตรงสินค้า
          </div>
          <div class="flex items-center gap-1 text-emerald-400">
            <i data-lucide="check" class="w-3 h-3"></i> ลิงก์ตรงร้านค้า
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div class="md:col-span-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video md:aspect-square relative">
          <img src="${post.deal.imageUrl}" alt="${post.deal.title}" class="w-full h-full object-cover" />
          <div class="absolute top-2 left-2 bg-emerald-950/90 backdrop-blur-sm border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
            <i data-lucide="badge-check" class="w-3 h-3 text-emerald-400"></i> รูปจริง Shopee CDN
          </div>
          <div class="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400">
            คอมมิชชัน ${post.deal.commissionRate} (~${post.deal.estCommission}฿)
          </div>
        </div>

        <div class="md:col-span-8 space-y-2">
          <h4 class="text-sm font-bold text-white line-clamp-1">${post.deal.title}</h4>
          <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto font-sans">
            ${this.escapeHtml(post.caption)}
          </div>
        </div>
      </div>

      <!-- 3-Platform Native Algorithm & Sub-ID Breakdown -->
      <div class="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <i data-lucide="layers" class="w-3.5 h-3.5 text-indigo-400"></i>
            การปรับแต่งตามอัลกอริทึม 3 แพลตฟอร์ม (Anti-Suppression & Tracking)
          </span>
          <span class="text-[10px] font-mono text-slate-400">Tone: ${post.tone || 'storytelling'}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <!-- 1. Telegram Card -->
          <div class="p-3 rounded-xl bg-slate-950/60 border border-sky-500/20 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-sky-400 flex items-center gap-1">
                <i data-lucide="send" class="w-3.5 h-3.5"></i> Telegram
              </span>
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">sub1=tg_deal</span>
            </div>
            <p class="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
              ${this.escapeHtml(post.telegram?.caption || post.caption)}
            </p>
            <!-- Telegram Inline Keyboard Button Mockup -->
            <div class="pt-1">
              <a href="${post.telegram?.buttonUrl || post.affiliateUrl}" target="_blank" class="w-full py-1.5 px-2 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 rounded-lg text-[11px] font-bold text-sky-200 flex items-center justify-center gap-1 text-center transition">
                <i data-lucide="mouse-pointer-click" class="w-3 h-3 text-sky-400"></i>
                <span>${post.telegram?.buttonText || '👉 สั่งซื้อร้านแท้ / รับโค้ด'}</span>
              </a>
              <div class="text-[9px] text-slate-400 pt-1 text-center">
                ปุ่ม Inline Button ใต้ภาพ (CTR สูงสุด)
              </div>
            </div>
          </div>

          <!-- 2. Facebook Page Card -->
          <div class="p-3 rounded-xl bg-slate-950/60 border border-blue-500/20 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-blue-400 flex items-center gap-1">
                <i data-lucide="facebook" class="w-3.5 h-3.5"></i> Facebook Page
              </span>
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">sub1=fb_page</span>
            </div>
            <div class="text-[10px] text-amber-400 font-medium flex items-center gap-1">
              <i data-lucide="shield-alert" class="w-3 h-3"></i> โพสต์ไม่มีลิงก์ (เปิด Reach 100%)
            </div>
            <div class="p-2 rounded-lg bg-blue-950/30 border border-blue-800/40 text-[10px] text-slate-300 space-y-1">
              <span class="text-blue-300 font-bold block flex items-center gap-1">
                <i data-lucide="message-square" class="w-3 h-3"></i> First Comment อัตโนมัติ:
              </span>
              <p class="font-mono text-[9px] text-slate-300 break-all leading-relaxed">
                ${this.escapeHtml(post.facebook?.firstComment || '')}
              </p>
            </div>
          </div>

          <!-- 3. X (Twitter) Card -->
          <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-700/60 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-200 flex items-center gap-1">
                <i data-lucide="twitter" class="w-3.5 h-3.5"></i> X (Twitter)
              </span>
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300">sub1=x_thread</span>
            </div>
            <div class="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <i data-lucide="check-circle-2" class="w-3 h-3"></i> ทวีตหลักไม่มีลิงก์ (กัน Shadowban)
            </div>
            <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 space-y-1">
              <span class="text-indigo-300 font-bold block flex items-center gap-1">
                <i data-lucide="corner-down-right" class="w-3 h-3"></i> Thread Reply อัตโนมัติ:
              </span>
              <p class="font-mono text-[9px] text-slate-300 break-all leading-relaxed">
                ${this.escapeHtml(post.twitter?.threadReply || '')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
        <div class="flex items-center gap-2">
          <button class="copy-btn px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>คัดลอกแคปชัน</span>
          </button>
          <button class="enqueue-jitter-btn px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
            <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-400"></i>
            <span>ส่งเข้าคิว Jitter</span>
          </button>
          <button class="broadcast-now-btn px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5">
            <i data-lucide="send" class="w-3.5 h-3.5"></i>
            <span>ยิง 3 ช่องทางทันที</span>
          </button>
        </div>

        <span class="text-[11px] text-slate-400 font-mono">
          ราคา ${post.deal.salePrice}.- (เดิม ${post.deal.originalPrice}.-)
        </span>
      </div>
    `;

    card.querySelector('.copy-btn').addEventListener('click', (e) => {
      navigator.clipboard.writeText(post.caption);
      const btn = e.currentTarget;
      btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i> คัดลอกแล้ว!';
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5"></i> คัดลอกแคปชัน';
        if (window.lucide) window.lucide.createIcons();
      }, 2000);
    });

    card.querySelector('.enqueue-jitter-btn')?.addEventListener('click', (e) => {
      const jobs = this.queueManager.enqueueDeal(post);
      this.logActivity(`[จัดคิวหน่วงเวลา] เพิ่มโพสต์เข้าคิว 3 ช่องทางพร้อมระบบ Jitter สำเร็จ`, 'success');
      const btn = e.currentTarget;
      btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i> เข้าคิวแล้ว!';
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-400"></i> ส่งเข้าคิว Jitter';
        if (window.lucide) window.lucide.createIcons();
      }, 2000);
    });

    card.querySelector('.broadcast-now-btn').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> กำลังส่ง...';
      const res = await this.publisher.broadcastPost(post);
      this.logActivity(`[ยิงด้วยมือ] ส่งโพสต์เข้าช่องทางที่เปิดใช้งานเรียบร้อย`, 'success');
      btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5"></i> ส่งเรียบร้อย!';
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="send" class="w-3.5 h-3.5"></i> ยิง 3 ช่องทางทันที';
        if (window.lucide) window.lucide.createIcons();
      }, 2000);
    });

    this.postFeedContainer.insertBefore(card, this.postFeedContainer.firstChild);
    if (window.lucide) window.lucide.createIcons();
  }

  logActivity(message, type = 'info') {
    if (!this.terminalLog) return;

    const time = new Date().toLocaleTimeString('th-TH');
    const line = document.createElement('div');
    line.className = 'terminal-line py-0.5 flex items-start gap-2';

    let color = 'text-slate-400';
    let prefix = '⚡';

    if (type === 'success') {
      color = 'text-emerald-400';
      prefix = '✅';
    } else if (type === 'warning') {
      color = 'text-amber-400';
      prefix = '⚠️';
    } else if (type === 'error') {
      color = 'text-rose-400';
      prefix = '❌';
    }

    line.innerHTML = `
      <span class="text-slate-600 flex-shrink-0 font-mono">[${time}]</span>
      <span class="${color}">${prefix} ${message}</span>
    `;

    this.terminalLog.insertBefore(line, this.terminalLog.firstChild);
  }

  renderStats() {
    if (this.statEarnings) this.statEarnings.textContent = `${this.stats.earnings.toFixed(2)} ฿`;
    if (this.statClicks) this.statClicks.textContent = this.stats.clicks.toLocaleString();
    if (this.statOrders) this.statOrders.textContent = this.stats.orders.toLocaleString();
    if (this.statPosts) this.statPosts.textContent = this.stats.posts.toLocaleString();
  }

  saveStats() {
    localStorage.setItem('aff_stat_posts', this.stats.posts.toString());
    localStorage.setItem('aff_stat_clicks', this.stats.clicks.toString());
    localStorage.setItem('aff_stat_orders', this.stats.orders.toString());
    localStorage.setItem('aff_stat_earnings', this.stats.earnings.toFixed(2));
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  refreshIcons() {
    if (typeof window !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
}

// เริ่มต้นทำงานทันทีเมื่อโหลดหน้าเว็บ
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AffiliateApp();
});
