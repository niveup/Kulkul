import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import PomodoroTimer from '../tools/PomodoroTimer';
import CityBuilderLoader from '../tools/CityBuilder'; // Assuming default export fits, might need lazy load wrapper if heavy
import { cn } from '../../lib/utils';

// Loading skeletons for instant feedback
const PanelSkeleton = () => (
    <div className="w-full h-full rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
);

export const Workstation = ({
    timerState,
    handleTimerAction,
    isDarkMode,
    toggleTheme,
    sessions
}) => {
    return (
        <div className="h-[calc(100vh-6rem)] min-h-[600px] w-full flex flex-col lg:flex-row gap-6 p-1 overflow-hidden">

            {/* LEFT PANEL: FOCUS REACTOR (35%) */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col"
            >
                <div className="bg-obsidian/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-1 h-full shadow-2xl relative overflow-hidden group">
                    {/* Ambient Glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/10 blur-[80px] pointer-events-none" />

                    <PomodoroTimer
                        state={timerState}
                        onAction={handleTimerAction}
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                    />
                </div>
            </motion.div>

            {/* RIGHT PANEL: SIMULATION VIEWPORT (Flex) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="flex-1 min-w-0 h-full relative"
            >
                <div className="absolute inset-0 bg-obsidian/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    {/* Holographic Border */}
                    <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 pointer-events-none z-20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />

                    {/* Content */}
                    <Suspense fallback={<PanelSkeleton />}>
                        <CityBuilderLoader
                            sessionHistory={sessions}
                            isDarkMode={isDarkMode}
                            onToggleTheme={toggleTheme}
                        />
                    </Suspense>
                </div>
            </motion.div>
        </div>
    );
};

export default Workstation;
