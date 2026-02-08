'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText, ChevronRight, BarChart, Sparkles, Trash2, Edit2, X, Check, Eye } from "lucide-react";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { generateDocx } from '@/lib/docx-generator';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { ResumePDF } from './ResumePDF';
import AdvancedSearch, { SearchFilters } from './AdvancedSearch';
import { useToast } from './Toast';

export default function DashboardClient({ serverHistory }: { serverHistory: any[] }) {
    const [history, setHistory] = useState<any[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        // Merge server history with local history (for guest/local items)
        const localHistory = JSON.parse(localStorage.getItem('careerzen_history') || '[]');

        // Combine them (tagging source)
        // For local items, we use the timestamp as a temporary ID for UI tracking
        const combined = [
            ...serverHistory.map(h => ({ ...h, source: 'cloud' })),
            ...localHistory.map((h: any) => ({
                ...h,
                source: 'local',
                id: h.id || `local-${new Date(h.date || h.createdAt).getTime()}`
            }))
        ].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

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

    const handleView = (item: any) => {
        if (item.source === 'cloud' && item.id) {
            router.push(`/resume/${item.id}`);
        } else if (item.source === 'local') {
            localStorage.setItem('careerzen_result', JSON.stringify(item.result));
            router.push('/');
        }
    };

    const handleDownload = async (e: React.MouseEvent, item: any, format: 'PDF' | 'DOCX') => {
        e.stopPropagation();
        if (!item.content) return;

        const data = JSON.parse(item.content);
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
        } else {
            // Handle local rename
            const localHistory = JSON.parse(localStorage.getItem('careerzen_history') || '[]');
            const index = localHistory.findIndex((h: any) =>
                (h.id === id) || (h.date === item.date && h.fileName === item.fileName)
            );

            if (index !== -1) {
                localHistory[index].fileName = editValue;
                localStorage.setItem('careerzen_history', JSON.stringify(localHistory));

                setHistory(prev => prev.map(h => h.id === id ? { ...h, fileName: editValue } : h));
                setFilteredHistory(prev => prev.map(h => h.id === id ? { ...h, fileName: editValue } : h));
                setEditingId(null);
                showToast('Local resume renamed!', 'success');
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
        } else {
            // Handle local delete
            const localHistory = JSON.parse(localStorage.getItem('careerzen_history') || '[]');
            const updated = localHistory.filter((h: any) =>
                !((h.id === id) || (h.date === item.date && h.fileName === item.fileName))
            );

            localStorage.setItem('careerzen_history', JSON.stringify(updated));
            setHistory(prev => prev.filter(h => h.id !== id));
            setFilteredHistory(prev => prev.filter(h => h.id !== id));
            setDeletingId(null);
            showToast('Local resume deleted!', 'success');
        }
    };

    return (
        <main className="p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2">
                                <ArrowLeft className="h-4 w-4" /> Back to Analyzer
                            </Link>
                            <h1 className="text-3xl font-bold font-display">Your Library</h1>
                            <p className="text-slate-500 text-sm mt-1">{history.length} resumes saved</p>
                        </div>
                    </div>

                    {/* Advanced Search */}
                    <AdvancedSearch onSearch={handleSearch} history={history} />
                </div>

                {/* List */}
                <div className="grid gap-4">
                    {filteredHistory.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <BarChart className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-slate-300">No Resumes Found</h3>
                            <p className="text-slate-500 mt-2">Upload a resume or save an optimized one to see it here.</p>
                            <Button asChild className="mt-6 bg-teal-600 hover:bg-teal-500">
                                <Link href="/">Upload Resume</Link>
                            </Button>
                        </div>
                    ) : (
                        filteredHistory.map((item, i) => (
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
                                            <div className={`p-3 rounded-full flex-shrink-0 ${item.matchScore === 100 ? 'bg-amber-500/10 text-amber-400' : 'bg-teal-500/10 text-teal-400'}`}>
                                                {item.matchScore === 100 ? <Sparkles className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
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
                                                            {item.content && <span className="text-[10px] bg-amber-950/40 text-amber-500 px-2 py-0.5 rounded border border-amber-900/50 flex-shrink-0">OPTIMIZED</span>}
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
                                                            <span>•</span>
                                                            <span>Score: <span className={item.matchScore >= 90 || item.result?.matchPercentage >= 70 ? "text-teal-400 font-bold" : "text-yellow-400 font-bold"}>{item.matchScore || item.result?.matchPercentage}%</span></span>
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
                                                    className="h-8 text-xs border-teal-700 text-teal-400 hover:bg-teal-900/50"
                                                    onClick={() => router.push(`/resume/${item.id}`)}
                                                >
                                                    <Eye className="h-3 w-3 mr-1" /> View
                                                </Button>
                                            )}

                                            {item.content && (
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

                                            {/* Delete Button - for both Cloud and Local */}
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
