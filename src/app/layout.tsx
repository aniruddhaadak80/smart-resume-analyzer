import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientOnly from "@/components/ClientOnly";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "careerzen | AI-Powered Resume & Interview Coach",
  description: "careerzen helps you land your dream job with AI-powered resume analysis and interview prep. Get instant ATS feedback and tailored interview questions.",
  keywords: ["resume analyzer", "careerzen", "ATS score", "AI resume", "career tools", "job application", "Gemini AI"],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${outfit.variable} ${spaceGrotesk.variable} font-sans antialiased bg-slate-950 text-slate-50`}
          suppressHydrationWarning
        >
          <ToastProvider>
            <div className="flex flex-col min-h-screen">
              <ClientOnly>
                <Navbar />
              </ClientOnly>
              <div className="flex-grow">
                {children}
              </div>
              <ClientOnly>
                <Footer />
              </ClientOnly>
            </div>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
