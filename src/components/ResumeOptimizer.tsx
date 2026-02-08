'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle2, Download, Save, FileText, FileType2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { optimizeResume } from "@/app/actions/optimize";
import { saveResume } from "@/app/actions/resume";
import { useUser } from "@clerk/nextjs";
import { generateDocx } from '@/lib/docx-generator';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { ResumePDF } from './ResumePDF';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'framer-motion';

// Skill color palette - unique gradients for each skill
const skillColors = [
    { bg: 'from-rose-900/50 to-pink-900/50', text: 'text-rose-300', border: 'border-rose-500/30', hover: 'hover:border-rose-400/50 hover:bg-rose-800/40' },
    { bg: 'from-amber-900/50 to-orange-900/50', text: 'text-amber-300', border: 'border-amber-500/30', hover: 'hover:border-amber-400/50 hover:bg-amber-800/40' },
    { bg: 'from-emerald-900/50 to-teal-900/50', text: 'text-emerald-300', border: 'border-emerald-500/30', hover: 'hover:border-emerald-400/50 hover:bg-emerald-800/40' },
    { bg: 'from-cyan-900/50 to-blue-900/50', text: 'text-cyan-300', border: 'border-cyan-500/30', hover: 'hover:border-cyan-400/50 hover:bg-cyan-800/40' },
    { bg: 'from-violet-900/50 to-purple-900/50', text: 'text-violet-300', border: 'border-violet-500/30', hover: 'hover:border-violet-400/50 hover:bg-violet-800/40' },
    { bg: 'from-fuchsia-900/50 to-pink-900/50', text: 'text-fuchsia-300', border: 'border-fuchsia-500/30', hover: 'hover:border-fuchsia-400/50 hover:bg-fuchsia-800/40' },
    { bg: 'from-sky-900/50 to-indigo-900/50', text: 'text-sky-300', border: 'border-sky-500/30', hover: 'hover:border-sky-400/50 hover:bg-sky-800/40' },
    { bg: 'from-lime-900/50 to-green-900/50', text: 'text-lime-300', border: 'border-lime-500/30', hover: 'hover:border-lime-400/50 hover:bg-lime-800/40' },
    { bg: 'from-yellow-900/50 to-amber-900/50', text: 'text-yellow-300', border: 'border-yellow-500/30', hover: 'hover:border-yellow-400/50 hover:bg-yellow-800/40' },
    { bg: 'from-red-900/50 to-rose-900/50', text: 'text-red-300', border: 'border-red-500/30', hover: 'hover:border-red-400/50 hover:bg-red-800/40' },
];

// Function to highlight keywords in summary
const highlightSummary = (text: string) => {
    if (!text) return null;

    // Patterns to highlight
    // Patterns to highlight
    const patterns = [
        { regex: /(?:\d+%|\d+\+|\$[\d,]+|\d+ years?|\d+x)/gi, class: 'text-emerald-400 font-bold' }, // Metrics
        { regex: /(?:React|Node\.js|Python|JavaScript|TypeScript|AWS|Docker|MongoDB|PostgreSQL|Next\.js|Express\.js|Java|C\+\+|Tailwind|REST|API|GraphQL|Kubernetes|CI\/CD|Git|Agile|Scrum)/gi, class: 'text-cyan-400 font-semibold' }, // Tech
        { regex: /(?:Full Stack|Front-end|Backend|Senior|Lead|Manager|Engineer|Developer|Architect|Expert|Proven|Award-winning|Certified)/gi, class: 'text-amber-400 font-semibold' }, // Titles/achievements
    ];

    let result = text;
    let parts: { text: string; className?: string }[] = [{ text: result }];

    patterns.forEach(pattern => {
        const newParts: { text: string; className?: string }[] = [];
        parts.forEach(part => {
            if (part.className) {
                newParts.push(part);
                return;
            }
            const segments = part.text.split(pattern.regex);
            const matches = part.text.match(pattern.regex) || [];
            let matchIndex = 0;
            segments.forEach((segment, i) => {
                if (segment) newParts.push({ text: segment });
                if (i < segments.length - 1 && matches[matchIndex]) {
                    newParts.push({ text: matches[matchIndex], className: pattern.class });
                    matchIndex++;
                }
            });
        });
        parts = newParts;
    });

    return parts.map((part, i) =>
        part.className ? <span key={i} className={part.className}>{part.text}</span> : part.text
    );
};

export default function ResumeOptimizer({ resumeText, jobDescription, originalFileName }: { resumeText: string, jobDescription: string, originalFileName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedData, setOptimizedData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState<'PDF' | 'DOCX' | null>(null);
    const { user } = useUser();
    const { showToast } = useToast();

    // Function to open full-page optimizer
    const openFullPageOptimizer = () => {
        window.location.href = '/optimize';
    };

    const handleOptimize = async () => {
        setIsOptimizing(true);
        try {
            const result = await optimizeResume(resumeText, jobDescription);
            if (result.success) {
                setOptimizedData(result.data);
                showToast('Resume optimized successfully! 🎉', 'success', 5000);
            } else {
                showToast('Optimization failed. Please try again.', 'error', 5000);
            }
        } catch (error) {
            console.error(error);
            showToast('Something went wrong. Please try again.', 'error', 5000);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleDownload = async (format: 'PDF' | 'DOCX') => {
        if (!optimizedData) return;
        setIsDownloading(format);

        const fileName = `Optimized_${originalFileName.replace(/\.[^/.]+$/, "")}`;

        try {
            if (format === 'PDF') {
                const blob = await pdf(<ResumePDF data={optimizedData} />).toBlob();
                saveAs(blob, `${fileName}.pdf`);
                showToast('📄 PDF downloaded successfully!', 'success', 4000);
            } else {
                const blob = await generateDocx(optimizedData);
                saveAs(blob, `${fileName}.docx`);
                showToast('📝 Word document downloaded successfully!', 'success', 4000);
            }
        } catch (error) {
            console.error(error);
            showToast('Download failed. Please try again.', 'error', 5000);
        } finally {
            setIsDownloading(null);
        }
    };

    const handleSave = async (format: 'PDF' | 'DOCX') => {
        if (!user || !optimizedData) return;
        setIsSaving(true);
        try {
            await saveResume({
                userId: user.id,
                fileName: `Optimized_${originalFileName}`,
                jobTitle: optimizedData.experience[0]?.role || "Unknown Role",
                matchScore: 100,
                fileType: format,
                content: optimizedData
            });
            showToast('✨ Saved to Dashboard! Your optimized resume is safe in the cloud.', 'success', 6000);
            setIsOpen(false);
        } catch (e) {
            showToast('Failed to save. Please try again.', 'error', 5000);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {/* Premium Animated Button */}
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(245,158,11,0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden cursor-pointer px-6 py-3 rounded-xl font-bold text-white shadow-xl 
                               bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 
                               border-2 border-amber-400/30 group"
                >
                    {/* Animated background shimmer */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Sparkle particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-white rounded-full"
                                animate={{
                                    y: [40, -10],
                                    x: [20 + i * 30, 30 + i * 25],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                }}
                            />
                        ))}
                    </div>

                    <span className="relative flex items-center gap-2">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        <span className="text-sm sm:text-base">AI Optimize (100% Match)</span>
                    </span>
                </motion.button>
            </DialogTrigger>

            <DialogContent
                suppressHydrationWarning
                className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-amber-500/30 text-slate-100 shadow-2xl"
                style={{ backgroundColor: '#0f172a' }}
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl sm:text-3xl font-display flex items-center gap-3">
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Sparkles className="text-amber-400 h-8 w-8" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                            AI Resume Optimizer
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {!optimizedData ? (
                        <motion.div
                            key="optimize-prompt"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center py-12 space-y-8 text-center"
                        >
                            <motion.div
                                className="relative"
                                animate={{ scale: isOptimizing ? [1, 1.1, 1] : 1 }}
                                transition={{ duration: 1, repeat: isOptimizing ? Infinity : 0 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 blur-2xl opacity-30 rounded-full" />
                                <div className="relative bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-8 rounded-full border border-amber-500/30">
                                    <Sparkles className={`h-16 w-16 text-amber-400 ${isOptimizing ? 'animate-spin' : 'animate-pulse'}`} />
                                </div>
                            </motion.div>

                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                                    Ready to Supercharge Your Resume?
                                </h3>
                                <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
                                    Our AI will analyze the job description and completely rewrite your resume to include
                                    <span className="text-amber-400 font-semibold"> every missing keyword</span>,
                                    optimize for ATS systems, and target a
                                    <span className="text-emerald-400 font-bold"> 100% Match Score</span>.
                                </p>
                            </div>

                            <motion.button
                                onClick={handleOptimize}
                                disabled={isOptimizing}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="cursor-pointer relative overflow-hidden px-8 py-4 rounded-xl font-bold text-lg
                                           bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white
                                           shadow-xl shadow-orange-500/30 border-2 border-amber-400/30
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                <span className="relative flex items-center gap-2">
                                    {isOptimizing ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Optimizing Your Resume...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5" />
                                            Start Optimization
                                        </>
                                    )}
                                </span>
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Success Banner */}
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="bg-gradient-to-r from-emerald-950/50 via-emerald-900/30 to-teal-950/50 
                                           border-2 border-emerald-500/30 p-5 rounded-2xl flex items-center gap-4
                                           shadow-lg shadow-emerald-500/10"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.5, repeat: 3 }}
                                >
                                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                                </motion.div>
                                <div>
                                    <h4 className="font-bold text-xl text-emerald-300">🎉 Optimization Complete!</h4>
                                    <p className="text-emerald-400/80">Your resume is now targeting a <span className="font-bold text-emerald-300">100% Match Score</span></p>
                                </div>
                            </motion.div>

                            {/* Content Preview Grid - Same Height */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Professional Summary */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="space-y-3 flex flex-col"
                                >
                                    <label className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-wider">
                                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                                        Professional Summary
                                    </label>
                                    <div className="flex-1 p-5 bg-gradient-to-br from-slate-900/80 to-slate-800/50 rounded-xl 
                                                    border-2 border-amber-500/20 text-sm leading-relaxed
                                                    hover:border-amber-500/40 transition-colors
                                                    max-h-64 overflow-y-auto custom-scrollbar">
                                        {highlightSummary(optimizedData.professionalSummary)}
                                    </div>
                                </motion.div>

                                {/* Skills - Same height as Summary */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-3 flex flex-col"
                                >
                                    <label className="flex items-center gap-2 text-sm font-bold text-cyan-400 uppercase tracking-wider">
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                                        Key Skills ({optimizedData.skills?.length || 0})
                                    </label>
                                    <div className="flex-1 p-5 bg-gradient-to-br from-slate-900/80 to-slate-800/50 rounded-xl 
                                                    border-2 border-cyan-500/20 flex flex-wrap gap-2 content-start
                                                    hover:border-cyan-500/40 transition-colors max-h-64 overflow-y-auto custom-scrollbar">
                                        {optimizedData.skills?.map((skill: string, i: number) => {
                                            const colorScheme = skillColors[i % skillColors.length];
                                            return (
                                                <motion.span
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.3 + i * 0.02 }}
                                                    className={`bg-gradient-to-r ${colorScheme.bg} ${colorScheme.text} 
                                                               px-3 py-1.5 rounded-lg text-xs font-medium
                                                               border ${colorScheme.border} ${colorScheme.hover} 
                                                               transition-all cursor-default`}
                                                >
                                                    {skill}
                                                </motion.span>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Experience Preview */}
                            {optimizedData.experience?.[0] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="space-y-3"
                                >
                                    <label className="flex items-center gap-2 text-sm font-bold text-purple-400 uppercase tracking-wider">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                                        Experience Preview
                                    </label>
                                    <div className="p-5 bg-gradient-to-br from-slate-900/80 to-slate-800/50 rounded-xl 
                                                    border-2 border-purple-500/20 space-y-3
                                                    hover:border-purple-500/40 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-bold text-purple-300">{optimizedData.experience[0].role}</h5>
                                                <p className="text-slate-400 text-sm">{optimizedData.experience[0].company}</p>
                                            </div>
                                            <span className="text-xs text-slate-500">{optimizedData.experience[0].date}</span>
                                        </div>
                                        <ul className="space-y-1 text-sm text-slate-300">
                                            {optimizedData.experience[0].description?.slice(0, 2).map((bullet: string, i: number) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className="text-purple-400">▸</span>
                                                    {bullet}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            )}

                            {/* Action Buttons */}
                            <DialogFooter className="flex-col sm:flex-row gap-4 mt-8 border-t-2 border-slate-800 pt-6">
                                {/* Download Buttons */}
                                <div className="flex-1 flex gap-3 justify-start">
                                    <motion.button
                                        onClick={() => handleDownload('PDF')}
                                        disabled={isDownloading === 'PDF'}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="cursor-pointer flex items-center gap-2 px-5 py-3 rounded-xl font-semibold
                                                   bg-gradient-to-r from-red-600 to-rose-600 text-white
                                                   border-2 border-red-400/30 shadow-lg shadow-red-500/20
                                                   hover:shadow-red-500/40 transition-all
                                                   disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDownloading === 'PDF' ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <FileText className="h-5 w-5" />
                                        )}
                                        PDF
                                    </motion.button>

                                    <motion.button
                                        onClick={() => handleDownload('DOCX')}
                                        disabled={isDownloading === 'DOCX'}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="cursor-pointer flex items-center gap-2 px-5 py-3 rounded-xl font-semibold
                                                   bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                                                   border-2 border-blue-400/30 shadow-lg shadow-blue-500/20
                                                   hover:shadow-blue-500/40 transition-all
                                                   disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDownloading === 'DOCX' ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <FileType2 className="h-5 w-5" />
                                        )}
                                        Word
                                    </motion.button>
                                </div>

                                {/* Save Button */}
                                {user ? (
                                    <motion.button
                                        onClick={() => handleSave('PDF')}
                                        disabled={isSaving}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="cursor-pointer relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-xl font-bold
                                                   bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white
                                                   border-2 border-emerald-400/30 shadow-lg shadow-emerald-500/30
                                                   hover:shadow-emerald-500/50 transition-all
                                                   disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <span className="relative flex items-center gap-2">
                                            {isSaving ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Save className="h-5 w-5" />
                                            )}
                                            Save to Dashboard
                                        </span>
                                    </motion.button>
                                ) : (
                                    <p className="text-sm text-slate-500 self-center bg-slate-800/50 px-4 py-2 rounded-lg">
                                        🔒 Sign in to save
                                    </p>
                                )}
                            </DialogFooter>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
