import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Calendar, Target, Activity, BarChart3 } from 'lucide-react';

const ProgressSection = ({ sessionHistory = [] }) => {

    // Calculate Stats
    const stats = useMemo(() => {
        const totalSessions = sessionHistory.filter(s => s.status === 'completed').length;
        const totalMinutes = sessionHistory.reduce((acc, s) => {
            return s.status === 'completed' ? acc + s.minutes : acc;
        }, 0);

        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;

        // Simple streak logic (consecutive days) - mock for now or calculate from dates
        // Calculating average duration
        const avgDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

        return {
            sessions: totalSessions,
            time: `${hours}h ${mins}m`,
            avg: `${avgDuration}m`,
            efficiency: sessionHistory.length > 0
                ? Math.round((totalSessions / sessionHistory.length) * 100)
                : 100
        };
    }, [sessionHistory]);

    return (
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100/50 rounded-xl text-indigo-600">
                    <TrendingUp size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Progress</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Total Focus Time Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-indigo-100 text-sm font-medium">Focus Time</span>
                        <Clock size={16} className="text-indigo-200" />
                    </div>
                    <div className="text-3xl font-black mb-1">{stats.time}</div>
                    <div className="text-xs text-indigo-200 bg-white/10 inline-block px-2 py-1 rounded-lg">
                        Total aggregated time
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Sessions Count */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 transition-colors group">
                        <div className="flex items-center gap-2 mb-2 text-slate-500 group-hover:text-indigo-600 transition-colors">
                            <Activity size={16} />
                            <span className="text-xs font-semibold">Sessions</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{stats.sessions}</div>
                    </div>

                    {/* Efficiency/Success Rate */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 transition-colors group">
                        <div className="flex items-center gap-2 mb-2 text-slate-500 group-hover:text-emerald-600 transition-colors">
                            <BarChart3 size={16} />
                            <span className="text-xs font-semibold">Efficiency</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{stats.efficiency}%</div>
                    </div>
                </div>

                {/* Recent Activity List (Mini) */}
                <div className="mt-2 flex-1 min-h-0 flex flex-col">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</h4>
                    <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {sessionHistory.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No activity yet.</p>
                        ) : (
                            sessionHistory.slice().reverse().slice(0, 5).map((session, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/50 border border-slate-100 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${session.status === 'completed' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                        <span className="text-sm font-medium text-slate-600">
                                            {session.minutes} min session
                                        </span>
                                    </div>
                                    <span className={`text-xs ${session.status === 'completed' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {session.status === 'completed' ? 'Done' : 'Failed'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressSection;
