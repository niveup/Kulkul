import React, { useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Hammer, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBuildingConfig } from '../../utils/pomodoroConfig';

const PomodoroTimer = ({ state, onAction }) => {
    const { duration, timeLeft, isActive, isCompleted, isFailed, initialTime } = state;

    // Determine current building based on the *set duration* (not time left)
    const currentBuilding = getBuildingConfig(Math.floor(initialTime / 60));
    const CurrentIcon = currentBuilding.icon;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
    };

    // Calculate Progress for "Building" animation
    const progress = 1 - (timeLeft / initialTime);
    const buildingHeight = Math.min(Math.max(progress * 100, 0), 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative shadow-2xl rounded-[2.5rem] overflow-hidden aspect-[4/5] flex flex-col justify-end border border-white/60 bg-white"
        >
            {/* ------------------------------------------------------ */}
            {/* IMMERSIVE BACKGROUND SCENE (Construction Site) */}
            {/* ------------------------------------------------------ */}
            <div className={`absolute inset-0 bg-gradient-to-b ${currentBuilding.sky} to-white transition-colors duration-1000 z-0`}>

                {/* Floating Clouds */}
                <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none">
                    <motion.div animate={{ x: ["-10%", "10%"] }} transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} className="absolute top-10 left-10 text-slate-300">
                        <div className="w-24 h-12 bg-current rounded-full blur-xl" />
                    </motion.div>
                    <motion.div animate={{ x: ["5%", "-5%"] }} transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} className="absolute top-20 right-10 text-slate-200">
                        <div className="w-32 h-16 bg-current rounded-full blur-xl" />
                    </motion.div>
                </div>

                {/* THE BUILDING (Centerpiece) */}
                <div className="absolute inset-x-0 bottom-[42%] flex justify-center items-end h-[50%] z-10 pointer-events-none">
                    {/* FAILED STATE */}
                    <AnimatePresence>
                        {isFailed && (
                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="absolute z-40 flex flex-col items-center justify-center top-0 text-red-500 drop-shadow-sm">
                                <AlertTriangle size={64} strokeWidth={2} />
                                <span className="text-sm font-bold uppercase tracking-widest mt-2 bg-white/90 px-3 py-1 rounded-full shadow-sm text-red-500">Construction Halted</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* COMPLETED STATE */}
                    <AnimatePresence>
                        {isCompleted && !isFailed && (
                            <motion.div initial={{ scale: 0.8, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ opacity: 0 }} className={`absolute z-40 mb-4 drop-shadow-2xl ${currentBuilding.color}`}>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className={`absolute -inset-8 opacity-20 blur-xl rounded-full bg-current`} />
                                <CurrentIcon size={140} strokeWidth={1.5} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* BUILDING PROGRESS (Active/Paused) */}
                    {!isFailed && !isCompleted && (
                        <div className="relative w-48 h-48 flex items-end justify-center">
                            {/* Blueprint/Ghost */}
                            <div className="absolute inset-0 flex items-end justify-center opacity-30 grayscale filter mix-blend-multiply">
                                <CurrentIcon size={160} />
                            </div>

                            {/* Constructed Part (Masked) */}
                            <div className="absolute bottom-0 left-0 w-full flex items-end justify-center overflow-hidden transition-all duration-1000 ease-linear" style={{ height: `${buildingHeight}%` }}>
                                <div className="w-48 h-48 flex items-end justify-center relative">
                                    <CurrentIcon size={160} className={`${currentBuilding.color} drop-shadow-2xl [&_path]:stroke-none`} strokeWidth={2} fill="currentColor" fillOpacity={0.15} />
                                    {/* Texture */}
                                    <div className="absolute inset-0 mix-blend-overlay opacity-30 bg-gradient-to-tr from-black/10 to-transparent" />
                                </div>
                                {/* Laser Line */}
                                <div className="absolute top-0 w-full h-[2px] bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,1)] z-20" />
                            </div>

                            {/* Hammer Animation */}
                            {isActive && (
                                <motion.div
                                    className="absolute z-30 text-slate-700 drop-shadow-lg"
                                    style={{ bottom: `${buildingHeight}%`, right: '-10%' }}
                                    animate={{ x: [-10, 0, -10], rotate: [-15, 0, -15] }}
                                    transition={{ duration: 0.6, repeat: Infinity }}
                                >
                                    <Hammer size={28} fill="currentColor" className="origin-bottom-left" />
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>

                {/* Ground */}
                <div className="absolute bottom-0 inset-x-0 h-[35%] bg-gradient-to-t from-white via-white/90 to-transparent z-10" />
            </div>


            {/* ------------------------------------------------------ */}
            {/* UI OVERLAY (Foreground) */}
            {/* ------------------------------------------------------ */}
            {/* ------------------------------------------------------ */}
            {/* STATIC HEADER (Pinned to Top) */}
            {/* ------------------------------------------------------ */}
            <div className="absolute top-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <div className="flex flex-col items-center">
                    {!isFailed && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-white/60 ${currentBuilding.color}`}>
                            <CurrentIcon size={16} strokeWidth={2.5} />
                            <span className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
                                {currentBuilding.label}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ------------------------------------------------------ */}
            {/* CENTERED TIMER (Fixed Position) */}
            {/* ------------------------------------------------------ */}
            <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center group">
                {/* Time */}
                <div className="text-7xl font-light tracking-tighter text-slate-800 tabular-nums leading-none select-none drop-shadow-sm transition-all duration-300" style={{ fontFamily: '"SF Pro Display", "Inter", sans-serif' }}>
                    {formatTime(timeLeft)}
                </div>

                {/* Hidden Time Slider Removed from here */}
            </div>

            {/* ------------------------------------------------------ */}
            {/* UI OVERLAY (Foreground) */}
            {/* ------------------------------------------------------ */}
            <div className="relative z-20 w-full px-8 pb-8 pt-4 flex flex-col items-center gap-6 bg-gradient-to-t from-white/80 to-transparent">

                {/* Spacer to push timer down if needed, though absolute header handles it. */}
                <div className="h-2" />



                {/* Controls */}
                <div className="w-full grid grid-cols-2 gap-4">
                    {!isActive ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => onAction('START')}
                            className="col-span-1 h-14 rounded-2xl flex items-center justify-center gap-2 bg-slate-900 text-white shadow-xl shadow-slate-300 hover:bg-slate-800 transition-all z-20"
                        >
                            <Play size={20} fill="currentColor" />
                            <span className="text-base font-semibold">{isCompleted || isFailed ? 'Restart' : 'Build'}</span>
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => onAction('PAUSE')}
                            className="col-span-1 h-14 rounded-2xl flex items-center justify-center gap-2 bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200 transition-all z-20"
                        >
                            <Pause size={20} fill="currentColor" />
                            <span className="text-base font-semibold">Pause</span>
                        </motion.button>
                    )}

                    {isActive ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => onAction('GIVE_UP')}
                            className="col-span-1 h-14 rounded-2xl flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all z-20"
                        >
                            <AlertTriangle size={20} />
                            <span className="text-base font-semibold">Give Up</span>
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => onAction('RESET')}
                            className="col-span-1 h-14 rounded-2xl flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm z-20"
                        >
                            <RotateCcw size={20} />
                            <span className="text-base font-semibold">Reset</span>
                        </motion.button>
                    )}
                </div>

                {/* Time Slider - Below Buttons */}
                {!isActive && !isCompleted && !isFailed && (
                    <div className="w-full flex flex-col items-center mt-2 px-4">
                        <div className="w-full flex justify-between text-xs text-slate-500 font-bold mb-2 tracking-wide">
                            <span>DURATION</span>
                            <span className="text-indigo-600">{duration} MIN</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="120"
                            value={duration}
                            onChange={(e) => onAction('SET_DURATION', e.target.value)}
                            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:bg-slate-300 transition-colors"
                        />
                        <div className="flex justify-between w-full text-[10px] text-slate-400 font-bold mt-1">
                            <span>1m</span>
                            <span>2h</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PomodoroTimer;
