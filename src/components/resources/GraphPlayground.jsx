import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { X, RefreshCw, Maximize2, Settings2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import ReactDOM from 'react-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// =============================================================================
// KATEX FORMULA COMPONENT
// =============================================================================
const KatexFormula = ({ latex, className }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && latex) {
            try {
                katex.render(latex, ref.current, {
                    throwOnError: false,
                    displayMode: false,
                    trust: true
                });
            } catch (e) {
                ref.current.textContent = latex;
            }
        }
    }, [latex]);

    return <span ref={ref} className={className} />;
};

// =============================================================================
// PHYSICS FUNCTIONS WITH PARAMETERS
// =============================================================================
const PARAMETRIC_FUNCTIONS = {
    // 1. Electric Field: Point Charge -> E = kQ/r^2
    'inverse-square': {
        name: 'Inverse Square Law (E)',
        fn: (x, params) => (params.k * params.Q) / (x * x),
        symbolic: (x, params) => `E = \\frac{kQ}{r^2}`,
        params: {
            Q: { label: 'Charge (Q)', min: 1, max: 10, step: 1, default: 4 },
            k: { label: 'Constant (k)', min: 1, max: 5, step: 0.1, default: 1 }
        },
        glossary: {
            E: "Electric Field Strength",
            Q: "Source Charge Magnitude",
            r: "Distance from Charge",
            k: "Coulomb Constant"
        },
        range: [0.5, 10]
    },
    // 2. Electric Potential: Point Charge -> V = kQ/r
    'inverse': {
        name: 'Inverse Prop. (V)',
        fn: (x, params) => (params.k * params.Q) / x,
        symbolic: (x, params) => `V = \\frac{kQ}{r}`,
        params: {
            Q: { label: 'Charge (Q)', min: 1, max: 10, step: 1, default: 4 },
            k: { label: 'Constant (k)', min: 1, max: 5, step: 0.1, default: 1 }
        },
        glossary: {
            V: "Electric Potential",
            Q: "Source Charge Magnitude",
            r: "Distance from Charge",
            k: "Coulomb Constant"
        },
        range: [0.5, 10]
    },
    // 3. Dipole Field (Axial): E ~ 1/r^3
    'inverse-cube': {
        name: 'Inverse Cube (Dipole)',
        fn: (x, params) => (2 * params.k * params.p) / (x * x * x),
        symbolic: (x, params) => `E_{axial} = \\frac{2kp}{r^3}`,
        params: {
            p: { label: 'Dipole (p)', min: 1, max: 10, step: 1, default: 4 },
            k: { label: 'Constant (k)', min: 1, max: 5, step: 0.1, default: 1 }
        },
        glossary: {
            E: "Electric Field Strength",
            p: "Electric Dipole Moment",
            r: "Distance from Dipole Center",
            k: "Coulomb Constant"
        },
        range: [1.5, 8]
    },
    // 4. Uniform Field
    'constant': {
        name: 'Uniform Field',
        fn: (x, params) => params.E,
        symbolic: (x, params) => `E = \\text{constant}`,
        params: {
            E: { label: 'Field (E)', min: -5, max: 5, step: 0.5, default: 2 }
        },
        glossary: {
            E: "Electric Field Strength",
            r: "Position"
        },
        range: [0, 10]
    },
    // 5. Ring Field on Axis
    'ring-field': {
        name: 'Charged Ring Field',
        fn: (x, params) => (params.k * params.Q * x) / Math.pow(Math.pow(params.R, 2) + x * x, 1.5),
        symbolic: (x, params) => `E = \\frac{kQx}{(R^2 + x^2)^{3/2}}`,
        params: {
            Q: { label: 'Charge (Q)', min: 1, max: 10, step: 1, default: 5 },
            R: { label: 'Radius (R)', min: 0.5, max: 4, step: 0.1, default: 2 },
            k: { label: 'k', min: 1, max: 2, step: 1, default: 1 }
        },
        glossary: {
            E: "Electric Field Strength",
            Q: "Total Charge on Ring",
            R: "Radius of Ring",
            x: "Axial Distance from Center",
            k: "Coulomb Constant"
        },
        markers: (params) => [
            {
                x: params.R / Math.sqrt(2),
                label: "E_max",
                xSymbol: "R/√2",
                ySymbol: "2kQ / (3√3 R²)"
            },
            {
                x: -params.R / Math.sqrt(2),
                label: "E_max",
                xSymbol: "-R/√2",
                ySymbol: "-2kQ / (3√3 R²)"
            }
        ],
        range: [-6, 6]
    },
    // 6. Shell Field (Inside/Outside)
    'shell-field': {
        name: 'Spherical Shell Field',
        fn: (x, params) => {
            const absX = Math.abs(x);
            return absX < params.R ? 0 : (params.k * params.Q) / (x * x);
        },
        symbolic: (x, params) => Math.abs(x) < params.R ? "E = 0" : "E = \\frac{kQ}{r^2}",
        params: {
            Q: { label: 'Charge (Q)', min: 1, max: 10, step: 1, default: 5 },
            R: { label: 'Radius (R)', min: 1, max: 4, step: 0.5, default: 2 },
            k: { label: 'k', min: 1, max: 2, step: 1, default: 1 }
        },
        glossary: {
            E: "Electric Field Strength",
            Q: "Total Charge on Shell",
            R: "Radius of Shell",
            r: "Distance from Center",
            k: "Coulomb Constant"
        },
        markers: (params) => [
            {
                x: params.R,
                label: "Surface",
                xSymbol: "R",
                ySymbol: "kQ / R²"
            },
            {
                x: -params.R,
                label: "Surface",
                xSymbol: "-R",
                ySymbol: "kQ / R²"
            }
        ],
        range: [0, 6]
    },
    // 7. Shell Potential
    'shell-potential': {
        name: 'Spherical Shell Potential',
        fn: (x, params) => {
            const absX = Math.abs(x);
            // V_in = kQ/R, V_out = kQ/r
            return absX < params.R ? (params.k * params.Q) / params.R : (params.k * params.Q) / absX;
        },
        symbolic: (x, params) => Math.abs(x) < params.R ? "V = \\frac{kQ}{R}" : "V = \\frac{kQ}{r}",
        params: {
            Q: { label: 'Charge (Q)', min: 1, max: 10, step: 1, default: 5 },
            R: { label: 'Radius (R)', min: 1, max: 4, step: 0.5, default: 2 },
            k: { label: 'k', min: 1, max: 2, step: 1, default: 1 }
        },
        glossary: {
            V: "Electric Potential",
            Q: "Total Charge on Shell",
            R: "Radius of Shell",
            r: "Distance from Center",
            k: "Coulomb Constant"
        },
        markers: (params) => [
            {
                x: params.R,
                label: "Surface",
                xSymbol: "R",
                ySymbol: "kQ / R"
            }
        ],
        range: [0, 6]
    },
    // 8. Solid Sphere Field
    'solid-sphere-field': {
        name: 'Solid Sphere Field',
        fn: (x, params) => {
            // E_in = kQx/R^3, E_out = kQ/x^2
            const r = Math.abs(x);
            return r < params.R
                ? (params.k * params.Q * r) / Math.pow(params.R, 3)
                : (params.k * params.Q) / (r * r);
        },
        symbolic: (x, params) => Math.abs(x) < params.R ? "E = \\frac{kQr}{R^3}" : "E = \\frac{kQ}{r^2}",
        params: {
            Q: { label: 'Charge (Q)', min: 1, max: 10, step: 1, default: 5 },
            R: { label: 'Radius (R)', min: 1, max: 4, step: 0.5, default: 2 },
            k: { label: 'k', min: 1, max: 2, step: 1, default: 1 }
        },
        glossary: {
            E: "Electric Field Strength",
            Q: "Total Charge on Sphere",
            R: "Radius of Sphere",
            r: "Distance from Center",
            k: "Coulomb Constant"
        },
        markers: (params) => [
            {
                x: params.R,
                label: "Surface",
                xSymbol: "R",
                ySymbol: "kQ / R²"
            }
        ],
        range: [0, 6]
    }
};

const CustomTooltip = ({ active, payload, label, xLabel, yLabel, isDarkMode, config, params, markers }) => {
    if (active && payload && payload.length) {
        const currentX = Number(label);

        // Find if we are near a marker (within tolerance)
        const relevantMarker = markers?.find(m => Math.abs(currentX - m.x) < 0.15); // tolerance based on step size
        const isCriticalPoint = !!relevantMarker;

        // Get symbolic representation if available
        const symbolicFn = config.symbolic;
        const symbolicText = symbolicFn ? symbolicFn(currentX, params) : '';

        return (
            <div className={cn(
                "px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border z-50 max-w-[250px]",
                isDarkMode
                    ? "bg-slate-900/95 border-slate-700 text-slate-200"
                    : "bg-white/95 border-slate-200 text-slate-700"
            )}>
                {/* 1. Primary Highlight: Critical Point Symbolic Coords */}
                {isCriticalPoint ? (
                    <div className="mb-2 pb-2 border-b border-dashed border-indigo-500/50">
                        <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", isDarkMode ? "text-indigo-400" : "text-indigo-600")}>
                            {relevantMarker.label}
                        </p>
                        {relevantMarker.xSymbol && (
                            <p className="text-sm font-serif italic opacity-90">
                                {xLabel} = {relevantMarker.xSymbol}
                            </p>
                        )}
                        {relevantMarker.ySymbol && (
                            <p className="text-sm font-serif italic opacity-90">
                                {yLabel} = {relevantMarker.ySymbol}
                            </p>
                        )}
                    </div>
                ) : (
                    symbolicText && (
                        <div className="mb-2 pb-2 border-b border-dashed border-slate-500/30">
                            <div className={cn("text-lg text-center", isDarkMode ? "text-slate-100" : "text-slate-800")}>
                                <KatexFormula latex={symbolicText} />
                            </div>
                        </div>
                    )
                )}

                {/* 2. Secondary Info: Values (Only shown for critical points or if no symbolic text exists) */}
                {(isCriticalPoint || !symbolicText) && (
                    <div className="space-y-1">
                        <p className="font-mono text-xs opacity-50">Value: {Number(payload[0].value).toFixed(2)}</p>
                    </div>
                )}

                {/* 3. Helper Text if nothing strictly critical */}
                {!isCriticalPoint && symbolicText && (
                    <p className="text-[10px] opacity-50 text-center mt-1">
                        (Hover critical points for formulas)
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const GraphPlayground = ({
    isOpen,
    onClose,
    graphConfig,
    title,
    isDarkMode
}) => {
    if (!isOpen || !graphConfig) return null;

    const [params, setParams] = useState({});
    const [config, setConfig] = useState(null);

    // Initialize params when graph opens
    useEffect(() => {
        const funcConfig = PARAMETRIC_FUNCTIONS[graphConfig.fn] || PARAMETRIC_FUNCTIONS['inverse-square'];
        setConfig(funcConfig);

        const initialParams = {};
        Object.entries(funcConfig.params).forEach(([key, val]) => {
            initialParams[key] = val.default;
        });
        setParams(initialParams);
    }, [graphConfig.fn]);

    // Generate graph data
    const data = useMemo(() => {
        if (!config) return [];
        const points = [];
        const [min, max] = graphConfig.domain || config.range;
        const step = graphConfig.step || 0.1;

        for (let x = min; x <= max; x += step) {
            // Avoid singularity at x=0
            if (Math.abs(x) < 0.001) continue;

            const val = config.fn(x, params);
            // Clamp for display
            const safeVal = Math.abs(val) > 50 ? (val > 0 ? 50 : -50) : val;

            points.push({ x, y: safeVal });
        }
        return points;
    }, [config, params, graphConfig]);

    // Generate Markers
    const markers = useMemo(() => {
        if (!config || !config.markers) return [];
        return config.markers(params);
    }, [config, params]);

    const handleReset = () => {
        if (!config) return;
        const initial = {};
        Object.entries(config.params).forEach(([key, val]) => {
            initial[key] = val.default;
        });
        setParams(initial);
    };

    if (!config) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className={cn(
                            "relative w-full max-w-4xl max-h-[90vh] overflow-hidden",
                            "rounded-3xl shadow-2xl border flex flex-col md:flex-row",
                            isDarkMode
                                ? "bg-slate-900 border-slate-700"
                                : "bg-white border-slate-200"
                        )}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* LEFT: Controls Panel */}
                        <div className={cn(
                            "w-full md:w-80 flex flex-col border-b md:border-b-0 md:border-r p-6 overflow-y-auto",
                            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-100"
                        )}>
                            <div className="mb-6">
                                <h2 className={cn("text-2xl font-bold mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                                    Interactive Lab
                                </h2>
                                <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                    Adjust variables to see how the field changes.
                                </p>

                                {/* Challenge Question */}
                                {graphConfig.question && (
                                    <div className={cn(
                                        "mt-4 p-3 rounded-xl border-l-4",
                                        isDarkMode ? "bg-indigo-900/20 border-indigo-500 text-indigo-300" : "bg-indigo-50 border-indigo-500 text-indigo-700"
                                    )}>
                                        <div className="flex items-start gap-2">
                                            <span className="font-bold text-xs uppercase tracking-wide opacity-70 mt-0.5">Focus:</span>
                                            <p className="text-sm font-medium leading-snug">
                                                {graphConfig.question}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Glossary Section */}
                            {config.glossary && (
                                <div className={cn(
                                    "mb-6 p-4 rounded-xl text-sm space-y-2",
                                    isDarkMode ? "bg-slate-800/50" : "bg-white border"
                                )}>
                                    <h4 className="font-bold opacity-80 uppercase text-xs tracking-wider mb-2">Variables</h4>
                                    {Object.entries(config.glossary).map(([symbol, desc]) => (
                                        <div key={symbol} className="flex gap-2">
                                            <span className="font-mono font-bold text-indigo-500 w-6 text-right">{symbol}</span>
                                            <span className="opacity-70 text-xs">{desc}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-6 flex-1">
                                {Object.entries(config.params).map(([key, setting]) => (
                                    <div key={key} className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className={cn("text-sm font-medium", isDarkMode ? "text-slate-300" : "text-slate-700")}>
                                                {setting.label}
                                            </label>
                                            <span className={cn(
                                                "font-mono text-xs px-2 py-1 rounded",
                                                isDarkMode ? "bg-slate-800 text-indigo-400" : "bg-white border text-indigo-600"
                                            )}>
                                                {params[key]?.toFixed(1)}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min={setting.min}
                                            max={setting.max}
                                            step={setting.step}
                                            value={params[key] || setting.default}
                                            onChange={(e) => setParams(prev => ({
                                                ...prev,
                                                [key]: parseFloat(e.target.value)
                                            }))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-500 hover:accent-indigo-400"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className={cn(
                                        "flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors border",
                                        isDarkMode
                                            ? "border-slate-700 hover:bg-slate-800 text-slate-300"
                                            : "border-slate-200 hover:bg-slate-100 text-slate-600"
                                    )}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 transition-all"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: Graph Display */}
                        <div className="flex-1 p-6 md:p-10 flex flex-col bg-slate-50/50 dark:bg-black/20">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className={cn("text-xl font-bold", isDarkMode ? "text-indigo-400" : "text-indigo-600")}>
                                        {title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-mono", isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-600")}>
                                            {graphConfig.fn}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-200 text-slate-500"
                                    )}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 w-full min-h-[300px] relative rounded-2xl overflow-hidden border bg-background/50 backdrop-blur-sm">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke={isDarkMode ? "#334155" : "#e2e8f0"}
                                            opacity={0.3}
                                        />
                                        <XAxis
                                            dataKey="x"
                                            tick={{ fill: isDarkMode ? "#94a3b8" : "#64748b", fontSize: 12 }}
                                            axisLine={{ stroke: isDarkMode ? "#475569" : "#cbd5e1" }}
                                            label={{
                                                value: graphConfig.xLabel,
                                                position: 'bottom',
                                                offset: 0,
                                                fill: isDarkMode ? "#94a3b8" : "#64748b"
                                            }}
                                        />
                                        <YAxis
                                            tick={{ fill: isDarkMode ? "#94a3b8" : "#64748b", fontSize: 12 }}
                                            axisLine={{ stroke: isDarkMode ? "#475569" : "#cbd5e1" }}
                                            label={{
                                                value: graphConfig.yLabel,
                                                angle: -90,
                                                position: 'insideLeft',
                                                fill: isDarkMode ? "#94a3b8" : "#64748b"
                                            }}
                                        />
                                        <Tooltip
                                            content={
                                                <CustomTooltip
                                                    xLabel={graphConfig.xLabel}
                                                    yLabel={graphConfig.yLabel}
                                                    isDarkMode={isDarkMode}
                                                    config={config}
                                                    params={params}
                                                    markers={markers}
                                                />
                                            }
                                        />
                                        <ReferenceLine y={0} stroke={isDarkMode ? "#475569" : "#cbd5e1"} />
                                        <ReferenceLine x={0} stroke={isDarkMode ? "#475569" : "#cbd5e1"} />

                                        {/* Critical Points Markers */}
                                        {markers.map((marker, idx) => (
                                            <ReferenceLine
                                                key={idx}
                                                x={marker.x}
                                                stroke={isDarkMode ? "#f472b6" : "#db2777"}
                                                strokeDasharray="3 3"
                                                label={{
                                                    value: marker.label,
                                                    position: 'top',
                                                    fill: isDarkMode ? "#f472b6" : "#db2777",
                                                    fontSize: 10
                                                }}
                                            />
                                        ))}

                                        <Line
                                            type="monotone"
                                            dataKey="y"
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{ r: 6, strokeWidth: 0, fill: "#818cf8" }}
                                            animationDuration={300}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default GraphPlayground;
