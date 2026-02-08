export default function ResumeLoading() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-800 rounded"></div>
                        <div className="h-8 w-64 bg-slate-800 rounded"></div>
                        <div className="h-4 w-48 bg-slate-800 rounded"></div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-10 w-32 bg-slate-800 rounded"></div>
                        <div className="h-10 w-36 bg-slate-800 rounded"></div>
                    </div>
                </div>

                {/* Content Grid Skeleton */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-40"></div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-48"></div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-32"></div>
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-32"></div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-72"></div>
                    </div>
                </div>
            </div>
        </main>
    );
}
