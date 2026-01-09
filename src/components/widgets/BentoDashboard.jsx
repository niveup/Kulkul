/**
 * Bento Dashboard Layout - Project Aether
 * 
 * A clean CSS Grid layout for the Overview tab.
 * Features HeroWindow and StreakHeatmap in a 2-column layout.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { springs, staggerContainerVariants, staggerItemVariants } from '../../lib/motion';
import HeroWindow from './HeroWindow';
import { StreakHeatmap } from './index';

const BentoDashboard = ({
    sessions = [],
    focusTime = '0h',
    userName = 'Aspirant',
    className,
}) => {
    return (
        <motion.div
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
            className={cn(
                'grid gap-6',
                // Simple 2-column Bento Layout
                'grid-cols-1 lg:grid-cols-2',
                className
            )}
        >
            {/* Hero Window - Full height on left */}
            <motion.div
                variants={staggerItemVariants}
                className="lg:row-span-1"
            >
                <HeroWindow
                    userName={userName}
                    focusTime={focusTime}
                    className="h-full min-h-[220px]"
                />
            </motion.div>

            {/* Streak Heatmap - Full height on right */}
            <motion.div
                variants={staggerItemVariants}
                className="lg:row-span-1"
            >
                <StreakHeatmap sessions={sessions} />
            </motion.div>
        </motion.div>
    );
};

export default BentoDashboard;
