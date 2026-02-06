# Telegram Video Streaming Server - HTTP API Version
# Uses Telegram Bot HTTP API (works on Hugging Face Spaces)

import os
import asyncio
import httpx
from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Telegram Video Streamer")

# CORS for your website
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Telegram credentials from environment variables
BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
CHANNEL = os.environ.get("CHANNEL", "kulkuljujum")
API_BASE = f"https://api.telegram.org/bot{BOT_TOKEN}"
FILE_BASE = f"https://api.telegram.org/file/bot{BOT_TOKEN}"

# HTTP client
http_client = None

async def get_client():
    global http_client
    if http_client is None:
        http_client = httpx.AsyncClient(timeout=60.0)
    return http_client

@app.on_event("startup")
async def startup():
    await get_client()
    logger.info(f"Server started. Channel: @{CHANNEL}")

@app.on_event("shutdown")
async def shutdown():
    global http_client
    if http_client:
        await http_client.aclose()

@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "ok", 
        "channel": CHANNEL,
        "note": "Use /stream/{message_id} to stream videos (files under 20MB only via Bot API)"
    }

@app.get("/info/{message_id}")
async def get_message_info(message_id: int):
    """Get message info"""
    try:
        client = await get_client()
        
        # Forward message to get file_id (Bot API trick)
        # Actually, we need to use getUpdates or forwardMessage
        # For now, just return a placeholder - Bot API can't directly get channel messages
        
        return {
            "id": message_id,
            "stream_url": f"/stream/{message_id}",
            "telegram_url": f"https://t.me/{CHANNEL}/{message_id}",
            "note": "Telegram Bot API has limitations for channel message access"
        }
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/getfile/{file_id}")
async def stream_by_file_id(file_id: str):
    """Stream a file by its file_id (if you have it)"""
    try:
        client = await get_client()
        
        # Get file path from Telegram
        resp = await client.get(f"{API_BASE}/getFile?file_id={file_id}")
        data = resp.json()
        
        if not data.get("ok"):
            raise HTTPException(status_code=404, detail=data.get("description", "File not found"))
        
        file_path = data["result"]["file_path"]
        file_url = f"{FILE_BASE}/{file_path}"
        
        # Stream the file
        async def stream_generator():
            async with client.stream("GET", file_url) as response:
                async for chunk in response.aiter_bytes(chunk_size=1024*1024):
                    yield chunk
        
        return StreamingResponse(
            stream_generator(),
            media_type="video/mp4",
            headers={"Content-Disposition": f"inline; filename={file_id}.mp4"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Stream error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/embed/{message_id}")
async def get_embed_url(message_id: int):
    """Return Telegram embed widget HTML"""
    html = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ margin: 0; padding: 0; background: #1a1a1a; }}
            .container {{ width: 100%; max-width: 800px; margin: 0 auto; }}
        </style>
    </head>
    <body>
        <div class="container">
            <script async src="https://telegram.org/js/telegram-widget.js?22" 
                    data-telegram-post="{CHANNEL}/{message_id}" 
                    data-width="100%">
            </script>
        </div>
    </body>
    </html>
    '''
    return Response(content=html, media_type="text/html")

@app.get("/redirect/{message_id}")
async def redirect_to_telegram(message_id: int):
    """Redirect to Telegram for viewing"""
    telegram_url = f"https://t.me/{CHANNEL}/{message_id}"
    return {"redirect_url": telegram_url, "message_id": message_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
