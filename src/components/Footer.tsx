'use client';

import { Github, Twitter, Linkedin, Globe, Mail, Code2, Cpu, Send, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="border-t border-slate-900 bg-slate-950 relative z-20 py-12">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* Left: Branding */}
                <div className="flex justify-center md:justify-start">
                    <Link href="/" className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Image src="/logo.png" alt="logo" fill className="object-contain" />
                        </div>
                        <span className="font-bold text-slate-500 group-hover:text-slate-300 transition-colors">careerzen</span>
                    </Link>
                </div>

                {/* Center: Social Icons */}
                <div className="flex flex-wrap justify-center gap-6 text-slate-500">
                    <a href="https://www.linkedin.com/in/aniruddha-adak" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="cursor-pointer"><Linkedin className="h-5 w-5 hover:text-white transition-colors" /></a>
                    <a href="https://github.com/aniruddhaadak80" target="_blank" rel="noopener noreferrer" title="GitHub" className="cursor-pointer"><Github className="h-5 w-5 hover:text-white transition-colors" /></a>
                    <a href="https://x.com/aniruddhadak" target="_blank" rel="noopener noreferrer" title="Twitter / X" className="cursor-pointer"><Twitter className="h-5 w-5 hover:text-white transition-colors" /></a>
                    <a href="https://dev.to/aniruddhaadak" target="_blank" rel="noopener noreferrer" title="Dev Profile" className="cursor-pointer"><Code2 className="h-5 w-5 hover:text-white transition-colors" /></a>
                    <a href="https://codepen.io/aniruddhaadak" target="_blank" rel="noopener noreferrer" title="CodePen" className="cursor-pointer"><Cpu className="h-5 w-5 hover:text-white transition-colors" /></a>
                    <a href="https://aniruddha-adak.vercel.app" target="_blank" rel="noopener noreferrer" title="Portfolio" className="cursor-pointer"><Globe className="h-5 w-5 hover:text-white transition-colors" /></a>
                    <a href="mailto:aniruddhaadak80@gmail.com" title="Email" className="cursor-pointer"><Mail className="h-5 w-5 hover:text-white transition-colors" /></a>
                    <a href="https://t.me/aniruddhaadak" target="_blank" rel="noopener noreferrer" title="Telegram" className="cursor-pointer"><Send className="h-5 w-5 hover:text-white transition-colors" /></a>
                    <a href="https://linktr.ee/aniruddha.adak" target="_blank" rel="noopener noreferrer" title="Linktree" className="cursor-pointer"><LinkIcon className="h-5 w-5 hover:text-white transition-colors" /></a>
                </div>

                {/* Right: Copyright */}
                <div className="text-sm text-slate-600 text-center md:text-right">
                    © 2026 careerzen. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
