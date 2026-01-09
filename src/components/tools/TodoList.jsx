import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Save, AlertTriangle } from 'lucide-react';

const TodoList = ({ tasks, addTask, toggleTask, removeTask, saveTask, saveAllTasks, hasUnsaved, onUnsavedChange }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        addTask(input);
        setInput('');
    };

    // Count unsaved tasks
    const unsavedCount = tasks.filter(t => !t.isSaved).length;

    // Notify parent about unsaved state
    useEffect(() => {
        if (onUnsavedChange) {
            onUnsavedChange(unsavedCount > 0);
        }
    }, [unsavedCount, onUnsavedChange]);

    // Warn before leaving if unsaved
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (unsavedCount > 0) {
                e.preventDefault();
                e.returnValue = 'You have unsaved todos. Are you sure you want to leave?';
                return e.returnValue;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [unsavedCount]);

    return (
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-lg">Todo List</h3>
                {unsavedCount > 0 && (
                    <div className="flex items-center gap-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium"
                        >
                            <AlertTriangle size={12} />
                            {unsavedCount} unsaved
                        </motion.div>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => saveAllTasks && saveAllTasks()}
                            className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                            <Save size={12} />
                            Save All
                        </motion.button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                    type="submit"
                    className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors"
                >
                    <Plus size={20} />
                </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                <AnimatePresence>
                    {tasks.length === 0 && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-slate-400 text-sm py-4"
                        >
                            No tasks yet. Let's get productive!
                        </motion.p>
                    )}
                    {tasks.map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${!task.isSaved
                                ? 'bg-amber-50 border-amber-200'
                                : task.completed
                                    ? 'bg-slate-50 border-transparent'
                                    : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <button
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.completed
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-slate-300 text-transparent hover:border-indigo-400'
                                        }`}
                                >
                                    <Check size={12} strokeWidth={3} />
                                </button>
                                <span className={`text-sm truncate transition-all ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                                    }`}>
                                    {task.text}
                                </span>
                                {!task.isSaved && (
                                    <span className="text-xs text-amber-600 font-medium">(unsaved)</span>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                {!task.isSaved && (
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => saveTask(task.id)}
                                        className="p-1 text-green-500 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                                        title="Save to cloud"
                                    >
                                        <Save size={16} />
                                    </motion.button>
                                )}
                                <button
                                    onClick={() => removeTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TodoList;
