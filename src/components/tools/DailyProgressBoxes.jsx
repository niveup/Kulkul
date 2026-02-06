import React from 'react';
import { motion } from 'framer-motion';

const DailyProgressBoxes = ({ data, goalMinutes }) => {
    // Get last 7 days of data
    const recentData = data.slice(-7);

    // Calculate maximum minutes for dynamic scaling
    const maxMinutes = Math.max(...recentData.map(d => d.value), goalMinutes);

    // Calculate percentage for color coding
    const getProgressColor = (minutes) => {
        if (maxMinutes <= 0) return 'bg-white/10';

        const percentage = (minutes / maxMinutes) * 100;

        if (percentage >= 100) return 'bg-emerald-500';
        if (percentage >= 75) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        if (percentage >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getProgressPercentage = (minutes) => {
        if (maxMinutes <= 0) return 0;
        return Math.min(100, (minutes / maxMinutes) * 100);
    };

    const formatHours = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <div className="grid grid-cols-7 gap-2">
            {recentData.map((day, index) => (
                <motion.div
                    key={day.date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="relative group"
                >
                    {/* Day Label */}
                    <div className="text-[10px] text-white/40 text-center mb-2">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>

                    {/* Progress Box */}
                    <div className="relative h-24 bg-white/5 rounded-lg overflow-hidden border border-white/10">
                        {/* Progress Fill */}
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${getProgressPercentage(day.value)}%` }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                            className={`absolute bottom-0 left-0 right-0 ${getProgressColor(day.value)} transition-all duration-300`}
                        />

                        {/* Hours Display */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[14px] font-bold text-white drop-shadow-lg">
                                {formatHours(day.value)}
                            </span>
                        </div>

                        {/* Percentage Tooltip on Hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <span className="text-[12px] font-bold text-white">
                                {Math.round(getProgressPercentage(day.value))}%
                            </span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default DailyProgressBoxes;
