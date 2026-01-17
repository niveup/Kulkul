import React, { useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const FocusVelocity = ({ data, goal = 0 }) => {
    // Aggregate by DATE (not individual sessions)
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Group sessions by date
        const byDate = {};
        data.forEach((session) => {
            const dateKey = new Date(session.timestamp).toDateString();
            if (!byDate[dateKey]) {
                byDate[dateKey] = { totalMinutes: 0, date: new Date(session.timestamp) };
            }

            // Add minutes (completed or elapsed time from ruined)
            if (session.status === 'completed') {
                byDate[dateKey].totalMinutes += session.minutes || 0;
            } else if (session.elapsedSeconds) {
                byDate[dateKey].totalMinutes += Math.floor(session.elapsedSeconds / 60);
            }
        });

        // Convert to array and take last 7 days
        return Object.values(byDate)
            .sort((a, b) => a.date - b.date)
            .slice(-7)
            .map(({ date, totalMinutes }) => ({
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                value: totalMinutes,
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            }));
    }, [data]);

    const average = useMemo(() => {
        if (!chartData.length) return 0;
        return (chartData.reduce((acc, curr) => acc + curr.value, 0) / chartData.length).toFixed(0);
    }, [chartData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-lg shadow-xl outline-none">
                    <p className="text-white/60 text-xs font-medium mb-1">{payload[0].payload.date}</p>
                    <p className="text-2xl font-semibold text-white tracking-tight">
                        {payload[0].value.toFixed(0)} <span className="text-sm font-normal text-white/50">min</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="w-full h-full flex flex-col">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-lg font-medium text-white">Focus Trend</h3>
                        <p className="text-white/40 text-sm">Last 7 Days</p>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center text-white/30 text-sm font-medium">
                    No data available yet
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-lg font-medium text-white">Focus Trend</h3>
                    <p className="text-white/40 text-sm">Last 7 Days</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-semibold text-white tracking-tight">{average}</p>
                    <p className="text-white/40 text-xs font-medium uppercase tracking-wide">Avg Minutes</p>
                </div>
            </div>

            {/* Minimal Area Chart */}
            <div id="focus-trend-chart" className="flex-1 w-full min-h-0 outline-none">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2997ff" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2997ff" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#2997ff"
                            strokeWidth={2}
                            fill="url(#colorFocus)"
                            animationDuration={1500}
                        />
                        {/* Goal Line */}
                        {goal > 0 && (
                            <ReferenceLine
                                y={goal}
                                stroke="#38bdf8"
                                strokeDasharray="3 3"
                                strokeOpacity={0.5}
                                label={{
                                    value: 'Goal',
                                    position: 'right',
                                    fill: '#38bdf8',
                                    fontSize: 10,
                                    opacity: 0.8
                                }}
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default React.memo(FocusVelocity);
