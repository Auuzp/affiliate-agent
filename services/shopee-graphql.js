/**
 * ==============================================================================
 * Shopee Open Platform - Official Affiliate GraphQL API Service
 * Endpoint: https://open-api.affiliate.shopee.co.th/graphql
 * Docs: https://affiliate.shopee.co.th/open_api
 * ==============================================================================
 */

const crypto = require('crypto');
const axios = require('axios');

class ShopeeGraphQLService {
  constructor() {
    this.appId = process.env.SHOPEE_APP_ID || '15349720148';
    this.appSecret = process.env.SHOPEE_APP_SECRET || '';
    this.endpoint = process.env.SHOPEE_GRAPHQL_ENDPOINT || 'https://open-api.affiliate.shopee.co.th/graphql';
  }

  /**
   * ตรวจสอบว่าได้ตั้งค่า App Secret สำหรับเชื่อมต่อ Open API จริงแล้วหรือไม่
   */
  isConfigured() {
    return Boolean(this.appId && this.appSecret && this.appSecret.trim().length > 0);
  }

  /**
   * คำนวณ SHA256 Signature ตามมาตรฐานของ Shopee Open Platform
   * สูตร: SHA256(AppId + Timestamp + PayloadString + AppSecret)
   */
  generateAuthHeader(payloadObj) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payloadStr = typeof payloadObj === 'string' ? payloadObj : JSON.stringify(payloadObj);
    const factor = `${this.appId}${timestamp}${payloadStr}${this.appSecret}`;
    const signature = crypto.createHash('sha256').update(factor, 'utf8').digest('hex');

    return {
      'Content-Type': 'application/json',
      'Authorization': `SHA256 Credential=${this.appId}, Timestamp=${timestamp}, Signature=${signature}`
    };
  }

  /**
   * สร้าง Shopee Official Shortlink (https://s.shopee.co.th/...) พร้อมแนบ Sub-ID ทางการ
   * @param {string} originUrl ลิงก์สินค้าต้นทาง
   * @param {string[]} subIds รายการ Sub-ID เช่น ['tg_deal'] หรือ ['fb_page']
   */
  async generateShortLink(originUrl, subIds = ['aff_deal']) {
    if (!this.isConfigured()) {
      // Fallback สำหรับกรณีที่ยังไม่ได้ใส่ Shopee App Secret
      return this.generateFallbackLink(originUrl, subIds[0]);
    }

    const mutation = `
      mutation GenerateShortLink($originUrl: String!, $subIds: [String!]) {
        generateShortLink(input: {
          originUrl: $originUrl,
          subIds: $subIds
        }) {
          shortLink
        }
      }
    `;

    const requestBody = {
      query: mutation,
      variables: {
        originUrl: originUrl,
        subIds: Array.isArray(subIds) ? subIds : [subIds]
      }
    };

    try {
      const headers = this.generateAuthHeader(requestBody);
      const response = await axios.post(this.endpoint, requestBody, { headers, timeout: 8000 });

      if (response.data && response.data.data && response.data.data.generateShortLink) {
        return {
          success: true,
          shortLink: response.data.data.generateShortLink.shortLink,
          isOfficialApi: true,
          subIds: subIds
        };
      }

      console.warn('[Shopee GraphQL] API returned errors:', response.data.errors);
      return this.generateFallbackLink(originUrl, subIds[0]);
    } catch (err) {
      console.error('[Shopee GraphQL] Request failed:', err.message);
      return this.generateFallbackLink(originUrl, subIds[0]);
    }
  }

  /**
   * ดึงรายการสินค้าที่มีค่าคอมมิชชันสูงสุดแบบเรียลไทม์ (productOfferV2)
   * @param {number} page หน้าที่ต้องการดึง
   * @param {number} limit จำนวนรายการ (ค่าเริ่มต้น 20)
   * @param {number} sortType 1: ค่าคอมมิชชันสูงสุด, 2: ยอดขายสูงสุด
   */
  async getProductOffers(page = 1, limit = 20, sortType = 1) {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Shopee App Secret not configured. Using local deals cache.',
        nodes: []
      };
    }

    const query = `
      query GetProductOffers($page: Int!, $limit: Int!, $sortType: Int!) {
        productOfferV2(page: $page, limit: $limit, sortType: $sortType) {
          page
          limit
          total
          nodes {
            itemId
            productName
            price
            commissionRate
            commission
            imageUrl
            offerLink
            shopName
            shopId
            sales
          }
        }
      }
    `;

    const requestBody = {
      query: query,
      variables: { page, limit, sortType }
    };

    try {
      const headers = this.generateAuthHeader(requestBody);
      const response = await axios.post(this.endpoint, requestBody, { headers, timeout: 10000 });

      if (response.data && response.data.data && response.data.data.productOfferV2) {
        const data = response.data.data.productOfferV2;
        return {
          success: true,
          isOfficialApi: true,
          page: data.page,
          total: data.total,
          nodes: (data.nodes || []).map(item => ({
            itemId: item.itemId,
            title: item.productName,
            price: parseFloat(item.price) || 0,
            commissionRate: `${Math.round(parseFloat(item.commissionRate) * 100)}%`,
            estCommission: parseFloat(item.commission) || 0,
            imageUrl: item.imageUrl,
            offerUrl: item.offerLink,
            shopName: item.shopName || 'Shopee Mall',
            soldCount: `${item.sales || 0} ชิ้น`
          }))
        };
      }

      return { success: false, nodes: [], error: response.data.errors };
    } catch (err) {
      console.error('[Shopee GraphQL] getProductOffers error:', err.message);
      return { success: false, nodes: [], error: err.message };
    }
  }

  /**
   * Fallback Resolver สร้าง Universal Deep Link กรณีไม่มี App Secret
   */
  generateFallbackLink(rawUrl, subId = 'aff_deal') {
    let cleanUrl = rawUrl || 'https://shopee.co.th';
    const subParam = `sub1=${encodeURIComponent(subId)}&sub_id1=${encodeURIComponent(subId)}&af_sub1=${encodeURIComponent(subId)}`;
    const joiner = cleanUrl.includes('?') ? '&' : '?';
    const affiliateWebUrl = `${cleanUrl}${joiner}${subParam}`;
    const deepLinkUrl = `shopeeth://open?url=${encodeURIComponent(affiliateWebUrl)}`;

    return {
      success: true,
      shortLink: affiliateWebUrl,
      deepLinkUrl: deepLinkUrl,
      isOfficialApi: false,
      subIds: [subId]
    };
  }
}

module.exports = new ShopeeGraphQLService();
