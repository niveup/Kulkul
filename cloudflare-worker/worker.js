// Cloudflare Worker - Unified Proxy (AI & Telegram Storage)
// Handles:
// 1. AI API Proxy (Cerebras, SambaNova)
// 2. Telegram File Uploads (Bypass Vercel 4.5MB limit)

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Provider',
                },
            });
        }

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

        try {
            const provider = request.headers.get('X-Provider');

            // =================================================================
            // 1. Telegram Storage Proxy
            // =================================================================
            if (provider === 'telegram-upload') {
                const botToken = env.TELEGRAM_BOT_TOKEN;
                const chatId = env.TELEGRAM_CHAT_ID;

                if (!botToken || !chatId) {
                    return new Response(JSON.stringify({ error: 'Telegram secrets not configured' }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                    });
                }

                // Forward the multipart/form-data body directly to Telegram
                const formData = await request.formData();
                formData.append('chat_id', chatId);

                // Send to Telegram API
                const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
                    method: 'POST',
                    body: formData
                });

                const tgData = await tgResponse.json();

                if (!tgData.ok) {
                    throw new Error(`Telegram Error: ${tgData.description}`);
                }

                // Extract file ID and return
                const fileId = tgData.result.document
                    ? tgData.result.document.file_id
                    : tgData.result.photo[tgData.result.photo.length - 1].file_id;

                const responseData = {
                    success: true,
                    fileId: fileId,
                    // We don't return a direct URL here because viewing handles that
                };

                return new Response(JSON.stringify(responseData), {
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                });
            }

            // =================================================================
            // 2. AI API Proxy (Legacy)
            // =================================================================
            const body = await request.text();
            let apiUrl, apiKey;

            if (provider === 'cerebras') {
                apiUrl = 'https://api.cerebras.ai/v1/chat/completions';
                apiKey = env.CEREBRAS_API_KEY;
            } else if (provider === 'sambanova') {
                apiUrl = 'https://api.sambanova.ai/v1/chat/completions';
                apiKey = env.SAMBANOVA_API_KEY;
            } else {
                return new Response(JSON.stringify({ error: 'Unknown provider' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                });
            }

            if (!apiKey) {
                return new Response(JSON.stringify({ error: `${provider} API key not configured` }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                });
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: body,
            });

            // Return the response with CORS headers
            const responseHeaders = new Headers(response.headers);
            responseHeaders.set('Access-Control-Allow-Origin', '*');

            return new Response(response.body, {
                status: response.status,
                headers: responseHeaders,
            });

        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }
    },
};
