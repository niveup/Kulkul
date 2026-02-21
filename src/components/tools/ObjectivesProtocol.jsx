import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Check, Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, History, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '../../store';
import { isTodayIST, getTodayIST, isFutureIST } from '../../utils/dateUtils';
import TodoHistory from './TodoHistory';

const ObjectivesProtocol = () => {
    const tasks = useTaskStore((state) => state.tasks);
    const addTask = useTaskStore((state) => state.addTask);
    const toggleTask = useTaskStore((state) => state.toggleTask);
    const removeTask = useTaskStore((state) => state.removeTask);

    const [newTask, setNewTask] = useState("");
    const [viewDate, setViewDate] = useState(getTodayIST());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const isToday = isTodayIST(viewDate);

    const displayTasks = useMemo(() => {
        const targetDateStr = viewDate.toDateString();

        return tasks.filter(t => {
            const taskDate = new Date(t.createdAt || t.created_at);
            return taskDate.toDateString() === targetDateStr;
        });
    }, [tasks, viewDate]);

    const isFuture = isFutureIST(viewDate);
    const isEditable = isToday || isFuture;

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim() || !isEditable) return;

        // If it's today, just add normally. If it's future, pass the viewDate.
        const createdAt = isToday ? null : viewDate.toISOString();
        addTask(newTask, createdAt);
        setNewTask("");
    };

    const navigateDate = (days) => {
        const nextDate = new Date(viewDate);
        nextDate.setDate(nextDate.getDate() + days);

        // Allow navigating up to Tomorrow (Today + 1)
        const limit = getTodayIST();
        limit.setDate(limit.getDate() + 1);

        if (nextDate <= limit) {
            setViewDate(nextDate);
        }
    };

    const formatDateHeading = (date) => {
        if (isTodayIST(date)) return 'Current';

        const today = getTodayIST();

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="h-full flex flex-col group/protocol overflow-hidden">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-6 px-1 shrink-0">
                <div className="flex flex-col">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">
                        {isToday ? 'Focus' : isFuture ? 'Planning' : 'Archive'}
                    </h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1.5">
                        {formatDateHeading(viewDate)}
                    </p>
                </div>

                <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => navigateDate(-1)}
                        className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                        <ChevronLeft size={14} strokeWidth={3} />
                    </button>

                    <button
                        onClick={() => setViewDate(getTodayIST())}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all duration-300 transform active:scale-90 ${isToday
                            ? 'bg-transparent text-white/10 cursor-not-allowed select-none'
                            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                            }`}
                        disabled={isToday}
                    >
                        Today
                    </button>

                    <button
                        onClick={() => navigateDate(1)}
                        className={`p-1.5 rounded-md transition-all active:scale-90 ${isFuture ? 'text-white/5 cursor-not-allowed select-none' : 'text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                        disabled={isFuture}
                    >
                        <ChevronRight size={14} strokeWidth={3} />
                    </button>
                </div>

                <button
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className={`h-9 aspect-square ml-1 flex items-center justify-center rounded-lg transition-all duration-300 border overflow-hidden relative group/btn ${isCalendarOpen
                        ? 'bg-blue-500 border-blue-400 text-white shadow-[0_5px_15px_rgba(59,130,246,0.3)]'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
                        }`}
                >
                    <div className={`absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700`} />
                    <CalendarIcon size={14} className="relative z-10" />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 relative">
                <AnimatePresence mode="wait">
                    {isCalendarOpen ? (
                        <motion.div
                            key="calendar-view"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                            className="absolute inset-0 z-50 flex flex-col"
                        >
                            <TodoHistory
                                onDateSelect={(date) => {
                                    setViewDate(date);
                                    setIsCalendarOpen(false);
                                }}
                                selectedDate={viewDate}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={viewDate.toDateString()}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {displayTasks.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-6 relative px-6">
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-48 bg-cyan-500/[0.03] blur-[100px] rounded-full pointer-events-none" />
                                    </div>
                                ) : (
                                    displayTasks.map((task, idx) => (
                                        <motion.div
                                            layout
                                            key={task.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25, delay: idx * 0.02, ease: [0.23, 1, 0.32, 1] }}
                                            className={`group flex items-center p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${task.completed
                                                ? 'bg-emerald-500/[0.02] border-emerald-500/10'
                                                : 'bg-white/[0.04] border-white/5 shadow-sm hover:bg-white/[0.06] hover:border-white/10'
                                                } ${!isEditable ? 'cursor-default' : 'cursor-pointer'}`}
                                            onClick={() => isEditable && toggleTask(task.id)}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/[0.03] to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                            <div className={`
                                                w-5 h-5 rounded-[8px] border flex items-center justify-center shrink-0 transition-all duration-300 mr-4 relative z-10
                                                ${task.completed
                                                    ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                                                    : 'bg-white/5 border-white/20 group-hover:border-white/40 shadow-inner'}
                                            `}>
                                                {task.completed && <Check size={12} className="text-white" strokeWidth={3.5} />}
                                            </div>

                                            <span className={`flex-1 text-[13px] font-medium tracking-normal relative z-10 transition-all duration-300 ${task.completed ? 'text-white/20 line-through' : 'text-white/90'}`}>
                                                {task.text}
                                            </span>

                                            {isEditable && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all relative z-10"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Input Layer: Editorial UX */}
                            <div className="mt-4 pt-4 border-t border-white/5 shrink-0">
                                {isEditable ? (
                                    <form onSubmit={handleAddTask} className="relative group/input">
                                        <div className="absolute inset-0 bg-cyan-500/5 blur-[30px] opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={newTask}
                                            onChange={(e) => setNewTask(e.target.value)}
                                            placeholder="Forge new objective..."
                                            className="w-full bg-[#0a0a0f]/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] pl-6 pr-14 py-4 text-[13px] font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 transition-all shadow-inner relative z-10 tracking-normal"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newTask.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white disabled:opacity-0 transition-all z-20 active:scale-90 border border-cyan-500/20 shadow-lg"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </form>
                                ) : (
                                    <div className="py-4 px-6 rounded-2xl bg-[#0a0a0f]/40 border border-white/5 flex items-center justify-center gap-3 shadow-inner">
                                        <Lock size={14} className="text-white/30" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Archive Protocol Active</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};

export default React.memo(ObjectivesProtocol);
