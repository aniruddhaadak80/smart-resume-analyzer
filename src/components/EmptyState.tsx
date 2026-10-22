'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export type EmptyStateVariant = 'tracker' | 'timeline' | 'analyses' | 'resumes';

interface EmptyStateProps {
    /** Which illustration to render. All illustrations share the same line-art style. */
    variant: EmptyStateVariant;
    title: string;
    description: string;
    actionLabel: string;
    /** Link target for the call to action. Ignored when `onAction` is provided. */
    actionHref?: string;
    /** Click handler for the call to action. Takes precedence over `actionHref`. */
    onAction?: () => void;
    secondaryLabel?: string;
    secondaryHref?: string;
}

/**
 * Shared illustration frame.
 *
 * Every illustration is drawn with the same visual language: a soft accent
 * blob in the background, 2px rounded strokes and the same teal → violet
 * accent gradient, so the empty states look like a set.
 */
function Illustration({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <svg
            viewBox="0 0 200 140"
            role="img"
            aria-hidden="true"
            className="h-36 w-52 max-w-full"
        >
            <defs>
                <linearGradient id={`${id}-accent`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="55%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
                <linearGradient id={`${id}-blob`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.04" />
                </linearGradient>
            </defs>

            {/* Soft background blob */}
            <path
                d="M100 18c34 0 62 20 62 48 0 30-30 56-66 56-38 0-68-24-68-54 0-28 32-50 72-50z"
                fill={`url(#${id}-blob)`}
            />

            <g
                fill="none"
                stroke={`url(#${id}-accent)`}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {children}
            </g>
        </svg>
    );
}

const ILLUSTRATIONS: Record<EmptyStateVariant, React.ReactNode> = {
    tracker: (
        <Illustration id="empty-tracker">
            {/* Three kanban columns */}
            <rect x="30" y="34" width="38" height="74" rx="8" />
            <rect x="80" y="34" width="38" height="74" rx="8" />
            <rect x="130" y="34" width="38" height="74" rx="8" />
            {/* Cards in the first column */}
            <rect x="38" y="48" width="22" height="8" rx="4" fill="rgba(45,212,191,0.28)" />
            <rect x="38" y="62" width="22" height="8" rx="4" fill="rgba(45,212,191,0.18)" />
            {/* Single card in the second column */}
            <rect x="88" y="48" width="22" height="8" rx="4" fill="rgba(167,139,250,0.22)" />
            {/* Plus badge */}
            <circle cx="149" cy="52" r="11" fill="rgba(34,211,238,0.18)" />
            <path d="M149 47v10M144 52h10" />
        </Illustration>
    ),
    timeline: (
        <Illustration id="empty-timeline">
            {/* Vertical rail */}
            <path d="M56 26v90" strokeDasharray="4 7" />
            {/* Events */}
            <circle cx="56" cy="42" r="7" fill="rgba(45,212,191,0.28)" />
            <rect x="78" y="34" width="62" height="16" rx="8" />
            <circle cx="56" cy="72" r="7" fill="rgba(34,211,238,0.24)" />
            <rect x="78" y="64" width="46" height="16" rx="8" />
            <circle cx="56" cy="102" r="7" fill="rgba(167,139,250,0.24)" />
            <rect x="78" y="94" width="54" height="16" rx="8" />
        </Illustration>
    ),
    analyses: (
        <Illustration id="empty-analyses">
            {/* Report sheet */}
            <rect x="52" y="26" width="72" height="90" rx="8" />
            <path d="M66 46h30M66 60h44M66 74h34" />
            {/* Magnifying glass */}
            <circle cx="122" cy="92" r="18" fill="rgba(45,212,191,0.12)" />
            <path d="M135 105l13 13" />
            {/* Chart bar inside the lens */}
            <path d="M114 98v-9M122 98v-15M130 98v-6" />
        </Illustration>
    ),
    resumes: (
        <Illustration id="empty-resumes">
            {/* Document with a folded corner */}
            <path d="M60 24h48l24 24v66a8 8 0 01-8 8H60a8 8 0 01-8-8V32a8 8 0 018-8z" />
            <path d="M108 24v24h24" />
            <path d="M68 66h56M68 80h40M68 94h48" />
            {/* Sparkle */}
            <path
                d="M140 44l4 11 11 4-11 4-4 11-4-11-11-4 11-4z"
                fill="rgba(167,139,250,0.22)"
            />
        </Illustration>
    ),
};

export default function EmptyState({
    variant,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    secondaryLabel,
    secondaryHref,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-14 text-center"
        >
            <div className="mb-6">{ILLUSTRATIONS[variant]}</div>

            <h3 className="text-xl font-semibold text-slate-200">{title}</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {onAction ? (
                    <Button
                        onClick={onAction}
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 font-semibold text-white hover:from-teal-500 hover:to-cyan-500"
                    >
                        {actionLabel}
                    </Button>
                ) : (
                    actionHref && (
                        <Button
                            asChild
                            className="bg-gradient-to-r from-teal-600 to-cyan-600 font-semibold text-white hover:from-teal-500 hover:to-cyan-500"
                        >
                            <Link href={actionHref}>{actionLabel}</Link>
                        </Button>
                    )
                )}

                {secondaryLabel && secondaryHref && (
                    <Button
                        asChild
                        variant="outline"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        <Link href={secondaryHref}>{secondaryLabel}</Link>
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
