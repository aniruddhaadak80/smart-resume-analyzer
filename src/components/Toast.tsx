'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X, Sparkles } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const toastStyles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; gradient: string }> = {
    success: {
        bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        border: 'border-emerald-400',
        icon: <CheckCircle className="w-6 h-6 text-white" />,
        gradient: 'from-emerald-400 via-teal-400 to-cyan-400',
    },
    error: {
        bg: 'bg-gradient-to-r from-red-500 to-rose-500',
        border: 'border-red-400',
        icon: <XCircle className="w-6 h-6 text-white" />,
        gradient: 'from-red-400 via-rose-400 to-pink-400',
    },
    warning: {
        bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
        border: 'border-amber-400',
        icon: <AlertCircle className="w-6 h-6 text-white" />,
        gradient: 'from-amber-400 via-orange-400 to-yellow-400',
    },
    info: {
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        border: 'border-blue-400',
        icon: <Sparkles className="w-6 h-6 text-white" />,
        gradient: 'from-blue-400 via-indigo-400 to-purple-400',
    },
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
    const style = toastStyles[toast.type];
    const [progress, setProgress] = useState(100);
    const duration = toast.duration || 5000;

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - (100 / (duration / 100))));
        }, 100);

        const timeout = setTimeout(() => {
            onClose();
        }, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [duration, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`relative overflow-hidden rounded-xl shadow-2xl ${style.bg} border ${style.border} min-w-[320px] max-w-[400px]`}
        >
            {/* Animated background shimmer */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${style.gradient} opacity-30`}
                animate={{
                    x: ['-100%', '100%'],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            {/* Content */}
            <div className="relative z-10 p-4 flex items-start gap-3">
                {/* Icon with pulse animation */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                >
                    {style.icon}
                </motion.div>

                {/* Message */}
                <div className="flex-1">
                    <p className="text-white font-semibold text-sm leading-relaxed">
                        {toast.message}
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="text-white/70 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                <motion.div
                    className="h-full bg-white/50"
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>

            {/* Sparkle particles for success */}
            {toast.type === 'success' && (
                <>
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-white rounded-full"
                            initial={{
                                opacity: 0,
                                x: 20,
                                y: 20,
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                x: [20, 20 + (i * 30), 40 + (i * 30)],
                                y: [20, -10 - (i * 5), -30 - (i * 10)],
                            }}
                            transition={{
                                duration: 1,
                                delay: i * 0.1,
                            }}
                        />
                    ))}
                </>
            )}
        </motion.div>
    );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success', duration: number = 5000) => {
        // Cap duration at 20 seconds as requested
        const cappedDuration = Math.min(duration, 20000);
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration: cappedDuration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast container - bottom right */}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
