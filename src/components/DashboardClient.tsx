/* eslint-disable */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, FileText, ChevronRight, BarChart, Sparkles, Trash2, Edit2, X, Check, Eye, Briefcase, LayoutGrid } from "lucide-react";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { generateDocx } from '@/lib/docx-generator';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { ResumePDF } from './ResumePDF';
import AdvancedSearch, { SearchFilters } from './AdvancedSearch';
import { useToast } from './Toast';
import { BadgeCollection } from './Badges';

export default function DashboardClient({ serverHistory }: { serverHistory: any[] }) {
    const [history, setHistory] = useState<any[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState<'all' | 'ANALYZE' | 'OPTIMIZE' | 'TRACKER'>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        const combined = serverHistory.map(h => ({ ...h, source: 'cloud' }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setHistory(combined);
        setFilteredHistory(combined);
    }, [serverHistory]);

    // Advanced search handler
    const handleSearch = useCallback((query: string, filters: SearchFilters) => {
        let result = [...history];

        // Text search
        if (query) {
            result = result.filter(item =>
                item.fileName?.toLowerCase().includes(query.toLowerCase()) ||
                item.jobTitle?.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Date filter
        const now = new Date();
        if (filters.dateRange !== 'all') {
            result = result.filter(item => {
                const date = new Date(item.createdAt || item.date);
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);

                switch (filters.dateRange) {
                    case 'today':
                        return date.toDateString() === now.toDateString();
                    case 'yesterday':
                        return date.toDateString() === yesterday.toDateString();
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return date >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return date >= monthAgo;
                    case 'threeMonths':
                        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        return date >= threeMonthsAgo;
                    case 'year':
                        return date.getFullYear() === now.getFullYear();
                    case 'lastYear':
                        return date.getFullYear() === now.getFullYear() - 1;
                    default:
                        return true;
                }
            });
        }

        // Score filter
        if (filters.scoreRange !== 'all') {
            result = result.filter(item => {
                const score = item.matchScore || item.result?.matchPercentage || 0;
                switch (filters.scoreRange) {
                    case 'perfect': return score === 100;
                    case 'high': return score >= 80;
                    case 'medium': return score >= 50 && score < 80;
                    default: return true;
                }
            });
        }

        // Action Type filter
        if (filters.actionType && filters.actionType !== 'all') {
            result = result.filter(item => {
                const type = item.actionType || 'OPTIMIZE';
                return type === filters.actionType;
            });
        }

        // Sort
        result.sort((a, b) => {
            switch (filters.sortBy) {
                case 'score':
                    return (b.matchScore || b.result?.matchPercentage || 0) - (a.matchScore || a.result?.matchPercentage || 0);
                case 'name':
                    return (a.fileName || '').localeCompare(b.fileName || '');
                default: // date
                    return new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime();
            }
        });

        setFilteredHistory(result);
    }, [history]);

    // Apply the active category on top of the search filters
    const finalHistory = filteredHistory.filter(item =>
        activeCategory === 'all' ? true : (item.actionType || 'OPTIMIZE') === activeCategory
    );

    const handleView = (item: any) => {
        if (item.source === 'cloud' && item.id) {
            router.push(`/resume/${item.id}`);
        }
    };

    const handleDownload = async (e: React.MouseEvent, item: any, format: 'PDF' | 'DOCX') => {
        e.stopPropagation();
        if (!item.content) return;

        const data = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
        const fileName = item.fileName || 'Resume';

        try {
            if (format === 'PDF') {
                const blob = await pdf(<ResumePDF data={data} />).toBlob();
                saveAs(blob, `${fileName}.pdf`);
            } else {
                const blob = await generateDocx(data);
                saveAs(blob, `${fileName}.docx`);
            }
            showToast(`Downloaded ${format} successfully!`, 'success');
        } catch (error) {
            showToast('Download failed. Please try again.', 'error');
        }
    };

    // CRUD: Update/Rename
    const handleRename = async (id: string) => {
        if (!editValue.trim()) return;

        const item = history.find(h => h.id === id);
        if (!item) return;

        if (item.source === 'cloud') {
            try {
                const res = await fetch(`/api/resumes/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileName: editValue }),
                });

                if (res.ok) {
                    setHistory(prev => prev.map(h => h.id === id ? { ...h, fileName: editValue } : h));
                    setFilteredHistory(prev => prev.map(h => h.id === id ? { ...h, fileName: editValue } : h));
                    setEditingId(null);
                    showToast('Resume renamed successfully!', 'success');
                }
            } catch (error) {
                showToast('Failed to rename.', 'error');
            }
        }
    };

    // CRUD: Delete
    const handleDelete = async (id: string) => {
        const item = history.find(h => h.id === id);
        if (!item) return;

        if (item.source === 'cloud') {
            try {
                const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });

                if (res.ok) {
                    setHistory(prev => prev.filter(h => h.id !== id));
                    setFilteredHistory(prev => prev.filter(h => h.id !== id));
                    setDeletingId(null);
                    showToast('Resume deleted successfully!', 'success');
                }
            } catch (error) {
                showToast('Failed to delete.', 'error');
            }
        }
    };

    return (
        <main className="p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2">
                                <ArrowLeft className="h-4 w-4" /> Back to Analyzer
                            </Link>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold font-display">History</h1>
                                <Badge variant="secondary" className="bg-slate-800 text-slate-300 pointer-events-none">
                                    {finalHistory.length} Items
                                </Badge>
                            </div>
                            <p className="text-slate-500 text-sm mt-1">{history.length} activities saved</p>
                        </div>
                        <Link href="/timeline" className="mt-4 md:mt-0 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-fuchsia-500/25">
                            <Sparkles className="h-4 w-4" />
                            View Advanced Timeline
                        </Link>
                    </div>

                    {/* Quick Nav */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setActiveCategory('ANALYZE')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group
                                ${activeCategory === 'ANALYZE'
                                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                    : 'bg-teal-500/5 border border-teal-500/10 text-teal-400/70 hover:bg-teal-500/10 hover:text-teal-300'}`}
                        >
                            <LayoutGrid className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            Analyzer
                        </button>

                        <button
                            onClick={() => setActiveCategory('OPTIMIZE')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group
                                ${activeCategory === 'OPTIMIZE'
                                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                    : 'bg-amber-500/5 border border-amber-500/10 text-amber-400/70 hover:bg-amber-500/10 hover:text-amber-300'}`}
                        >
                            <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            Optimize Resume
                        </button>

                        <button
                            onClick={() => setActiveCategory('TRACKER')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group
                                ${activeCategory === 'TRACKER'
                                    ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                                    : 'bg-violet-500/5 border border-violet-500/10 text-violet-400/70 hover:bg-violet-500/10 hover:text-violet-300'}`}
                        >
                            <Briefcase className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            Application Tracker
                        </button>

                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm
                                ${activeCategory === 'all'
                                    ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                    : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <Calendar className="h-4 w-4" />
                            History
                        </button>
                    </div>

                    {/* Badges */}
                    <BadgeCollection />

                    {/* Advanced Search */}
                    <AdvancedSearch onSearch={handleSearch} history={history} />
                </div>

                {/* List */}
                <div className="grid gap-4">
                    {finalHistory.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <BarChart className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-slate-300">No Records Found</h3>
                            <p className="text-slate-500 mt-2">No activities match your selected filters.</p>
                            {activeCategory === 'all' && (
                                <Button asChild className="mt-6 bg-teal-600 hover:bg-teal-500">
                                    <Link href="/">Try Analyzer</Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        finalHistory.map((item, i) => (
                            <motion.div
                                key={item.id || i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                layout
                            >
                                <Card className="glass-card hover:bg-slate-800/50 transition-all group border-slate-800 relative overflow-hidden">
                                    <CardContent className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={() => handleView(item)}>
                                            <div className={`p-3 rounded-full flex-shrink-0 
                                                ${item.actionType === 'TRACKER' ? 'bg-violet-500/10 text-violet-400' :
                                                    item.actionType === 'ANALYZE' ? 'bg-cyan-500/10 text-cyan-400' :
                                                        (item.matchScore === 100 ? 'bg-amber-500/10 text-amber-400' : 'bg-teal-500/10 text-teal-400')}`}
                                            >
                                                {item.actionType === 'TRACKER' ? <Briefcase className="h-6 w-6" /> :
                                                    item.actionType === 'ANALYZE' ? <BarChart className="h-6 w-6" /> :
                                                        (item.matchScore === 100 ? <Sparkles className="h-6 w-6" /> : <FileText className="h-6 w-6" />)}
                                            </div>
                                            <div className="min-w-0 cursor-pointer">
                                                {editingId === item.id ? (
                                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                        <input
                                                            type="text"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm w-48"
                                                            autoFocus
                                                            onKeyDown={(e) => e.key === 'Enter' && handleRename(item.id)}
                                                        />
                                                        <button onClick={() => handleRename(item.id)} className="p-1 hover:bg-emerald-900/50 rounded">
                                                            <Check className="h-4 w-4 text-emerald-400" />
                                                        </button>
                                                        <button onClick={() => setEditingId(null)} className="p-1 hover:bg-slate-700 rounded">
                                                            <X className="h-4 w-4 text-slate-400" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-lg text-slate-200 group-hover:text-teal-300 transition-colors truncate">
                                                                {item.fileName}
                                                            </h3>
                                                            {item.actionType === 'TRACKER' && <span className="text-[10px] bg-violet-950/40 text-violet-400 px-2 py-0.5 rounded border border-violet-900/50 flex-shrink-0">JOB STATUS: {item.jobTitle}</span>}
                                                            {item.actionType === 'ANALYZE' && <span className="text-[10px] bg-cyan-950/40 text-cyan-500 px-2 py-0.5 rounded border border-cyan-900/50 flex-shrink-0">ANALYSIS</span>}
                                                            {(!item.actionType || item.actionType === 'OPTIMIZE') && item.content && <span className="text-[10px] bg-amber-950/40 text-amber-500 px-2 py-0.5 rounded border border-amber-900/50 flex-shrink-0">OPTIMIZED</span>}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-500 text-sm mt-1">
                                                            <span className="flex items-center gap-1 cursor-pointer" title="Time in IST">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(item.createdAt || item.date).toLocaleString('en-IN', {
                                                                    timeZone: 'Asia/Kolkata',
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    hour12: true
                                                                })}
                                                            </span>
                                                            {item.actionType !== 'TRACKER' && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>Score: <span className={item.matchScore >= 90 || item.result?.matchPercentage >= 70 ? "text-teal-400 font-bold" : "text-yellow-400 font-bold"}>{item.matchScore || item.result?.matchPercentage}%</span></span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
                                            {/* View Button */}
                                            {item.source === 'cloud' && item.id && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className={`h-8 text-xs ${item.actionType === 'TRACKER' ? 'border-violet-700 text-violet-400 hover:bg-violet-900/50' : 'border-teal-700 text-teal-400 hover:bg-teal-900/50'}`}
                                                    onClick={() => handleView(item)}
                                                >
                                                    <Eye className="h-3 w-3 mr-1" /> View
                                                </Button>
                                            )}

                                            {item.content && item.actionType !== 'TRACKER' && (
                                                <>
                                                    <Button size="sm" variant="outline" className="h-8 text-xs border-slate-700 hover:bg-slate-800" onClick={(e) => handleDownload(e, item, 'PDF')}>
                                                        PDF
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="h-8 text-xs border-slate-700 hover:bg-slate-800" onClick={(e) => handleDownload(e, item, 'DOCX')}>
                                                        Word
                                                    </Button>
                                                </>
                                            )}

                                            {/* Edit Button - for both Cloud and Local */}
                                            {item.actionType !== 'TRACKER' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingId(item.id);
                                                        setEditValue(item.fileName);
                                                    }}
                                                    className="p-2 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                                                    title="Rename"
                                                >
                                                    <Edit2 className="h-4 w-4 text-slate-400" />
                                                </button>
                                            )}

                                            {/* Delete Button - for both Cloud and Local */}
                                            {/* Delete Button - for both Cloud and Local */}
                                            {item.actionType !== 'TRACKER' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeletingId(item.id);
                                                    }}
                                                    className="p-2 hover:bg-red-900/50 rounded transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-400" />
                                                </button>
                                            )}

                                            {item.source === 'local' && (
                                                <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                                            )}
                                        </div>
                                    </CardContent>

                                    {/* Delete Confirmation Overlay */}
                                    <AnimatePresence>
                                        {deletingId === item.id && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-red-950/90 backdrop-blur-sm flex items-center justify-center gap-4 z-10"
                                            >
                                                <p className="text-red-300 font-medium">Delete this resume?</p>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="bg-red-600 hover:bg-red-500 text-white"
                                                >
                                                    Yes, Delete
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setDeletingId(null)}
                                                    className="border-red-700 text-red-300 hover:bg-red-900/50"
                                                >
                                                    Cancel
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
