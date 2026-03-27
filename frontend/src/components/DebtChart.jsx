import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

export default function DebtChart({ repos }) {
    // Calculate aggregate "Debt" metrics across all repos
    const metrics = [
        { label: 'No CI/CD', count: repos.filter((r) => !r.has_ci).length, color: '#ef4444' },
        { label: 'No Tests', count: repos.filter((r) => !r.has_tests).length, color: '#f59e0b' },
        {
            label: 'No Container',
            count: repos.filter((r) => !r.has_docker).length,
            color: '#3b82f6',
        },
        { label: 'No Linting', count: repos.filter((r) => !r.has_lint).length, color: '#10b981' },
    ].filter(() => repos.length > 0);

    const chartData = metrics.map((m) => ({
        name: m.label,
        count: (m.count / repos.length) * 100, // Percentage of repos with this "debt"
        displayCount: m.count,
    }));

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tick={{
                            fill: 'var(--ds-muted)',
                            fontSize: 8,
                            fontWeight: 900,
                            textTransform: 'uppercase',
                        }}
                        width={80}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--ds-bg)',
                            border: '1px solid var(--ds-border)',
                            fontSize: '10px',
                        }}
                        itemStyle={{ color: 'var(--ds-text)' }}
                        formatter={(value) => [`${Math.round(value)}% Frequency`, 'Vector Impact']}
                        cursor={{ fill: 'var(--ds-accent)', fillOpacity: 0.02 }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={metrics[index].color}
                                fillOpacity={0.4}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
