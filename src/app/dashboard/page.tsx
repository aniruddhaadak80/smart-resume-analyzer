'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText, ChevronRight, BarChart } from "lucide-react";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [history, setHistory] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const savedHistory = JSON.parse(localStorage.getItem('careerzen_history') || '[]');
        setHistory(savedHistory);
    }, []);

    const loadAnalysis = (item: any) => {
        localStorage.setItem('careerzen_result', JSON.stringify(item.result));
        router.push('/');
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-50 selection:bg-teal-500/30 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Analyzer
                    </Link>
                    <h1 className="text-3xl font-bold font-display">Analysis History</h1>
                </div>

                {/* List */}
                <div className="grid gap-4">
                    {history.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <BarChart className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-slate-300">No Analysis Yet</h3>
                            <p className="text-slate-500 mt-2">Upload a resume to see your history here.</p>
                            <Button asChild className="mt-6 bg-teal-600 hover:bg-teal-500">
                                <Link href="/">Upload Resume</Link>
                            </Button>
                        </div>
                    ) : (
                        history.map((item, i) => (
                            <motion.div
                                key={item.id || i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="glass-card hover:bg-slate-800/50 transition-all cursor-pointer group border-slate-800" onClick={() => loadAnalysis(item)}>
                                    <CardContent className="flex items-center justify-between p-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${item.result.matchPercentage >= 70 ? 'bg-teal-500/10 text-teal-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-slate-200 group-hover:text-teal-300 transition-colors">{item.fileName}</h3>
                                                <div className="flex items-center gap-3 text-slate-500 text-sm mt-1">
                                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(item.date).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>Score: <span className={item.result.matchPercentage >= 70 ? "text-teal-400 font-bold" : "text-yellow-400 font-bold"}>{item.result.matchPercentage}%</span></span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
