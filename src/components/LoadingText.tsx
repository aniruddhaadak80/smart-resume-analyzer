'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LoadingTextProps {
    messages: string[];
    interval?: number;
    className?: string; // Allow custom styling
}

export default function LoadingText({ messages, interval = 2500, className }: LoadingTextProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % messages.length);
        }, interval);

        return () => clearInterval(timer);
    }, [messages, interval]);

    return (
        <div className={`relative h-8 overflow-hidden flex items-center justify-center ${className}`}>
            <AnimatePresence mode="wait">
                <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute text-center whitespace-nowrap"
                >
                    {messages[index]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
}
