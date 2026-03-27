import {
    Radar,
    RadarChart as RechartsRadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts';

const CATEGORY_LABELS = {
    engineering_depth: 'Engineering',
    discipline: 'Discipline',
    collaboration: 'Collaboration',
    consistency: 'Consistency',
    oss_impact: 'OSS Impact',
};

export default function RadarChart({ data }) {
    const chartData = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
        category: label,
        score: data?.[key] || 0,
        baseline: 65, // Industrial Baseline (Standardized)
        fullMark: 100,
    }));

    return (
        <div className="w-full h-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsRadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                    <PolarGrid stroke="var(--ds-border)" strokeOpacity={0.1} />
                    <PolarAngleAxis
                        dataKey="category"
                        tick={{
                            fill: 'var(--ds-muted)',
                            fontSize: 8,
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    {/* Market Baseline */}
                    <Radar
                        name="Market Baseline"
                        dataKey="baseline"
                        stroke="var(--ds-accent)"
                        strokeOpacity={0.15}
                        strokeDasharray="4 4"
                        fill="transparent"
                        strokeWidth={1}
                        dot={false}
                    />
                    {/* User Score */}
                    <Radar
                        name="Score"
                        dataKey="score"
                        stroke="var(--ds-accent)"
                        fill="var(--ds-accent)"
                        fillOpacity={0.08}
                        strokeWidth={2}
                        animationBegin={300}
                        dot={{ r: 2, fill: 'var(--ds-accent)' }}
                    />
                </RechartsRadarChart>
            </ResponsiveContainer>

            <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-0.5 bg-ds-accent" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-ds-accent">
                        Identity Vector
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-0.5 border-t border-ds-accent/20 border-dashed" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-ds-accent/30">
                        Industry Baseline
                    </span>
                </div>
            </div>
        </div>
    );
}
