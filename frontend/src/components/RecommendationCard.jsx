import { Lightbulb } from 'lucide-react';
import FlameIcon from './ui/flame-icon';
import TerminalIcon from './ui/terminal-icon';
import UsersIcon from './ui/users-icon';
import UnlinkIcon from './ui/unlink-icon';
import SparklesIcon from './ui/sparkles-icon';

const PRIORITY_STYLES = {
    high: { bg: 'bg-ds-danger/10', text: 'text-ds-danger', border: 'border-ds-danger/20', label: 'CRITICAL' },
    medium: { bg: 'bg-ds-warning/10', text: 'text-ds-warning', border: 'border-ds-warning/20', label: 'RECOMMENDED' },
    low: { bg: 'bg-ds-accent/10', text: 'text-ds-accent', border: 'border-ds-accent/20', label: 'ENHANCEMENT' },
};

const CATEGORIES = [
    { key: 'engineering_depth', label: 'Engineering Depth', icon: FlameIcon },
    { key: 'discipline', label: 'Code Discipline', icon: TerminalIcon },
    { key: 'collaboration', label: 'Collaboration', icon: UsersIcon },
    { key: 'consistency', label: 'Consistency', icon: UnlinkIcon },
    { key: 'oss_impact', label: 'OSS Impact', icon: SparklesIcon },
];

export default function RecommendationCard({ recommendation }) {
    const priority = PRIORITY_STYLES[recommendation.priority] || PRIORITY_STYLES.medium;
    const category = CATEGORIES.find(cat => cat.key === recommendation.category);
    const Icon = category ? category.icon : Lightbulb;

    return (
        <div className="ds-panel group transition-all duration-300">
            <div className="flex items-start gap-4">
                <div className="w-8 h-8 shrink-0 rounded bg-ds-accent/5 border border-ds-border flex items-center justify-center text-ds-muted group-hover:text-ds-text transition-colors">
                    <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${priority.border} ${priority.bg} ${priority.text}`}>
                            {priority.label}
                        </span>
                        <span className="ds-label opacity-40">#{recommendation.category.slice(0, 3)}</span>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-[12px] font-black text-ds-text uppercase tracking-tight leading-tight">
                            {recommendation.title}
                        </h4>
                        <p className="text-[10px] text-ds-muted leading-relaxed">
                            {recommendation.description}
                        </p>
                    </div>

                    {recommendation.action_url && (
                        <a
                            href={recommendation.action_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[9px] font-black text-ds-text uppercase tracking-[0.2em] hover:text-ds-brand transition-colors pt-1"
                        >
                            Execute Resolve
                            <span className="opacity-40">→</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
