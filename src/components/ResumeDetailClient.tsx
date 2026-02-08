'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, Calendar, Award, Sparkles, Briefcase, GraduationCap, Code, Trophy, Globe } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { generateDocx } from '@/lib/docx-generator';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { ResumePDF } from './ResumePDF';
import { useState } from 'react';

// Skill color palette
const skillColors = [
    'from-rose-900/50 to-pink-900/50 text-rose-300 border-rose-500/30',
    'from-amber-900/50 to-orange-900/50 text-amber-300 border-amber-500/30',
    'from-emerald-900/50 to-teal-900/50 text-emerald-300 border-emerald-500/30',
    'from-cyan-900/50 to-blue-900/50 text-cyan-300 border-cyan-500/30',
    'from-violet-900/50 to-purple-900/50 text-violet-300 border-violet-500/30',
    'from-fuchsia-900/50 to-pink-900/50 text-fuchsia-300 border-fuchsia-500/30',
    'from-sky-900/50 to-indigo-900/50 text-sky-300 border-sky-500/30',
    'from-lime-900/50 to-green-900/50 text-lime-300 border-lime-500/30',
];

interface Resume {
    id: string;
    fileName: string;
    jobTitle: string | null;
    matchScore: number | null;
    content: string | null;
    createdAt: Date;
}

export default function ResumeDetailClient({ resume }: { resume: Resume }) {
    const [isDownloading, setIsDownloading] = useState<'PDF' | 'DOCX' | null>(null);
    const data = resume.content ? JSON.parse(resume.content) : {};

    const handleDownload = async (format: 'PDF' | 'DOCX') => {
        setIsDownloading(format);
        try {
            const fileName = resume.fileName.replace(/\.[^/.]+$/, "");
            if (format === 'PDF') {
                const blob = await pdf(<ResumePDF data={data} />).toBlob();
                saveAs(blob, `${fileName}.pdf`);
            } else {
                const blob = await generateDocx(data);
                saveAs(blob, `${fileName}.docx`);
            }
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            setIsDownloading(null);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Library
                        </Link>
                        <h1 className="text-3xl font-bold font-display flex items-center gap-3">
                            <FileText className="h-8 w-8 text-teal-400" />
                            {resume.fileName}
                        </h1>
                        <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(resume.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Award className="h-4 w-4 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">{resume.matchScore || 0}% Match</span>
                            </span>
                        </div>
                    </div>

                    {/* Download Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={() => handleDownload('PDF')}
                            disabled={isDownloading !== null}
                            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white"
                        >
                            {isDownloading === 'PDF' ? 'Downloading...' : 'Download PDF'}
                        </Button>
                        <Button
                            onClick={() => handleDownload('DOCX')}
                            disabled={isDownloading !== null}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
                        >
                            {isDownloading === 'DOCX' ? 'Downloading...' : 'Download Word'}
                        </Button>
                    </div>
                </motion.div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left Column - Contact & Skills */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Contact Info */}
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                                    <Globe className="h-5 w-5" /> Contact Info
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {data.contactInfo?.email && (
                                        <div>
                                            <span className="text-slate-500">Email</span>
                                            <p className="text-cyan-400">{data.contactInfo.email}</p>
                                        </div>
                                    )}
                                    {data.contactInfo?.phone && (
                                        <div>
                                            <span className="text-slate-500">Phone</span>
                                            <p className="text-slate-200">{data.contactInfo.phone}</p>
                                        </div>
                                    )}
                                    {data.contactInfo?.linkedin && (
                                        <div>
                                            <span className="text-slate-500">LinkedIn</span>
                                            <p className="text-cyan-400 truncate">{data.contactInfo.linkedin}</p>
                                        </div>
                                    )}
                                    {data.contactInfo?.location && (
                                        <div>
                                            <span className="text-slate-500">Location</span>
                                            <p className="text-slate-200">{data.contactInfo.location}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                                    <Code className="h-5 w-5" /> Skills ({data.skills?.length || 0})
                                </h3>
                                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                                    {data.skills?.map((skill: string, i: number) => (
                                        <span
                                            key={i}
                                            className={`bg-gradient-to-r ${skillColors[i % skillColors.length]} 
                                                       px-3 py-1.5 rounded-lg text-xs font-medium border`}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Education */}
                        {data.education && data.education.length > 0 && (
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5" /> Education
                                    </h3>
                                    <div className="space-y-4">
                                        {data.education.map((edu: any, i: number) => (
                                            <div key={i} className="border-l-2 border-purple-500/30 pl-4">
                                                <h4 className="font-bold text-slate-200">{edu.degree}</h4>
                                                <p className="text-purple-400 text-sm">{edu.institution}</p>
                                                <p className="text-slate-500 text-xs">{edu.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>

                    {/* Right Column - Summary & Experience */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-2 space-y-6"
                    >
                        {/* Professional Summary */}
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" /> Professional Summary
                                </h3>
                                <p className="text-slate-300 leading-relaxed">
                                    {data.professionalSummary}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Experience */}
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" /> Experience
                                </h3>
                                <div className="space-y-6">
                                    {data.experience?.map((exp: any, i: number) => (
                                        <div key={i} className="border-l-2 border-emerald-500/30 pl-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-lg text-slate-200">{exp.role}</h4>
                                                    <p className="text-emerald-400">{exp.company}</p>
                                                </div>
                                                <span className="text-slate-500 text-sm">{exp.date}</span>
                                            </div>
                                            <ul className="space-y-2 mt-3">
                                                {exp.description?.map((bullet: string, j: number) => (
                                                    <li key={j} className="text-slate-300 text-sm flex gap-2">
                                                        <span className="text-emerald-400">▸</span>
                                                        {bullet}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Achievements */}
                        {data.achievements && data.achievements.length > 0 && (
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                                        <Trophy className="h-5 w-5" /> Key Achievements
                                    </h3>
                                    <ul className="space-y-2">
                                        {data.achievements.map((achievement: string, i: number) => (
                                            <li key={i} className="text-slate-300 flex gap-2">
                                                <span className="text-yellow-400">★</span>
                                                {achievement}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
