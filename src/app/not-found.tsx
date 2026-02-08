'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, FileX } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />

            <div className="text-center space-y-8 max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative inline-block"
                >
                    <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full" />
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl relative z-10 shadow-2xl">
                        <FileX className="h-24 w-24 text-teal-400 mx-auto" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white font-display">
                        404
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-200">
                        Resume Not Found (Or Page)
                    </h2>
                    <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                        Even AI gets lost sometimes. The page you're searching for seems to have been archived or moved.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4"
                >
                    <Button asChild size="lg" className="rounded-full px-8 bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 w-full md:w-auto transition-all hover:scale-105">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" /> Back Home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-slate-700 text-slate-400 hover:bg-slate-800 w-full md:w-auto transition-all hover:scale-105">
                        <Link href="/dashboard">
                            <Search className="mr-2 h-4 w-4" /> Go to Library
                        </Link>
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="pt-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/40 border border-slate-800 rounded-full text-sm text-slate-500 italic">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        AI is currently re-indexing the universe...
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
