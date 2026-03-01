import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function HistoricalChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center opacity-20">
                <span className="text-[10px] font-black uppercase tracking-widest italic">
                    Trend Dataset Offline
                </span>
            </div>
        );
    }

    const chartData = [...data].reverse().map((entry) => ({
        date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: entry.score,
    }));

    return (
        <div className="w-full h-full flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--ds-accent)" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="var(--ds-accent)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border)" strokeOpacity={0.1} vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: 'var(--ds-muted)', fontSize: 8, fontWeight: 900 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'var(--ds-muted)', fontSize: 8, fontWeight: 900 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--ds-bg)',
                            border: '1px solid var(--ds-border)',
                            borderRadius: '4px',
                            padding: '8px',
                        }}
                        itemStyle={{ color: 'var(--ds-text)', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}
                        labelStyle={{ color: 'var(--ds-muted)', fontSize: '7px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="var(--ds-accent)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        dot={{ fill: 'var(--ds-bg)', stroke: 'var(--ds-accent)', r: 2, strokeWidth: 1.5 }}
                        activeDot={{ r: 4, fill: 'var(--ds-accent)', stroke: 'var(--ds-bg)' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
