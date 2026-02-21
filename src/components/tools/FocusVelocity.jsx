import React, { useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, ReferenceLine, YAxis, XAxis } from 'recharts';
// No lucide-react imports needed for this component currently

const FocusVelocity = ({ data, goal = 0 }) => {
    const [timeRange, setTimeRange] = React.useState(7); // 7, 30, or all days
    // Aggregate by DATE (not individual sessions) - Production Ready
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Group sessions by date using IST for consistency
        const byDate = new Map();

        data.forEach((session) => {
            if (!session || !session.timestamp) return;

            const date = new Date(session.timestamp);
            const dateKey = date.toDateString();

            if (!byDate.has(dateKey)) {
                byDate.set(dateKey, {
                    totalMinutes: 0,
                    completedMinutes: 0,
                    failedMinutes: 0,
                    completedSessions: 0,
                    failedSessions: 0,
                    date: date
                });
            }

            const dayData = byDate.get(dateKey);

            // Add minutes based on session status
            if (session.status === 'completed') {
                const minutes = session.minutes || 0;
                dayData.totalMinutes += minutes;
                dayData.completedMinutes += minutes;
                dayData.completedSessions++;
            } else if (session.status === 'failed' && session.elapsedSeconds) {
                const minutes = Math.floor(session.elapsedSeconds / 60);
                dayData.totalMinutes += minutes;
                dayData.failedMinutes += minutes;
                dayData.failedSessions++;
            }
        });

        // Get data based on selected time range
        const daysToShow = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysToInclude = timeRange === 'all'
            ? Math.max(30, byDate.size) // Show at least 30 days or all available data
            : timeRange;

        for (let i = daysToInclude - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toDateString();

            if (byDate.has(dateKey)) {
                const dayData = byDate.get(dateKey);
                daysToShow.push({
                    name: timeRange === 'all' && daysToShow.length > 0
                        ? (new Date(daysToShow[0].date).getMonth() !== date.getMonth()
                            ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                            : date.getDate().toString())
                        : date.getDate().toString(),
                    value: dayData.totalMinutes,
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    completedMinutes: dayData.completedMinutes,
                    failedMinutes: dayData.failedMinutes,
                    completedSessions: dayData.completedSessions,
                    failedSessions: dayData.failedSessions,
                    efficiency: dayData.completedSessions + dayData.failedSessions > 0
                        ? Math.round((dayData.completedSessions / (dayData.completedSessions + dayData.failedSessions)) * 100)
                        : 0
                });
            } else {
                // Add empty day for consistency
                daysToShow.push({
                    name: timeRange === 'all' && daysToShow.length > 0
                        ? (new Date(daysToShow[0].date).getMonth() !== date.getMonth()
                            ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                            : date.getDate().toString())
                        : date.getDate().toString(),
                    value: 0,
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    completedMinutes: 0,
                    failedMinutes: 0,
                    completedSessions: 0,
                    failedSessions: 0,
                    efficiency: 0
                });
            }
        }

        return daysToShow;
    }, [data, timeRange]);

    // -------------------------------------------------------------------------
    // Average Calculation
    // -------------------------------------------------------------------------
    const averageValue = useMemo(() => {
        if (!chartData.length) return 0;
        const total = chartData.reduce((acc, curr) => acc + curr.value, 0);
        return Math.round(total / chartData.length);
    }, [chartData]);

    const goalProgress = useMemo(() => {
        if (!chartData.length || goal <= 0) return 0;
        const totalMinutes = chartData.reduce((acc, curr) => acc + curr.value, 0);
        const daysCount = timeRange === 'all' ? chartData.length : timeRange;
        return Math.round((totalMinutes / (goal * daysCount)) * 100);
    }, [chartData, goal, timeRange]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/10 backdrop-blur-xl px-4 py-3 rounded-lg shadow-xl outline-none">
                    <p className="text-white/60 text-xs font-medium mb-2">{data.date}</p>
                    <p className="text-2xl font-semibold text-white tracking-tight mb-2">
                        {data.value.toFixed(0)} <span className="text-sm font-normal text-white/50">min</span>
                    </p>
                    {data.completedSessions > 0 || data.failedSessions > 0 ? (
                        <div className="space-y-1 text-xs">
                            {data.completedSessions > 0 && (
                                <p className="text-emerald-400">
                                    ✓ {data.completedSessions} completed ({data.completedMinutes}m)
                                </p>
                            )}
                            {data.failedSessions > 0 && (
                                <p className="text-rose-400">
                                    ✗ {data.failedSessions} interrupted ({data.failedMinutes}m)
                                </p>
                            )}
                        </div>
                    ) : null}
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
                        <h3 className="text-lg font-medium text-white">Focus Timer</h3>
                        <p className="text-white/40 text-sm">Last {timeRange === 'all' ? '30+' : timeRange} Days</p>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center text-white/30 text-sm font-medium">
                    No data available yet
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col pt-2">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-lg font-medium text-white">Focus Timer</h3>
                    <div className="flex gap-2 mt-2">
                        {[7, 30, 'all'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`text-xs px-2 py-1 rounded transition-colors ${timeRange === range
                                    ? 'bg-accent-blue text-white'
                                    : 'text-white/40 hover:text-white/70'
                                    }`}
                            >
                                {range === 'all' ? 'All' : `${range}D`}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-semibold text-white tracking-tight">{averageValue}m</p>
                    <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest mt-1">Average / Day</p>
                </div>
            </div>

            {/* Minimal Area Chart */}
            <div id="focus-trend-chart" className="flex-1 w-full min-h-0 outline-none focus:outline-none" style={{ outline: "none" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: 10, right: 10, top: 20 }}>
                        <defs>
                            <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2997ff" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2997ff" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            tickFormatter={(value) => `${value}m`}
                            dx={-10}
                            domain={[0, 'auto']}
                            allowDataOverflow={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#2997ff"
                            strokeWidth={2}
                            fill="url(#colorFocus)"
                            animationDuration={1500}
                        />

                        {averageValue > 0 && (
                            <ReferenceLine
                                y={averageValue}
                                stroke="rgba(255, 255, 255, 0.4)"
                                strokeDasharray="3 3"
                                strokeWidth={1}
                                label={{
                                    value: `AVG: ${averageValue}m`,
                                    position: 'top',
                                    fill: 'rgba(255, 255, 255, 0.5)',
                                    fontSize: 8,
                                    fontWeight: 'bold',
                                    offset: 10,
                                    letterSpacing: '1px'
                                }}
                            />
                        )}

                        {/* Goal Line */}
                        {goal > 0 && (
                            <ReferenceLine
                                y={goal}
                                stroke="#38bdf8"
                                strokeDasharray="3 3"
                                strokeOpacity={0.5}
                                label={{
                                    value: 'GOAL',
                                    position: 'top',
                                    fill: '#38bdf8',
                                    fontSize: 8,
                                    fontWeight: 'bold',
                                    opacity: 0.8,
                                    offset: 10
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
