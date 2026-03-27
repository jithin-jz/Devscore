import ScanBarcodeIcon from './ui/scan-barcode-icon';
import RefreshIcon from './ui/refresh-icon';
import CheckedIcon from './ui/checked-icon';
import TriangleAlertIcon from './ui/triangle-alert-icon';
import BulbIcon from './ui/bulb-icon';
import { useState } from 'react';
import { auditRepository } from '../lib/api';

export default function AuditorTab({ repos, onRefresh }) {
    const [auditing, setAuditing] = useState(null);

    const handleAudit = async (repoId) => {
        setAuditing(repoId);
        try {
            await auditRepository(repoId);

            // Start polling for the audit results
            let attempts = 0;
            const poll = setInterval(async () => {
                attempts++;
                const result = await onRefresh();

                // Find if the repo now has an audit in the NEW list
                const repo = result?.repos?.find((r) => r.id === repoId);
                if (repo?.audit || attempts > 60) {
                    clearInterval(poll);
                    setAuditing(null);
                }
            }, 5000);
        } catch (err) {
            console.error(err);
            setAuditing(null);
        }
    };

    return (
        <div className="space-y-8 animate-premium-fade-in">
            <div className="grid grid-cols-1 gap-6">
                {repos.map((repo) => (
                    <div
                        key={repo.id}
                        className="ds-panel p-6 space-y-6 group hover:bg-ds-accent/[0.01]"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-sm font-black text-ds-text uppercase tracking-wider">
                                    {repo.name}
                                </h3>
                                <p className="text-[10px] text-ds-muted font-bold uppercase tracking-widest">
                                    {repo.primary_language || 'Unknown Stack'}
                                </p>
                            </div>
                            <button
                                onClick={() => handleAudit(repo.id)}
                                disabled={auditing === repo.id}
                                className={`px-4 py-2 flex items-center gap-2 ${repo.audit ? 'btn-subtle' : 'btn-premium'}`}
                            >
                                {auditing === repo.id ? (
                                    <RefreshIcon size={12} className="animate-spin" />
                                ) : (
                                    <>
                                        {repo.audit ? (
                                            <RefreshIcon size={12} />
                                        ) : (
                                            <ScanBarcodeIcon size={12} color="var(--ds-bg)" />
                                        )}
                                        {repo.audit ? 'Re-Scan' : 'Run Audit'}
                                    </>
                                )}
                            </button>
                        </div>

                        {repo.audit ? (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6 border-t border-ds-border">
                                <div className="md:col-span-4 space-y-4">
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black text-ds-text">
                                            {repo.audit.architecture_score}
                                        </span>
                                        <span className="ds-label mb-1 opacity-40">/ 100</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="ds-label">Structure Summary</span>
                                        <p className="text-[11px] text-ds-muted leading-relaxed italic">
                                            "{repo.audit.summary}"
                                        </p>
                                    </div>
                                </div>

                                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-ds-success">
                                            <CheckedIcon size={16} />
                                            <span className="ds-label">Strengths</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {repo.audit.strengths.map((s, i) => (
                                                <li
                                                    key={i}
                                                    className="text-[10px] text-ds-text leading-snug"
                                                >
                                                    <span className="font-bold block uppercase text-[8px] text-ds-muted">
                                                        {s.title}
                                                    </span>
                                                    {s.description}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-ds-warning">
                                            <TriangleAlertIcon size={16} />
                                            <span className="ds-label">Potential Risks</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {repo.audit.weaknesses.map((w, i) => (
                                                <li
                                                    key={i}
                                                    className="text-[10px] text-ds-text leading-snug"
                                                >
                                                    <span className="font-bold block uppercase text-[8px] text-ds-muted">
                                                        {w.title}
                                                    </span>
                                                    {w.description}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-ds-brand">
                                            <BulbIcon size={16} />
                                            <span className="ds-label">Suggestions</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {repo.audit.suggestions.map((s, i) => (
                                                <li
                                                    key={i}
                                                    className="text-[10px] text-ds-text leading-snug"
                                                >
                                                    <span className="font-bold block uppercase text-[8px] text-ds-muted">
                                                        {s.title}
                                                    </span>
                                                    {s.description}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-ds-bg-subtle/20 rounded-xl border border-dashed border-ds-border">
                                <ScanBarcodeIcon className="text-ds-muted/20" size={48} />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-ds-muted uppercase tracking-widest">
                                        No Audit Found
                                    </p>
                                    <p className="text-[9px] text-ds-muted/60 max-w-[200px] leading-relaxed">
                                        Run an AI audit to discover what's working well and what can
                                        be improved.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
