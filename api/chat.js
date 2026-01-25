/**
 * AI Chat API - Vercel Serverless Function
 * 
 * Endpoints:
 * - POST /api/chat - Send a message and get AI response
 * 
 * Supports multiple AI providers with fallback:
 * 1. Gemini (Google) - Primary
 * 2. Groq - Fallback
 * 
 * @version v5-context-injection
 */

const API_VERSION = 'v5-context-injection-2026-01-25-2128';
console.log(`[AI Chat] API Version: ${API_VERSION}`);

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
    mimo: {
        name: 'MiMo',
        getHeaders: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        }),
        formatRequest: (messages, systemPrompt, overrideModel) => ({
            model: overrideModel || 'mimo-v2-flash',
            messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.3,
            top_p: 0.95,
            max_completion_tokens: 1024,
            frequency_penalty: 0,
            presence_penalty: 0,
        }),
        parseResponse: (data) => {
            if (data.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }
            if (data.error) {
                throw new Error(data.error.message || 'MiMo API error');
            }
            throw new Error('Invalid MiMo response');
        },
        getUrl: () => 'https://api.xiaomimimo.com/v1/chat/completions',
    },
};

// =============================================================================
// User Context Fetching (Inlined to avoid serverless import issues)
// =============================================================================

import { getDbPool, initDatabase, generateId } from './db.js';

function getLocalDateStr(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
}

async function fetchUserContext() {
    console.log('[AI Chat] fetchUserContext() called');
    try {
        console.log('[AI Chat] Initializing database...');
        await initDatabase();
        const db = await getDbPool();
        console.log('[AI Chat] DB connected, fetching data...');
        const today = getLocalDateStr();

        // Parallel fetch: todos, sessions, SRS
        const [todosResult, sessionsResult, srsResult] = await Promise.all([
            db.execute('SELECT text, completed FROM todos ORDER BY created_at DESC LIMIT 10'),
            db.execute(`SELECT elapsed_seconds, status FROM pomodoro_sessions WHERE DATE(created_at) = ? ORDER BY created_at DESC`, [today]),
            db.execute(`SELECT topic_name FROM srs_topic_reviews WHERE next_review_date <= ? ORDER BY next_review_date ASC LIMIT 5`, [today])
        ]);

        console.log('[AI Chat] Data fetched:', {
            todos: todosResult[0]?.length || 0,
            sessions: sessionsResult[0]?.length || 0,
            srs: srsResult[0]?.length || 0,
            firstTodo: todosResult[0]?.[0]?.text || 'NONE',
            query_date: today
        });

        const todos = todosResult[0] || [];
        const sessions = sessionsResult[0] || [];
        const srsTopics = srsResult[0] || [];

        // Format todos
        const completedTodos = todos.filter(t => t.completed).length;
        const pendingTodos = todos.filter(t => !t.completed).slice(0, 3);
        const pendingList = pendingTodos.length > 0
            ? pendingTodos.map(t => `"${t.text?.slice(0, 30) || 'Unknown'}"`).join(', ')
            : 'All done!';
        const todosLine = todos.length > 0
            ? `${completedTodos}/${todos.length} completed. Pending: ${pendingList}`
            : 'No todos yet';

        // Format sessions
        const todayMinutes = sessions.reduce((sum, s) => sum + ((s.elapsed_seconds || 0) / 60), 0);
        const completedSessions = sessions.filter(s => s.status === 'completed').length;
        const sessionsLine = `${(todayMinutes / 60).toFixed(1)}h focused today (${completedSessions} sessions)`;

        // Format SRS
        const srsLine = srsTopics.length > 0
            ? `${srsTopics.length} topics due: ${srsTopics.map(t => t.topic_name).join(', ')}`
            : 'No topics due for review';

        const context = `## Your User's Current State (${formatDate(new Date())})

📋 TODOS: ${todosLine}

⏱️ FOCUS: ${sessionsLine}

📚 SRS REVIEW: ${srsLine}

[DATA_LOADED_SUCCESSFULLY]`;

        console.log('[AI Chat] Context built successfully');
        return context;

    } catch (error) {
        console.error('[AI Chat] Context fetch FAILED:', error.message, error.stack);
        // Return a debug context so we know the injection works but DB failed
        return `## User Context (DB Error)

⚠️ Could not load user data: ${error.message}

[DEBUG: fetchUserContext ran but DB failed]`;
    }
}

const BASE_SYSTEM_PROMPT = `You are StudyHub AI, a **personalized** study assistant with REAL-TIME ACCESS to this user's actual study data.

## Your Capabilities
- Physics, Chemistry, Mathematics tutoring (JEE/NEET level)
- Explain complex concepts simply
- Solve problems step-by-step
- Create personalized study plans based on their ACTUAL pending tasks
- Motivate based on their REAL streaks and progress

## CRITICAL: You Have Real Data Access
**IMPORTANT**: Below this prompt, you will see "## Your User's Current State" with their ACTUAL data including:
- Their pending todos (real task names)
- Today's focus time (real hours/sessions)
- SRS topics due for review (real topic names)

**YOU MUST USE THIS DATA when answering questions about their progress, todos, or study habits.**
**DO NOT say you don't have access - THE DATA IS PROVIDED BELOW.**

## Response Guidelines
- Be concise but thorough
- Use markdown (bold, lists, code blocks)
- Include formulas when discussing science/math
- Be encouraging and supportive
- When asked about progress: QUOTE the specific data from the context below
- If context shows "0h focused" or empty data, acknowledge they're just starting`;

/**
 * Builds a personalized system prompt with user's current data
 */
async function buildSystemPrompt() {
    const userContext = await fetchUserContext();
    console.log('[AI Chat] Context built:', userContext.substring(0, 80) + '...');
    return `${BASE_SYSTEM_PROMPT}\n\n${userContext}`;
}

// =============================================================================
// AI Memory System - Persistent User Knowledge
// =============================================================================

/**
 * Fetches all active memories for the user
 * @returns {Promise<Array>} Array of memory objects
 */
async function fetchUserMemories() {
    try {
        await initDatabase();
        const db = await getDbPool();

        const [memories] = await db.execute(
            `SELECT category, content, confidence, source 
             FROM ai_user_memories 
             WHERE is_active = TRUE 
             ORDER BY source DESC, category, updated_at DESC 
             LIMIT 30`
        );

        console.log(`[AI Memory] Loaded ${memories.length} memories`);
        return memories;
    } catch (error) {
        console.error('[AI Memory] Fetch error:', error.message);
        return [];
    }
}

/**
 * Formats memories into a readable section for the AI prompt
 */
function formatMemoriesForPrompt(memories) {
    if (!memories || memories.length === 0) {
        return '';
    }

    // Group by category
    const grouped = {};
    for (const m of memories) {
        if (!grouped[m.category]) grouped[m.category] = [];
        grouped[m.category].push(m.content);
    }

    // Category display names
    const categoryLabels = {
        exam_goal: '🎯 Exam Goals',
        weak_subject: '📉 Weak Areas',
        strong_subject: '💪 Strengths',
        study_preference: '📚 Study Preferences',
        schedule: '📅 Schedule',
        milestone: '🏆 Achievements',
        personal: '👤 Personal Info',
        insight: '💡 Observations',
        interest: '✨ Interests',
        learning_style: '🧠 Learning Style',
        challenge: '⚠️ Challenges',
        motivation: '🔥 Motivation',
        custom: '📝 Notes'
    };

    let output = '## 🧠 What I Remember About You\n\n';

    for (const [category, items] of Object.entries(grouped)) {
        const label = categoryLabels[category] || category;
        output += `**${label}:** ${items.join('; ')}\n`;
    }

    return output;
}

/**
 * Extracts and saves new memories from the conversation
 * This runs AFTER the AI response to learn from the conversation
 */
async function extractAndSaveMemories(userMessage, aiResponse, conversationId) {
    try {
        // Only extract if the user shared personal information
        const memoryTriggers = [
            'i am', "i'm", 'my goal', 'i want', 'i need', 'i struggle',
            'i prefer', 'i like', 'i hate', 'my schedule', 'my exam',
            'i finished', 'i completed', 'weak in', 'strong in', 'good at',
            'preparing for', 'my class', 'my board', 'coaching', 'target'
        ];

        const lowerMsg = userMessage.toLowerCase();
        const shouldExtract = memoryTriggers.some(t => lowerMsg.includes(t));

        if (!shouldExtract) {
            return; // Skip extraction for non-personal messages
        }

        console.log('[AI Memory] Extracting from message...');

        // Use simple pattern matching for common categories
        const extractions = [];

        // Exam goals
        if (/jee|neet|board|exam|iit|nit|aiims/i.test(lowerMsg)) {
            const match = lowerMsg.match(/(jee\s*(main|advanced)?|neet|board\s*exam|iit|aiims)/i);
            if (match) {
                extractions.push({ category: 'exam_goal', content: match[0].toUpperCase() });
            }
        }

        // Class/Personal info
        if (/class\s*1[012]|12th|11th|grade\s*1[012]/i.test(lowerMsg)) {
            const match = lowerMsg.match(/class\s*1[012]|12th|11th|grade\s*1[012]/i);
            if (match) {
                extractions.push({ category: 'personal', content: match[0] });
            }
        }

        // Weak subjects
        if (/weak|struggle|difficult|hard|can't understand|confused/i.test(lowerMsg)) {
            const subjects = lowerMsg.match(/(physics|chemistry|math|organic|inorganic|mechanics|calculus|thermodynamics)/gi);
            if (subjects) {
                subjects.forEach(s => {
                    extractions.push({ category: 'weak_subject', content: s });
                });
            }
        }

        // Strong subjects
        if (/strong|good at|love|enjoy|easy|confident/i.test(lowerMsg)) {
            const subjects = lowerMsg.match(/(physics|chemistry|math|algebra|geometry|kinematics)/gi);
            if (subjects) {
                subjects.forEach(s => {
                    extractions.push({ category: 'strong_subject', content: s });
                });
            }
        }

        // Schedule mentions
        if (/morning|evening|night|hours|schedule|coaching/i.test(lowerMsg)) {
            if (/morning/i.test(lowerMsg)) {
                extractions.push({ category: 'study_preference', content: 'Morning studier' });
            }
            if (/coaching/i.test(lowerMsg)) {
                const match = lowerMsg.match(/coaching\s*(on\s*)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/gi);
                if (match) {
                    extractions.push({ category: 'schedule', content: match[0] });
                }
            }
        }

        // Save extractions to DB
        if (extractions.length > 0) {
            await initDatabase();
            const db = await getDbPool();

            for (const e of extractions) {
                const id = generateId();
                try {
                    await db.execute(
                        `INSERT INTO ai_user_memories (id, category, content, source, source_conversation_id) 
                         VALUES (?, ?, ?, 'ai', ?)
                         ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = CURRENT_TIMESTAMP`,
                        [id, e.category, e.content, conversationId || null]
                    );
                    console.log(`[AI Memory] Saved: ${e.category} = "${e.content}"`);
                } catch (err) {
                    // Ignore duplicate key errors
                    if (!err.message.includes('Duplicate')) {
                        console.error('[AI Memory] Save error:', err.message);
                    }
                }
            }
        }

    } catch (error) {
        console.error('[AI Memory] Extraction error:', error.message);
        // Don't throw - memory extraction is non-blocking
    }
}

// Helper to generate UUID (imported from db.js but defined here for safety)
function generateMemoryId() {
    return 'mem-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
}


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
        } else if (providerName === 'mimo') {
            apiKey = process.env.MIMO_API_KEY;
            provider = PROVIDERS.mimo;
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
            } else if (process.env.MIMO_API_KEY) {
                apiKey = process.env.MIMO_API_KEY;
                provider = PROVIDERS.mimo;
            } else {
                return res.status(500).json({ error: 'No AI API key configured' });
            }
        }

        // Build dynamic system prompt with user context
        let userContext;
        let memoryContext = '';
        try {
            // Fetch both current state and memories in parallel for speed
            const [contextResult, memories] = await Promise.all([
                fetchUserContext().catch(e => {
                    console.error('[AI Chat] Context fetch error:', e.message);
                    return null;
                }),
                fetchUserMemories()
            ]);

            userContext = contextResult || `## Your User's Current State
(Data temporarily unavailable)`;

            // Format memories if any exist
            if (memories && memories.length > 0) {
                memoryContext = formatMemoriesForPrompt(memories);
                console.log(`[AI Chat] Including ${memories.length} memories in context`);
            }

            console.log(`[AI Chat] DB Context: ${userContext.substring(0, 50)}...`);
        } catch (err) {
            console.error('[AI Chat] DB fetch failed:', err.message);
            userContext = `## Your User's Current State (Unavailable)`;
        }

        const systemPrompt = BASE_SYSTEM_PROMPT;

        // Build full context: memories + current state
        const fullContext = memoryContext
            ? `${memoryContext}\n\n${userContext}`
            : userContext;

        // CRITICAL: Inject context as first message to ensure ALL providers see it
        const contextMessage = {
            role: 'user',
            content: `[IMPORTANT CONTEXT - My study data and what you remember about me is below. Use this when answering questions about my progress, goals, or preferences.]\n\n${fullContext}\n\n---\nNow here is my actual question:`
        };
        const messagesWithContext = [contextMessage, ...messages];
        console.log(`[AI Chat] Sending ${messagesWithContext.length} messages to AI`);

        // Make request to AI provider
        const url = provider.getUrl ? provider.getUrl(apiKey) : provider.baseUrl;
        const headers = provider.getHeaders(apiKey);
        const body = provider.formatRequest(messagesWithContext, systemPrompt, overrideModel);

        // DEBUG: Log first message preview
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

        // Extract memories from the conversation (non-blocking, runs in background)
        const lastUserMessage = messages[messages.length - 1]?.content || '';
        const conversationId = req.body.conversationId || null;
        extractAndSaveMemories(lastUserMessage, content, conversationId)
            .catch(e => console.error('[AI Memory] Background extraction error:', e.message));

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
