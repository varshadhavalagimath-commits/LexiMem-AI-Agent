const axios = require('axios');
const env = require('../config/env');

class GroqClient {
  constructor() {
    this.apiKey = env.groq.apiKey;
    this.model = env.groq.model || 'llama-3.3-70b-versatile';
    this.temperature = env.groq.temperature || 0.1;
    this.maxTokens = env.groq.maxTokens || 4096;
    this.endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  async generateJson({ systemPrompt, userPrompt }) {
    if (!this.isConfigured()) {
      return null; // Signals orchestrator to use high-precision legal heuristic engine
    }

    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages: [
            { role: 'system', content: `${systemPrompt}\n\nIMPORTANT: Return ONLY valid, parseable JSON. Do not wrap in markdown code fences or backticks. Return raw JSON.` },
            { role: 'user', content: userPrompt },
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 25000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) return null;

      try {
        const cleaned = content.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        return JSON.parse(cleaned);
      } catch (parseErr) {
        console.warn('[Groq Client] JSON parse error from model response, attempting regex recovery:', parseErr.message);
        const match = content.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        return null;
      }
    } catch (apiErr) {
      console.warn(`[Groq Client] API request failed (${apiErr.response?.data?.error?.message || apiErr.message}). Falling back to internal legal intelligence engine.`);
      return null;
    }
  }

  async generateText({ systemPrompt, userPrompt }) {
    if (!this.isConfigured()) return null;

    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 25000,
        }
      );

      return response.data?.choices?.[0]?.message?.content?.trim() || null;
    } catch (apiErr) {
      console.warn(`[Groq Client] API error: ${apiErr.message}`);
      return null;
    }
  }
}

module.exports = new GroqClient();
