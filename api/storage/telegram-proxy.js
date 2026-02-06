// Secure Telegram File Viewer
// Proxies content from Telegram -> Client
// Hides the Bot Token from the frontend

export default async function handler(req, res) {
    const { fileId } = req.query;

    if (!fileId) {
        return res.status(400).json({ error: 'Missing fileId' });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    if (!BOT_TOKEN) {
        console.error('[Telegram Proxy] TELEGRAM_BOT_TOKEN is not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        // 1. Get File Path from Telegram API
        const getFileUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;

        const pathRes = await fetch(getFileUrl);
        const pathData = await pathRes.json();

        if (!pathData.ok) {
            console.error('[Telegram Proxy] Telegram API error:', pathData.description);
            return res.status(404).json({ error: pathData.description || 'File not found' });
        }

        const filePath = pathData.result.file_path;
        const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

        // 2. Redirect to Telegram's CDN directly (simplest, most reliable method)
        // This avoids body consumption issues entirely
        // Note: This exposes the bot token in the redirect URL, but only server-side

        // Alternative: Stream the file using https module
        const https = await import('https');

        return new Promise((resolve, reject) => {
            https.get(fileUrl, (fileRes) => {
                // Forward content headers
                const contentType = fileRes.headers['content-type'];
                const contentLength = fileRes.headers['content-length'];

                if (contentType) res.setHeader('Content-Type', contentType);
                if (contentLength) res.setHeader('Content-Length', contentLength);
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

                // Pipe the stream directly to response
                fileRes.pipe(res);

                fileRes.on('end', () => {
                    resolve();
                });

                fileRes.on('error', (err) => {
                    console.error('[Telegram Proxy] Stream error:', err);
                    reject(err);
                });
            }).on('error', (err) => {
                console.error('[Telegram Proxy] HTTPS request error:', err);
                res.status(500).json({ error: 'Failed to fetch file' });
                reject(err);
            });
        });

    } catch (error) {
        console.error('[Telegram Proxy] Error:', error.message);
        return res.status(500).json({ error: 'Internal proxy error', details: error.message });
    }
}
