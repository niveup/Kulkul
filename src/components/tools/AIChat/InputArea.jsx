import React, { useRef, useCallback, useState, useEffect } from 'react';
import styles from './AIChat.module.css';

const InputArea = ({
    value,
    onChange,
    onSend,
    disabled,
    placeholder = "Message...",
    isThinking
}) => {
    const textareaRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    // Auto-grow textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [value]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && value.trim()) {
                onSend(value);
            }
        }
    }, [disabled, value, onSend]);

    const handleSend = useCallback(() => {
        if (!disabled && value.trim()) {
            onSend(value);
        }
    }, [disabled, value, onSend]);

    const hasContent = value.trim().length > 0;

    return (
        <div className={styles.inputWrapper}>
            {/* Floating Glass Capsule */}
            <div className={styles.inputCapsule}>
                {/* Left Tools */}
                <div className="flex items-center gap-1">
                    <button className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className={styles.inputField}
                    style={{
                        height: 'auto',
                        // We let the CSS module handle min/max heights
                    }}
                />

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={disabled || !hasContent}
                    className={styles.sendButton}
                >
                    {isThinking ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default InputArea;
