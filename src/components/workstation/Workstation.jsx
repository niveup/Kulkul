import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import PomodoroTimer from '../tools/PomodoroTimer';
import CityBuilderLoader from '../tools/CityBuilder';
import { cn } from '../../lib/utils';

// Premium Loading Skeletion - Pulsing Glass
const PanelSkeleton = () => (
    <div className="w-full h-full rounded-[2rem] bg-white/5 animate-pulse border border-white/5 shadow-inner" />
);

export const Workstation = ({
    timerState,
    handleTimerAction,
    isDarkMode,
    toggleTheme,
    sessions
}) => {
    return (
        <div className="h-screen w-full p-4 lg:p-6 flex flex-col lg:flex-row gap-8 overflow-hidden">

            {/* LEFT PANEL: FOCUS ORB (Fixed Width) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Apple-style spring ease
                className="w-full lg:w-[420px] shrink-0 flex flex-col relative z-20"
            >
                {/* Glass Card Material */}
                <div className="relative w-full h-full bg-black/40 backdrop-blur-[40px] saturate-150 border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
                    {/* Inner sheen/lighting */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                    <PomodoroTimer
                        state={timerState}
                        onAction={handleTimerAction}
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                    />
                </div>
            </motion.div>

            {/* RIGHT PANEL: IMMERSIVE VIEWPORT (Flex) */}
            <motion.div
                initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 min-w-0 h-full relative z-10"
            >
                {/* Glass Card Material - Slightly more transparent for the viewport */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[20px] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
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
