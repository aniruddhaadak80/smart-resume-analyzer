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
      .from(".upload-card", { y: 30, opacity: 0, duration: 0.8, ease: "back.out(1.7)" }, "-=0.5");
  }, { scope: containerRef, dependencies: [isMounted] });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeResume = async () => {
    if (!file || !jobDescription) {
      setError('Please upload a resume and provide a job description.');
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

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">

        {/* Hero Section */}
        <section className="text-center space-y-4 pt-10">
          <h1 className="hero-text text-4xl md:text-7xl font-bold tracking-tighter">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Resume</span> Analyzer
          </h1>
          <p className="hero-text text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Powered by Gemini AI. Elevate your career by optimizing your resume for every job application.
          </p>
        </section>

        {/* Upload Section */}
        {!result && (
          <Card className="upload-card glass-card border-white/10 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Start Your Analysis</CardTitle>
              <CardDescription>Upload your resume (PDF/DOCX) and paste the job description.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume File</Label>
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:bg-slate-800/50 transition-colors cursor-pointer relative group">
                    <input
                      type="file"
                      id="resume"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                    />
                    <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform pointer-events-none">
                      {file ? (
                        <>
                          <FileText className="h-10 w-10 text-indigo-400" />
                          <span className="font-medium text-slate-200">{file.name}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-10 w-10 text-slate-500" />
                          <span className="text-slate-400">Click to upload or drag & drop</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-desc">Job Description</Label>
                  <Textarea
                    id="job-desc"
                    placeholder="Paste the job description here..."
                    className="h-[140px] bg-slate-900/50 border-slate-700 resize-none focus:ring-indigo-500"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-950/30 p-3 rounded-md">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                onClick={analyzeResume}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-indigo-500/25 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                  </>
                ) : (
                  "Analyze Now"
                )}
              </Button>

            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {result && (
          <div className="results-container space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Analysis Report</h2>
              <Button variant="outline" onClick={() => setResult(null)}>Analyze New</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="score-card glass-card border-none bg-indigo-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-300">Match Percentage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-indigo-400">{result.matchPercentage}%</div>
                </CardContent>
              </Card>
              <Card className="score-card glass-card border-none bg-purple-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-300">ATS Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-400">{result.atsScore}/100</div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Candidate Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">{result.candidateSummary}</p>
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
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords?.map((kw: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-red-950/50 text-red-300 border-red-900">{kw}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Lightbulb className="h-5 w-5" /> Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] w-full pr-4">
                    <ul className="space-y-3">
                      {result.improvements?.map((imp: string, i: number) => (
                        <li key={i} className="flex gap-2 text-slate-300 text-sm">
                          <span className="text-yellow-500">•</span> {imp}
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
