import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
    TrendingUp, Activity, BarChart3, Zap, Calendar, Sparkles, Target,
    Moon, ChevronLeft, ChevronRight, X, Plus, Trash2, CheckCircle2,
    Circle, AlertTriangle, ArrowRight, Focus
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceLine
} from 'recharts';

// ============================================================================
// COMPONENT: FOCUS VELOCITY (CHART)
// ============================================================================

const FocusVelocity = ({ data }) => {
    // Transform session history into chart data
    // We want a rolling window of recent performance or activity over time
    // For this demo, we'll mock a "Velocity" curve based on recent sessions
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return Array(7).fill(0).map((_, i) => ({ name: `Day ${i}`, value: 0 }));

        // Simple aggregation for demo: Last 7 sessions or days
        // In a real app, this would be proper date aggregation
        return data.slice(0, 7).reverse().map((session, i) => ({
            name: new Date(session.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
            value: session.minutes || 0,
            efficiency: session.status === 'completed' ? 100 : 40
        }));
    }, [data]);

    return (
        <div className="relative w-full h-full min-h-[300px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Activity size={18} />
                    </div>
                    <div>
                        <h3 className="text-white font-medium tracking-tight">Focus Velocity</h3>
                        <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Real-time Analytics</p>
                    </div>
                </div>
                {chartData.length > 0 && (
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white tabular-nums tracking-tighter">
                            {chartData[chartData.length - 1]?.value}<span className="text-sm text-white/40 font-normal ml-1">mins</span>
                        </div>
                        <div className="text-emerald-400 text-xs font-medium flex items-center justify-end gap-1">
                            <TrendingUp size={12} /> +12% vs avg
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute inset-0 top-16 bottom-0 left-0 right-0 min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// ============================================================================
// COMPONENT: OBJECTIVES PROTOCOL (TODO)
// ============================================================================

const ObjectivesProtocol = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: "Complete System Architecture", completed: true },
        { id: 2, text: "Review PR #412", completed: false },
        { id: 3, text: "Deploy to Production", completed: false }
    ]);
    const [newTask, setNewTask] = useState("");

    const addTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
        setNewTask("");
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const removeTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={18} />
                </div>
                <div>
                    <h3 className="text-white font-medium tracking-tight">Objectives Protocol</h3>
                    <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Daily Targets</p>
                </div>
            </div>

            <form onSubmit={addTask} className="relative group mb-6">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Initialize new objective..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                    <Plus size={16} />
                </div>
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/10 text-white hover:bg-indigo-500 hover:text-white transition-colors opacity-0 group-focus-within:opacity-100"
                >
                    <ArrowRight size={14} />
                </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                <AnimatePresence initial={false}>
                    {tasks.map(task => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${task.completed ? 'bg-white/5 border-transparent opacity-60' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <button
                                    onClick={() => toggleTask(task.id)}
                                    className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/20 text-transparent hover:border-white/40'}`}
                                >
                                    <CheckCircle2 size={12} strokeWidth={3} />
                                </button>
                                <span className={`text-sm truncate transition-all ${task.completed ? 'text-white/30 line-through' : 'text-white/90'}`}>
                                    {task.text}
                                </span>
                            </div>
                            <button
                                onClick={() => removeTask(task.id)}
                                className="text-white/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                            >
                                <Trash2 size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {tasks.length === 0 && (
                    <div className="text-center py-8 text-white/20 text-xs uppercase tracking-widest">
                        Protocol Empty
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// COMPONENT: SESSION TIMELINE (HISTORY)
// ============================================================================

const SessionTimeline = ({ sessions = [] }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                    <Calendar size={18} />
                </div>
                <div>
                    <h3 className="text-white font-medium tracking-tight">Session Timeline</h3>
                    <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Recent Activity</p>
                </div>
            </div>

            <div className="relative flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* Connector Line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10"></div>

                <div className="space-y-6 pl-10 pt-2">
                    {sessions.slice(0, 10).map((session, i) => (
                        <motion.div
                            key={session.id || i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative"
                        >
                            {/* Dot */}
                            <div className={`absolute -left-[29px] top-1.5 w-3 h-3 rounded-full border-2 border-[#1a1a1a] ${session.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}></div>

                            <div className="flex items-center justify-between mb-1">
                                <span className="text-white font-medium text-sm">
                                    {session.minutes} Minutes
                                </span>
                                <span className="text-white/40 text-xs">
                                    {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="text-white/50 text-xs">
                                {session.status === 'completed' ? 'Deep Work Cycle Completed' : 'Session Aborted'}
                            </div>
                        </motion.div>
                    ))}
                    {sessions.length === 0 && (
                        <div className="text-white/20 text-xs">No recorded sessions. Initialize loop.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN LAYOUT: BENTO GRID
// ============================================================================

const ProgressSection = ({ sessionHistory = [] }) => {

    // Bento Item Wrapper
    const BentoItem = ({ children, className, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
            className={`
                relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] 
                shadow-2xl overflow-hidden p-6
                ${className || ''}
            `}
        >
            {/* Glass Shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            {children}
        </motion.div>
    );

    return (
        <div className="min-h-full w-full p-1 text-white">

            {/* 1. Header Area with Date/Theme Controls */}
            <div className="flex items-center justify-between mb-8 px-2">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <BarChart3 className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Command Center</h1>
                        <p className="text-white/50 text-sm font-medium tracking-wide">
                            Productivity Analytics & Objectives
                        </p>
                    </div>
                </motion.div>

                <div className="flex items-center gap-4">
                    <div className="h-10 px-4 rounded-full bg-black/20 border border-white/10 flex items-center gap-2 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold tracking-wide text-white/70">LIVE SYSTEM</span>
                    </div>
                    {/* Theme Toggle placeholder if needed again */}
                </div>
            </div>

            {/* 2. Main Bento Grid */}
            <LayoutGroup>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">

                    {/* Hero Chart (Span 8) */}
                    <div className="col-span-1 md:col-span-12 lg:col-span-8 h-[400px]">
                        <BentoItem className="h-full bg-gradient-to-br from-indigo-900/20 to-black/40">
                            <FocusVelocity data={sessionHistory} />
                        </BentoItem>
                    </div>

                    {/* Efficiency Gauge (Span 4) */}
                    <div className="col-span-1 md:col-span-6 lg:col-span-4 h-[400px]">
                        <BentoItem className="h-full flex flex-col justify-between bg-gradient-to-br from-emerald-900/10 to-black/40">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                        <Zap size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium tracking-tight">Efficiency Pulse</h3>
                                        <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Systems Normal</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="relative">
                                    {/* Decorative Rings */}
                                    <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-[spin_8s_linear_infinite]" />
                                    <div className="absolute -inset-4 rounded-full border border-emerald-500/10 animate-[spin_12s_linear_infinite_reverse]" />

                                    <div className="w-40 h-40 rounded-full bg-gradient-to-b from-emerald-500/10 to-transparent backdrop-blur-md border border-emerald-500/30 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                                        <span className="text-5xl font-bold text-white tracking-tighter">98%</span>
                                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-1">Optimal</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-white/40 text-xs uppercase font-bold">Total Sessions</div>
                                    <div className="text-xl font-bold text-white mt-1">{sessionHistory.length}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-white/40 text-xs uppercase font-bold">Focus Hours</div>
                                    <div className="text-xl font-bold text-white mt-1">
                                        {(sessionHistory.reduce((acc, s) => acc + (s.minutes || 0), 0) / 60).toFixed(1)}h
                                    </div>
                                </div>
                            </div>
                        </BentoItem>
                    </div>

                    {/* Objectives Protocol (Span 6) */}
                    <div className="col-span-1 md:col-span-6 h-[500px]">
                        <BentoItem className="h-full" delay={0.1}>
                            <ObjectivesProtocol />
                        </BentoItem>
                    </div>

                    {/* Session Timeline (Span 6) */}
                    <div className="col-span-1 md:col-span-6 h-[500px]">
                        <BentoItem className="h-full" delay={0.15}>
                            <SessionTimeline sessions={sessionHistory} />
                        </BentoItem>
                    </div>

                </div>
            </LayoutGroup>
        </div>
    );
};

export default ProgressSection;
