import React, { useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Hammer, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBuildingConfig } from '../../utils/pomodoroConfig';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// 1. Dynamic Background (Lumina Engine)
const ReactorBackground = React.memo(({ isActive, isCompleted }) => (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
        {/* Deep Void Base */}
        <div className="absolute inset-0 bg-[#0A0A0C]" />

        {/* Dynamic Energy Field */}
        <motion.div
            animate={{
                opacity: isActive ? 0.6 : 0.2,
                scale: isActive ? 1.1 : 1,
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-indigo-600/20 blur-[100px] rounded-full"
        />
        <motion.div
            animate={{
                opacity: isActive ? 0.5 : 0.1,
                rotate: isActive ? 45 : 0
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-violet-600/10 blur-[80px] rounded-full"
        />

        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
));

// 2. Control Button (Haptic Glass)
const ControlBtn = ({ onClick, icon: Icon, label, variant = 'primary', className }) => {
    const isPrimary = variant === 'primary';
    const isDestructive = variant === 'destructive';

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98, y: 0 }}
            className={`
                relative h-14 rounded-2xl flex items-center justify-center gap-3 w-full
                transition-all duration-300 border
                ${isPrimary
                    ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-400/20 shadow-[0_4px_20px_rgba(79,70,229,0.3)] text-white'
                    : isDestructive
                        ? 'bg-black/40 border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40'
                        : 'bg-black/40 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/10 hover:text-white'
                }
                ${className}
            `}
        >
            <Icon size={18} strokeWidth={2.5} />
            <span className="text-sm font-bold tracking-wide uppercase">{label}</span>

            {/* Shine Effect */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
        </motion.button>
    );
};

// 3. Main Display (Holographic)
const TimerDisplay = React.memo(({ state, currentBuilding, handleDurationChange }) => {
    const { timeLeft, isActive, isCompleted, isFailed, initialTime } = state;
    const [showHours, setShowHours] = React.useState(false);

    const progress = 1 - (timeLeft / initialTime);
    const buildingHeight = Math.min(Math.max(progress * 100, 0), 100);
    const CurrentIcon = currentBuilding.icon;

    const formatTime = (seconds) => {
        if (showHours) {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return (
                <>
                    <span className="w-[1.2ch] text-right inline-block">{hrs}</span>
                    <span className="opacity-50 mx-0.5">:</span>
                    <span className="w-[2ch] inline-block">{mins.toString().padStart(2, '0')}</span>
                    <span className="opacity-50 mx-0.5">:</span>
                    <span className="w-[2ch] inline-block">{secs.toString().padStart(2, '0')}</span>
                </>
            );
        }
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return (
            <>
                <span className="w-[2ch] inline-block text-right">{mins.toString().padStart(2, '0')}</span>
                <span className="opacity-50 mx-1">:</span>
                <span className="w-[2ch] inline-block">{secs.toString().padStart(2, '0')}</span>
            </>
        );
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center py-8 relative">
            {/* Central Holo-Ring */}
            <div className="relative w-72 h-72 flex items-center justify-center mb-8">
                {/* Outer Tracks */}
                <div className="absolute inset-0 rounded-full border border-white/5" />
                <div className="absolute inset-4 rounded-full border border-white/5 border-dashed opacity-50 animate-[spin_60s_linear_infinite]" />

                {/* Completion Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="144" cy="144" r="142" stroke="rgba(255,255,255,0.02)" strokeWidth="4" fill="none" />
                    <motion.circle
                        cx="144" cy="144" r="142"
                        stroke={isFailed ? "#f43f5e" : "#6366f1"}
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress }}
                        className="drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    />
                </svg>

                {/* Building Projection */}
                <div className="relative z-10 w-48 h-48 flex items-end justify-center">
                    {!isFailed ? (
                        <>
                            {/* Building Silhouette (Ghost) */}
                            <div className="absolute inset-0 flex items-end justify-center opacity-10 blur-[1px]">
                                <CurrentIcon size={160} className="text-white" strokeWidth={1} />
                            </div>

                            {/* Building Constructing */}
                            <div className="absolute bottom-0 left-0 w-full flex items-end justify-center overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ height: `${isCompleted ? 100 : buildingHeight}%` }}>
                                <CurrentIcon size={160} className={`${currentBuilding.color} drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]`} strokeWidth={2} fill="currentColor" fillOpacity={0.15} />
                            </div>

                            {/* Construction Laser */}
                            {!isCompleted && isActive && (
                                <motion.div
                                    className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_cyan] z-20"
                                    style={{ bottom: `${buildingHeight}%` }}
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            )}
                        </>
                    ) : (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <AlertTriangle size={80} className="text-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.6)]" strokeWidth={1.5} />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Time Controller */}
            <div className="flex items-center gap-8 z-20">
                {/* Decrement */}
                {!isActive && !isCompleted && !isFailed && (
                    <motion.button onClick={() => handleDurationChange(-5)} whileHover={{ x: -2 }} className="p-2 text-white/20 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </motion.button>
                )}

                {/* Digital Clock */}
                <div className="flex flex-col items-center">
                    <div
                        className="text-7xl font-bold text-white tracking-tighter tabular-nums leading-none drop-shadow-2xl"
                        style={{ fontFamily: '"Outfit", sans-serif' }}
                    >
                        {formatTime(timeLeft)}
                    </div>

                    {/* Unit Toggle */}
                    <button
                        onClick={() => setShowHours(!showHours)}
                        className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300/60 hover:text-indigo-300 transition-colors border border-white/5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10"
                    >
                        {showHours ? 'HH:MM:SS' : 'MM:SS'}
                    </button>

                    <p className="mt-2 text-xs font-medium text-white/30 tracking-wide">
                        {isActive ? 'System Active' : 'System Standby'}
                    </p>
                </div>

                {/* Increment */}
                {!isActive && !isCompleted && !isFailed && (
                    <motion.button onClick={() => handleDurationChange(5)} whileHover={{ x: 2 }} className="p-2 text-white/20 hover:text-white transition-colors">
                        <ChevronRight size={24} />
                    </motion.button>
                )}
            </div>
        </div>
    );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PomodoroTimer = ({ state, onAction, isDarkMode, onToggleTheme }) => {
    const { duration, isActive, isCompleted, isFailed, initialTime } = state;
    const activeTimeBytes = isActive ? Math.floor(initialTime / 60) : duration;
    const currentBuilding = getBuildingConfig(activeTimeBytes);
    const CurrentIcon = currentBuilding.icon;

    const handleDurationChange = (change) => {
        const newDuration = Math.max(5, Math.min(995, duration + change));
        onAction('SET_DURATION', newDuration);
    };

    return (
        <div className="relative w-full h-full flex flex-col justify-between">
            <ReactorBackground isActive={isActive} isCompleted={isCompleted} />

            {/* Header: Project Status */}
            <div className="relative z-10 w-full px-8 pt-8 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                        <CurrentIcon size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Target Protocol</div>
                        <div className="text-sm font-bold text-white tracking-wide">{currentBuilding.label}</div>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/5">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                        {isActive ? 'Online' : 'Idle'}
                    </span>
                </div>
            </div>

            {/* Display */}
            <TimerDisplay state={state} currentBuilding={currentBuilding} handleDurationChange={handleDurationChange} />

            {/* Action Deck */}
            <div className="relative z-10 px-8 pb-8 pt-6">
                <div className="grid grid-cols-2 gap-4">
                    {!isActive ? (
                        <ControlBtn
                            onClick={() => onAction('START')}
                            label={isCompleted || isFailed ? 'Re-Initialize' : 'Engage'}
                            icon={Play}
                            className="col-span-2"
                        />
                    ) : (
                        <>
                            <ControlBtn
                                onClick={() => onAction('PAUSE')}
                                label="Suspend"
                                icon={Pause}
                                variant="secondary"
                            />
                            <ControlBtn
                                onClick={() => onAction('GIVE_UP')}
                                label="Abort"
                                icon={AlertTriangle}
                                variant="destructive"
                            />
                        </>
                    )}

                    {!isActive && (
                        <div className="col-span-2 flex justify-center mt-2">
                            <button
                                onClick={() => onAction('RESET')}
                                className="flex items-center gap-2 text-xs font-semibold text-white/30 hover:text-white transition-colors uppercase tracking-wider"
                            >
                                <RotateCcw size={12} />
                                Reset Config
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PomodoroTimer;
