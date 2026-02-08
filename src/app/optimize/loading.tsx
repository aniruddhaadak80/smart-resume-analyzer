export default function OptimizeLoading() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto animate-pulse">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="h-4 w-32 bg-slate-800 rounded mb-4"></div>
                    <div className="flex items-center gap-3">
                        <div className="h-14 w-14 bg-slate-800 rounded-xl"></div>
                        <div className="space-y-2">
                            <div className="h-8 w-64 bg-slate-800 rounded"></div>
                            <div className="h-4 w-80 bg-slate-800 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Input Areas Skeleton */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="h-6 w-40 bg-slate-800 rounded mb-4"></div>
                        <div className="h-96 bg-slate-800/50 rounded"></div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="h-6 w-48 bg-slate-800 rounded mb-4"></div>
                        <div className="h-96 bg-slate-800/50 rounded"></div>
                    </div>
                </div>

                {/* Button Skeleton */}
                <div className="flex justify-center mt-6">
                    <div className="h-16 w-64 bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-xl"></div>
                </div>
            </div>
        </main>
    );
}
