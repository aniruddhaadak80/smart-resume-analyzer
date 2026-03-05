'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Search, X } from 'lucide-react';
import { Input } from './ui/input';

interface KeywordHeatmapProps {
    resumeText: string;
    jobDescription: string;
    missingKeywords: string[];
    foundKeywords: string[];
}

export default function KeywordHeatmap({
    resumeText,
    jobDescription,
    missingKeywords = [],
    foundKeywords = [],
}: KeywordHeatmapProps) {
    const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [isJDExpanded, setIsJDExpanded] = useState(false);
    const [isResumeExpanded, setIsResumeExpanded] = useState(false);

    // Filter keywords based on search
    const filteredFound = foundKeywords.filter(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredMissing = missingKeywords.filter(k => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const totalKeywords = missingKeywords.length + foundKeywords.length;
    const matchPercentage = totalKeywords > 0 ? Math.round((foundKeywords.length / totalKeywords) * 100) : 0;

    // Helper to highlight keywords in text
    const highlightText = (text: string, highlightMissing: boolean = false) => {
        if (!text) return null;

        // Escape regex special characters
        const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        let highlightedText = text;
        const allKeywords = [...foundKeywords, ...(highlightMissing ? missingKeywords : [])];

        // Sort by length descending to match longest phrases first
        allKeywords.sort((a, b) => b.length - a.length);

        if (allKeywords.length === 0) return <p className="whitespace-pre-wrap">{text}</p>;

        const tokens: { type: 'text' | 'found' | 'missing'; content: string; keyword?: string }[] = [{ type: 'text', content: text }];

        allKeywords.forEach(keyword => {
            if (!keyword.trim()) return;
            const isMissing = missingKeywords.includes(keyword);
            if (!highlightMissing && isMissing) return;

            const regex = new RegExp(`\\b(${escapeRegExp(keyword)})\\b`, 'gi');

            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i].type !== 'text') continue;

                const parts = tokens[i].content.split(regex);
                if (parts.length > 1) {
                    const newTokens: typeof tokens = [];
                    parts.forEach((part, index) => {
                        if (index % 2 === 1) {
                            newTokens.push({ type: isMissing ? 'missing' : 'found', content: part, keyword });
                        } else if (part) {
                            newTokens.push({ type: 'text', content: part });
                        }
                    });
                    tokens.splice(i, 1, ...newTokens);
                    i += newTokens.length - 1; // Adjust index after splice
                }
            }
        });

        return (
            <p className="whitespace-pre-wrap leading-relaxed">
                {tokens.map((token, i) => {
                    if (token.type === 'text') return <span key={i}>{token.content}</span>;

                    const isActive = activeKeyword === token.keyword;
                    const baseClass = "px-1 rounded-sm mx-0.5 font-medium transition-colors cursor-pointer border-b-2";

                    if (token.type === 'missing') {
                        return (
                            <span
                                key={i}
                                onClick={() => setActiveKeyword(isActive ? null : token.keyword || null)}
                                className={`${baseClass} ${isActive ? 'bg-red-500/40 border-red-400 text-red-50' : 'bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/30'}`}
                            >
                                {token.content}
                            </span>
                        );
                    } else {
                        return (
                            <span
                                key={i}
                                onClick={() => setActiveKeyword(isActive ? null : token.keyword || null)}
                                className={`${baseClass} ${isActive ? 'bg-emerald-500/40 border-emerald-400 text-emerald-50' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/30'}`}
                            >
                                {token.content}
                            </span>
                        );
                    }
                })}
            </p>
        );
    };

    return (
        <Card className="glass-card border-slate-800 lg:col-span-2 overflow-hidden">
            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-display flex items-center gap-2">
                            ATS Keyword Heatmap
                        </CardTitle>
                        <p className="text-slate-400 text-sm mt-1">Visualize how well your resume matches the job description</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500/50 border border-emerald-500" />
                            <span className="text-emerald-300">Found ({foundKeywords.length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500" />
                            <span className="text-red-300">Missing ({missingKeywords.length})</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300 font-medium">Keyword Coverage</span>
                        <span className="text-slate-300 font-bold">{matchPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${matchPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/30">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search keywords..."
                            className="pl-9 bg-slate-950/50 border-slate-800 focus-visible:ring-teal-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 relative">
                    {/* Floating Active Keyword Tooltip */}
                    <AnimatePresence>
                        {activeKeyword && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute left-1/2 -translate-x-1/2 top-4 z-10 bg-slate-800 border-2 border-slate-600 shadow-2xl rounded-xl p-3 flex items-center gap-3"
                            >
                                <span className="text-slate-200 font-medium whitespace-nowrap">Selected: <span className="text-white font-bold">{activeKeyword}</span></span>
                                <Badge variant="outline" className={missingKeywords.includes(activeKeyword) ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}>
                                    {missingKeywords.includes(activeKeyword) ? "Missing" : "Found"}
                                </Badge>
                                <button onClick={() => setActiveKeyword(null)} className="p-1 hover:bg-slate-700 rounded-md">
                                    <X className="h-4 w-4 text-slate-400" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Job Description Panel */}
                    <div className="p-6 bg-slate-900/20">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center justify-between">
                            Job Description
                        </h3>

                        {/* Keyword Chips */}
                        <div className="flex flex-wrap gap-1.5 mb-6">
                            {filteredFound.map((kw, i) => (
                                <Badge
                                    key={`f-${i}`}
                                    variant="outline"
                                    onClick={() => setActiveKeyword(activeKeyword === kw ? null : kw)}
                                    className={`cursor-pointer transition-colors ${activeKeyword === kw ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'}`}
                                >
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {kw}
                                </Badge>
                            ))}
                            {filteredMissing.map((kw, i) => (
                                <Badge
                                    key={`m-${i}`}
                                    variant="outline"
                                    onClick={() => setActiveKeyword(activeKeyword === kw ? null : kw)}
                                    className={`cursor-pointer transition-colors ${activeKeyword === kw ? 'bg-red-500 text-white border-red-500' : 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'}`}
                                >
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    {kw}
                                </Badge>
                            ))}
                            {(filteredFound.length === 0 && filteredMissing.length === 0) && (
                                <span className="text-sm text-slate-500">No matching keywords found</span>
                            )}
                        </div>

                        <div className={`p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 text-slate-300 text-sm overflow-hidden relative transition-all duration-300 ${!isJDExpanded ? 'max-h-[300px]' : ''}`}>
                            {highlightText(jobDescription, true)}

                            {!isJDExpanded && (
                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950/90 to-transparent flex items-end justify-center pb-2">
                                    <button
                                        onClick={() => setIsJDExpanded(true)}
                                        className="text-teal-400 text-xs font-semibold hover:text-teal-300 underline underline-offset-2"
                                    >
                                        Show full description
                                    </button>
                                </div>
                            )}
                            {isJDExpanded && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => setIsJDExpanded(false)}
                                        className="text-slate-500 text-xs font-semibold hover:text-slate-300 underline underline-offset-2"
                                    >
                                        Show less
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resume Panel */}
                    <div className="p-6 bg-slate-900/40">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">
                            Your Selected Resume
                        </h3>
                        <div className={`p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-sm overflow-hidden relative transition-all duration-300 ${!isResumeExpanded ? 'max-h-[500px]' : ''}`}>
                            {highlightText(resumeText, false)}

                            {!isResumeExpanded && (
                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent flex items-end justify-center pb-2">
                                    <button
                                        onClick={() => setIsResumeExpanded(true)}
                                        className="text-teal-400 text-xs font-semibold hover:text-teal-300 underline underline-offset-2"
                                    >
                                        Show full resume
                                    </button>
                                </div>
                            )}
                            {isResumeExpanded && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => setIsResumeExpanded(false)}
                                        className="text-slate-500 text-xs font-semibold hover:text-slate-300 underline underline-offset-2"
                                    >
                                        Show less
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
