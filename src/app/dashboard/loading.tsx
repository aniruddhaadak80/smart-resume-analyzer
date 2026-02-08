export default function DashboardLoading() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-slate-800 rounded animate-pulse"></div>
                        <div className="h-4 w-28 bg-slate-800 rounded animate-pulse"></div>
                    </div>
                    <div className="h-9 w-40 bg-slate-800 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-slate-800 rounded animate-pulse"></div>

                    {/* Search Bar Skeleton */}
                    <div className="h-12 w-full bg-slate-900 border border-slate-800 rounded-lg animate-pulse"></div>
                </div>

                {/* Cards Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-slate-800 rounded-full animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 w-48 bg-slate-800 rounded animate-pulse"></div>
                                    <div className="h-4 w-32 bg-slate-800 rounded animate-pulse"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-8 w-16 bg-slate-800 rounded animate-pulse"></div>
                                    <div className="h-8 w-16 bg-slate-800 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
