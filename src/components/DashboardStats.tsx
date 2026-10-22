'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Sparkles, Briefcase, GraduationCap, Flame } from 'lucide-react';

export type DashboardStatsData = {
    analyzed: number;
    optimized: number;
    jobsTracked: number;
    interviews: number;
    streak: number;
};

/**
 * Counts from 0 up to `target` over `duration` milliseconds.
 * Uses an ease-out curve so the number decelerates into place.
 */
function useCountUp(target: number, duration = 1000) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (target <= 0) return;

        let frame = 0;
        const startedAt = performance.now();

        const tick = (now: number) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(target * eased));

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return target <= 0 ? 0 : value;
}

const CARDS: Array<{
    key: keyof DashboardStatsData;
    label: string;
    icon: typeof BarChart;
    iconClass: string;
    iconBg: string;
}> = [
    {
        key: 'analyzed',
        label: 'Analyzed',
        icon: BarChart,
        iconClass: 'text-cyan-400',
        iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
        key: 'optimized',
        label: 'Optimized',
        icon: Sparkles,
        iconClass: 'text-amber-400',
        iconBg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
        key: 'jobsTracked',
        label: 'Jobs Tracked',
        icon: Briefcase,
        iconClass: 'text-violet-400',
        iconBg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
        key: 'interviews',
        label: 'Interviews',
        icon: GraduationCap,
        iconClass: 'text-rose-400',
        iconBg: 'bg-rose-500/10 border-rose-500/20',
    },
    {
        key: 'streak',
        label: 'Day Streak',
        icon: Flame,
        iconClass: 'text-emerald-400',
        iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    },
];

function StatCard({
    label,
    icon: Icon,
    iconClass,
    iconBg,
    value,
    index,
}: {
    label: string;
    icon: typeof BarChart;
    iconClass: string;
    iconBg: string;
    value: number;
    index: number;
}) {
    const displayValue = useCountUp(value);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="glass-card flex items-center gap-4 rounded-2xl border border-slate-800 p-4 transition-colors hover:border-slate-700"
        >
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconClass}`} />
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold tabular-nums text-slate-100">{displayValue}</p>
                <p className="truncate text-xs font-medium text-slate-400">{label}</p>
            </div>
        </motion.div>
    );
}

export default function DashboardStats({ stats }: { stats: DashboardStatsData }) {
    return (
        <section aria-label="Your activity at a glance">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Your activity at a glance
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {CARDS.map((card, index) => (
                    <StatCard
                        key={card.key}
                        label={card.label}
                        icon={card.icon}
                        iconClass={card.iconClass}
                        iconBg={card.iconBg}
                        value={stats[card.key] ?? 0}
                        index={index}
                    />
                ))}
            </div>
        </section>
    );
}
