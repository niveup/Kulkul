// Cloudflare Worker - AI API Proxy
// This proxies requests to Cerebras and SambaNova APIs to bypass IP blocking

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
            const provider = request.headers.get('X-Provider') || 'cerebras';
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
