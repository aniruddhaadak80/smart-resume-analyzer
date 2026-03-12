'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, UploadCloud, FileText, CheckCircle2, AlertTriangle, Lightbulb, ArrowRight, Sparkles, X } from "lucide-react";
import Image from "next/image";
import InterviewCoach from "@/components/InterviewCoach";
import ResumeOptimizer from "@/components/ResumeOptimizer";
import LoadingText from "@/components/LoadingText";
import KeywordHeatmap from "@/components/KeywordHeatmap";
import { useUser, SignInButton } from "@clerk/nextjs";
import { fireConfetti, checkBadges, type BadgeId } from "@/lib/gamification";
import { BadgeUnlockToast } from "@/components/Badges";
import { saveResume } from "@/app/actions/resume";
import { useToast } from "@/components/Toast";
import { summarizeJD } from "@/app/actions/summarize";

import { Variants } from "framer-motion";

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const LOADING_MESSAGES = [
  "Scanning for ATS compatibility...",
  "Analyzing impact verbs...",
  "Detecting missing keywords...",
  "Comparing against top industry standards...",
  "Formatting structure..."
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [newBadges, setNewBadges] = useState<BadgeId[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [jdSummary, setJdSummary] = useState<string[] | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!jobDescription || jobDescription.trim().length < 50) {
      showToast('Paste a job description first (at least 50 characters).', 'error');
      return;
    }
    setIsSummarizing(true);
    setJdSummary(null);
    const res = await summarizeJD(jobDescription);
    setIsSummarizing(false);
    if (res.success) {
      setJdSummary(res.data);
    } else {
      showToast(res.error, 'error');
    }
  };
  const { isSignedIn, user, isLoaded } = useUser();
  const { showToast } = useToast();
  const signInBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const clearResult = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeResume = async () => {
    // Auth gate: require sign-in for analysis
    if (!isSignedIn) {
      signInBtnRef.current?.click();
      return;
    }

    if (!file) {
      setError('Please upload a resume to proceed.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Analysis failed');

      setResult(data);

      // 🎊 Gamification: check badges and fire confetti for 90%+ scores
      const score = data.matchPercentage || 0;
      const earned = checkBadges(score);
      if (earned.length > 0) setNewBadges(earned);
      if (score >= 90) fireConfetti();

    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !result) return;
    setIsSaving(true);
    try {
      await saveResume({
        userId: user.id,
        fileName: file?.name || "MyResume",
        jobTitle: jobDescription ? "Target Role" : "General Analysis",
        matchScore: result.matchPercentage || 0,
        fileType: "JSON",
        content: result,
        actionType: "ANALYZE"
      });
      showToast('✨ Saved to Dashboard! Your analysis is safe in the cloud.', 'success', 6000);
    } catch (e) {
      showToast('Failed to save. Please try again.', 'error', 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden selection:bg-teal-500/30">

      {/* 🏅 Badge unlock notification */}
      {newBadges.length > 0 && (
        <BadgeUnlockToast badgeIds={newBadges} onClose={() => setNewBadges([])} />
      )}
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10 pb-20">

        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center space-y-8 pt-10 pb-20 min-h-[80vh] flex flex-col justify-center items-center"
        >
          <motion.div variants={fadeInUp} className="inline-block">
            <Badge variant="secondary" className="bg-teal-950/50 text-teal-300 border-teal-500/20 px-4 py-1.5 text-sm rounded-full backdrop-blur-md">
              ✨ AI-Powered Career Optimization
            </Badge>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl font-bold tracking-tighter leading-none font-display text-white">
            Land Your Dream <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 text-glow">
              Job Faster.
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed italic font-light">
            Upload your resume and get instant, AI-driven feedback to beat the ATS and impress recruiters. Tailored interview prep included.
          </motion.p>

          <motion.div variants={fadeInUp} className="pt-4">
            <Button
              onClick={() => document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full px-8 py-6 text-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-105 cursor-pointer"
            >
              Start Free Analysis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.section>

        {/* Main Interface */}
        <div id="analysis-section" className="scroll-mt-24">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5 }}
                className="space-y-24"
              >
                {/* Upload Card */}
                <Card className="glass-card border-slate-800 bg-slate-900/60 backdrop-blur-2xl max-w-4xl mx-auto overflow-hidden">
                  {/* Progress Bar Loader */}
                  {loading && <motion.div layoutId="loader" className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 absolute top-0 left-0 w-full" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2, repeat: Infinity }} />}

                  <CardHeader className="text-center pb-10 pt-10">
                    <CardTitle className="text-3xl font-display">Start Analysis</CardTitle>
                    <CardDescription className="text-slate-400 text-lg italic">Process your resume in seconds.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 px-8 pb-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Dropzone */}
                      <div className="space-y-3 group">
                        <Label className="text-base font-medium text-slate-300">Resume File <span className="text-teal-400">*</span></Label>
                        <div className="border-2 border-dashed border-slate-700/50 rounded-2xl p-8 text-center bg-slate-900/40 hover:bg-slate-800/60 hover:border-teal-500/50 transition-all cursor-pointer relative h-[220px] flex flex-col items-center justify-center group-hover:shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                          <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" />
                          <div className="flex flex-col items-center gap-4 transition-transform group-hover:-translate-y-1">
                            {file ? (
                              <>
                                <div className="bg-teal-500/20 p-4 rounded-full ring-1 ring-teal-500/50">
                                  <FileText className="h-8 w-8 text-teal-400" />
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-slate-200 text-lg">{file.name}</p>
                                  <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="bg-slate-800 p-4 rounded-full group-hover:bg-slate-700 transition-colors">
                                  <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-teal-400 transition-colors" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-300 text-lg">Click to Upload</p>
                                  <p className="text-sm text-slate-500 mt-1">PDF or DOCX</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Job Desc */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-base font-medium text-slate-300">Job Description</Label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSummarize}
                              disabled={isSummarizing}
                              className="flex items-center gap-1.5 text-[11px] font-medium text-teal-400 hover:text-teal-300 border border-teal-500/30 hover:border-teal-400/60 bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSummarizing
                                ? <><Loader2 className="h-3 w-3 animate-spin" /> Summarizing...</>
                                : <><Sparkles className="h-3 w-3" /> Summarize</>}
                            </button>
                            <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-800 uppercase tracking-wider">Optional</Badge>
                          </div>
                        </div>

                        <AnimatePresence>
                          {jdSummary && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.25 }}
                              className="relative rounded-xl border border-teal-500/20 bg-teal-950/30 backdrop-blur px-4 pt-3 pb-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 uppercase tracking-wider">
                                  <Sparkles className="h-3 w-3" /> Key Requirements
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setJdSummary(null)}
                                  className="text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <ul className="space-y-1.5">
                                {jdSummary.map((req, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Textarea
                          placeholder="Paste the job description here..."
                          className="h-[220px] bg-slate-900/40 border-slate-700/50 resize-none focus:ring-teal-500/50 focus:border-teal-500/50 text-slate-300 leading-relaxed rounded-2xl"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-red-400 bg-red-950/20 border border-red-900/50 p-4 rounded-xl">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                      </motion.div>
                    )}

                    {/* Hidden sign-in trigger for unauthenticated users */}
                    <SignInButton mode="modal" forceRedirectUrl="/">
                      <button ref={signInBtnRef} className="hidden" aria-hidden="true" />
                    </SignInButton>

                    <Button
                      onClick={analyzeResume}
                      className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold py-8 text-xl shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:shadow-[0_0_40px_rgba(20,184,166,0.5)] transition-all rounded-xl relative overflow-hidden group cursor-pointer"
                      disabled={loading}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                        {loading ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Loader2 className="animate-spin h-5 w-5" />
                              <span>Analyzing...</span>
                            </div>
                            <LoadingText
                              messages={[
                                "Scanning for ATS compatibility...",
                                "Analyzing impact verbs...",
                                "Detecting missing keywords...",
                                "Comparing against top industry standards...",
                                "Formatting structure..."
                              ]}
                              className="text-sm font-normal text-teal-100/80"
                            />
                          </div>
                        ) : !isSignedIn ? (
                          <>Sign In to Analyze <ArrowRight className="group-hover:translate-x-1 transition-transform" /></>
                        ) : (
                          <>Run Analysis <ArrowRight className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </span>
                    </Button>
                  </CardContent>
                </Card>

                {/* How It Works Section */}
                <section className="space-y-16 py-10">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                  >
                    <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">How <span className="text-teal-400">careerzen</span> Works</h2>
                    <p className="text-slate-400 max-w-xl mx-auto italic text-lg">Three simple steps to resume perfection.</p>
                  </motion.div>

                  <div className="grid md:grid-cols-3 gap-12">
                    {[
                      { title: "Upload", desc: "Drag & drop your resume securely.", img: "/assets/upload_mockup.png" },
                      { title: "Analyze", desc: "Our AI scans for 50+ ATS checkpoints.", img: "/assets/analysis_mockup.png" },
                      { title: "Improve", desc: "Get actionable tips & interview prep.", img: "/assets/results_mockup.png" }
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 80 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: i * 0.2, duration: 0.8, ease: "easeOut" }}
                        className="space-y-6 text-center group"
                      >
                        <div className="relative h-[250px] w-full rounded-3xl overflow-hidden glass-card border-none shadow-2xl group-hover:scale-105 transition-transform duration-500">
                          <Image src={step.img} alt={step.title} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2 font-display">{step.title}</h3>
                          <p className="text-slate-400 leading-relaxed italic">{step.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                <motion.div variants={fadeInUp} className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-bold font-display">Analysis Report</h2>
                    <p className="text-slate-400">Detailed insights for your profile</p>
                  </div>
                  <div className="flex gap-3 mt-4 md:mt-0">
                    <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:shadow-emerald-500/50 text-white cursor-pointer transition-all border-2 border-emerald-400/30">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      Save to Dashboard
                    </Button>
                    <Button onClick={clearResult} variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 cursor-pointer">
                      Upload New Resume
                    </Button>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <ScoreCard title="Match Score" score={result.matchPercentage} color="teal" />
                  <ScoreCard title="ATS Score" score={result.atsScore} color="cyan" />
                </div>

                {/* AI Resume Optimizer - Only show if score < 100 and we have the text */}
                {(result.matchPercentage < 100 || result.atsScore < 100) && result.resumeText && (
                  <motion.div variants={fadeInUp} className="flex justify-center w-full py-6">
                    <ResumeOptimizer
                      resumeText={result.resumeText}
                      jobDescription={jobDescription || "Standard role based on resume content."}
                      originalFileName={file?.name || "MyResume"}
                    />
                  </motion.div>
                )}

                <motion.div variants={fadeInUp}>
                  <Card className="glass-card border-teal-500/10">
                    <CardHeader><CardTitle>Candidate Summary</CardTitle></CardHeader>
                    <CardContent><p className="text-slate-300 text-lg leading-relaxed">{result.candidateSummary}</p></CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <KeywordHeatmap
                    resumeText={result.resumeText || ""}
                    jobDescription={jobDescription || ""}
                    missingKeywords={result.missingKeywords || []}
                    foundKeywords={result.skillsFound || []}
                  />
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FeedbackCard title="Missing Keywords" icon={AlertTriangle} items={result.missingKeywords} type="error" />
                  <FeedbackCard title="Improvements" icon={Lightbulb} items={result.improvements} type="warning" />
                </div>

                {result.interviewQuestions && (

                  <motion.div variants={fadeInUp} className="w-full">
                    <InterviewCoach questions={result.interviewQuestions} />
                  </motion.div>

                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <div className="pt-20" />
    </main>
  );
}

// Sub-components for cleaner code
function ScoreCard({ title, score, color }: { title: string, score: number, color: 'teal' | 'cyan' }) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className={`glass-card border-none bg-${color}-500/5 overflow-hidden relative`}>
        <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500/10 rounded-full blur-2xl -mr-10 -mt-10`} />
        <CardHeader className="pb-2"><CardTitle className={`text-sm font-medium text-${color}-300 uppercase tracking-widest`}>{title}</CardTitle></CardHeader>
        <CardContent>
          <div className={`text-6xl font-bold text-${color}-400 font-display`}>{score}<span className="text-2xl text-slate-600">%</span></div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FeedbackCard({ title, icon: Icon, items, type }: { title: string, icon: any, items: string[], type: 'error' | 'warning' }) {
  const colorClass = type === 'error' ? 'red' : 'yellow';
  return (
    <motion.div variants={fadeInUp}>
      <Card className={`glass-card border-l-4 border-l-${colorClass}-500`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-${colorClass}-400`}>
            <Icon className="h-5 w-5" /> {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {items.map((item, i) => (
                type === 'error'
                  ? <Badge key={i} variant="secondary" className="bg-red-950/40 text-red-300 border-red-900/50">{item}</Badge>
                  : <div key={i} className="flex gap-2 text-slate-300 w-full"><span className="text-yellow-500">•</span>{item}</div>
              ))}
            </div>
          ) : <p className="text-slate-500 italic">None found.</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}
