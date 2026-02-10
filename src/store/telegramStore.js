import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTelegramStore = create(
    persist(
        (set) => ({
            botToken: '',
            chatId: '',
            isEnabled: false,

            setCredentials: (botToken, chatId) => set({ botToken, chatId }),
            toggleEnabled: () => set((state) => ({ isEnabled: !state.isEnabled })),
            setEnabled: (isEnabled) => set({ isEnabled }),
        }),
        {
            name: 'telegram-config',
        }
    )
);
