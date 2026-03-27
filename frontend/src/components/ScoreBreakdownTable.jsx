import FlameIcon from './ui/flame-icon';
import TerminalIcon from './ui/terminal-icon';
import UsersIcon from './ui/users-icon';
import UnlinkIcon from './ui/unlink-icon';
import SparklesIcon from './ui/sparkles-icon';

const CATEGORIES = [
    { key: 'engineering_depth', label: 'Engineering Depth', icon: FlameIcon },
    { key: 'discipline', label: 'Code Discipline', icon: TerminalIcon },
    { key: 'collaboration', label: 'Collaboration', icon: UsersIcon },
    { key: 'consistency', label: 'Consistency', icon: UnlinkIcon },
    { key: 'oss_impact', label: 'OSS Impact', icon: SparklesIcon },
];

export default function ScoreBreakdownTable({ data }) {
    if (!data || !data.last_calculated) return null;

    return (
        <div className="flex flex-col w-full h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-ds-border">
                {CATEGORIES.map((cat, i) => {
                    const score = data[cat.key] || 0;
                    const Icon = cat.icon;

                    return (
                        <div
                            key={cat.key}
                            className="bg-ds-bg-subtle p-6 space-y-4 group animate-premium-fade-in"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-2.5 rounded bg-ds-accent/5 border border-ds-border text-ds-muted group-hover:text-ds-text transition-colors">
                                    <Icon size={18} />
                                </div>
                                <span className="ds-value text-lg tracking-tighter">
                                    {Math.round(score)}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black tracking-tight text-ds-muted group-hover:text-ds-text transition-colors uppercase">
                                    {cat.label}
                                </h4>
                                <div className="h-1 w-full bg-ds-accent/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-ds-accent transition-all duration-1000"
                                        style={{ width: `${score}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
