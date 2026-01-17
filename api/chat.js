/**
 * AI Chat API - Vercel Serverless Function
 * 
 * Endpoints:
 * - POST /api/chat - Send a message and get AI response
 * 
 * Supports multiple AI providers with fallback:
 * 1. Gemini (Google) - Primary
 * 2. Groq - Fallback
 */

// =============================================================================
// Provider Configurations
// =============================================================================

const PROVIDERS = {
    gemini: {
        name: 'Gemini',
        formatRequest: (messages, systemPrompt, overrideModel) => ({
            contents: messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            })),
            systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        }),
        parseResponse: (data) => {
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            }
            if (data.error) {
                throw new Error(data.error.message || 'Gemini API error');
            }
            throw new Error('Invalid Gemini response structure');
        },
        getUrl: (apiKey, overrideModel) => `https://generativelanguage.googleapis.com/v1beta/models/${overrideModel || 'gemini-2.0-flash'}:generateContent`,
        getHeaders: (apiKey) => ({
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
        }),
    },
    groq: {
        name: 'Groq',
        getHeaders: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        }),
        formatRequest: (messages, systemPrompt, overrideModel) => ({
            model: overrideModel || 'llama-3.3-70b-versatile',
            messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.7,
            max_tokens: 2048,
        }),
        parseResponse: (data) => {
            if (data.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }
            throw new Error('Invalid Groq response');
        },
        getUrl: () => 'https://api.groq.com/openai/v1/chat/completions',
    },
    cerebras: {
        name: 'Cerebras',
        getHeaders: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        }),
        formatRequest: (messages, systemPrompt, overrideModel) => ({
            model: overrideModel || 'llama-3.3-70b',
            messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.7,
            max_tokens: 2048,
        }),
        parseResponse: (data) => {
            if (data.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }
            if (data.error) {
                throw new Error(data.error.message || 'Cerebras API error');
            }
            throw new Error('Invalid Cerebras response');
        },
        getUrl: () => 'https://api.cerebras.ai/v1/chat/completions',
    },
    sambanova: {
        name: 'SambaNova',
        getHeaders: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        }),
        formatRequest: (messages, systemPrompt, overrideModel) => ({
            model: overrideModel || 'Meta-Llama-3.1-405B-Instruct',
            messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.7,
            max_tokens: 2048,
        }),
        parseResponse: (data) => {
            if (data.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }
            if (data.error) {
                throw new Error(data.error.message || 'SambaNova API error');
            }
            throw new Error('Invalid SambaNova response');
        },
        getUrl: () => 'https://api.sambanova.ai/v1/chat/completions',
    },
};

// =============================================================================
// System Prompt
// =============================================================================

const SYSTEM_PROMPT = `You are StudyHub AI, a helpful, friendly, and knowledgeable study assistant. You help students with:
- Physics, Chemistry, and Mathematics (especially JEE/NEET preparation)
- Explaining complex concepts in simple terms
- Solving problems step by step
- Creating study plans and providing motivation

Guidelines:
- Be concise but thorough
- Use markdown formatting (bold, lists, code blocks) for clarity
- Include relevant formulas when discussing science/math
- Be encouraging and supportive
- If you don't know something, say so honestly`;

// =============================================================================
// Main Handler
// =============================================================================

import { requireAuth } from './authMiddleware.js';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    'https://personal-dashboard-alpha-gilt.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

export default async function handler(req, res) {
    // CORS headers - restrict to allowed origins
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Require authentication for AI access
    const authResult = await requireAuth(req, res);
    if (authResult !== true) return; // Already sent 401/429

    try {
        const { messages, provider: providerName = 'cerebras', model: modelName } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Get API key and provider based on provider name
        let apiKey;
        let provider;
        const overrideModel = modelName; // Allow custom model names

        if (providerName === 'cerebras') {
            apiKey = process.env.CEREBRAS_API_KEY;
            provider = PROVIDERS.cerebras;
        } else if (providerName === 'sambanova') {
            apiKey = process.env.SAMBANOVA_API_KEY;
            provider = PROVIDERS.sambanova;
        } else if (providerName === 'gemini') {
            apiKey = process.env.GEMINI_API_KEY;
            provider = PROVIDERS.gemini;
        } else if (providerName === 'groq') {
            apiKey = process.env.GROQ_API_KEY;
            provider = PROVIDERS.groq;
        } else {
            // Default to Cerebras
            apiKey = process.env.CEREBRAS_API_KEY;
            provider = PROVIDERS.cerebras;
        }

        if (!apiKey) {
            // Fallback to any available provider
            if (process.env.CEREBRAS_API_KEY) {
                apiKey = process.env.CEREBRAS_API_KEY;
                provider = PROVIDERS.cerebras;
            } else if (process.env.SAMBANOVA_API_KEY) {
                apiKey = process.env.SAMBANOVA_API_KEY;
                provider = PROVIDERS.sambanova;
            } else if (process.env.GEMINI_API_KEY) {
                apiKey = process.env.GEMINI_API_KEY;
                provider = PROVIDERS.gemini;
            } else if (process.env.GROQ_API_KEY) {
                apiKey = process.env.GROQ_API_KEY;
                provider = PROVIDERS.groq;
            } else {
                return res.status(500).json({ error: 'No AI API key configured' });
            }
        }

        // Make request to AI provider
        const url = provider.getUrl ? provider.getUrl(apiKey) : provider.baseUrl;
        const headers = provider.getHeaders(apiKey);
        const body = provider.formatRequest(messages, SYSTEM_PROMPT, overrideModel);

        console.log(`[AI Chat] Using provider: ${provider.name}, model: ${overrideModel || 'default'}`);

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[AI Chat] ${provider.name} error:`, errorText);
            return res.status(response.status).json({
                error: `${provider.name} API error`,
                details: errorText
            });
        }

        const data = await response.json();
        const content = provider.parseResponse(data);

        return res.status(200).json({
            role: 'assistant',
            content,
            model: provider.name,
        });

    } catch (error) {
        console.error('[AI Chat] Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
