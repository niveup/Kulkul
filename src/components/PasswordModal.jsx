
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const PasswordModal = () => {
    const { isAuthenticated, isGuest, login, enterGuestMode, error: authError } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If authenticated or guest mode chosen, don't show modal (unless we want to support switching back)
    // For this modal, we hide it when one of those states is active.
    if (isAuthenticated || isGuest) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setError(false);
        setIsSubmitting(true);

        try {
            const isValid = await login(password);
            if (isValid) {
                setSuccess(true);
            } else {
                setError(true);
            }
        } catch (err) {
            setError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
            {/* 1. Cinematic Background Blur & Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-950/30 backdrop-blur-3xl"
            />

            {/* Background Ambient Orbs (Premium Feel) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px]"
                />
            </div>

            {/* 2. The Glass Card */}
            <AnimatePresence>
                {!success ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            x: error ? [0, -10, 10, -10, 10, 0] : 0
                        }}
                        exit={{ scale: 0.95, opacity: 0, filter: 'blur(10px)' }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            x: { duration: 0.4 } // Shake duration
                        }}
                        className={cn(
                            "relative w-full max-w-md p-1",
                            "rounded-[32px]", // Super rounded premium feel
                            "bg-gradient-to-b from-white/20 to-white/5", // Glass border gradient
                            "shadow-2xl shadow-indigo-500/20"
                        )}
                    >
                        {/* Inner Content Container */}
                        <div className={cn(
                            "relative overflow-hidden",
                            "rounded-[30px] p-8",
                            "bg-slate-900/80 backdrop-blur-xl", // The main glass material
                            "border border-white/10",
                            "flex flex-col items-center text-center"
                        )}>

                            {/* Icon */}
                            <div className="mb-6 p-4 rounded-full bg-white/5 border border-white/10 shadow-inner">
                                <Lock className="w-8 h-8 text-white/90" />
                            </div>

                            {/* Title */}
                            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                                Enter your secure key to access <br /> the AI Core and Database.
                            </p>

                            {/* Input Form */}
                            <form onSubmit={handleSubmit} className="w-full space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter Password" // Use simple placeholder for sleek look, dots will appear on type
                                        className={cn(
                                            "relative w-full px-6 py-4",
                                            "bg-white/5 hover:bg-white/10 focus:bg-white/10",
                                            "border border-white/10 focus:border-indigo-500/50",
                                            "rounded-2xl outline-none",
                                            "text-white text-center text-lg tracking-widest placeholder:tracking-normal",
                                            "placeholder-slate-500",
                                            "transition-all duration-300",
                                            "focus:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                                        )}
                                        autoFocus
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={!password}
                                    className={cn(
                                        "w-full py-4 rounded-2xl",
                                        "bg-gradient-to-r from-indigo-600 to-purple-600",
                                        "text-white font-semibold text-lg",
                                        "shadow-lg shadow-indigo-500/30",
                                        "hover:shadow-indigo-500/50",
                                        "disabled:opacity-50 disabled:cursor-not-allowed",
                                        "transition-all duration-300",
                                        "flex items-center justify-center gap-2"
                                    )}
                                >
                                    Unlock Dashboard
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </form>

                            {/* Guest Mode Divider */}
                            <div className="relative w-full my-8 flex items-center gap-4">
                                <div className="h-px bg-white/10 flex-1" />
                                <span className="text-xs text-slate-500 uppercase tracking-widest">or</span>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            {/* Guest Button */}
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={enterGuestMode}
                                className={cn(
                                    "w-full py-3 px-4 rounded-xl",
                                    "bg-transparent border border-white/10",
                                    "text-slate-400 hover:text-white",
                                    "text-sm font-medium",
                                    "flex items-center justify-center gap-2",
                                    "transition-colors duration-300"
                                )}
                            >
                                <Clock className="w-4 h-4" />
                                Review Logs & Timer (Guest Mode)
                            </motion.button>

                        </div>
                    </motion.div>
                ) : (
                    // Success View (Unlock Animation)
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="relative flex flex-col items-center justify-center z-50 text-white"
                        onAnimationComplete={() => {
                            // Wait a moment then let the parent/context know we are done? 
                            // Actually context is already updated, just waiting for exit animation.
                        }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.5, ease: "backOut" }}
                            className="p-6 rounded-full bg-green-500/20 border border-green-500/50 mb-4 shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                        >
                            <ShieldCheck className="w-16 h-16 text-green-400" />
                        </motion.div>
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold"
                        >
                            Access Granted
                        </motion.h2>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PasswordModal;
