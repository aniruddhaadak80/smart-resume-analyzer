'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, UploadCloud, FileText, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

export default function Home() {
  const containerRef = useRef(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initial Animation
  useGSAP(() => {
    if (!isMounted) return;
    const tl = gsap.timeline();
    tl.from(".hero-text", { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out" })
      .from(".upload-card", { y: 30, opacity: 0, duration: 0.8, ease: "back.out(1.7)" }, "-=0.5")
      .from(".feature-card", { y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }, "-=0.2");
  }, { scope: containerRef, dependencies: [isMounted] });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeResume = async () => {
    if (!file) {
      setError('Please upload a resume to proceed.');
      return;
    }

    setLoading(true);
    setError('');

    // Animate out upload card
    gsap.to(".upload-card", { scale: 0.95, opacity: 0.5, duration: 0.3 });

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

      // Animate results in
      setTimeout(() => {
        gsap.from(".results-container", { y: 50, opacity: 0, duration: 0.8, ease: "power3.out" });
        gsap.from(".score-card", { scale: 0, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.3 });
      }, 100);

    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
      gsap.to(".upload-card", { scale: 1, opacity: 1, duration: 0.3 });
    }
  };

  if (!isMounted) return null;

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-20 relative z-10 pb-20">

        {/* Hero Section */}
        <section className="text-center space-y-6 pt-10">
          <Badge variant="secondary" className="hero-text bg-indigo-500/10 text-indigo-300 border-indigo-500/20 px-4 py-1 text-sm rounded-full mb-4">
            ✨ AI-Powered V2.0 Now Live
          </Badge>
          <h1 className="hero-text text-5xl md:text-7xl font-bold tracking-tighter leading-tight font-display">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Resume</span> Analyzer
          </h1>
          <p className="hero-text text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Optimize your resume for any job description using advanced Gemini AI.
            Get instant feedback on ATS scores, missing keywords, and actionable insights.
          </p>
        </section>

        {/* Upload Section */}
        {!result && (
          <div className="space-y-16">
            <Card className="upload-card glass-card border-white/10 bg-slate-900/50 backdrop-blur-xl max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Start Your Analysis</CardTitle>
                <CardDescription className="text-slate-400">Upload your resume (PDF/DOCX). Job description is optional but recommended.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="resume" className="text-base">Resume File <span className="text-red-400">*</span></Label>
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:bg-slate-800/50 transition-colors cursor-pointer relative group h-[200px] flex flex-col items-center justify-center">
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                      />
                      <div className="flex flex-col items-center gap-3 group-hover:scale-105 transition-transform pointer-events-none">
                        {file ? (
                          <>
                            <div className="bg-indigo-500/10 p-4 rounded-full">
                              <FileText className="h-10 w-10 text-indigo-400" />
                            </div>
                            <span className="font-medium text-slate-200 text-lg">{file.name}</span>
                            <span className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </>
                        ) : (
                          <>
                            <div className="bg-slate-800 p-4 rounded-full">
                              <UploadCloud className="h-10 w-10 text-slate-500" />
                            </div>
                            <p className="font-medium text-slate-300 text-lg">Click to upload or drag & drop</p>
                            <p className="text-sm text-slate-500">PDF or DOCX (Max 5MB)</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="job-desc" className="text-base">Job Description</Label>
                      <Badge variant="outline" className="text-xs text-slate-400 border-slate-700">Optional</Badge>
                    </div>
                    <Textarea
                      id="job-desc"
                      placeholder="Paste the job description here for targeted keywords analysis..."
                      className="h-[200px] bg-slate-900/50 border-slate-700 resize-none focus:ring-indigo-500 text-slate-300 leading-relaxed"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 text-red-400 bg-red-950/20 border border-red-900/50 p-4 rounded-lg">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                <Button
                  onClick={analyzeResume}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-8 text-xl shadow-xl hover:shadow-indigo-500/20 transition-all rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Analyzing Resume...
                    </>
                  ) : (
                    "Run Free Analysis"
                  )}
                </Button>

              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "ATS Scoring", icon: CheckCircle2, desc: "Get a match score out of 100 based on modern recruiting standards." },
                { title: "Smart Keywords", icon: Lightbulb, desc: "Identify missing keywords crucial for passing automated screeners." },
                { title: "Instant Feedback", icon: FileText, desc: "Detailed breakdown of strengths, weaknesses, and improvement tips." }
              ].map((feature, i) => (
                <div key={i} className="feature-card glass-card p-6 rounded-xl space-y-4 hover:bg-slate-800/50 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold font-display">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="results-container space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold font-display">Analysis Report</h2>
              <Button variant="outline" onClick={() => setResult(null)} className="border-slate-700 hover:bg-slate-800">
                Analyze New Resume
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="score-card glass-card border-none bg-indigo-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-300">Match Percentage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-indigo-400 font-display">{result.matchPercentage}%</div>
                </CardContent>
              </Card>
              <Card className="score-card glass-card border-none bg-purple-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-300">ATS Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-purple-400 font-display">{result.atsScore}/100</div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl">Candidate Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed text-lg">{result.candidateSummary}</p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="h-5 w-5" /> Missing Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.missingKeywords && result.missingKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map((kw: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-red-950/50 text-red-300 border-red-900 px-3 py-1">{kw}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No missing critical keywords found. Great job!</p>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Lightbulb className="h-5 w-5" /> Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px] w-full pr-4">
                    <ul className="space-y-4">
                      {result.improvements?.map((imp: string, i: number) => (
                        <li key={i} className="flex gap-3 text-slate-300">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span className="leading-relaxed">{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
