import React from 'react';
import { motion } from 'framer-motion';

const SessionTimeline = ({ sessions = [] }) => {
    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-medium text-white mb-6 pl-1">Timeline</h3>

            <div className="relative flex-1 overflow-y-auto pl-2">
                {/* Thin Guide Line */}
                <div className="absolute left-[19px] top-2 bottom-0 w-px bg-white/5"></div>

                <div className="space-y-8">
                    {sessions.length === 0 ? (
                        <div className="pl-10 text-white/30 text-sm">No sessions recorded yet.</div>
                    ) : (
                        sessions.slice(0, 10).map((session, i) => (
                            <motion.div
                                key={session.id || i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative pl-10 group"
                            >
                                {/* Dot Node */}
                                <div className={`
                                    absolute left-[15px] top-1.5 w-2 h-2 rounded-full border border-black z-10 transition-all
                                    ${session.status === 'completed' ? 'bg-accent-blue shadow-[0_0_10px_rgba(41,151,255,0.4)]' : 'bg-white/20'}
                                `} />

                                <div className="flex flex-col">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-white font-medium text-sm">
                                            {session.minutes} mins
                                        </span>
                                        <span className="text-white/30 text-xs">
                                            {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <span className={`text-xs font-medium tracking-wide mt-0.5 ${session.status === 'completed' ? 'text-accent-blue' : 'text-white/40'}`}>
                                        {session.status === 'completed' ? 'Focus Session' : 'Interrupted'}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(SessionTimeline);
