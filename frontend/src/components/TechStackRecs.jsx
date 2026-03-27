import { useState, useEffect } from 'react';
import {
    getTechRecommendations,
    dismissTechRecommendation,
    regenerateTechRecommendations,
} from '../lib/api';
import {
    Sparkles,
    ExternalLink,
    X,
    RefreshCw,
    Code2,
    Wrench,
    Cloud,
    BookOpen,
    Lightbulb,
} from 'lucide-react';

const CATEGORY_CONFIG = {
    language: {
        label: 'Language',
        icon: Code2,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
    },
    framework: {
        label: 'Framework',
        icon: Wrench,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
    },
    tool: {
        label: 'Tool',
        icon: Wrench,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
    },
    cloud: {
        label: 'Cloud',
        icon: Cloud,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
    },
    practice: {
        label: 'Practice',
        icon: Lightbulb,
        color: 'text-pink-400',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
    },
};

const PRIORITY_STYLES = {
    high: {
        label: 'HIGH PRIORITY',
        bg: 'bg-ds-danger/10',
        text: 'text-ds-danger',
        border: 'border-ds-danger/20',
    },
    medium: {
        label: 'RECOMMENDED',
        bg: 'bg-ds-warning/10',
        text: 'text-ds-warning',
        border: 'border-ds-warning/20',
    },
    low: {
        label: 'NICE TO HAVE',
        bg: 'bg-ds-accent/10',
        text: 'text-ds-accent',
        border: 'border-ds-accent/20',
    },
};

export default function TechStackRecs() {
    const [techRecs, setTechRecs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const fetchTechRecs = async () => {
        try {
            const res = await getTechRecommendations();
            if (Array.isArray(res.data)) {
                setTechRecs(res.data);
            } else {
                setTechRecs([]);
                console.error('Tech recs response is not an array:', res.data);
            }
        } catch (err) {
            console.error('Failed to fetch tech recs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTechRecs();
    }, []);

    const handleDismiss = async (id) => {
        try {
            await dismissTechRecommendation(id);
            setTechRecs((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error('Failed to dismiss:', err);
        }
    };

    const handleRegenerate = async () => {
        setRefreshing(true);
        try {
            await regenerateTechRecommendations();

            let tries = 0;
            const pollMax = 10;

            const poll = async () => {
                const res = await getTechRecommendations();
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setTechRecs(res.data);
                    setRefreshing(false);
                    return;
                }

                tries++;
                if (tries < pollMax) {
                    setTimeout(poll, 3000);
                } else {
                    setRefreshing(false);
                }
            };

            setTimeout(poll, 3000);
        } catch (err) {
            console.error('Failed to regenerate:', err);
            setRefreshing(false);
        }
    };

    const filteredRecs =
        activeFilter === 'all' ? techRecs : techRecs.filter((r) => r.category === activeFilter);

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'language', label: 'Languages' },
        { key: 'framework', label: 'Frameworks' },
        { key: 'tool', label: 'Tools' },
        { key: 'cloud', label: 'Cloud' },
        { key: 'practice', label: 'Practices' },
    ];

    if (loading) {
        return (
            <div className="ds-panel py-12 flex items-center justify-center">
                <div className="animate-pulse text-ds-muted text-[10px] font-black uppercase tracking-widest">
                    Loading Tech Recommendations...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-ds-accent/10 rounded-lg border border-ds-accent/20">
                        <Sparkles className="text-ds-accent" size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-ds-text uppercase tracking-tight">
                            Tech Stack Recommendations
                        </h3>
                        <p className="text-[10px] text-ds-muted">
                            AI-powered learning path suggestions
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleRegenerate}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-1.5 bg-ds-accent/5 hover:bg-ds-accent/10 border border-ds-border rounded text-[9px] font-black uppercase tracking-wider text-ds-muted hover:text-ds-text transition-all"
                >
                    <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="flex gap-2 flex-wrap">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all ${
                            activeFilter === filter.key
                                ? 'bg-ds-accent text-ds-bg'
                                : 'bg-ds-accent/5 text-ds-muted hover:text-ds-text border border-ds-border'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {filteredRecs.length === 0 ? (
                <div className="ds-panel py-16 text-center border-dashed border-ds-border/20">
                    <Sparkles className="text-ds-muted/20 mx-auto mb-4" size={32} />
                    <h4 className="text-[11px] font-black text-ds-text uppercase opacity-40">
                        No recommendations yet
                    </h4>
                    <p className="text-[9px] text-ds-muted mt-2">
                        Run an analysis to get personalized tech suggestions
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRecs.map((rec) => {
                        const catConfig = CATEGORY_CONFIG[rec.category] || CATEGORY_CONFIG.tool;
                        const CatIcon = catConfig.icon;
                        const priority = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.medium;
                        const resources = rec.learning_resources || {};

                        return (
                            <div key={rec.id} className="ds-panel group relative">
                                <button
                                    onClick={() => handleDismiss(rec.id)}
                                    className="absolute top-3 right-3 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-ds-danger/10 transition-all"
                                >
                                    <X size={14} className="text-ds-muted hover:text-ds-danger" />
                                </button>

                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-10 h-10 shrink-0 rounded-lg ${catConfig.bg} border ${catConfig.border} flex items-center justify-center`}
                                    >
                                        <CatIcon size={18} className={catConfig.color} />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${priority.border} ${priority.bg} ${priority.text}`}
                                            >
                                                {priority.label}
                                            </span>
                                            <span
                                                className={`text-[7px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${catConfig.bg} ${catConfig.color}`}
                                            >
                                                {catConfig.label}
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="text-[13px] font-black text-ds-text uppercase tracking-tight">
                                                {rec.technology}
                                            </h4>
                                            <p className="text-[10px] text-ds-muted leading-relaxed mt-1">
                                                {rec.reason}
                                            </p>
                                        </div>

                                        {rec.career_impact && (
                                            <div className="p-2 bg-ds-accent/5 rounded border border-ds-accent/10">
                                                <p className="text-[8px] text-ds-accent font-medium">
                                                    💼 {rec.career_impact}
                                                </p>
                                            </div>
                                        )}

                                        {Object.keys(resources).length > 0 && (
                                            <div className="flex gap-2 flex-wrap pt-1">
                                                {resources.beginner && (
                                                    <a
                                                        href={resources.beginner}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[8px] font-bold text-ds-text hover:text-ds-brand transition-colors"
                                                    >
                                                        <BookOpen size={10} />
                                                        Beginner
                                                    </a>
                                                )}
                                                {resources.intermediate && (
                                                    <a
                                                        href={resources.intermediate}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[8px] font-bold text-ds-text hover:text-ds-brand transition-colors"
                                                    >
                                                        <BookOpen size={10} />
                                                        Intermediate
                                                    </a>
                                                )}
                                                {resources.advanced && (
                                                    <a
                                                        href={resources.advanced}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[8px] font-bold text-ds-text hover:text-ds-brand transition-colors"
                                                    >
                                                        <BookOpen size={10} />
                                                        Advanced
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
