import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { cn } from '../../lib/utils';
import { useTheme } from '../../store/resourceStore';

const CustomTooltip = ({ active, payload, label, xLabel, yLabel, isDarkMode }) => {
    if (active && payload && payload.length) {
        return (
            <div className={cn(
                "px-3 py-2 rounded-lg text-xs font-mono shadow-xl backdrop-blur-xl border",
                isDarkMode
                    ? "bg-slate-900/90 border-slate-700 text-slate-200"
                    : "bg-white/90 border-slate-200 text-slate-700"
            )}>
                <p className="font-bold mb-1">{xLabel}: {Number(label).toFixed(2)}</p>
                <p className={isDarkMode ? "text-indigo-400" : "text-indigo-600"}>
                    {yLabel}: {Number(payload[0].value).toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

// Physics function registry to avoid serializing functions in store
const PHYSICS_FUNCTIONS = {
    'inverse-square': (x) => 1 / (x * x),
    'inverse': (x) => 1 / x,
    'inverse-cube': (x) => 1 / (x * x * x),
    'linear': (x) => x,
    'constant': (x) => 1,

    // Specific Physics Formulas
    'ring-field': (x) => {
        const R = 2; // Assume R=2 for visualization
        return x / Math.pow(R * R + x * x, 1.5);
    },
    'shell-field': (x) => {
        const R = 2;
        return x < R ? 0 : 1 / (x * x); // normalized
    },
    'solid-sphere-field': (x) => {
        const R = 2;
        return x < R ? x : (R * R * R) / (R * x * x); // Normalized to match at boundary roughly (actually E_out ~ 1/r^2, E_in ~ r)
        // E_surf = kQ/R^2. E_in(r) = kQr/R^3 = (kQ/R^2) * (r/R). 
        // Let kQ = 4, R = 2. E_surf = 1.
        // E_in = 1 * (x/2) = 0.5x
        // E_out = 4/x^2. At x=2, E=1. Matches.
    },
    'solid-sphere-potential': (x) => {
        const R = 2;
        // V_out = kQ/x. Let kQ=4. V_out = 4/x. At R=2, V=2.
        // V_in = kQ/2R * (3 - x^2/R^2) = 4/4 * (3 - x^2/4) = 3 - x^2/4.
        // At x=0, V=3. At x=2, V = 3-1=2. Matches.
        return x < R ? (3 - (x * x) / 4) : 4 / x;
    },
    'shell-potential': (x) => {
        const R = 2;
        // V_in = kQ/R (const). V_out = kQ/x.
        // Let kQ=4. V_in = 2. V_out = 4/x.
        return x < R ? 2 : 4 / x;
    }
};

const InteractiveGraph = ({
    formula, // Can be function or string key
    range = [0, 10],
    step = 0.1,
    xLabel = 'x',
    yLabel = 'y',
    isDarkMode
}) => {
    const theme = useTheme();

    const data = useMemo(() => {
        // Resolve function
        let func = typeof formula === 'function' ? formula : PHYSICS_FUNCTIONS[formula];
        if (!func) return [];

        const points = [];
        const [min, max] = range;

        // Handle special cases and potential singularities
        for (let x = min; x <= max; x += step) {
            // Avoid exactly 0 for 1/x functions by adding a tiny offset if needed,
            // or let the formula function handle it.
            // For visualization, we'll clamp very large values
            let y = func(x);

            // Filters for Infinity/NaN
            if (!isFinite(y)) continue;
            if (Math.abs(y) > 20) y = y > 0 ? 20 : -20; // Clamp for display

            points.push({ x, y });
        }
        return points;
    }, [formula, range, step]);

    return (
        <div className="w-full h-[200px] mt-4 mb-2 select-none">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? "#334155" : "#e2e8f0"}
                        opacity={0.5}
                    />
                    <XAxis
                        dataKey="x"
                        type="number"
                        domain={range}
                        tick={{ fontSize: 10, fill: isDarkMode ? "#94a3b8" : "#64748b" }}
                        tickFormatter={(val) => val.toFixed(0)}
                    />
                    <YAxis
                        hide // Hide Y axis for cleaner look, tooltip shows values
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        content={<CustomTooltip xLabel={xLabel} yLabel={yLabel} isDarkMode={isDarkMode} />}
                        cursor={{ stroke: isDarkMode ? "#6366f1" : "#6366f1", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="y"
                        stroke={isDarkMode ? "#818cf8" : "#4f46e5"}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0, fill: isDarkMode ? "#c7d2fe" : "#4f46e5" }}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-between px-2 text-[10px] text-slate-500 font-mono mt-1">
                <span>{xLabel}</span>
                <span>Move cursor to probe</span>
            </div>
        </div>
    );
};

export default React.memo(InteractiveGraph);
