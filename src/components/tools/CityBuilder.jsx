import React, { useMemo, useState, Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Html, Sky, Stars } from '@react-three/drei';
import { Trophy, Map, Lock, Unlock, Zap } from 'lucide-react';
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

const Scene = ({ positions, sessionHistory, onBuildingSelect, selectedBuildingIndex }) => {
    // State for splash effect
    const [splashTrigger, setSplashTrigger] = useState(0);

    // Lighting and Environment
    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={0.8}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.5} color="#90CAF9" />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sky sunPosition={[10, 20, 10]} turbidity={8} rayleigh={6} />
            <Environment preset="city" />

            <Platform />
            <Fence />

            {/* Interactive Lake in the corner */}
            <InteractiveLake
                position={[3.5, 0, 3.5]}
                sessionHistory={sessionHistory}
                splashTrigger={splashTrigger}
            />

            {/* Buildings */}
            {sessionHistory.map((session, index) => {
                if (!positions[index]) return null;

                const pos = positions[index];
                // Grid x,y are 0..10. Map to world coordinates -5..5
                const worldX = (pos.x - 5) + 0.5; // +0.5 to center in tile
                const worldZ = (pos.y - 5) + 0.5;

                const config = getBuildingConfig(session.minutes);
                const isFailed = session.status === 'failed';

                // Determine Comp
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
                        {/* Tooltip via Html */}
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

            <ContactShadows opacity={0.4} scale={20} blur={2} far={4.5} />
        </>
    );
};

const CityBuilder = ({ sessionHistory = [] }) => {
    // State for selected building tooltip
    const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(null);
    // State for auto-rotation
    const [autoRotate, setAutoRotate] = useState(false);
    // State for Genesis Pulse
    const [isLakeDrained, setLakeDrained] = useState(false);
    const [resetLakeTrigger, setResetLakeTrigger] = useState(0);

    const handleGenesisPulse = () => {
        setResetLakeTrigger(prev => prev + 1);
        setLakeDrained(false);
        setAutoRotate(true); // Restart rotation on reset
    };

    // Calculate total XP
    const totalXP = useMemo(() => {
        return sessionHistory.reduce((acc, session) => {
            if (session.status === 'failed') return acc + 5;
            return acc + session.minutes;
        }, 0);
    }, [sessionHistory]);

    // Position Generation Logic (Same as before but tailored for 3D Grid)
    const positions = useMemo(() => {
        const GRID_SIZE = 10;
        // Logic to avoid the "Lake" area which we decided is roughly bottom-right (idx 7,7 to 9,9 in a 0-9 grid)
        const isLake = (x, y) => {
            return (x >= 7 && y >= 7);
        };

        const allPositions = [];
        // We want to fill from center-ish or random, but respect boundaries
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                if (!isLake(x, y)) {
                    allPositions.push({ x, y });
                }
            }
        }

        // Poisson-like / Farthest Point Sampling
        const ordered = [];
        if (allPositions.length > 0) {
            // Start with a random seed
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

                // Distance to nearest existing
                for (const existing of ordered) {
                    const dx = candidate.x - existing.x;
                    const dy = candidate.y - existing.y;
                    const d = dx * dx + dy * dy;
                    if (d < minDist) minDist = d;
                }

                // Score: prefer further away, add jitter
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

    return (
        <div className="h-full flex flex-col min-h-0 bg-slate-50/50 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 shrink-0 bg-white/40 backdrop-blur-sm border-b border-white/20 z-10 relative">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Map className="text-emerald-600" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Productivity City</h2>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Genesis Pulse Button - appears when lake is drained */}
                    {isLakeDrained && (
                        <button
                            onClick={handleGenesisPulse}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all text-sm font-semibold animate-pulse"
                        >
                            <Zap size={16} />
                            Genesis Pulse
                        </button>
                    )}

                    <button
                        onClick={() => setAutoRotate(!autoRotate)}
                        className="p-2 rounded-xl bg-white/50 border border-white/50 hover:bg-white/80 transition-colors text-slate-600"
                        title={autoRotate ? "Lock Rotation" : "Unlock Rotation"}
                    >
                        {autoRotate ? <Unlock size={18} /> : <Lock size={18} />}
                    </button>
                    <div className="px-4 py-2 bg-emerald-100/50 rounded-xl border border-emerald-200/50 flex items-center gap-2 backdrop-blur-md">
                        <Trophy size={18} className="text-emerald-600" />
                        <span className="font-bold text-emerald-700">{totalXP} XP</span>
                    </div>
                </div>
            </div>

            {/* 3D Scene */}
            <div className="flex-1 relative" onClick={() => setSelectedBuildingIndex(null)}>
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
                            sessionHistory={sessionHistory}
                            onBuildingSelect={setSelectedBuildingIndex}
                            selectedBuildingIndex={selectedBuildingIndex}
                            autoRotate={autoRotate}
                            resetLakeTrigger={resetLakeTrigger}
                            onLakeDrained={setLakeDrained}
                        />
                    </Suspense>
                </Canvas>

                {/* Legend or Instructions Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none">
                    <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-full text-slate-500 text-xs shadow-sm border border-white/50">
                        Left Click to Inspect • Drag to Speed Up/Drain Lake • toggle Lock to Stop
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CityBuilder;
