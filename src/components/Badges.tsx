'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { BADGES, getEarnedBadges, getRarityColor, type BadgeId } from '@/lib/gamification';

// Badge unlock toast notification
export function BadgeUnlockToast({ badgeIds, onClose }: { badgeIds: BadgeId[]; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (badgeIds.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.8 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2"
            >
                {badgeIds.map((id) => {
                    const badge = BADGES[id];
                    return (
                        <motion.div
                            key={id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center gap-3 px-5 py-3 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl shadow-black/50`}
                        >
                            <div className={`text-3xl`}>{badge.emoji}</div>
                            <div>
                                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Badge Unlocked!</p>
                                <p className="text-sm font-bold text-white">{badge.title}</p>
                                <p className={`text-xs ${getRarityColor(badge.rarity)} capitalize`}>{badge.rarity}</p>
                            </div>
                            <button onClick={onClose} className="ml-3 text-slate-500 hover:text-white">
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </motion.div>
        </AnimatePresence>
    );
}

// Badge collection grid for dashboard
export function BadgeCollection() {
    const [earned, setEarned] = useState<BadgeId[]>([]);

    useEffect(() => {
        setEarned(getEarnedBadges());
    }, []);

    const allBadges = Object.values(BADGES);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Your Badges</h2>
                <span className="text-xs text-slate-500 ml-auto">{earned.length}/{allBadges.length} earned</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allBadges.map((badge) => {
                    const isEarned = earned.includes(badge.id);
                    return (
                        <motion.div
                            key={badge.id}
                            whileHover={isEarned ? { scale: 1.05 } : {}}
                            className={`relative p-4 rounded-xl border text-center transition-all ${isEarned
                                    ? `bg-gradient-to-br ${badge.gradient}/10 border-slate-600 hover:border-slate-500`
                                    : 'bg-slate-900/30 border-slate-800 opacity-40 grayscale'
                                }`}
                        >
                            <div className={`text-3xl mb-2 ${isEarned ? '' : 'blur-[2px]'}`}>{badge.emoji}</div>
                            <p className="text-xs font-bold text-slate-200 truncate">{badge.title}</p>
                            <p className={`text-[10px] ${getRarityColor(badge.rarity)} capitalize mt-0.5`}>{badge.rarity}</p>
                            {isEarned && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                                >
                                    <span className="text-white text-[10px]">✓</span>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
