---
title: Tg Streamer
emoji: 📺
colorFrom: blue
colorTo: cyan
sdk: docker
pinned: false
---

# Telegram Video Streaming Server

Stream videos from your Telegram channel directly to browsers.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check |
| `GET /list?limit=50` | List videos in channel |
| `GET /info/{message_id}` | Get video metadata |
| `GET /stream/{message_id}` | Stream video directly |

## Environment Variables Required

| Name | Description |
|------|-------------|
| `API_ID` | Telegram API ID |
| `API_HASH` | Telegram API Hash |
| `BOT_TOKEN` | Bot token from @BotFather |
| `CHANNEL` | Channel username |
