import React, { useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Hammer, Trophy, Timer, Building2, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBuildingConfig } from '../../utils/pomodoroConfig';

// Memoized Background Component to prevent repaints
const TimerBackground = React.memo(() => (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/50 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    </div>
));

// Memoized Building/Timer Display
const TimerDisplay = React.memo(({ state, currentBuilding, handleDurationChange }) => {
    const { timeLeft, isActive, isCompleted, isFailed, initialTime } = state;
    const [showHours, setShowHours] = React.useState(false);

    // Calculate Progress
    const progress = 1 - (timeLeft / initialTime);
    const buildingHeight = Math.min(Math.max(progress * 100, 0), 100);

    const CurrentIcon = currentBuilding.icon;

    const formatTime = (seconds) => {
        if (showHours) {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
        }
    };

    return (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-8">
            {/* Construction Zone */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-6">
                {/* Ring Glow */}
                <div className="absolute inset-0 rounded-full border border-white/5 bg-white/1"></div>
                <AnimatePresence>
                    {isFailed && (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="absolute z-40 flex flex-col items-center">
                            <AlertTriangle size={64} className="text-rose-500 mb-2 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                            <span className="text-rose-400 font-bold uppercase tracking-widest text-sm">Failed</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isFailed && (
                    <div className="relative w-40 h-40 flex items-end justify-center">
                        <div className="absolute inset-0 flex items-end justify-center opacity-10 blur-[1px]">
                            <CurrentIcon size={140} className="text-white" strokeWidth={1} />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full flex items-end justify-center overflow-hidden transition-all duration-700 ease-in-out" style={{ height: `${isCompleted ? 100 : buildingHeight}%` }}>
                            <div className="w-40 h-40 flex items-end justify-center relative">
                                <CurrentIcon size={140} className={`${currentBuilding.color} drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] filter brightness-110`} strokeWidth={2} fill="currentColor" fillOpacity={0.2} />
                            </div>
                            {!isCompleted && isActive && (
                                <div className="absolute top-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_cyan] z-20 animate-pulse"></div>
                            )}
                        </div>
                        {!isCompleted && isActive && (
                            <div
                                className="absolute -right-4 top-1/2 z-30 text-slate-400 animate-hammer"
                                style={{
                                    animation: 'hammer 0.5s ease-in-out infinite',
                                }}
                            >
                                <Hammer size={24} fill="currentColor" />
                            </div>
                        )}
                        <style>{`
                            @keyframes hammer {
                                0%, 100% { transform: rotate(-10deg) translateX(0); }
                                50% { transform: rotate(20deg) translateX(5px); }
                            }
                        `}</style>

                    </div>
                )}
            </div>

            {/* TIMER DISPLAY CONTROL GROUP */}
            <div className="relative group px-4 py-2 flex items-center justify-center gap-4 -mt-4">

                {/* Left Arrow (Decrement) - VERY SLIM */}
                {!isActive && !isCompleted && !isFailed && (
                    <motion.button
                        onClick={() => handleDurationChange(-5)}
                        className="flex items-center justify-center h-24 w-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        whileHover={{ x: -2, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <ChevronLeft size={16} />
                    </motion.button>
                )}

                <div className="flex flex-col items-center">
                    {/* Digits */}
                    <div
                        className={`${showHours && timeLeft >= 3600 ? 'text-4xl lg:text-5xl' : 'text-5xl lg:text-6xl'} font-bold tracking-tighter text-white drop-shadow-2xl tabular-nums leading-none cursor-default z-10 text-center transition-all duration-300 min-w-[200px]`}
                        style={{ fontFamily: '"Outfit", sans-serif' }}
                    >
                        {formatTime(timeLeft)}
                    </div>

                    {/* Min/Hrs Toggle Switch (Layout Animation) */}
                    <div className="flex items-center bg-white/5 p-1 rounded-full mt-4 border border-white/10 relative isolate">
                        <button
                            onClick={() => setShowHours(false)}
                            className={`relative z-10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors ${!showHours ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {!showHours && (
                                <motion.div
                                    layoutId="activePill"
                                    className="absolute inset-0 bg-white/10 rounded-full -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            Mins
                        </button>
                        <button
                            onClick={() => setShowHours(true)}
                            className={`relative z-10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors ${showHours ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {showHours && (
                                <motion.div
                                    layoutId="activePill"
                                    className="absolute inset-0 bg-white/10 rounded-full -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            Hours
                        </button>
                    </div>

                    <p className="text-indigo-200/50 text-xs font-medium uppercase tracking-[0.2em] mt-4">
                        {isActive ? 'Keep Focusing' : isCompleted ? 'Session Complete' : 'Ready'}
                    </p>
                </div>

                {/* Right Arrow (Increment) - VERY SLIM */}
                {!isActive && !isCompleted && !isFailed && (
                    <motion.button
                        onClick={() => handleDurationChange(5)}
                        className="flex items-center justify-center h-24 w-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        whileHover={{ x: 2, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <ChevronRight size={16} />
                    </motion.button>
                )}
            </div>

        </div>
    );
});

const PomodoroTimer = ({ state, onAction, isDarkMode, onToggleTheme }) => {
    const { duration, timeLeft, isActive, isCompleted, isFailed, initialTime } = state;

    // Use duration specifically for determining colors while sliding for instant feedback
    const activeTimeBytes = isActive ? Math.floor(initialTime / 60) : duration;
    const currentBuilding = getBuildingConfig(activeTimeBytes);
    const CurrentIcon = currentBuilding.icon;

    // Helper to clamp duration
    const handleDurationChange = (change) => {
        const newDuration = Math.max(5, Math.min(995, duration + change));
        onAction('SET_DURATION', newDuration);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative shadow-2xl rounded-[2.5rem] overflow-hidden h-full min-h-[500px] flex flex-col justify-between border border-white/10 bg-slate-900 isolate"
        >
            <TimerBackground />

            {/* HEADER (Building Badge) */}
            <div className="relative z-20 pt-8 flex justify-center">
                {!isFailed && (
                    <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-lg ${currentBuilding.color}`}>
                        <CurrentIcon size={18} strokeWidth={2} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${currentBuilding.color} drop-shadow-sm`}>
                            {currentBuilding.label}
                        </span>
                    </div>
                )}
            </div>

            <TimerDisplay state={state} currentBuilding={currentBuilding} handleDurationChange={handleDurationChange} />


            {/* ------------------------------------------------------ */}
            {/* CONTROLS (Bottom) */}
            {/* ------------------------------------------------------ */}
            <div className="relative z-20 w-full px-8 pb-10 bg-gradient-to-t from-slate-900/90 to-transparent pt-10">

                {/* Control Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {!isActive ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => onAction('START')}
                            className={`col-span-1 h-12 rounded-xl flex items-center justify-center gap-2 text-white shadow-lg transition-all ${currentBuilding.bg.replace('bg-', 'bg-gradient-to-r from-').replace('500', '500')} ${currentBuilding.bg.replace('bg-', 'to-').replace('500', '600')} shadow-${currentBuilding.bg.replace('bg-', '')}/25 hover:shadow-${currentBuilding.bg.replace('bg-', '')}/40`}
                        >
                            <Play size={18} fill="currentColor" />
                            <span className="text-sm font-bold">{isCompleted || isFailed ? 'Restart Build' : 'Start Build'}</span>
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => onAction('PAUSE')}
                            className="col-span-1 h-12 rounded-xl flex items-center justify-center gap-2 bg-slate-800 text-amber-400 border border-slate-700 hover:bg-slate-750 transition-all"
                        >
                            <Pause size={18} fill="currentColor" />
                            <span className="text-sm font-bold">Pause</span>
                        </motion.button>
                    )}

                    {isActive ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => onAction('GIVE_UP')}
                            className="col-span-1 h-12 rounded-xl flex items-center justify-center gap-2 bg-slate-800 text-rose-400 border border-slate-700 hover:bg-slate-750 transition-all"
                        >
                            <AlertTriangle size={18} />
                            <span className="text-sm font-bold">Give Up</span>
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => onAction('RESET')}
                            className="col-span-1 h-12 rounded-xl flex items-center justify-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750 transition-all"
                        >
                            <RotateCcw size={18} />
                            <span className="text-sm font-bold">Reset</span>
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default PomodoroTimer;
