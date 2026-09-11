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

// ==============================================================================
// 6. Twitter Proxy Endpoint (CORS-Safe Server Dispatch)
// ==============================================================================
app.post('/api/twitter/tweet', async (req, res) => {
  try {
    const { mainTweet, threadReply, imageUrl } = req.body;
    const result = await socialPublisher.sendToTwitter(mainTweet, imageUrl, threadReply);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
});
