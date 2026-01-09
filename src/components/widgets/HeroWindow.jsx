/**
 * Hero Window Component - Project Aether
 * 
 * The main "morning brief" widget with:
 * - Time-aware dynamic gradient background
 * - Large typographic greeting
 * - Current date and weather-like status
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Cloud, Sparkles, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { springs } from '../../lib/motion';
import GlassPanel from '../ui/GlassPanel';

// Time-based gradient themes
const getTimeTheme = (hour) => {
    if (hour >= 5 && hour < 8) {
        // Dawn (5-8am)
        return {
            gradient: 'from-amber-500/30 via-rose-500/20 to-purple-600/30',
            icon: Sun,
            period: 'Dawn',
            message: 'Early bird catches the worm!',
        };
    } else if (hour >= 8 && hour < 12) {
        // Morning (8am-12pm)
        return {
            gradient: 'from-cyan-500/25 via-sky-500/20 to-blue-600/25',
            icon: Sun,
            period: 'Morning',
            message: 'Peak focus hours ahead',
        };
    } else if (hour >= 12 && hour < 17) {
        // Afternoon (12-5pm)
        return {
            gradient: 'from-amber-400/25 via-orange-500/20 to-rose-500/25',
            icon: Cloud,
            period: 'Afternoon',
            message: 'Stay hydrated, stay focused',
        };
    } else if (hour >= 17 && hour < 20) {
        // Evening (5-8pm)
        return {
            gradient: 'from-purple-500/30 via-pink-500/20 to-rose-600/30',
            icon: Sparkles,
            period: 'Evening',
            message: 'Golden hour for revision',
        };
    } else {
        // Night (8pm-5am)
        return {
            gradient: 'from-slate-700/40 via-indigo-900/30 to-purple-900/40',
            icon: Moon,
            period: 'Night',
            message: 'Rest well for tomorrow',
        };
    }
};

const getGreeting = (hour) => {
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
};

const HeroWindow = ({ userName = 'Aspirant', focusTime = '0h', className }) => {
    const now = new Date();
    const hour = now.getHours();

    const theme = useMemo(() => getTimeTheme(hour), [hour]);
    const greeting = useMemo(() => getGreeting(hour), [hour]);
    const TimeIcon = theme.icon;

    const formattedDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.smooth}
            className={cn('relative overflow-hidden', className)}
        >
            <GlassPanel
                variant="thick"
                padding={false}
                className="h-full min-h-[200px]"
            >
                {/* Dynamic Gradient Background */}
                <div
                    className={cn(
                        'absolute inset-0 bg-gradient-to-br',
                        theme.gradient
                    )}
                />

                {/* Animated Orb */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"
                />

                {/* Content */}
                <div className="relative z-10 p-6 lg:p-8 h-full flex flex-col justify-between">
                    {/* Top Row: Date & Time */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                            <TimeIcon size={16} />
                            <span>{theme.period}</span>
                            <span className="text-white/30">•</span>
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-semibold text-base bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
                            <Clock size={16} className="text-cyan-400" />
                            <span>{formattedTime}</span>
                        </div>
                    </div>

                    {/* Main Greeting */}
                    <div className="my-4">
                        <motion.h1
                            className="text-3xl lg:text-4xl font-black text-white tracking-tight"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ ...springs.smooth, delay: 0.1 }}
                        >
                            {greeting}, <span className="text-cyan-400">{userName}</span>
                        </motion.h1>
                        <motion.p
                            className="text-white/60 mt-2 text-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ ...springs.smooth, delay: 0.2 }}
                        >
                            {theme.message}
                        </motion.p>
                    </div>

                    {/* Bottom Row: Quick Stats */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-white/80 text-sm font-medium">
                                {focusTime} focused today
                            </span>
                        </div>
                    </div>
                </div>
            </GlassPanel>
        </motion.div>
    );
};

export default HeroWindow;
