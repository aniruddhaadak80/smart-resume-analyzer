'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, Download, Save, FileText, FileType2, Upload, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { optimizeResume } from '@/app/actions/optimize';
import { saveResume } from '@/app/actions/resume';
import { extractText } from '@/app/actions/extract';
import { useUser } from '@clerk/nextjs';
import { generateDocx } from '@/lib/docx-generator';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { ResumePDF } from './ResumePDF';
import { useToast } from './Toast';
import { useRouter } from 'next/navigation';

// Skill color palette
const skillColors = [
    { bg: 'from-rose-900/50 to-pink-900/50', text: 'text-rose-300', border: 'border-rose-500/30' },
    { bg: 'from-amber-900/50 to-orange-900/50', text: 'text-amber-300', border: 'border-amber-500/30' },
    { bg: 'from-emerald-900/50 to-teal-900/50', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    { bg: 'from-cyan-900/50 to-blue-900/50', text: 'text-cyan-300', border: 'border-cyan-500/30' },
    { bg: 'from-violet-900/50 to-purple-900/50', text: 'text-violet-300', border: 'border-violet-500/30' },
    { bg: 'from-fuchsia-900/50 to-pink-900/50', text: 'text-fuchsia-300', border: 'border-fuchsia-500/30' },
    { bg: 'from-sky-900/50 to-indigo-900/50', text: 'text-sky-300', border: 'border-sky-500/30' },
    { bg: 'from-lime-900/50 to-green-900/50', text: 'text-lime-300', border: 'border-lime-500/30' },
];

// Keyword highlighting
const highlightSummary = (text: string) => {
    if (!text) return null;
    const patterns = [
        { regex: /(\d+%|\d+\+|\$[\d,]+|\d+ years?|\d+x)/gi, class: 'text-emerald-400 font-bold' },
        { regex: /(React|Node\.js|Python|JavaScript|TypeScript|AWS|Docker|MongoDB|PostgreSQL|Next\.js|Express\.js|Java|C\+\+|Tailwind|REST|API|GraphQL|Kubernetes|CI\/CD|Git|Agile|Scrum)/gi, class: 'text-cyan-400 font-semibold' },
        { regex: /(Full Stack|Front-end|Backend|Senior|Lead|Manager|Engineer|Developer|Architect|Expert|Proven|Award-winning|Certified)/gi, class: 'text-amber-400 font-semibold' },
    ];

    let parts: { text: string; className?: string }[] = [{ text }];

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

export default function OptimizeClient() {
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [fileName, setFileName] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedData, setOptimizedData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState<'PDF' | 'DOCX' | null>(null);
    const [isExtractingResume, setIsExtractingResume] = useState(false);
    const [isExtractingJD, setIsExtractingJD] = useState(false);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jdFile, setJdFile] = useState<File | null>(null);
    const { user } = useUser();
    const { showToast } = useToast();
    const router = useRouter();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'jd') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'resume') {
            setIsExtractingResume(true);
            setResumeFile(file);
            setFileName(file.name.split('.')[0]);
        } else {
            setIsExtractingJD(true);
            setJdFile(file);
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await extractText(formData);
            if (result.success && result.text) {
                if (type === 'resume') {
                    setResumeText(result.text);
                    showToast('Resume text extracted successfully!', 'success');
                } else {
                    setJobDescription(result.text);
                    showToast('Job description extracted successfully!', 'success');
                }
            } else {
                showToast(result.error || 'Failed to extract text.', 'error');
            }
        } catch (error) {
            showToast('Something went wrong during extraction.', 'error');
        } finally {
            type === 'resume' ? setIsExtractingResume(false) : setIsExtractingJD(false);
        }
    };

    // Load from localStorage if available
    useEffect(() => {
        const stored = localStorage.getItem('careerzen_optimize_data');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setResumeText(data.resumeText || '');
                setJobDescription(data.jobDescription || '');
                setFileName(data.fileName || 'Resume');
            } catch (e) {
                console.error('Error loading stored data:', e);
            }
        }
    }, []);

    const handleOptimize = async () => {
        if (!resumeText.trim() || !jobDescription.trim()) {
            showToast('Please provide both resume text and job description.', 'error');
            return;
        }

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

        try {
            if (format === 'PDF') {
                const blob = await pdf(<ResumePDF data={optimizedData} />).toBlob();
                saveAs(blob, `Optimized_${fileName || 'Resume'}.pdf`);
            } else {
                const blob = await generateDocx(optimizedData);
                saveAs(blob, `Optimized_${fileName || 'Resume'}.docx`);
            }
            showToast(`Downloaded ${format} successfully!`, 'success');
        } catch (error) {
            console.error('Download error:', error);
            showToast(`Failed to download ${format}.`, 'error');
        } finally {
            setIsDownloading(null);
        }
    };

    const handleSave = async () => {
        if (!optimizedData || !user) {
            showToast('Please sign in to save resumes.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const result = await saveResume({
                userId: user.id,
                fileName: `Optimized_${fileName || 'Resume'}`,
                jobTitle: optimizedData.experience?.[0]?.role || "Optimized Role",
                matchScore: 100,
                fileType: "PDF",
                content: optimizedData,
            });

            if (result.success) {
                showToast('Resume saved to your library! 🎉', 'success');
                router.push('/dashboard');
            } else {
                showToast('Failed to save resume.', 'error');
            }
        } catch (error) {
            showToast('Failed to save resume.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                        <ArrowLeft className="h-4 w-4" /> Back to Analyzer
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
                            <Sparkles className="h-8 w-8 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                                AI Resume Optimizer
                            </h1>
                            <p className="text-slate-400">Target 100% match score with AI-powered optimization</p>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!optimizedData ? (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid md:grid-cols-2 gap-6"
                        >
                            {/* Resume Input */}
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="flex items-center gap-2 text-lg font-bold text-teal-400">
                                            <FileText className="h-5 w-5" />
                                            Your Resume Content
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".pdf,.docx"
                                                onChange={(e) => handleFileUpload(e, 'resume')}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                disabled={isExtractingResume}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 border-teal-500/30 text-teal-400 hover:bg-teal-500/10 cursor-pointer"
                                                disabled={isExtractingResume}
                                            >
                                                {isExtractingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                {resumeFile ? 'Change File' : 'Upload PDF/Word'}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Textarea
                                            placeholder="Paste your resume text here... or upload a file above."
                                            className="min-h-[400px] bg-slate-900 border-slate-700 text-slate-200 resize-none"
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                            disabled={isExtractingResume}
                                        />
                                        {isExtractingResume && (
                                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] rounded-md flex items-center justify-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
                                                    <p className="text-teal-400 text-sm font-medium">Extracting text...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">{resumeText.length} characters</p>
                                </CardContent>
                            </Card>

                            {/* Job Description Input */}
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="flex items-center gap-2 text-lg font-bold text-purple-400">
                                            <Briefcase className="h-5 w-5" />
                                            Target Job Description
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".pdf,.docx,image/*"
                                                onChange={(e) => handleFileUpload(e, 'jd')}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                disabled={isExtractingJD}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 cursor-pointer"
                                                disabled={isExtractingJD}
                                            >
                                                {isExtractingJD ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                {jdFile ? 'Change File' : 'Upload File/Image'}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Textarea
                                            placeholder="Paste the job description here... or upload a file/image above."
                                            className="min-h-[400px] bg-slate-900 border-slate-700 text-slate-200 resize-none"
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            disabled={isExtractingJD}
                                        />
                                        {isExtractingJD && (
                                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] rounded-md flex items-center justify-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                                                    <p className="text-purple-400 text-sm font-medium">Parsing job details...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">{jobDescription.length} characters</p>
                                </CardContent>
                            </Card>

                            {/* Optimize Button */}
                            <div className="md:col-span-2 flex justify-center">
                                <motion.button
                                    onClick={handleOptimize}
                                    disabled={isOptimizing || !resumeText.trim() || !jobDescription.trim()}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative overflow-hidden px-12 py-5 rounded-xl font-bold text-xl
                                               bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white
                                               shadow-xl shadow-orange-500/30 border-2 border-amber-400/30
                                               disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                    <span className="relative flex items-center gap-3">
                                        {isOptimizing ? (
                                            <>
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                Optimizing Your Resume...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-6 w-6" />
                                                Optimize for 100% Match
                                            </>
                                        )}
                                    </span>
                                </motion.button>
                            </div>
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
                                           border-2 border-emerald-500/30 p-6 rounded-2xl flex items-center justify-between
                                           shadow-lg shadow-emerald-500/10"
                            >
                                <div className="flex items-center gap-4">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                                    <div>
                                        <h4 className="font-bold text-2xl text-emerald-300">🎉 Optimization Complete!</h4>
                                        <p className="text-emerald-400/80">Your resume is now targeting a <span className="font-bold text-emerald-300">100% Match Score</span></p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => handleDownload('PDF')}
                                        disabled={isDownloading !== null}
                                        className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500"
                                    >
                                        {isDownloading === 'PDF' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                                        PDF
                                    </Button>
                                    <Button
                                        onClick={() => handleDownload('DOCX')}
                                        disabled={isDownloading !== null}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                                    >
                                        {isDownloading === 'DOCX' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileType2 className="h-4 w-4" />}
                                        Word
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                                    >
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Save
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Content Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Professional Summary */}
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardContent className="p-6 space-y-4">
                                        <label className="flex items-center gap-2 text-lg font-bold text-amber-400">
                                            <Sparkles className="h-5 w-5" />
                                            Professional Summary
                                        </label>
                                        <div className="text-slate-300 leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
                                            {highlightSummary(optimizedData.professionalSummary)}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Skills */}
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardContent className="p-6 space-y-4">
                                        <label className="flex items-center gap-2 text-lg font-bold text-cyan-400">
                                            <CheckCircle2 className="h-5 w-5" />
                                            Skills ({optimizedData.skills?.length || 0})
                                        </label>
                                        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                                            {optimizedData.skills?.map((skill: string, i: number) => {
                                                const color = skillColors[i % skillColors.length];
                                                return (
                                                    <span
                                                        key={i}
                                                        className={`bg-gradient-to-r ${color.bg} ${color.text} px-3 py-1.5 rounded-lg text-sm font-medium border ${color.border}`}
                                                    >
                                                        {skill}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Experience */}
                            {optimizedData.experience && (
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardContent className="p-6 space-y-6">
                                        <label className="flex items-center gap-2 text-lg font-bold text-purple-400">
                                            <Briefcase className="h-5 w-5" />
                                            Experience
                                        </label>
                                        <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar">
                                            {optimizedData.experience.map((exp: any, i: number) => (
                                                <div key={i} className="border-l-2 border-purple-500/30 pl-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-lg text-slate-200">{exp.role}</h4>
                                                            <p className="text-purple-400">{exp.company}</p>
                                                        </div>
                                                        <span className="text-slate-500 text-sm">{exp.date}</span>
                                                    </div>
                                                    <ul className="space-y-2 mt-3">
                                                        {exp.description?.map((bullet: string, j: number) => (
                                                            <li key={j} className="text-slate-300 text-sm flex gap-2">
                                                                <span className="text-purple-400">▸</span>
                                                                {bullet}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Start Over Button */}
                            <div className="flex justify-center pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setOptimizedData(null)}
                                    className="border-slate-700 text-slate-400 hover:bg-slate-800"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Start New Optimization
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
