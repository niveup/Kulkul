import { useTelegramStore } from '../store/telegramStore';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

export const telegramService = {
    /**
     * Send a text message to the configured Telegram chat
     * @param {string} text - The message content
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    sendMessage: async (text) => {
        const { botToken, chatId, isEnabled } = useTelegramStore.getState();

        if (!isEnabled || !botToken || !chatId) {
            return { success: false, error: 'Telegram backup is disabled or missing credentials' };
        }

        try {
            const response = await fetch(`${TELEGRAM_API_BASE}${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML', // Optional: Allows basic formatting if needed
                }),
            });

            const data = await response.json();

            if (!data.ok) {
                console.error('[TelegramService] API Error:', data);
                return { success: false, error: data.description || 'Unknown Telegram API error' };
            }

            return { success: true };
        } catch (error) {
            console.error('[TelegramService] Network Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Test the credentials by sending a "ping" message
     */
    testConnection: async (token, chat) => {
        try {
            const response = await fetch(`${TELEGRAM_API_BASE}${token}/getMe`);
            const data = await response.json();

            if (!data.ok) return { success: false, error: 'Invalid Bot Token' };

            // Allow sending a test message if we have a chat ID
            if (chat) {
                const msgResponse = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chat,
                        text: '🔔 *Telegram Backup Implemented Successfully*',
                        parse_mode: 'Markdown'
                    })
                });
                const msgData = await msgResponse.json();
                if (!msgData.ok) return { success: false, error: 'Bot Token valid, but Chat ID invalid or bot cannot talk to chat' };
            }

            return { success: true, botName: data.result.username };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
};
