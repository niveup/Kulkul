import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const TodayTimeline = ({ sessions = [] }) => {
    // Filter sessions for today only
    const todaySessions = React.useMemo(() => {
        const today = new Date().toDateString();
        return sessions
            .filter(session => new Date(session.timestamp).toDateString() === today)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }, [sessions]);

    // Calculate total focus time for today
    const totalFocusTime = React.useMemo(() => {
        return todaySessions.reduce((acc, session) => {
            if (session.status === 'completed') {
                return acc + (session.minutes || 0);
            } else if (session.status === 'failed' && session.elapsedSeconds) {
                return acc + Math.floor(session.elapsedSeconds / 60);
            }
            return acc;
        }, 0);
    }, [todaySessions]);

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (minutes) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-lg font-medium text-white">Today's Timeline</h3>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Clock size={16} />
                    <span>{formatDuration(totalFocusTime)}</span>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative flex-1 overflow-y-auto px-2">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-2 bottom-0 w-px bg-white/10"></div>

                <div className="space-y-4">
                    {todaySessions.length === 0 ? (
                        <div className="pl-10 text-white/30 text-sm">
                            No sessions recorded today. Start focusing!
                        </div>
                    ) : (
                        todaySessions.map((session, index) => (
                            <motion.div
                                key={session.id || index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative pl-10 group"
                            >
                                {/* Status Dot */}
                                <div className={`
                                    absolute left-[15px] top-1.5 w-2 h-2 rounded-full border-2 z-10 transition-all
                                    ${session.status === 'completed'
                                        ? 'bg-emerald-500 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                        : 'bg-rose-500 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                                    }
                                `} />

                                {/* Session Card */}
                                <div className={`
                                    p-3 rounded-xl border transition-all
                                    ${session.status === 'completed'
                                        ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20'
                                        : 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/20'
                                    }
                                `}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-2">
                                            {session.status === 'completed' ? (
                                                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
                                            ) : (
                                                <AlertTriangle size={16} className="text-rose-500 mt-0.5" />
                                            )}
                                            <div>
                                                <p className="text-white text-sm font-medium">
                                                    {session.status === 'completed' ? 'Focus Session' : 'Interrupted'}
                                                </p>
                                                <p className="text-white/50 text-xs mt-0.5">
                                                    {formatTime(session.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white text-sm font-medium">
                                                {formatDuration(session.minutes || Math.floor(session.elapsedSeconds / 60))}
                                            </p>
                                            <p className={`
                                                text-xs mt-0.5
                                                ${session.status === 'completed' ? 'text-emerald-500/70' : 'text-rose-500/70'}
                                            `}>
                                                {session.status === 'completed' ? 'Completed' : 'Incomplete'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(TodayTimeline);
