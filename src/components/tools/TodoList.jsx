import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Check,
    Trash2,
    Save,
    AlertTriangle,
    Calendar as CalendarIcon,
    Sparkles,
    Target,
    Clock,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { validators } from '../../utils/apiErrorHandler';
import { getTodayIST, isTodayIST } from '../../utils/dateUtils';

const TodoList = ({ tasks, addTask, toggleTask, removeTask, saveTask, saveAllTasks, hasUnsaved, onUnsavedChange }) => {
    const [input, setInput] = useState('');
    const [inputError, setInputError] = useState('');
    const [viewDate, setViewDate] = useState(getTodayIST());
    const isToday = isTodayIST(viewDate);

    const handleSubmit = (e) => {
        e.preventDefault();
        const validation = validators.validateTaskText(input);
        if (!validation.isValid) {
            setInputError(validation.error);
            return;
        }
        addTask(validation.sanitized);
        setInput('');
        setInputError('');
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (inputError) setInputError('');
    };

    const unsavedCount = tasks.filter(t => !t.isSaved).length;

    useEffect(() => {
        if (onUnsavedChange) {
            onUnsavedChange(unsavedCount > 0);
        }
    }, [unsavedCount, onUnsavedChange]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (unsavedCount > 0) {
                e.preventDefault();
                e.returnValue = 'Unsaved changes detected. Leave?';
                return e.returnValue;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [unsavedCount]);

    return (
        <div className="h-full flex flex-col bg-[#050508]/40 backdrop-blur-3xl rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl relative">
            {/* Header Area */}
            <div className="flex items-center justify-between p-6 pb-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        Focus
                    </h3>
                </div>

                <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => {/* Navigate functionality if applicable */ }}
                        className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                        <ChevronLeft size={14} strokeWidth={3} />
                    </button>

                    <button
                        onClick={() => setViewDate(getTodayIST())}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all duration-300 transform active:scale-90 ${isToday
                            ? 'bg-transparent text-white/10 cursor-default'
                            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                            }`}
                        disabled={isToday}
                    >
                        Today
                    </button>

                    <button
                        onClick={() => {/* Navigate functionality if applicable */ }}
                        className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                        <ChevronRight size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {tasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center opacity-30 text-center py-12"
                        >
                            <Sparkles size={32} className="text-cyan-400 mb-3" />
                            <p className="text-xs font-medium text-white tracking-wide uppercase opacity-50">Empty Slate</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-2">
                            {tasks.map((task, index) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${task.completed
                                        ? 'bg-white/[0.02] border-white/5 opacity-50'
                                        : 'bg-white/[0.04] border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.06] shadow-lg'
                                        }`}
                                >
                                    {/* Liquid Sheen Background */}
                                    {!task.completed && (
                                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}

                                    <div className="flex items-center gap-3.5 overflow-hidden flex-1">
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.completed
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                                                : 'border-white/20 text-transparent hover:border-cyan-400 hover:scale-110'
                                                }`}
                                        >
                                            <Check size={10} strokeWidth={4} />
                                        </button>

                                        <div className="flex flex-col min-w-0">
                                            <span className={`text-[13px] font-medium tracking-tight truncate transition-all ${task.completed ? 'text-white/20 line-through' : 'text-white/90'
                                                }`}>
                                                {task.text}
                                            </span>
                                            {!task.isSaved && (
                                                <span className="text-[8px] text-amber-500/60 font-black uppercase tracking-[0.2em]">Pending Cloud</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => removeTask(task.id)}
                                            className="p-1.5 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-gradient-to-t from-[#050508] to-transparent">
                <form onSubmit={handleSubmit} className="relative group/input">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Commit a new todo..."
                        className={`w-full bg-[#0a0a0f]/60 backdrop-blur-3xl border rounded-[2rem] pl-6 pr-14 py-4 text-[13px] font-medium text-white placeholder:text-white/20 focus:outline-none transition-all shadow-inner relative z-10 tracking-normal ${inputError ? 'border-rose-500/40 focus:border-rose-500' : 'border-white/10 focus:border-cyan-500/40'
                            }`}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white disabled:opacity-0 transition-all z-20 active:scale-90 border border-cyan-500/20 shadow-lg"
                    >
                        <Plus size={16} strokeWidth={3} />
                    </button>

                    {inputError && (
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-6 left-6 text-rose-400 text-[10px] font-bold uppercase tracking-wider"
                        >
                            {inputError}
                        </motion.p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default React.memo(TodoList);