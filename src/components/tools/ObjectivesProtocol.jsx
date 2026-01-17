import React, { useState } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '../../store';

const ObjectivesProtocol = () => {
    const tasks = useTaskStore((state) => state.tasks);
    const addTask = useTaskStore((state) => state.addTask);
    const toggleTask = useTaskStore((state) => state.toggleTask);
    const removeTask = useTaskStore((state) => state.removeTask);

    const [newTask, setNewTask] = useState("");

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        addTask(newTask);
        setNewTask("");
    };

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-medium text-white mb-4 pl-1">Objectives</h3>

            <div className="flex-1 overflow-y-auto pr-2">
                <AnimatePresence initial={false} mode="popLayout">
                    {tasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-white/30 text-sm"
                        >
                            <p>No active objectives.</p>
                        </motion.div>
                    ) : (
                        tasks.map(task => (
                            <motion.div
                                layout
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group flex items-center p-3 mb-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => toggleTask(task.id)}
                            >
                                {/* iOS Style Checkbox */}
                                <div className={`
                                    w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all duration-300 mr-4
                                    ${task.completed
                                        ? 'bg-accent-blue border-accent-blue'
                                        : 'border-white/20 group-hover:border-white/40'}
                                `}>
                                    {task.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                                </div>

                                <span className={`flex-1 text-sm font-medium transition-colors ${task.completed ? 'text-white/30 line-through' : 'text-white/90'}`}>
                                    {task.text}
                                </span>

                                <button
                                    onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-white/40 hover:text-red-400 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Clean Input */}
            <form onSubmit={handleAddTask} className="mt-4 relative">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add new objective..."
                    className="liquid-input pl-4 pr-10"
                />
                <button
                    type="submit"
                    disabled={!newTask.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/10 text-white disabled:opacity-0 transition-all hover:bg-white/20"
                >
                    <Plus size={16} />
                </button>
            </form>
        </div>
    );
};

export default React.memo(ObjectivesProtocol);
