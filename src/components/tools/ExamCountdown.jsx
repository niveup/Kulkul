import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TimeBox = ({ value, label }) => (
    <div className="flex flex-col items-center group">
        <motion.div
            initial={{ y: -5, opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-16 h-16 md:w-20 md:h-20 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 flex items-center justify-center text-3xl md:text-4xl font-bold text-slate-800 shadow-sm group-hover:bg-white/60 group-hover:scale-105 transition-all duration-300"
            style={{ fontFamily: '"SF Pro Display", "Inter", sans-serif' }}
        >
            {value}
        </motion.div>
        <span className="text-[10px] md:text-xs font-bold text-slate-500 mt-2 uppercase tracking-[0.2em]">{label}</span>
    </div>
);

const Separator = () => (
    <span className="text-4xl font-light text-slate-300 -mt-8 mx-2 hidden sm:block">:</span>
);

const ExamCountdown = () => {
    // Set your target date here
    const targetDate = new Date('2026-01-21T09:00:00').getTime();

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
            };
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-white/40 via-white/60 to-white/40 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200 px-8 py-4"
        >
            {/* Liquid Background Blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-300/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-300/20 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">

                {/* Branding / Title */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-xs font-bold tracking-[0.2em] text-indigo-500 uppercase">Target Exam</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            JEE Mains
                        </span> 2026
                    </h2>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-2 md:gap-4">
                    <TimeBox value={timeLeft.days} label="Days" />
                    <Separator />
                    <TimeBox value={timeLeft.hours} label="Hours" />
                    <Separator />
                    <TimeBox value={timeLeft.minutes} label="Mins" />
                    <Separator />
                    <TimeBox value={timeLeft.seconds} label="Secs" />
                </div>
            </div>
        </motion.div>
    );
};

export default ExamCountdown;
