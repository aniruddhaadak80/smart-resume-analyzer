'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Trash2, ExternalLink, MapPin, DollarSign, X, Briefcase, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useToast } from './Toast';
import { getApplications, createApplication, updateApplication, deleteApplication, JobApplicationData } from '@/app/actions/tracker';

// Kanban column definitions
const COLUMNS = [
    { id: 'wishlist', title: '💫 Wishlist', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', text: 'text-violet-300', badge: 'bg-violet-500/20 text-violet-300' },
    { id: 'applied', title: '📨 Applied', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', text: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-300' },
    { id: 'interviewing', title: '🎯 Interviewing', color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300' },
    { id: 'offer', title: '🎉 Offer', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300' },
    { id: 'rejected', title: '❌ Rejected', color: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30', text: 'text-red-300', badge: 'bg-red-500/20 text-red-300' },
];

type JobApp = {
    id: string;
    jobTitle: string;
    company: string;
    location?: string | null;
    jobUrl?: string | null;
    status: string;
    notes?: string | null;
    salary?: string | null;
    color?: string | null;
    position: number;
    createdAt: Date;
    updatedAt: Date;
    appliedDate?: Date | null;
};

export default function TrackerClient() {
    const [applications, setApplications] = useState<JobApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addToColumn, setAddToColumn] = useState('wishlist');
    const [draggedCard, setDraggedCard] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const { isSignedIn } = useUser();
    const { showToast } = useToast();
    const signInBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const loadApplications = async () => {
        setIsLoading(true);
        const result = await getApplications();
        if (result.success) {
            setApplications(result.data as JobApp[]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (isSignedIn && mounted) {
            loadApplications();
        } else if (mounted) {
            setIsLoading(false);
        }
    }, [isSignedIn, mounted]);

    const handleAdd = (columnId: string) => {
        if (!isSignedIn) {
            signInBtnRef.current?.click();
            return;
        }
        setAddToColumn(columnId);
        setShowAddModal(true);
    };

    const handleCreate = async (data: JobApplicationData) => {
        const result = await createApplication({ ...data, status: addToColumn });
        if (result.success) {
            showToast('Application added! 🎉', 'success');
            setShowAddModal(false);
            loadApplications();
        } else {
            showToast(result.error || 'Failed to add application', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        const result = await deleteApplication(id);
        if (result.success) {
            setApplications(prev => prev.filter(a => a.id !== id));
            showToast('Application removed', 'success');
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedCard(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        if (!draggedCard) return;

        // Optimistic update
        setApplications(prev =>
            prev.map(a => a.id === draggedCard ? { ...a, status: newStatus } : a)
        );
        setDraggedCard(null);

        const result = await updateApplication(draggedCard, { status: newStatus });
        if (!result.success) {
            showToast('Failed to move application', 'error');
            loadApplications(); // Revert
        } else {
            showToast(`Moved to ${COLUMNS.find(c => c.id === newStatus)?.title}`, 'success');
        }
    };

    const getColumnApps = (status: string) => applications.filter(a => a.status === status);

    if (!mounted) return <div className="min-h-screen"></div>;

    return (
        <main className="p-4 md:p-8">
            {/* Hidden sign-in trigger */}
            <SignInButton mode="modal" forceRedirectUrl="/tracker">
                <button ref={signInBtnRef} className="hidden" aria-hidden="true" />
            </SignInButton>

            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Link>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl border border-violet-500/30">
                                <Briefcase className="h-8 w-8 text-violet-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                                    Application Tracker
                                </h1>
                                <p className="text-slate-400">Track your job applications from wishlist to offer</p>
                            </div>
                        </div>
                        <div className="text-sm text-slate-500">
                            {applications.length} application{applications.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </motion.div>

                {/* Kanban Board */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {COLUMNS.map((col) => (
                            <motion.div
                                key={col.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-gradient-to-b ${col.color} rounded-xl border ${col.border} p-3 min-h-[400px]`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, col.id)}
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h3 className={`text-sm font-bold ${col.text}`}>{col.title}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badge}`}>
                                        {getColumnApps(col.id).length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="space-y-2">
                                    <AnimatePresence>
                                        {getColumnApps(col.id).map((app) => (
                                            <motion.div
                                                key={app.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, app.id)}
                                                className={`bg-slate-900/80 border border-slate-700/50 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-slate-600 transition-all group ${draggedCard === app.id ? 'opacity-50' : ''}`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <GripVertical className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-slate-200 truncate">{app.jobTitle}</h4>
                                                        <p className="text-xs text-slate-400 truncate">{app.company}</p>
                                                        {app.location && (
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                                <MapPin className="h-3 w-3" /> {app.location}
                                                            </p>
                                                        )}
                                                        {app.salary && (
                                                            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                                                                <DollarSign className="h-3 w-3" /> {app.salary}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {app.jobUrl && (
                                                            <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400">
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                        <button onClick={() => handleDelete(app.id)} className="text-slate-500 hover:text-red-400">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {app.notes && (
                                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 border-t border-slate-800 pt-2">{app.notes}</p>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Add Button */}
                                <button
                                    onClick={() => handleAdd(col.id)}
                                    className="w-full mt-2 py-2 border border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all flex items-center justify-center gap-1 text-xs"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Add
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Application Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddApplicationModal
                        column={addToColumn}
                        onClose={() => setShowAddModal(false)}
                        onSubmit={handleCreate}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}

// Add Application Modal
function AddApplicationModal({ column, onClose, onSubmit }: { column: string; onClose: () => void; onSubmit: (data: JobApplicationData) => void }) {
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');
    const [jobUrl, setJobUrl] = useState('');
    const [salary, setSalary] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const colInfo = COLUMNS.find(c => c.id === column);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobTitle.trim() || !company.trim()) return;
        setIsSubmitting(true);
        await onSubmit({ jobTitle, company, location, jobUrl, salary, notes });
        setIsSubmitting(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Add to {colInfo?.title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Job Title *</label>
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={e => setJobTitle(e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Company *</label>
                        <input
                            type="text"
                            value={company}
                            onChange={e => setCompany(e.target.value)}
                            placeholder="e.g. Google"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                placeholder="e.g. Remote"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Salary</label>
                            <input
                                type="text"
                                value={salary}
                                onChange={e => setSalary(e.target.value)}
                                placeholder="e.g. $150k"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Job URL</label>
                        <input
                            type="url"
                            value={jobUrl}
                            onChange={e => setJobUrl(e.target.value)}
                            placeholder="https://linkedin.com/jobs/..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Any notes about this application..."
                            rows={2}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isSubmitting || !jobTitle.trim() || !company.trim()}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Application'}
                    </Button>
                </form>
            </motion.div>
        </motion.div>
    );
}
