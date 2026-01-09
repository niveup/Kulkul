import React, { useMemo, useState, Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Html, Sky, Stars } from '@react-three/drei';
import { Trophy, Map, Lock, Unlock, Zap, ChevronLeft, ChevronRight, Building2, ZapOff, Moon, Calendar, X } from 'lucide-react';
import { getBuildingConfig } from '../../utils/pomodoroConfig';
import {
    TentComplete, TentRuin,
    CozyHouseComplete, CozyHouseRuin,
    BuildingComplete, BuildingRuin,
    SkyscraperComplete, SkyscraperRuin,
    LandmarkComplete, LandmarkRuin
} from './BuildingModels';
import { Platform, Fence, InteractiveLake } from './EnvironmentAssets';
import * as THREE from 'three';

const Scene = ({ positions, sessionHistory, onBuildingSelect, selectedBuildingIndex, isLiteMode, isDarkMode, autoRotate, resetLakeTrigger, onLakeDrained }) => {
    const [splashTrigger, setSplashTrigger] = useState(0);

    return (
        <>
            <ambientLight intensity={isLiteMode ? 0.8 : isDarkMode ? 0.2 : 0.4} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={isLiteMode ? 1.0 : isDarkMode ? 0.4 : 0.8}
                castShadow={!isLiteMode}
                shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.5} color={isDarkMode ? "#4facfe" : "#90CAF9"} />

            {!isLiteMode && (
                <>
                    {isDarkMode ? (
                        <>
                            <Stars radius={100} depth={50} count={8000} factor={4} saturation={0} fade speed={0.5} />
                            <Sky sunPosition={[0, -10, -100]} turbidity={0} rayleigh={0.1} inclination={1} azimuth={0.25} mieCoefficient={0.005} mieDirectionalG={0.8} />
                            <Environment preset="night" />
                        </>
                    ) : (
                        <>
                            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                            <Sky sunPosition={[10, 20, 10]} turbidity={8} rayleigh={6} />
                            <Environment preset="city" />
                        </>
                    )}
                    <ContactShadows opacity={0.4} scale={20} blur={2} far={4.5} />
                </>
            )}

            {isLiteMode && <color attach="background" args={[isDarkMode ? '#0f172a' : '#f0f9ff']} />}

            <Platform />
            <Fence />

            <InteractiveLake
                position={[3.5, 0, 3.5]}
                sessionHistory={sessionHistory}
                splashTrigger={splashTrigger}
                isLiteMode={isLiteMode}
            />

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
                            <Html position={[0, 2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                                <div className="bg-black/80 backdrop-blur-md text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-white/10 pointer-events-none transform -translate-y-4">
                                    <div className="font-bold text-emerald-400">{config.label}</div>
                                    <div className="text-gray-300">{Math.floor(session.minutes)} mins</div>
                                    <div className={`text-[10px] uppercase tracking-wider mt-1 ${isFailed ? 'text-red-400' : 'text-emerald-500/80'}`}>
                                        {session.status === 'failed' ? 'Session Failed' : 'Completed'}
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

    // Internal date state - default to today's date
    const [internalSelectedDate, setInternalSelectedDate] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        return today;
    });

    // Use prop if provided, otherwise use internal state
    const selectedDate = selectedDateProp !== undefined ? selectedDateProp : internalSelectedDate;

    // Filter sessions by selected date
    const filteredHistory = useMemo(() => {
        if (!selectedDate) return sessionHistory;
        const dateStr = selectedDate.toDateString();
        return sessionHistory.filter(s => new Date(s.timestamp).toDateString() === dateStr);
    }, [sessionHistory, selectedDate]);

    // Get days with sessions for calendar highlighting
    const daysWithSessions = useMemo(() => {
        const days = new Set();
        sessionHistory.forEach(s => {
            days.add(new Date(s.timestamp).toDateString());
        });
        return days;
    }, [sessionHistory]);

    // Calendar helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const handleDateSelect = (date) => {
        setShowDatePicker(false);
        // Update internal state
        setInternalSelectedDate(date);
        // Also notify parent if callback provided
        if (onDateChange) onDateChange(date);
    };

    const clearDate = () => {
        // Reset to today's date (not null/all-time)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setInternalSelectedDate(today);
        // Also notify parent if callback provided
        if (onDateChange) onDateChange(today);
    };

    const handleGenesisPulse = () => {
        setResetLakeTrigger(prev => prev + 1);
        setLakeDrained(false);
        setAutoRotate(true);
    };

    const totalXP = useMemo(() => {
        const history = selectedDate ? filteredHistory : sessionHistory;
        return history.reduce((acc, session) => {
            if (session.status === 'failed') return acc + 5;
            return acc + session.minutes;
        }, 0);
    }, [sessionHistory, filteredHistory, selectedDate]);

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

        const ordered = [];
        if (allPositions.length > 0) {
            const firstIdx = Math.floor(Math.random() * allPositions.length);
            ordered.push(allPositions[firstIdx]);
            allPositions.splice(firstIdx, 1);
        }

        while (allPositions.length > 0) {
            let bestCandidateIdx = -1;
            let maxMinDist = -1;

            for (let i = 0; i < allPositions.length; i++) {
                const candidate = allPositions[i];
                let minDist = Number.MAX_VALUE;

                for (const existing of ordered) {
                    const dx = candidate.x - existing.x;
                    const dy = candidate.y - existing.y;
                    const d = dx * dx + dy * dy;
                    if (d < minDist) minDist = d;
                }

                const score = minDist + (Math.random() * 0.5);
                if (score > maxMinDist) {
                    maxMinDist = score;
                    bestCandidateIdx = i;
                }
            }

            if (bestCandidateIdx !== -1) {
                ordered.push(allPositions[bestCandidateIdx]);
                allPositions.splice(bestCandidateIdx, 1);
            } else {
                break;
            }
        }
        return ordered;
    }, []);

    const PAGE_SIZE = 91;
    const historyToUse = selectedDate ? filteredHistory : sessionHistory;
    const totalPages = Math.ceil(historyToUse.length / PAGE_SIZE) || 1;
    const [currentPage, setCurrentPage] = useState(totalPages - 1);

    useEffect(() => {
        setCurrentPage(totalPages - 1);
    }, [totalPages]);

    const visibleHistory = useMemo(() => {
        const start = currentPage * PAGE_SIZE;
        return historyToUse.slice(start, start + PAGE_SIZE);
    }, [historyToUse, currentPage]);

    // Stats for selected date
    const dateStats = useMemo(() => {
        const completed = filteredHistory.filter(s => s.status === 'completed').length;
        const failed = filteredHistory.filter(s => s.status === 'failed').length;
        return { completed, failed, total: filteredHistory.length };
    }, [filteredHistory]);

    const handlePrevPage = () => setCurrentPage(p => Math.max(0, p - 1));
    const handleNextPage = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1));

    return (
        <div className={`h-full ${isDarkMode ? 'dark' : ''}`}>
            <div className={`h-full flex flex-col min-h-0 rounded-3xl overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50/50'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 shrink-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-b border-white/20 dark:border-white/5 z-10 relative">
                    <div>
                        <div className="flex items-center gap-3">
                            {/* Calendar Picker Button */}
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className={`p-2 rounded-lg transition-colors ${showDatePicker ? 'bg-indigo-500 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'}`}
                            >
                                <Calendar size={20} />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    Productivity City
                                    {selectedDate && (
                                        <span className="text-sm font-medium text-indigo-500 dark:text-indigo-400">
                                            • {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                </h2>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {selectedDate ? `${dateStats.completed} completed, ${dateStats.failed} failed` : `Platform ${currentPage + 1} of ${totalPages}`}
                                </div>
                            </div>
                        </div>

                        {/* Date Picker Dropdown */}
                        {showDatePicker && (
                            <div className="absolute top-20 left-6 z-50 p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-2xl w-72">
                                <div className="flex items-center justify-between mb-3">
                                    <button onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-600">
                                        <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
                                    </button>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {pickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-600">
                                        <ChevronRight size={16} className="text-slate-600 dark:text-slate-300" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className="p-1 font-medium text-slate-400">{d}</div>
                                    ))}
                                    {getDaysInMonth(pickerMonth).map((day, idx) => {
                                        const isSelected = day && selectedDate?.toDateString() === day.toDateString();
                                        const hasSession = day && daysWithSessions.has(day.toDateString());
                                        const isToday = day && new Date().toDateString() === day.toDateString();

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => day && handleDateSelect(day)}
                                                disabled={!day}
                                                className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${!day ? 'cursor-default' :
                                                    isSelected
                                                        ? 'bg-indigo-500 text-white font-bold ring-2 ring-indigo-300'
                                                        : isToday
                                                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-400 font-semibold hover:bg-blue-200 dark:hover:bg-blue-800/50'
                                                            : hasSession
                                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 font-semibold'
                                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-500 hover:text-slate-900 dark:hover:text-white'
                                                    }`}
                                            >
                                                {day?.getDate() || ''}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Back to Today button - only show when viewing a past date */}
                        {selectedDate && selectedDate.toDateString() !== new Date().toDateString() && (
                            <button
                                onClick={clearDate}
                                className="px-3 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            >
                                <Calendar size={14} />
                                Today
                            </button>
                        )}

                        {totalPages > 1 && !selectedDate && (
                            <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 rounded-xl p-1 border border-white/50 dark:border-white/10">
                                <button onClick={handlePrevPage} disabled={currentPage === 0} className="p-1.5 hover:bg-white/80 dark:hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors">
                                    <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
                                </button>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-1">Plat {currentPage + 1}</span>
                                <button onClick={handleNextPage} disabled={currentPage === totalPages - 1} className="p-1.5 hover:bg-white/80 dark:hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors">
                                    <ChevronRight size={16} className="text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>
                        )}

                        <div className="px-3 py-2 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200/50 dark:border-indigo-500/20 flex items-center gap-2 backdrop-blur-md">
                            <Building2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">{historyToUse.length} Builds</span>
                        </div>

                        {isLakeDrained && (
                            <button onClick={handleGenesisPulse} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all text-sm font-semibold animate-pulse">
                                <Zap size={16} />
                                Pulse
                            </button>
                        )}

                        <button onClick={onToggleTheme} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-indigo-500 text-white' : 'bg-white/50 text-slate-600 hover:bg-white/80'} border border-transparent dark:border-white/10`} title={isDarkMode ? "Day Mode" : "Night Mode"}>
                            {isDarkMode ? <Moon size={18} fill="currentColor" /> : <Moon size={18} />}
                        </button>

                        <button onClick={() => setLiteMode(!isLiteMode)} className={`p-2 rounded-xl transition-colors ${isLiteMode ? 'bg-indigo-500 text-white' : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10'}`} title={isLiteMode ? "Enable Graphics" : "Lite Mode"}>
                            <ZapOff size={18} />
                        </button>
                        <button onClick={() => setAutoRotate(!autoRotate)} className="p-2 rounded-xl bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300" title={autoRotate ? "Lock" : "Unlock"}>
                            {autoRotate ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                        <div className="px-4 py-2 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200/50 dark:border-emerald-500/20 flex items-center gap-2 backdrop-blur-md">
                            <Trophy size={18} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">{totalXP} XP</span>
                        </div>
                    </div>
                </div>

                {/* 3D Scene */}
                <div className="flex-1 relative" onClick={() => { setSelectedBuildingIndex(null); setShowDatePicker(false); }}>
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
                                sessionHistory={visibleHistory}
                                onBuildingSelect={setSelectedBuildingIndex}
                                selectedBuildingIndex={selectedBuildingIndex}
                                autoRotate={autoRotate}
                                resetLakeTrigger={resetLakeTrigger}
                                onLakeDrained={setLakeDrained}
                                isLiteMode={isLiteMode}
                                isDarkMode={isDarkMode}
                            />
                        </Suspense>
                    </Canvas>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none">
                        <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-full text-slate-500 text-xs shadow-sm border border-white/50">
                            {selectedDate ? `Showing buildings from ${selectedDate.toLocaleDateString()}` : 'Left Click to Inspect • Drag to Speed Up/Drain Lake • toggle Lock to Stop'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CityBuilder;
