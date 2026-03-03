import { Download, ShieldCheck, Award, TrendingUp, UserCheck, Search, Database } from 'lucide-react';
import RadarChart from './RadarChart';

export default function ReportTab({ user, score, history, repos }) {
    const handlePrint = () => {
        window.print();
    };

    const topRepos = [...repos].sort((a, b) => (b.audit?.architecture_score || 0) - (a.audit?.architecture_score || 0)).slice(0, 3);

    return (
        <div className="space-y-8 animate-premium-fade-in print:bg-white print:text-black">
            <header className="flex justify-end print:hidden">
                <button
                    onClick={handlePrint}
                    className="btn-premium flex items-center gap-2"
                >
                    <Download size={14} />
                    Export Report
                </button>
            </header>

            {/* The Dossier (Printable Area) */}
            <div className="ds-panel p-6 sm:p-10 md:p-16 space-y-12 md:space-y-20 relative bg-ds-bg font-sans print:p-0 print:border-0 print:bg-transparent overflow-hidden">
                <div className="absolute top-0 right-0 p-10 print:hidden">
                    <ShieldCheck size={120} className="text-ds-accent/[0.03]" />
                </div>

                {/* Header Block */}
                <section className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-ds-border pb-12 gap-8 print:border-black/20">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Database size={24} className="text-ds-accent print:text-black" />
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-ds-text print:text-black">DevScore Report</h1>
                        </div>
                        <div className="space-y-1">
                            <p className="ds-label text-ds-brand print:text-blue-700">Status: Verified</p>
                            <p className="text-[10px] text-ds-muted font-black uppercase tracking-widest print:text-neutral-500">Account ID: {user?.id || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <h3 className="text-sm font-black text-ds-text uppercase tracking-widest print:text-black">{user?.username}</h3>
                        <p className="text-[10px] text-ds-muted uppercase tracking-widest print:text-neutral-500">Current Tier: {user?.tier || 'Baseline'}</p>
                    </div>
                </section>

                {/* Core Metrics Block */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center">
                    <div className="h-[280px] sm:h-[350px] md:h-[400px] print:h-[300px]">
                        <RadarChart data={score} />
                    </div>
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h3 className="text-[10px] md:text-xs font-black uppercase text-ds-muted tracking-widest">Overall DevScore</h3>
                            <div className="flex items-end gap-3 font-display">
                                <span className="text-6xl sm:text-7xl md:text-8xl font-black text-ds-text print:text-black leading-none tracking-tighter">{Math.round(user?.dev_score || 0)}</span>
                                <span className="text-sm sm:text-base md:text-xl text-ds-muted mb-2 sm:mb-3 opacity-40">/ 100</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 border-t border-ds-border pt-8 print:border-black/10">
                            {[
                                { label: 'Discipline', val: score?.discipline },
                                { label: 'Engineering', val: score?.engineering_depth },
                                { label: 'Collaboration', val: score?.collaboration },
                                { label: 'Consistency', val: score?.consistency }
                            ].map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <span className="ds-label text-[8px] opacity-40">{item.label}</span>
                                    <span className="text-lg font-black text-ds-text print:text-black">{item.val || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Top Audited Repositories Block */}
                <section className="space-y-8">
                    <h3 className="text-xs font-black uppercase text-ds-muted tracking-widest flex items-center gap-3">
                        <Search size={14} className="opacity-40" />
                        Top Assessed Repositories
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {topRepos.map((repo, i) => (
                            <div key={i} className="p-6 border border-ds-border bg-ds-accent/[0.02] rounded-xl space-y-4 print:border-black/10 print:bg-neutral-50">
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-wider text-ds-text print:text-black truncate">{repo.name}</h4>
                                    <p className="text-[8px] text-ds-muted font-bold uppercase tracking-widest">{repo.primary_language}</p>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-black text-ds-text print:text-black">{repo.audit?.architecture_score || repo.stars}</span>
                                    <span className="text-[8px] text-ds-muted mb-1 opacity-40">VQ</span>
                                </div>
                                <p className="text-[9px] text-ds-muted leading-relaxed line-clamp-3 italic">
                                    {repo.audit?.summary || "Standard repository metrics verification and code checks."}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Evolution History Block */}
                <section className="space-y-8">
                    <h3 className="text-xs font-black uppercase text-ds-muted tracking-widest flex items-center gap-3">
                        <TrendingUp size={14} className="opacity-40" />
                        Score History
                    </h3>
                    <div className="h-32 flex items-end gap-1 border-b border-ds-border pb-2 print:border-black/10">
                        {history.slice(-20).map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-ds-brand/20 hover:bg-ds-brand/40 transition-colors print:bg-blue-200"
                                style={{ height: `${(h.dev_score / 100) * 100}%` }}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-ds-muted text-[8px] font-black uppercase tracking-widest opacity-40">
                        <span>Start Point</span>
                        <span>Current Snapshot</span>
                    </div>
                </section>

                {/* Footer Signature Block */}
                <footer className="pt-20 border-t border-ds-border flex justify-between items-center print:border-black/10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <UserCheck size={14} className="text-ds-success" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-ds-text print:text-black">Verified Developer</span>
                        </div>
                        <p className="text-[8px] text-ds-muted font-medium max-w-xs leading-loose opacity-40">
                            This report is generated based on an analysis of your open-source repositories and GitHub activity.
                        </p>
                    </div>
                    <div className="p-6 border border-ds-border rounded-xl bg-ds-accent/[0.02] print:border-black/10 print:bg-neutral-50">
                        <Award size={32} className="text-ds-accent/20 print:text-black/10" />
                    </div>
                </footer>
            </div>
        </div>
    );
}
