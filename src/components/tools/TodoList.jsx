import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2 } from 'lucide-react';

const TodoList = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: "Revise Chapter 4 Physics", completed: false },
        { id: 2, text: "Solve 20 Math Problems", completed: true },
    ]);
    const [input, setInput] = useState('');

    const addTask = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: input, completed: false }]);
        setInput('');
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const removeTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Progress Section</h3>

            <form onSubmit={addTask} className="flex gap-2 mb-4">
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
                            className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${task.completed
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
                            </div>

                            <button
                                onClick={() => removeTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TodoList;
