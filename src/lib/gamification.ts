import confetti from 'canvas-confetti';

// 🎊 Epic confetti burst for 90%+ scores
export function fireConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#00d4aa', '#06b6d4', '#a78bfa', '#f59e0b', '#ec4899', '#10b981'];

    // Fire multiple bursts from different angles
    (function frame() {
        confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors,
        });
        confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors,
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();

    // Big center burst
    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.6 },
            colors,
            startVelocity: 30,
            gravity: 0.8,
            ticks: 200,
        });
    }, 200);
}

// 🏅 Badge definitions
export type BadgeId =
    | 'first_scan'
    | 'score_70'
    | 'score_80'
    | 'score_90'
    | 'score_100'
    | 'optimizer'
    | 'five_scans'
    | 'ten_scans';

export interface Badge {
    id: BadgeId;
    title: string;
    description: string;
    emoji: string;
    gradient: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const BADGES: Record<BadgeId, Badge> = {
    first_scan: {
        id: 'first_scan',
        title: 'First Steps',
        emoji: '🚀',
        description: 'Completed your first resume scan',
        gradient: 'from-blue-500 to-cyan-500',
        rarity: 'common',
    },
    score_70: {
        id: 'score_70',
        title: 'Getting There',
        emoji: '📈',
        description: 'Achieved a 70%+ match score',
        gradient: 'from-green-500 to-emerald-500',
        rarity: 'common',
    },
    score_80: {
        id: 'score_80',
        title: 'Strong Match',
        emoji: '💪',
        description: 'Achieved an 80%+ match score',
        gradient: 'from-teal-500 to-cyan-500',
        rarity: 'uncommon',
    },
    score_90: {
        id: 'score_90',
        title: 'Elite Resume',
        emoji: '🔥',
        description: 'Achieved a 90%+ match score',
        gradient: 'from-amber-500 to-orange-500',
        rarity: 'rare',
    },
    score_100: {
        id: 'score_100',
        title: 'Perfect Score',
        emoji: '👑',
        description: 'Achieved a perfect 100% match score',
        gradient: 'from-yellow-400 to-amber-500',
        rarity: 'legendary',
    },
    optimizer: {
        id: 'optimizer',
        title: 'Optimizer',
        emoji: '✨',
        description: 'Used the AI Resume Optimizer',
        gradient: 'from-violet-500 to-purple-500',
        rarity: 'uncommon',
    },
    five_scans: {
        id: 'five_scans',
        title: 'Dedicated',
        emoji: '🎯',
        description: 'Completed 5 resume scans',
        gradient: 'from-pink-500 to-rose-500',
        rarity: 'rare',
    },
    ten_scans: {
        id: 'ten_scans',
        title: 'Veteran',
        emoji: '🏆',
        description: 'Completed 10 resume scans',
        gradient: 'from-amber-400 to-yellow-500',
        rarity: 'epic',
    },
};

const RARITY_COLORS: Record<string, string> = {
    common: 'text-slate-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-amber-400',
};

export function getRarityColor(rarity: string) {
    return RARITY_COLORS[rarity] || 'text-slate-400';
}

// Local storage helpers for badge tracking
const BADGES_KEY = 'careerzen_badges';
const SCAN_COUNT_KEY = 'careerzen_scan_count';

export function getEarnedBadges(): BadgeId[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(BADGES_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveBadge(badgeId: BadgeId): boolean {
    const earned = getEarnedBadges();
    if (earned.includes(badgeId)) return false; // Already earned
    earned.push(badgeId);
    localStorage.setItem(BADGES_KEY, JSON.stringify(earned));
    return true; // Newly earned
}

export function getScanCount(): number {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(SCAN_COUNT_KEY) || '0', 10);
}

export function incrementScanCount(): number {
    const count = getScanCount() + 1;
    localStorage.setItem(SCAN_COUNT_KEY, count.toString());
    return count;
}

// Check what badges should be awarded based on a score and scan count
export function checkBadges(matchScore: number): BadgeId[] {
    const newBadges: BadgeId[] = [];
    const scanCount = incrementScanCount();

    // First scan
    if (saveBadge('first_scan')) newBadges.push('first_scan');

    // Score milestones
    if (matchScore >= 70 && saveBadge('score_70')) newBadges.push('score_70');
    if (matchScore >= 80 && saveBadge('score_80')) newBadges.push('score_80');
    if (matchScore >= 90 && saveBadge('score_90')) newBadges.push('score_90');
    if (matchScore >= 100 && saveBadge('score_100')) newBadges.push('score_100');

    // Scan count milestones
    if (scanCount >= 5 && saveBadge('five_scans')) newBadges.push('five_scans');
    if (scanCount >= 10 && saveBadge('ten_scans')) newBadges.push('ten_scans');

    return newBadges;
}
