'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, MessageSquare, User, Bot, Volume2, Sparkles, Loader2, ChevronRight, PlayCircle } from "lucide-react";
import { transcribeAudio, generateCoachResponse } from '@/app/actions/sarvam';

interface InterviewCoachProps {
    questions: { question: string, answer: string }[];
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export default function InterviewCoach({ questions }: InterviewCoachProps) {
    const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [inputText, setInputText] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [recordingTime, setRecordingTime] = useState(0);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // ... (refs remain same)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    // Timer effect for recording limit
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 29) { // 30s limit - 1s buffer
                        stopRecording();
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const startPractice = (index: number) => {
        setActiveQuestion(index);
        setMessages([
            {
                role: 'assistant',
                content: `Let's practice! Here is the question:\n\n${questions[index].question}\n\nTake a moment to think, then you can type your answer or use the microphone to speak.`,
                timestamp: Date.now()
            }
        ]);
    };

    const stopPractice = () => {
        setActiveQuestion(null);
        setMessages([]);
        setInputText('');
    };


    const FormattedMessage = ({ content }: { content: string }) => {
        // 1. Clean markdown symbols
        const cleanText = content
            .replace(/[*_#`~-]/g, '') // Remove common markdown chars
            .replace(/\n\s*\n/g, '\n'); // Remove extra blank lines

        // 2. Split into lines to check for keywords
        const lines = cleanText.split('\n');

        return (
            <div className="space-y-1">
                {lines.map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={i} className="h-2" />;

                    // Highlighting logic
                    if (trimmed.match(/^(feedback|good|positive|great)/i) || trimmed.includes("✅")) {
                        return (
                            <div key={i} className="text-emerald-300 font-semibold bg-emerald-950/30 px-2 py-1 rounded w-fit mb-1 mt-2">
                                {trimmed}
                            </div>
                        );
                    }
                    if (trimmed.match(/^(improvement|tip|suggest|weak)/i) || trimmed.includes("⚠️") || trimmed.includes("💡")) {
                        return (
                            <div key={i} className="text-amber-300 font-semibold bg-amber-950/30 px-2 py-1 rounded w-fit mb-1 mt-2">
                                {trimmed}
                            </div>
                        );
                    }
                    if (trimmed.match(/^(question|next|ask|follow)/i) || trimmed.includes("❓") || trimmed.includes("🤔")) {
                        return (
                            <div key={i} className="text-blue-300 font-semibold bg-blue-950/30 px-2 py-1 rounded w-fit mb-1 mt-2">
                                {trimmed}
                            </div>
                        );
                    }

                    // Numbered lists highlighting
                    if (trimmed.match(/^\d+\./)) {
                        return (
                            <div key={i} className="pl-2 border-l-2 border-slate-600 ml-1 text-slate-200">
                                {trimmed}
                            </div>
                        );
                    }

                    return <p key={i} className="text-slate-200">{trimmed}</p>;
                })}
            </div>
        );
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        const newMessages = [
            ...messages,
            { role: 'user', content: text, timestamp: Date.now() }
        ] as Message[];

        setMessages(newMessages);
        setInputText('');
        setIsProcessing(true);

        try {
            // Prepare context for the AI
            const history = newMessages
                .filter((m, i) => !(i === 0 && m.role === 'assistant'))
                .map(m => ({
                    role: m.role,
                    content: m.content
                }));

            if (history.length <= 2) {
                const context = `You are an expert Interview Coach. 
          The user is practicing this question: "${questions[activeQuestion!].question}".
          The suggested answer/tip was: "${questions[activeQuestion!].answer}".
          
          Analyze the user's response. Structure your response efficiently.
          
          Use these exact headers to separate sections:
          ✅ FEEDBACK: (Positive aspects)
          💡 TIPS: (Improvements)
          🤔 QUESTION: (Follow-up)
          
          CRITICAL INSTRUCTIONS:
          - DO NOT use bold (**), italics (*), or headers (###).
          - Keep it plain text.
          - Be concise.`;

                history.unshift({ role: 'system', content: context } as any);
            }

            const response = await generateCoachResponse(history);

            if (response.success && response.content) {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: response.content, timestamp: Date.now() }
                ]);
            } else {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: "Sorry, I couldn't generate a response. Please try again.", timestamp: Date.now() }
                ]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    // ... (keep recording functions) ...

    // Update render:
    // Replace the message content div
    // ...

    // ...


    // ... (rest of startRecording, stopRecording remains same)

    // Render loop snippet:

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // webm is standard for MediaRecorder
                // const audioFile = new File([audioBlob], "voice_input.webm", { type: 'audio/webm' });

                setIsProcessing(true); // Show loading while transcribing

                // Convert Blob to File for formData
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');

                try {
                    const result = await transcribeAudio(formData);
                    if (result.success && result.text) {
                        handleSendMessage(result.text); // Send transcribed text as user message
                    } else {
                        // Handle error
                        console.error("Transcription failed", result.error);
                        setMessages(prev => [
                            ...prev,
                            { role: 'assistant', content: "I had trouble hearing that. Could you try speaking again or typing your answer?", timestamp: Date.now() }
                        ]);
                        setIsProcessing(false);
                    }
                } catch (err) {
                    console.error(err);
                    setIsProcessing(false);
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please ensuring permission is granted.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <Card className="glass-card border-t-4 border-t-teal-500 w-full">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-2xl font-display text-white">
                        <Sparkles className="text-teal-400 h-6 w-6" /> AI Interview Coach
                    </CardTitle>
                    <p className="text-slate-400 mt-2">Practice your answers with real-time AI feedback.</p>
                </div>
                {activeQuestion !== null && (
                    <Button variant="ghost" onClick={stopPractice} className="text-slate-400 hover:text-white">
                        Exit Practice
                    </Button>
                )}
            </CardHeader>

            <CardContent className="p-0">
                <AnimatePresence mode="wait">
                    {activeQuestion === null ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-6 space-y-4"
                        >
                            <ScrollArea className="h-[400px] w-full pr-4">
                                <div className="space-y-4">
                                    {questions.map((q, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-slate-950/30 p-5 rounded-xl border border-slate-800/50 hover:border-teal-500/30 transition-colors group cursor-pointer"
                                            onClick={() => startPractice(i)}
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h4 className="text-base font-medium text-slate-200 mb-2 group-hover:text-teal-300 transition-colors">
                                                        {q.question}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 line-clamp-1 italic">
                                                        Tip: {q.answer}
                                                    </p>
                                                </div>
                                                <Button size="sm" className="bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white shrink-0">
                                                    Practice <ChevronRight className="h-4 w-4 ml-1" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-[500px]"
                        >
                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-6">
                                    {messages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.role === 'assistant' && (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
                                                    <Sparkles className="h-5 w-5 text-white" />
                                                </div>
                                            )}

                                            <div className={`
                        max-w-[85%] rounded-2xl p-5 text-[15px] leading-7 shadow-xl
                        ${msg.role === 'user'
                                                    ? 'bg-slate-800 text-slate-200 rounded-tr-none border border-slate-700'
                                                    : 'bg-gradient-to-br from-indigo-900/90 to-slate-900/90 text-white rounded-tl-none border border-indigo-500/30 backdrop-blur-md'}
                      `}>
                                                {msg.role === 'assistant' ? (
                                                    <FormattedMessage content={msg.content} />
                                                ) : (
                                                    <p className="whitespace-pre-wrap font-light tracking-wide">{msg.content}</p>
                                                )}
                                            </div>

                                            {msg.role === 'user' && (
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0 border border-slate-600">
                                                    <User className="h-5 w-5 text-slate-300" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}

                                    {isProcessing && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                                            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0 border border-teal-500/30">
                                                <Bot className="h-4 w-4 text-teal-400" />
                                            </div>
                                            <div className="bg-slate-800/50 rounded-2xl p-4 rounded-tl-none flex items-center gap-2 text-slate-400 text-sm">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            </ScrollArea>

                            <div className="p-4 bg-slate-950/50 border-t border-slate-800/50 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <Button
                                        size="icon"
                                        variant={isRecording ? "destructive" : "secondary"}
                                        className={`rounded-full h-12 w-12 transition-all ${isRecording ? 'animate-pulse ring-4 ring-red-500/20' : 'hover:bg-slate-700'}`}
                                        onClick={isRecording ? stopRecording : startRecording}
                                        disabled={isProcessing}
                                    >
                                        {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                    </Button>

                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            className="w-full bg-slate-900/80 border-slate-700 text-slate-200 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent placeholder:text-slate-500"
                                            placeholder={isRecording ? "Listening..." : "Type your answer..."}
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage(inputText)}
                                            disabled={isRecording || isProcessing}
                                        />
                                    </div>

                                    <Button
                                        size="icon"
                                        className="rounded-full h-12 w-12 bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.2)]"
                                        onClick={() => handleSendMessage(inputText)}
                                        disabled={!inputText.trim() || isProcessing || isRecording}
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* Voice Wave Animation Hint */}
                                <AnimatePresence>
                                    {isRecording && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex items-center justify-center gap-1 mt-2 h-4">
                                                {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((n, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ height: [4, n * 3, 4] }}
                                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                                                        className={`w-1 rounded-full ${recordingTime > 20 ? 'bg-red-500' : 'bg-teal-500'}`}
                                                    />
                                                ))}
                                                <span className={`text-xs ml-2 font-medium ${recordingTime > 20 ? 'text-red-400' : 'text-teal-400'}`}>
                                                    Recording... {30 - recordingTime}s left
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
