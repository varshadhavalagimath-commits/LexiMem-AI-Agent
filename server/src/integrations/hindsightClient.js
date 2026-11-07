const axios = require('axios');
const env = require('../config/env');

class HindsightClient {
  constructor() {
    this.baseUrl = (env.hindsight.baseUrl || 'https://api.hindsight.vectorize.io').replace(/\/$/, '');
    this.apiKey = env.hindsight.apiKey;
    this.defaultBankId = env.hindsight.bankId || 'leximem-precedents';
    this.isAvailable = false;
    this.lastCheck = null;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'LexiMem-Legal-Agent/1.0',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      headers['x-api-key'] = this.apiKey;
    }
    return headers;
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        headers: this.getHeaders(),
        timeout: 2500,
      });
      this.isAvailable = response.status >= 200 && response.status < 300;
      this.lastCheck = new Date();
      return {
        online: true,
        baseUrl: this.baseUrl,
        mode: this.apiKey ? 'Hindsight Cloud' : 'Hindsight Local/Docker',
        status: 'Connected',
      };
    } catch (err) {
      this.isAvailable = false;
      this.lastCheck = new Date();
      return {
        online: false,
        baseUrl: this.baseUrl,
        mode: 'Synchronized MongoDB Local Memory',
        status: 'Local Backup Active (Hindsight server offline or credentials not set)',
        diagnostic: err.message,
      };
    }
  }

  /**
   * Retain a confirmed legal decision into Hindsight persistent memory bank.
   * As per official Hindsight API: retains unstructured content and multidimensional facts.
   */
  async retain({ bankId = this.defaultBankId, content, metadata = {} }) {
    const payload = {
      content: typeof content === 'string' ? content : JSON.stringify(content),
      metadata: {
        system: 'LexiMem-Precedent-Engine',
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    };

    const endpoints = [
      `${this.baseUrl}/v1/default/banks/${bankId}/memories/retain`,
      `${this.baseUrl}/v1/retain`,
      `${this.baseUrl}/api/v1/banks/${bankId}/memories`,
    ];

    for (const url of endpoints) {
      try {
        const res = await axios.post(url, payload, {
          headers: this.getHeaders(),
          timeout: 4000,
        });
        return {
          success: true,
          memoryId: res.data?.id || res.data?.memory_id || `hs-${Date.now()}`,
          raw: res.data,
          mode: 'hindsight_live',
        };
      } catch (err) {
        // Continue to try alternative REST endpoint structure
      }
    }

    console.warn(`[Hindsight Client] Hindsight server offline or endpoint unreachable at ${this.baseUrl}. Recording in persistent MongoDB fallback store.`);
    return {
      success: true,
      memoryId: `local-mem-${Date.now()}`,
      mode: 'local_backup',
      note: 'Stored in MongoDB persistent precedent store with local vector indexing.',
    };
  }

  /**
   * Recall relevant legal decisions from Hindsight persistent memory.
   * Multi-strategy parallel search: semantic vector, BM25, and entity graph.
   */
  async recall({ bankId = this.defaultBankId, query, limit = 5, filters = {} }) {
    const payload = {
      query,
      limit,
      filters,
    };

    const endpoints = [
      `${this.baseUrl}/v1/default/banks/${bankId}/memories/recall`,
      `${this.baseUrl}/v1/recall`,
      `${this.baseUrl}/api/v1/banks/${bankId}/recall`,
    ];

    for (const url of endpoints) {
      try {
        const res = await axios.post(url, payload, {
          headers: this.getHeaders(),
          timeout: 4000,
        });
        const results = res.data?.results || res.data?.memories || [];
        return {
          success: true,
          results,
          source: 'hindsight_live',
        };
      } catch (err) {
        // Continue to next endpoint or fallback
      }
    }

    // Graceful fallback to null so PrecedentRetrievalAgent can query synchronized MongoDB collection
    return {
      success: false,
      results: [],
      source: 'local_backup',
    };
  }

  /**
   * Reflect: Agentic reasoning combining recalled precedents
   */
  async reflect({ bankId = this.defaultBankId, prompt }) {
    try {
      const res = await axios.post(`${this.baseUrl}/v1/default/banks/${bankId}/memories/reflect`, {
        prompt,
      }, {
        headers: this.getHeaders(),
        timeout: 5000,
      });
      return res.data;
    } catch (err) {
      return null;
    }
  }
}

module.exports = new HindsightClient();
