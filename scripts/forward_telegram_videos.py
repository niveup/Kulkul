# Telegram Content Forwarder Script
# Forwards ALL content (videos, PDFs, images, text) from source channel

from telethon import TelegramClient
from telethon.errors import FloodWaitError
import asyncio

# Your Telegram API credentials
API_ID = 36005492
API_HASH = '66b18d73d1c4003cfcb52d8f5ca5f30f'

# Source channel (the one you want to copy from)
SOURCE_CHANNEL = 'VoraJeeBooster2026'

# Your channel username (without @)
DESTINATION_CHANNEL = 'kulkuljujum'

async def main():
    print("=" * 50)
    print("🚀 Telegram FULL Content Forwarder")
    print("=" * 50)
    
    # Create the client - reuse existing session
    async with TelegramClient('forwarder_session', API_ID, API_HASH) as client:
        print("\n📱 Logging in...")
        
        await client.start()
        me = await client.get_me()
        print(f"✅ Logged in as: {me.first_name} ({me.phone})")
        
        # Get channels
        print(f"\n📺 Source: @{SOURCE_CHANNEL}")
        source = await client.get_entity(SOURCE_CHANNEL)
        
        print(f"📁 Destination: @{DESTINATION_CHANNEL}")
        try:
            dest = await client.get_entity(DESTINATION_CHANNEL)
        except Exception as e:
            print(f"❌ Error: Could not find @{DESTINATION_CHANNEL}")
            return
        
        # Count ALL messages
        print("\n🔍 Counting ALL messages...")
        all_messages = []
        
        async for message in client.iter_messages(source):
            all_messages.append(message)
        
        total = len(all_messages)
        print(f"📊 Found {total} total messages to forward")
        
        # Breakdown
        videos = sum(1 for m in all_messages if m.video)
        docs = sum(1 for m in all_messages if m.document and not m.video)
        photos = sum(1 for m in all_messages if m.photo)
        text_only = sum(1 for m in all_messages if m.text and not m.media)
        
        print(f"   📹 Videos: {videos}")
        print(f"   📄 Documents/PDFs: {docs}")
        print(f"   🖼️ Photos: {photos}")
        print(f"   💬 Text messages: {text_only}")
        
        if total == 0:
            print("No messages found!")
            return
        
        # Confirm
        confirm = input(f"\n⚠️ Forward ALL {total} messages to @{DESTINATION_CHANNEL}? (yes/no): ")
        if confirm.lower() not in ['yes', 'y']:
            print("Cancelled.")
            return
        
        # Forward ALL messages (oldest first)
        print("\n📤 Forwarding all messages...")
        all_messages.reverse()
        
        forwarded = 0
        errors = 0
        
        for i, message in enumerate(all_messages, 1):
            try:
                await client.forward_messages(dest, message)
                forwarded += 1
                
                # Show progress every 10 messages
                if i % 10 == 0 or i == total:
                    print(f"   [{i}/{total}] Progress: {(i/total*100):.1f}%")
                
                # Delay to avoid rate limits
                await asyncio.sleep(1.5)
                
            except FloodWaitError as e:
                print(f"   ⏳ Rate limited! Waiting {e.seconds}s...")
                await asyncio.sleep(e.seconds + 1)
                await client.forward_messages(dest, message)
                forwarded += 1
                
            except Exception as e:
                errors += 1
                if errors <= 5:
                    print(f"   ❌ Error at {i}: {str(e)[:40]}")
        
        print("\n" + "=" * 50)
        print(f"✅ Done! Forwarded {forwarded}/{total} messages")
        if errors > 0:
            print(f"❌ {errors} errors")
        print("=" * 50)

if __name__ == '__main__':
    asyncio.run(main())
