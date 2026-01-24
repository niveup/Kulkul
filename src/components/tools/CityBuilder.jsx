/* eslint-disable react-hooks/purity */
import React, { useMemo, useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Html, Sky, Stars } from '@react-three/drei';
import { Lock, Zap, ChevronLeft, ChevronRight, ZapOff, Calendar, X, RefreshCw, Target } from 'lucide-react';
import { getBuildingConfig } from '../../utils/pomodoroConfig';
import { getISTDate, getTodayIST, isFutureIST, isTodayIST } from '../../utils/dateUtils';
import {
    TentComplete, TentRuin,
    CozyHouseComplete, CozyHouseRuin,
    BuildingComplete, BuildingRuin,
    SkyscraperComplete, SkyscraperRuin,
    LandmarkComplete, LandmarkRuin
} from './BuildingModels';
import { Platform, Fence, InteractiveLake } from './EnvironmentAssets';
// THREE is imported in BuildingModels.jsx
import { AnimatePresence, motion } from 'framer-motion';

// ============================================================================
// HOLOGRAPHIC CONTROL BUTTON
// ============================================================================
const HoloBtn = ({ onClick, icon: Icon, active, label, title }) => (
    <button
        onClick={onClick}
        title={title}
        className={`
            relative p-2 rounded-lg backdrop-blur-md border transition-all duration-300 group
            ${active
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'
            }
        `}
    >
        <Icon size={16} />
        {label && <span className="ml-2 text-xs font-bold tracking-wider">{label}</span>}

        {/* Corner Accents */}
        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-current opacity-50" />
        <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-current opacity-50" />
    </button>
);

const Scene = ({ positions, sessionHistory, onBuildingSelect, selectedBuildingIndex, isLiteMode, isDarkMode, autoRotate, resetLakeTrigger, onLakeDrained }) => {
    const [splashTrigger, setSplashTrigger] = useState(0);

    return (
        <>
            <ambientLight intensity={isLiteMode ? 0.8 : 0.2} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={isLiteMode ? 1.0 : 0.8}
                castShadow={!isLiteMode}
                shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.5} color={isDarkMode ? "#4facfe" : "#90CAF9"} />

            {!isLiteMode && (
                <>
                    <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={0.5} />
                    <Sky sunPosition={[0, -5, -100]} turbidity={0} rayleigh={0.1} inclination={1} azimuth={0.25} mieCoefficient={0.005} mieDirectionalG={0.8} />
                    <Environment preset="night" />
                    <ContactShadows opacity={0.4} scale={20} blur={2} far={4.5} />
                </>
            )}

            {/* Platform & Environment */}
            <Platform />
            <Fence />
            <InteractiveLake
                position={[3.5, 0, 3.5]}
                sessionHistory={sessionHistory}
                splashTrigger={splashTrigger}
                isLiteMode={isLiteMode}
            />

            {/* Buildings */}
            {sessionHistory.map((session, index) => {
                if (!positions[index]) return null;

                const pos = positions[index];
                const worldX = (pos.x - 5) + 0.5;
                const worldZ = (pos.y - 5) + 0.5;

                const config = getBuildingConfig(session.minutes);
                const isFailed = session.status === 'failed';

                let Comp = TentComplete;
                if (isFailed) {
                    if (config.id === 'tent') Comp = TentRuin;
                    else if (config.id === 'house') Comp = CozyHouseRuin;
                    else if (['apartment', 'building'].includes(config.id)) Comp = BuildingRuin;
                    else if (config.id === 'skyscraper') Comp = SkyscraperRuin;
                    else Comp = LandmarkRuin;
                } else {
                    if (config.id === 'tent') Comp = TentComplete;
                    else if (config.id === 'house') Comp = CozyHouseComplete;
                    else if (['apartment', 'building'].includes(config.id)) Comp = BuildingComplete;
                    else if (config.id === 'skyscraper') Comp = SkyscraperComplete;
                    else Comp = LandmarkComplete;
                }

                const isSelected = selectedBuildingIndex === index;

                return (
                    <group key={session.id || index} position={[worldX, 0, worldZ]}>
                        <group scale={[0.6, 0.6, 0.6]}>
                            <Comp
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onBuildingSelect(index);
                                }}
                                isSelected={isSelected}
                            />
                        </group>
                        {isSelected && (
                            <Html position={[0, 2.5, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                                <div className="bg-black/90 backdrop-blur-xl text-white text-xs p-3 rounded-none border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] whitespace-nowrap relative">
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500" />
                                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500" />

                                    <div className="font-bold text-emerald-400 uppercase tracking-widest text-[10px] mb-1">Sector Data</div>
                                    <div className="font-bold text-white text-sm">{config.label}</div>
                                    <div className="flex items-center gap-2 mt-1 text-white/50">
                                        <span>{Math.floor(session.minutes)} MINS</span>
                                        <span>•</span>
                                        <span className={isFailed ? 'text-rose-400' : 'text-emerald-400'}>
                                            {isFailed ? 'FAILED' : 'STABLE'}
                                        </span>
                                    </div>
                                </div>
                            </Html>
                        )}
                    </group>
                );
            })}
        </>
    );
};

const CityBuilder = ({ sessionHistory = [], isDarkMode, onToggleTheme, selectedDate: selectedDateProp, onDateChange }) => {
    const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(null);
    const [autoRotate, setAutoRotate] = useState(false);
    const [isLakeDrained, setLakeDrained] = useState(false);
    const [resetLakeTrigger, setResetLakeTrigger] = useState(0);
    const [isLiteMode, setLiteMode] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerMonth, setPickerMonth] = useState(new Date());

    // Internal date state - Defaults to Today (IST)
    const [internalSelectedDate, setInternalSelectedDate] = useState(() => {
        const today = getISTDate();
        today.setHours(12, 0, 0, 0); // Noon to avoid timezone shifts
        return today;
    });

    // Persistence Effect Removed to allow daily auto-rotation

    const selectedDate = selectedDateProp !== undefined ? selectedDateProp : internalSelectedDate;

    // Filter/Stats Logic
    const filteredHistory = useMemo(() => {
        if (!selectedDate) return sessionHistory;
        const dateStr = selectedDate.toDateString();
        return sessionHistory.filter(s => new Date(s.timestamp).toDateString() === dateStr);
    }, [sessionHistory, selectedDate]);

    const dateStats = useMemo(() => {
        const completed = filteredHistory.filter(s => s.status === 'completed').length;
        const failed = filteredHistory.filter(s => s.status === 'failed').length;
        return { completed, failed, total: filteredHistory.length };
    }, [filteredHistory]);

    // Positions Logic
    const positions = useMemo(() => {
        const GRID_SIZE = 10;
        const isLake = (x, y) => (x >= 7 && y >= 7);
        const allPositions = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                if (!isLake(x, y)) {
                    allPositions.push({ x, y });
                }
            }
        }
        const valid = allPositions;

        // Randomize
        for (let i = valid.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [valid[i], valid[j]] = [valid[j], valid[i]];
        }
        return valid;
    }, []);

    const handleGenesisPulse = () => {
        setResetLakeTrigger(prev => prev + 1);
        setLakeDrained(false);
        setAutoRotate(true);
    };

    // Calendar Logic
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(pickerMonth);
    const firstDay = getFirstDayOfMonth(pickerMonth);
    const today = getTodayIST();

    const handlePrevMonth = () => {
        setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1));
    };

    return (
        <div className="h-full w-full relative group bg-black/60">
            {/* Main Canvas Area - handled by Three.js */}

            {/* Dynamic Island HUD (Bottom Center) - minimal glass bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 w-full max-w-2xl px-4 pointer-events-none">

                {/* Status Message (If any) */}
                {/* Genesis Pulse Removed as per user request */}

                {/* Main Controls - Glass Pill */}
                <div className="pointer-events-auto flex items-center p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl gap-2">

                    {/* View Controls */}
                    <div className="flex items-center gap-1 px-2 border-r border-white/10">
                        <button
                            onClick={() => setAutoRotate(!autoRotate)}
                            className={`p-3 rounded-full transition-all ${!autoRotate ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                            title={autoRotate ? "Lock Rotation" : "Unlock Rotation"}
                        >
                            {autoRotate ? <RefreshCw size={20} className="animate-spin-slow" /> : <Lock size={20} />}
                        </button>
                        <button
                            onClick={() => setLiteMode(!isLiteMode)}
                            className={`p-3 rounded-full transition-all ${isLiteMode ? 'bg-indigo-500 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                            title="Performance Mode"
                        >
                            {isLiteMode ? <Zap size={20} fill="currentColor" /> : <ZapOff size={20} />}
                        </button>
                    </div>

                    {/* Date Picker Trigger */}
                    <button
                        onClick={() => setShowDatePicker(true)}
                        className="px-6 py-3 rounded-full text-white hover:bg-white/10 transition-all flex items-center gap-3 min-w-[140px] justify-center"
                    >
                        <Calendar size={18} className="text-white/60" />
                        <span className="text-base font-semibold tabular-nums tracking-wide">
                            {selectedDate ? selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "All Time"}
                        </span>
                    </button>

                    {/* Stats Summary */}
                    <div className="px-4 flex items-center gap-4 text-sm font-medium border-l border-white/10 text-white/80">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{dateStats.completed}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>{dateStats.failed}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Picker Overlay - Full Screen Glass */}
            <AnimatePresence>
                {showDatePicker && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="absolute inset-0 z-[60] bg-black/60 flex items-center justify-center p-8 text-white"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setShowDatePicker(false);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0A0A0C] border border-white/10 rounded-3xl p-6 shadow-2xl max-w-md w-full"
                        >
                            {/* Header: Month/Year & Navigation */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-bold tracking-tight text-white capitalize">
                                        {pickerMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </h3>
                                    <button
                                        onClick={() => setPickerMonth(new Date())}
                                        className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
                                        title="Jump to Today"
                                    >
                                        <Target size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
                                    <button
                                        onClick={handleNextMonth}
                                        disabled={pickerMonth.getMonth() === today.getMonth() && pickerMonth.getFullYear() === today.getFullYear()}
                                        className={`p-2 rounded-full transition-colors ${pickerMonth.getMonth() === today.getMonth() && pickerMonth.getFullYear() === today.getFullYear() ? 'opacity-30 cursor-not-allowed text-white/30' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                    <button onClick={() => setShowDatePicker(false)} className="p-2 ml-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"><X size={18} /></button>
                                </div>
                            </div>

                            {/* Weekday Headers */}
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                    <div key={day} className="text-xs font-bold text-white/30 uppercase tracking-widest py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {/* Empty slots for offset - Add aspect-square to prevent collapse */}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square" />
                                ))}

                                {/* Days */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    // Use noon to avoid DST midnight shifts
                                    const dayDate = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), i + 1, 12, 0, 0);
                                    const isToday = isTodayIST(dayDate);
                                    const isSelected = selectedDate && dayDate.toDateString() === selectedDate.toDateString();

                                    const isFuture = isFutureIST(dayDate);

                                    return (
                                        <button
                                            key={i}
                                            disabled={isFuture}
                                            onClick={() => {
                                                setInternalSelectedDate(dayDate);
                                                setShowDatePicker(false);
                                            }}
                                            className={`
                                                aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all relative
                                                ${isFuture ? 'opacity-20 cursor-not-allowed' : ''}
                                                ${isSelected && !isFuture
                                                    ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                                    : !isFuture ? 'hover:bg-white/10 text-white/70 hover:text-white' : ''
                                                }
                                                ${isToday && !isSelected ? 'text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/20' : ''}
                                            `}
                                        >
                                            {i + 1}
                                            {isToday && !isSelected && <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-emerald-500" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <button
                                onClick={() => { setInternalSelectedDate(null); setShowDatePicker(false); }}
                                className="w-full mt-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-medium tracking-wide transition-colors text-xs uppercase"
                            >
                                Clear Selection (Show All)
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Viewport Canvas */}
            <div className="w-full h-full cursor-move" onClick={() => { setSelectedBuildingIndex(null); setShowDatePicker(false); }}>
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[-8, 8, 8]} fov={50} />
                    <OrbitControls
                        enablePan={false}
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 2.2}
                        minDistance={5}
                        maxDistance={25}
                        autoRotate={autoRotate}
                        autoRotateSpeed={0.5}
                    />
                    <Suspense fallback={null}>
                        <Scene
                            positions={positions}
                            sessionHistory={filteredHistory}
                            onBuildingSelect={setSelectedBuildingIndex}
                            selectedBuildingIndex={selectedBuildingIndex}
                            autoRotate={autoRotate}
                            resetLakeTrigger={resetLakeTrigger}
                            onLakeDrained={setLakeDrained}
                            isLiteMode={isLiteMode}
                            isDarkMode={true} // Force dark mode for Space aesthetic
                        />
                    </Suspense>
                </Canvas>
            </div >

            {/* Bottom Status Bar */}
            < div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end pointer-events-none" >
                <div className="flex gap-4">
                    <div className="bg-black/40 backdrop-blur-md border border-white/5 px-4 py-2 rounded-lg">
                        <div className="text-[10px] text-white/40 uppercase font-bold">Grid Stability</div>
                        <div className="text-emerald-400 font-mono text-xs">100% OPTIMAL</div>
                    </div>
                </div>

                {
                    isLakeDrained && (
                        <button onClick={handleGenesisPulse} className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse">
                            <Zap size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Genesis Pulse Available</span>
                        </button>
                    )
                }
            </div >
        </div >
    );
};

export default CityBuilder;
