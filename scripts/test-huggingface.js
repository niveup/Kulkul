/**
 * test-huggingface.js
 * 
 * Verifies the Hugging Face Inference API connection for Moltbot.
 * Run with: node scripts/test-huggingface.js [TOKEN]
 */

import dotenv from 'dotenv';
dotenv.config();

const HF_TOKEN = process.argv[2] || process.env.HF_TOKEN;
const MODEL = 'moltbot/molty-lobster';

async function testConnection() {
    if (!HF_TOKEN) {
        console.error('❌ Error: HF_TOKEN is missing. Provide it as an argument or in .env file.');
        process.exit(1);
    }

    console.log(`📡 Connecting to Hugging Face: ${MODEL}...`);
    const MODEL_ID = MODEL;

    try {
        const response = await fetch(`https://router.huggingface.co/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: 'Hello! Who are you?' }
                ],
                max_tokens: 100
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Success! Moltbot responded:');
            console.log('-----------------------------------');
            console.log(data.choices[0].message.content);
            console.log('-----------------------------------');
        } else {
            console.error('❌ API Error:', data.error || data);
        }
    } catch (error) {
        console.error('❌ Connection Error:', error.message);
    }
}

testConnection();
