'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, LogIn, UserPlus, BarChart, Sparkles, Briefcase, MessageSquare, GraduationCap } from 'lucide-react';

const ACTION_CONFIG = {
    'LOGIN': { icon: LogIn, color: 'text-emerald-400', bg: 'bg-emerald-900/30 text-emerald-400', label: 'Logged In' },
    'SIGNUP': { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-900/30 text-emerald-400', label: 'Signed Up' },
    'ANALYZE': { icon: BarChart, color: 'text-cyan-400', bg: 'bg-cyan-900/30 text-cyan-400', label: 'Analyzed Resume' },
    'OPTIMIZE': { icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-900/30 text-amber-400', label: 'Optimized Resume' },
    'TRACKER': { icon: Briefcase, color: 'text-violet-400', bg: 'bg-violet-900/30 text-violet-400', label: 'Job Tracker Update' },
    'COACH': { icon: GraduationCap, color: 'text-rose-400', bg: 'bg-rose-900/30 text-rose-400', label: 'Interview Coaching' },
    'CHAT': { icon: MessageSquare, color: 'text-fuchsia-400', bg: 'bg-fuchsia-900/30 text-fuchsia-400', label: 'Expert Chat' },
};

export default function TimelineClient({ serverActivities }: { serverActivities: any[] }) {
    const [filter, setFilter] = useState<string>('ALL');

    const filtered = useMemo(() => {
        if (filter === 'ALL') return serverActivities;
        return serverActivities.filter(a => a.actionType === filter);
    }, [serverActivities, filter]);

    const groupedByDate = useMemo(() => {
        const groups: Record<string, any[]> = {};
        for (const act of filtered) {
            const dateStr = new Date(act.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(act);
        }
        return groups;
    }, [filtered]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                        Activity Timeline
                    </h1>
                    <p className="text-slate-400 mt-2">A comprehensive, step-by-step history of your journey.</p>
                </div>

                <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 backdrop-blur overflow-x-auto custom-scrollbar">
                    {['ALL', 'LOGIN', 'ANALYZE', 'OPTIMIZE', 'TRACKER'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => setFilter(opt)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === opt
                                    ? 'bg-slate-800 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {Object.keys(groupedByDate).length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activity recorded yet for this filter.</p>
                </div>
            ) : (
                <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                    {Object.entries(groupedByDate).map(([date, activities], gIdx) => (
                        <div key={date} className="relative z-10">
                            {/* Date Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: gIdx * 0.1 }}
                                className="flex items-center justify-center mb-8"
                            >
                                <div className="bg-slate-900 border border-slate-800 text-slate-300 text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
                                    {date}
                                </div>
                            </motion.div>

                            {/* Activities for this date */}
                            <div className="space-y-6">
                                {activities.map((act, idx) => {
                                    const config = ACTION_CONFIG[act.actionType as keyof typeof ACTION_CONFIG] || ACTION_CONFIG['LOGIN'];
                                    const Icon = config.icon;
                                    const details = act.details ? JSON.parse(act.details) : null;

                                    return (
                                        <motion.div
                                            key={act.id}
                                            initial={{ opacity: 0, x: -50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: "-50px" }}
                                            transition={{ delay: idx * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group select-none"
                                        >
                                            {/* Center Node */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-950 shadow-inner group-hover:scale-110 transition-transform bg-slate-900 absolute left-0 md:left-1/2 md:-translate-x-1/2">
                                                <Icon className={`h-4 w-4 ${config.color}`} />
                                            </div>

                                            {/* Content Card */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm group-hover:bg-slate-800/80 group-hover:border-slate-700 transition-all shadow-sm">
                                                <div className="flex justify-between items-start mb-2 gap-4">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border border-white/10 ${config.bg}`}>
                                                            {config.label}
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-medium">
                                                            {new Date(act.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-slate-300 text-sm mt-2 font-medium">
                                                    {details?.action === 'CREATED_JOB' && <span>Added <span className="text-violet-300">{details.jobTitle}</span> at <span className="text-violet-300">{details.company}</span></span>}
                                                    {details?.action === 'UPDATED_JOB_STATUS' && <span>Moved <span className="text-violet-300">{details.jobTitle}</span> to <span className="capitalize text-slate-100">{details.status}</span></span>}
                                                    {details?.action === 'SAVED_REPORT' && <span>Saved Report for <span className="text-amber-300">{details.fileName}</span> (Score: {details.score}%)</span>}
                                                    {!details && act.actionType === 'LOGIN' && <span>User successfully authenticated</span>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
