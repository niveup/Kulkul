import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNoteActions } from '../../store/notesStore';

const FloatingAddButton = ({ isDarkMode }) => {
    const { toggleModal } = useNoteActions();
    const [isHovered, setIsHovered] = useState(false);

    return (
        /* Increased Hover Area Wrapper */
        <div
            className="fixed bottom-0 right-0 z-[100] p-8" /* Adding padding to increase hit area */
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative flex items-center justify-end">
                {/* Main Button */}
                <motion.button
                    layout
                    onClick={() => toggleModal(true)}
                    initial={{ width: 56 }}
                    animate={{
                        width: isHovered ? "auto" : 56,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        mass: 0.8
                    }}
                    className={`
                        relative h-14 rounded-[28px] overflow-hidden flex items-center
                        bg-emerald-500 text-white shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] 
                        hover:shadow-[0_20px_40px_-5px_rgba(16,185,129,0.6)] transition-shadow duration-300
                    `}
                >
                    {/* Subtle Shine/Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="flex items-center px-4 gap-3 min-w-[56px] justify-center h-full">
                        <div className="shrink-0 flex items-center justify-center">
                            <Plus
                                size={24}
                                className={`stroke-[3] transition-transform duration-500 ease-out ${isHovered ? 'rotate-90' : 'rotate-0'}`}
                            />
                        </div>

                        <AnimatePresence>
                            {isHovered && (
                                <motion.span
                                    key="label"
                                    initial={{ opacity: 0, x: -5, width: 0 }}
                                    animate={{ opacity: 1, x: 0, width: "auto" }}
                                    exit={{ opacity: 0, x: -5, width: 0 }}
                                    transition={{
                                        duration: 0.2,
                                        width: { duration: 0.3 }
                                    }}
                                    className="font-black tracking-tight text-lg whitespace-nowrap overflow-hidden"
                                >
                                    CAPTURE
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Animated Ambient Glow */}
                    <motion.div
                        animate={{
                            opacity: [0.1, 0.2, 0.1],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-white/10 blur-xl pointer-events-none"
                    />
                </motion.button>
            </div>
        </div>
    );
};

export default FloatingAddButton;
