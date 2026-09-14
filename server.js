/**
 * ==============================================================================
 * AffiliatePilot AI - Production Backend Server (Node.js & Express)
 * Provides 24/7 Webhooks, Cron Automation, Shopee GraphQL, and Multi-Publisher
 * ==============================================================================
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const shopeeGraphQL = require('./services/shopee-graphql');
const geminiAI = require('./services/gemini-ai');
const queueWorker = require('./services/queue-worker');
const socialPublisher = require('./services/social-publisher');
const telegramWebhook = require('./controllers/telegram-webhook');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================================================================
// Basic Authentication Middleware (Protects Dashboard & Admin Routes)
// ==============================================================================
const basicAuthMiddleware = (req, res, next) => {
  // ข้อยกเว้น: Public Routes ที่ external services ต้องเรียกเข้ามา
  const publicPaths = ['/api/health', '/webhook/telegram'];
  if (publicPaths.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="AffiliatePilot Dashboard"');
    return res.status(401).send('Authentication required to access AffiliatePilot Dashboard');
  }

  try {
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf8');
    const [username, password] = credentials.split(':');

    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || 'affiliate_pilot_admin_2026';

    if (username === expectedUser && password === expectedPass) {
      return next();
    }
  } catch (err) {
    // Format error
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="AffiliatePilot Dashboard"');
  return res.status(401).send('Invalid credentials');
};

app.use(basicAuthMiddleware);

// Serve static frontend files (Dashboard UI)
app.use(express.static(path.join(__dirname)));

// ==============================================================================
// 1. Health & Status Endpoints
// ==============================================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    features: {
      shopeeGraphQL: shopeeGraphQL.isConfigured(),
      telegramWebhook: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      geminiAI: Boolean(process.env.GEMINI_API_KEY),
      queueWorkerActive: true
    }
  });
});

// ==============================================================================
// 2. Telegram Webhook Endpoint (24/7 Bot Assistant)
// ==============================================================================
app.post('/webhook/telegram', (req, res) => {
  telegramWebhook.handleWebhook(req, res);
});

app.post('/api/telegram/setup-webhook', async (req, res) => {
  const publicUrl = req.body.publicUrl || process.env.BASE_URL || `http://localhost:${PORT}`;
  const result = await telegramWebhook.setTelegramWebhook(publicUrl);
  res.json(result);
});

// ==============================================================================
// 3. Shopee Affiliate GraphQL Endpoints
// ==============================================================================
app.get('/api/shopee/deals', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const sortType = parseInt(req.query.sortType, 10) || 1;

  const result = await shopeeGraphQL.getProductOffers(page, limit, sortType);
  res.json(result);
});

app.post('/api/shopee/shortlink', async (req, res) => {
  const { originUrl, subIds } = req.body;
  if (!originUrl) {
    return res.status(400).json({ error: 'originUrl is required' });
  }

  const result = await shopeeGraphQL.generateShortLink(originUrl, subIds || ['aff_deal']);
  res.json(result);
});

// ==============================================================================
// 4. Auto-Pilot & Multi-Platform Publishing Endpoints
// ==============================================================================
app.post('/api/deals/publish', async (req, res) => {
  try {
    const { deal } = req.body;
    if (!deal || !deal.title) {
      return res.status(400).json({ error: 'Deal object is required' });
    }

    const defaultUrl = deal.defaultUrl || deal.offerUrl || 'https://shopee.co.th';

    // 1. สร้าง Short Links แยก Sub-ID อัตโนมัติ (GraphQL)
    const [tgLink, fbLink, xLink] = await Promise.all([
      shopeeGraphQL.generateShortLink(defaultUrl, ['tg_deal']),
      shopeeGraphQL.generateShortLink(defaultUrl, ['fb_page']),
      shopeeGraphQL.generateShortLink(defaultUrl, ['x_thread'])
    ]);

    const urls = {
      tg: tgLink.shortLink || tgLink.deepLinkUrl,
      fb: fbLink.shortLink || fbLink.deepLinkUrl,
      x: xLink.shortLink || xLink.deepLinkUrl
    };

    // 2. สร้างคอนเทนต์แยก 3 แพลตฟอร์มด้วย AI (Pain Point & 5 Tones)
    const postPayload = await geminiAI.generateMultiPlatformPost(deal, urls);

    // 3. นำเข้าคิวหน่วงเวลา Staggered Jitter Queue
    const jobs = queueWorker.enqueueDeal(postPayload);

    res.json({
      success: true,
      post: postPayload,
      jobsScheduled: jobs.length,
      jobs: jobs.map(j => ({ id: j.id, platform: j.platform, scheduledAt: j.scheduledAt }))
    });

  } catch (err) {
    console.error('[API Publish Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 5. Smart Queue Management Endpoints
// ==============================================================================
app.get('/api/queue/stats', (req, res) => {
  res.json(queueWorker.getStats());
});

app.post('/api/queue/flush', (req, res) => {
  res.json(queueWorker.flushQueueNow());
});

app.post('/api/queue/clear', (req, res) => {
  res.json(queueWorker.clearQueue());
});

app.post('/api/queue/enqueue', (req, res) => {
  try {
    const { post } = req.body;
    if (!post || !post.deal) {
      return res.status(400).json({ success: false, error: 'post with deal is required' });
    }
    const jobs = queueWorker.enqueueDeal(post);
    res.json({
      success: true,
      jobsScheduled: jobs.length,
      jobs: jobs.map(j => ({ id: j.id, platform: j.platform, scheduledAt: j.scheduledAt }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================================================================
// 6. Secure Social & AI Proxy Endpoints (Zero Client Credential Exposure)
// ==============================================================================

// Telegram Post Proxy (Server holds TELEGRAM_BOT_TOKEN)
app.post('/api/telegram/post', async (req, res) => {
  try {
    const { caption, imageUrl, buttonText, buttonUrl } = req.body;
    const result = await socialPublisher.sendToTelegram(caption, imageUrl, buttonText, buttonUrl);
    res.json({
      success: Boolean(result?.success),
      messageId: result?.messageId || null,
      error: result?.error || null,
      simulated: Boolean(result?.simulated)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Facebook Page Post Proxy (Server holds FACEBOOK_PAGE_ACCESS_TOKEN)
app.post('/api/facebook/post', async (req, res) => {
  try {
    const { caption, imageUrl, firstComment } = req.body;
    const result = await socialPublisher.sendToFacebookPage(caption, imageUrl, firstComment);
    res.json({
      success: Boolean(result?.success),
      postId: result?.postId || null,
      error: result?.error || null,
      simulated: Boolean(result?.simulated)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Twitter Tweet Proxy (Server holds TWITTER_API_KEY / Webhook)
app.post('/api/twitter/tweet', async (req, res) => {
  try {
    const { mainTweet, threadReply, imageUrl } = req.body;
    const result = await socialPublisher.sendToTwitter(mainTweet, imageUrl, threadReply);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Universal Multi-Publisher Proxy
app.post('/api/social/publish', async (req, res) => {
  try {
    const { platform, caption, imageUrl, firstComment, buttonText, buttonUrl, mainTweet, threadReply } = req.body;
    let result;
    if (platform === 'telegram') {
      result = await socialPublisher.sendToTelegram(caption, imageUrl, buttonText, buttonUrl);
    } else if (platform === 'facebook') {
      result = await socialPublisher.sendToFacebookPage(caption, imageUrl, firstComment);
    } else if (platform === 'twitter') {
      result = await socialPublisher.sendToTwitter(mainTweet || caption, imageUrl, threadReply || firstComment);
    } else {
      return res.status(400).json({ success: false, error: 'Invalid platform specified' });
    }

    res.json({
      success: Boolean(result?.success),
      postId: result?.postId || result?.messageId || null,
      error: result?.error || null,
      simulated: Boolean(result?.simulated)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Chat Assistant Proxy (Server holds GEMINI_API_KEY)
app.post(['/api/chat', '/api/ai/chat'], async (req, res) => {
  try {
    const query = req.body.userQuery || req.body.query || '';
    const candidateDeals = req.body.candidateDeals || [];
    const sender = req.body.senderName || req.body.sender || 'เพื่อนสมาชิก';
    const aiResult = await geminiAI.chatWithCustomer(query, candidateDeals, sender);
    res.json({
      success: true,
      text: aiResult.text,
      deal: aiResult.deal || null
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ตรวจสอบสถานะการเชื่อมต่อบริการต่างๆ โดยส่งเฉพาะค่า boolean (ห้าม expose secret/token)
app.get('/api/config/status', (req, res) => {
  res.json({
    telegram: {
      configured: Boolean((process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID) || process.env.WEBHOOK_RELAY_URL),
      hasDirectToken: Boolean(process.env.TELEGRAM_BOT_TOKEN)
    },
    facebook: {
      configured: Boolean((process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID) || process.env.WEBHOOK_RELAY_URL),
      pageId: process.env.FACEBOOK_PAGE_ID || null
    },
    twitter: {
      configured: Boolean(process.env.TWITTER_API_KEY || process.env.WEBHOOK_RELAY_URL)
    },
    gemini: {
      configured: Boolean(process.env.GEMINI_API_KEY)
    },
    webhookRelay: {
      configured: Boolean(process.env.WEBHOOK_RELAY_URL)
    }
  });
});

// ==============================================================================
// 7. 24/7 Cloud Keep-Alive Auto-Pinger (Prevents Render Sleep Mode)
// ==============================================================================
const keepAliveTargetUrl = process.env.BASE_URL?.includes('render.com') 
  ? `${process.env.BASE_URL}/api/health` 
  : 'https://dealy-affiliate-pilot.onrender.com/api/health';

console.log(`[Keep-Alive] 24/7 Cloud Auto-Pinger initialized for: ${keepAliveTargetUrl}`);

// ยิง Ping ทุกๆ 8 นาที เพื่อให้เซิร์ฟเวอร์ Cloud ตื่นตัวตลอด 24 ชม. ไม่เข้า Sleep Mode (Render Sleep ที่ 15 นาที)
setInterval(async () => {
  try {
    const res = await axios.get(keepAliveTargetUrl, { timeout: 15000 });
    console.log(`[Keep-Alive Ping] Status: ${res.data?.status || 'ok'} (${new Date().toLocaleTimeString('th-TH')})`);
  } catch (err) {
    console.warn('[Keep-Alive Ping Notice]:', err.message);
  }
}, 8 * 60 * 1000);

// ==============================================================================
// Start Server
// ==============================================================================
app.listen(PORT, () => {
  console.log('=================================================================');
  console.log(`🚀 AffiliatePilot AI Production Server running on port ${PORT}`);
  console.log(`📡 Dashboard UI: http://localhost:${PORT}`);
  console.log(`⚡ Telegram Webhook: POST http://localhost:${PORT}/webhook/telegram`);
  console.log(`🛒 Shopee GraphQL Status: ${shopeeGraphQL.isConfigured() ? 'Connected (Official)' : 'Fallback Mode'}`);
  console.log('=================================================================');

  // เริ่มต้น Telegram Polling รวมศูนย์บน Server (ถ้ามี Token และไม่ได้ใช้ Webhook)
  telegramWebhook.startServerPolling();
});
