import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { X, Save, Timer, Activity, Goal } from 'lucide-react';
import { useAppStore } from '../../store';

// --- Custom Physics Slider Component ---
const PhysicsSlider = ({ value, min, max, step, onChange, accentColor = "blue" }) => {
    const constraintsRef = useRef(null);
    const x = useMotionValue(0);
    const widthRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    // Physics spring for the TRACK FILL (Liquid Effect behind the knob)
    const widthSpring = useSpring(x, { stiffness: 400, damping: 25 });

    // Sync knob position from value when NOT dragging
    useEffect(() => {
        if (widthRef.current && !isDragging) {
            const range = max - min;
            const percentage = (value - min) / range;
            x.set(percentage * widthRef.current);
        }
    }, [value, min, max, isDragging, widthRef]); // Re-run if value changes externally

    const handleDrag = () => {
        if (!widthRef.current) return;

        // Use direct x value for real-time responsiveness
        const currentX = x.get();
        const percentage = Math.min(Math.max(currentX / widthRef.current, 0), 1);
        const rawValue = min + percentage * (max - min);

        // Snap to step
        const snappedValue = Math.round(rawValue / step) * step;
        const clampedValue = Math.min(Math.max(snappedValue, min), max);

        // Update parent state immediately
        if (clampedValue !== value) {
            onChange(clampedValue);
        }
    };

    const trackColor = accentColor === 'blue' ? '#38bdf8' : '#10b981';

    return (
        <div className="relative h-12 flex items-center select-none touch-none" ref={constraintsRef}>
            {/* The Track Container */}
            <div
                className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden"
                ref={(el) => { if (el) widthRef.current = el.offsetWidth; }}
            >
                {/* Active Fill Track (Follows with Spring for liquid feel) */}
                <motion.div
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                        width: widthSpring,
                        backgroundColor: trackColor,
                        opacity: 0.5
                    }}
                />
            </div>

            {/* The Draggable Handle (Direct Control) */}
            <motion.div
                drag="x"
                dragConstraints={constraintsRef}
                dragElastic={0} // No elasticity to ensure precision at edges
                dragMomentum={false}
                onDragStart={() => setIsDragging(true)}
                onDrag={handleDrag}
                onDragEnd={() => setIsDragging(false)}
                style={{ x }} // Bind DIRECTLY to x for 1:1 control
                className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-20"
            >
                {/* The Visible Knob */}
                <div className={`
                    w-6 h-6 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.3)] 
                    border border-white/10 flex items-center justify-center transition-transform duration-200
                    ${isDragging ? 'scale-115 shadow-[0_0_0_5px_rgba(255,255,255,0.15)]' : 'hover:scale-105'}
                `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${accentColor === 'blue' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                </div>
            </motion.div>
        </div>
    );
};

// --- Values Component (No Box, Integrated Look) ---
const ValueDisplay = ({ children }) => (
    <div className="text-[17px] font-medium text-white tracking-tight flex items-baseline gap-0.5">
        {children}
    </div>
);

const GoalSettings = ({ isOpen, onClose }) => {
    const { goals, updateGoals } = useAppStore();
    const [localGoals, setLocalGoals] = React.useState(goals);

    // Sync local state when open
    useEffect(() => {
        if (isOpen) setLocalGoals(goals);
    }, [isOpen, goals]);

    const handleSave = () => {
        updateGoals(localGoals);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] transition-colors duration-500"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.9, y: 10, filter: "blur(10px)" }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 m-auto w-full max-w-md h-fit z-[101] p-4"
                    >
                        <div className="group relative overflow-hidden bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 p-6 shadow-2xl rounded-[32px]">

                            {/* Ambient Glows */}
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/30 via-transparent to-transparent blur-3xl animate-spin-slow pointer-events-none" />
                            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] opacity-10 bg-accent-blue/30 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative z-10">

                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                                            <Goal size={18} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                                        </div>
                                        <div>
                                            <h3 className="text-[17px] font-semibold text-white tracking-tight leading-none">Focus Targets</h3>
                                            <p className="text-white/40 text-[11px] font-medium mt-1">Daily productivity goals</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all backdrop-blur-md"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="space-y-8">

                                    {/* Focus Goal Section */}
                                    <div className="group/item space-y-1">
                                        <div className="flex items-end justify-between px-1 mb-2">
                                            <label className="flex items-center gap-2 text-[15px] font-medium text-white/90">
                                                <Timer size={16} className="text-blue-400" />
                                                Daily Focus
                                            </label>

                                            {/* Integrated Value - Pure Text */}
                                            <ValueDisplay>
                                                <span>{Math.floor(localGoals.dailyFocusMinutes / 60)}</span>
                                                <span className="text-sm text-white/40 mr-1.5 font-normal">h</span>
                                                <span>{(localGoals.dailyFocusMinutes % 60).toString().padStart(2, ' ')}</span>
                                                <span className="text-sm text-white/40 font-normal">m</span>
                                            </ValueDisplay>
                                        </div>

                                        <PhysicsSlider
                                            value={localGoals.dailyFocusMinutes}
                                            min={0}
                                            max={1440}
                                            step={15}
                                            onChange={(val) => setLocalGoals(prev => ({ ...prev, dailyFocusMinutes: val }))}
                                            accentColor="blue"
                                        />
                                        <div className="flex justify-between -mt-2 text-[10px] text-white/20 font-medium px-1">
                                            <span>0h</span>
                                            <span>24h</span>
                                        </div>
                                    </div>

                                    {/* Efficiency Goal Section */}
                                    <div className="group/item space-y-1">
                                        <div className="flex items-end justify-between px-1 mb-2">
                                            <label className="flex items-center gap-2 text-[15px] font-medium text-white/90">
                                                <Activity size={16} className="text-emerald-400" />
                                                Target Efficiency
                                            </label>

                                            {/* Integrated Value - Pure Text */}
                                            <ValueDisplay>
                                                <span>{localGoals.targetEfficiency}</span>
                                                <span className="text-sm text-white/40 font-normal ml-0.5">%</span>
                                            </ValueDisplay>
                                        </div>

                                        <PhysicsSlider
                                            value={localGoals.targetEfficiency}
                                            min={0}
                                            max={100}
                                            step={5}
                                            onChange={(val) => setLocalGoals(prev => ({ ...prev, targetEfficiency: val }))}
                                            accentColor="green"
                                        />
                                        <div className="flex justify-between -mt-2 text-[10px] text-white/20 font-medium px-1">
                                            <span>0%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10">
                                    <button
                                        onClick={handleSave}
                                        className="relative w-full py-3.5 rounded-2xl bg-white text-black font-semibold text-sm tracking-wide overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] hover:animate-shimmer" />
                                        <span className="relative flex items-center justify-center gap-2">
                                            <Save size={16} />
                                            Save Changes
                                        </span>
                                    </button>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default GoalSettings;
