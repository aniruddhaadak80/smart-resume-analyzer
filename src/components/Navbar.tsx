'use client';

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/60 backdrop-blur-xl transition-all">
            <div className="max-w-6xl mx-auto flex h-20 items-center justify-between px-6 md:px-12">
                <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
                        <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <span className="text-xl font-bold font-display tracking-tight group-hover:text-teal-100 transition-colors">
                        career<span className="text-teal-400">zen</span>
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <div className="hidden md:block mr-2">
                        <a
                            href="https://github.com/aniruddhaadak80/smart-resume-analyzer"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-full hover:scale-105 transition-transform duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-teal-500 animate-gradient-xy opacity-70 blur-md group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center px-4 py-2 bg-slate-950 rounded-full transition-all ease-in duration-75 group-hover:bg-slate-900">
                                <Github className="w-4 h-4 mr-2 text-white group-hover:text-teal-400 transition-colors" />
                                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent font-bold group-hover:from-teal-300 group-hover:to-cyan-300">Star on GitHub</span>
                            </div>
                        </a>
                    </div>
                    <SignedOut>
                        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50">Sign In</Button>
                        </SignInButton>
                        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                            <Button className="bg-teal-500/10 text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 rounded-full">Get Started</Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" prefetch={true} className="text-sm font-medium text-slate-300 hover:text-white hover:underline underline-offset-4 hidden md:inline-block cursor-pointer">
                                Dashboard
                            </Link>
                            <Link href="/optimize" prefetch={true} className="text-sm font-medium text-slate-300 hover:text-white hover:underline underline-offset-4 hidden md:inline-block cursor-pointer">
                                Optimize
                            </Link>
                            <UserButton afterSignOutUrl="/" appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10 ring-2 ring-teal-500/20"
                                }
                            }} />
                        </div>
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}
