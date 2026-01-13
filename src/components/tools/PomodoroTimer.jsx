import React from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// DESIGN SYSTEM - LIQUID BUTTONS & CONTROLS
// ============================================================================

const LiquidButton = ({ onClick, icon: Icon, label, variant = 'primary', size = 'default', className }) => {
    // Variants map to static, safe classes
    const styles = {
        primary: 'bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]',
        secondary: 'bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/20',
        destructive: 'bg-rose-500/20 text-rose-200 border border-rose-500/30 hover:bg-rose-500/30 hover:border-rose-500/50',
        ghost: 'bg-transparent text-white/50 hover:text-white hover:bg-white/5',
    };

    const sizes = {
        default: 'h-14 px-6 rounded-full text-base',
        sm: 'h-10 px-4 rounded-full text-sm',
        icon: 'w-12 h-12 rounded-full flex items-center justify-center p-0',
    };

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                relative flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-300
                ${styles[variant]} ${sizes[size]} ${className}
            `}
        >
            {Icon && <Icon size={size === 'sm' ? 16 : 20} strokeWidth={2} />}
            {label && <span>{label}</span>}
        </motion.button>
    );
};

const IconButton = ({ onClick, icon: Icon, disabled }) => (
    <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" } : {}}
        whileTap={!disabled ? { scale: 0.9 } : {}}
        className={`
            p-4 rounded-full transition-colors 
            ${disabled ? 'opacity-30 cursor-not-allowed' : 'text-white/70 hover:text-white cursor-pointer'}
        `}
    >
        <Icon size={24} />
    </motion.button>
);

// ============================================================================
// LIQUID PROGRESS RING
// ============================================================================

const ProgressRing = ({ progress, isFailed, isActive, isCompleted }) => {
    const radius = 130;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress * circumference);

    // Color Logic: "Liquid Mercury" (white) -> "Emerald Glass" (Complete) -> "Rose Glass" (Fail)
    const strokeColor = isFailed ? '#f43f5e' : isCompleted ? '#10b981' : '#ffffff';

    return (
        <div className="relative w-[320px] h-[320px] flex items-center justify-center">
            {/* Background Track (Frosted) */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 transform">
                <circle
                    cx="160" cy="160" r={radius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="12"
                    fill="transparent"
                />
            </svg>

            {/* Active Liquid Track */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 transform drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{
                        strokeDashoffset,
                        stroke: strokeColor
                    }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    cx="160" cy="160" r={radius}
                    strokeWidth="12"
                    fill="transparent"
                    strokeLinecap="round"
                    style={{ strokeDasharray: circumference }}
                />
            </svg>

            {/* Inner Glass Sphere (Background for content) */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md border border-white/5 flex items-center justify-center shadow-inner">
                {/* This space intentionally left for the content (time) to sit on top */}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PomodoroTimer = ({ state, onAction, isDarkMode, onToggleTheme }) => {
    const { duration, timeLeft, isActive, isCompleted, isFailed, initialTime } = state;

    // Helper to calculate progress (0 to 1)
    const activeTimeBytes = isActive ? Math.floor(initialTime / 60) : duration;
    // Note: progress goes from 0 (start) to 1 (end). 
    // If not active, show full ring (1) or empty (0)? Let's show full ring when idle.
    const progress = isActive ? 1 - (timeLeft / initialTime) : 0;

    // This function is no longer used in the new design, but kept for potential future use or if the original intent was to use it elsewhere.
    // For now, we'll use a placeholder for CurrentIcon.
    const CurrentIcon = CheckCircle2; // Placeholder, as getBuildingConfig is removed.

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDurationChange = (change) => {
        const newDuration = Math.max(5, Math.min(120, duration + change)); // Cap at 120 mins
        onAction('SET_DURATION', newDuration);
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-between py-10 px-6">

            {/* 1. Header: Status Pill */}
            <div className="flex flex-col items-center gap-2">
                <div className={`
                    flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-500
                    ${isFailed ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            isActive ? 'bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' :
                                'bg-white/5 border-white/10 text-white/40'}
                `}>
                    <CurrentIcon size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">{isCompleted ? 'Completed' : isFailed ? 'Failed' : 'Focus Session'}</span>
                </div>
            </div>

            {/* 2. Main Dial */}
            <div className="relative flex-1 flex flex-col items-center justify-center min-h-[350px]">
                <ProgressRing
                    progress={isActive ? progress : 0} // When idle, ring is empty. 
                    isFailed={isFailed}
                    isActive={isActive}
                    isCompleted={isCompleted}
                />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    {/* Time Display */}
                    <motion.div
                        layout
                        className="text-7xl font-light tracking-tighter text-white tabular-nums drop-shadow-2xl"
                        style={{ fontFamily: '"Outfit", sans-serif' }} // Ensuring the font is applied
                    >
                        {formatTime(timeLeft)}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-medium text-white/50 tracking-[0.2em] mt-2 uppercase"
                    >
                        {isActive ? 'Focusing' : isCompleted ? 'Session Done' : isFailed ? 'Look Away?' : 'Ready'}
                    </motion.div>
                </div>

                {/* Floating Controls for Duration (Only visible when Idle) */}
                <AnimatePresence>
                    {!isActive && !isCompleted && !isFailed && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute bottom-0 translate-y-20 flex items-center gap-8"
                        >
                            <IconButton onClick={() => handleDurationChange(-5)} icon={ChevronLeft} disabled={duration <= 5} />
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold text-white">{duration}</span>
                                <span className="text-[10px] uppercase tracking-widest text-white/40">Minutes</span>
                            </div>
                            <IconButton onClick={() => handleDurationChange(5)} icon={ChevronRight} disabled={duration >= 120} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. Primary Controls (Bottom Deck) */}
            {/* Fixed height container to prevent layout shifts */}
            <div className="w-full h-24 flex items-end justify-center pb-4">
                <AnimatePresence mode="wait">
                    {!isActive ? (
                        <motion.div
                            key="start-controls"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex gap-4"
                        >
                            {isCompleted || isFailed ? (
                                <LiquidButton
                                    onClick={() => onAction('RESET')}
                                    label="New Session"
                                    icon={RotateCcw}
                                    variant="secondary"
                                    className="w-48"
                                />
                            ) : (
                                <LiquidButton
                                    onClick={() => onAction('START')}
                                    label="Start Focus"
                                    icon={Play}
                                    variant="primary"
                                    className="w-48"
                                />
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="active-controls"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex gap-4"
                        >
                            <LiquidButton
                                onClick={() => onAction('PAUSE')}
                                label="Pause"
                                icon={Pause}
                                variant="secondary"
                            />
                            <LiquidButton
                                onClick={() => onAction('GIVE_UP')}
                                label="End"
                                icon={AlertTriangle}
                                variant="destructive"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PomodoroTimer;
