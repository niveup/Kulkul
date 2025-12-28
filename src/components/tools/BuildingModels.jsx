import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ============================================
// PARTICLE SYSTEMS (Fire, Smoke, Embers)
// ============================================

// Hook for Drop Animation
const useBuildingDrop = (groupRef, isNew, onLand) => {
    // Initial states
    const isDropping = useRef(isNew);
    const yPos = useRef(isNew ? 60 : 0); // Start higher up (60 units)
    const velocity = useRef(0);

    useFrame((state, delta) => {
        if (!isDropping.current || !groupRef.current) return;

        // Physics constants
        const GRAVITY = 25; // Lower gravity for visible fall
        const BOUNCE = 0.4; // More bounce

        // Apply gravity
        velocity.current += GRAVITY * delta;
        yPos.current -= velocity.current * delta;

        // Ground collision
        if (yPos.current <= 0) {
            yPos.current = 0;

            // Bounce or stop
            if (Math.abs(velocity.current) > 2) {
                // Bounce
                velocity.current = -velocity.current * BOUNCE;

                // Trigger splash on FIRST impact (high velocity)
                // We can use a threshold to prevent tiny dribble splashes
                if (Math.abs(velocity.current) > 5 && onLand) {
                    onLand();
                    // Only trigger once
                    onLand = null;
                }
            } else {
                // Stop
                isDropping.current = false;
                velocity.current = 0;
                // Ensure splash happens if it didn't bounce enough (unlikely but safe)
                if (onLand) onLand();
            }
        }

        groupRef.current.position.y = yPos.current;
    });
};

export const FireParticles = ({ position = [0, 0, 0], scale = 1, intensity = 1 }) => {
    const particlesRef = useRef();
    const count = 50 * intensity;

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * scale;
            positions[i * 3 + 1] = Math.random() * scale * 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * scale;

            // Fire colors: yellow to orange to red
            const t = Math.random();
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 0.3 + t * 0.5;
            colors[i * 3 + 2] = t * 0.2;

            sizes[i] = Math.random() * 0.1 + 0.05;
        }

        return { positions, colors, sizes };
    }, [count, scale]);

    useFrame((state) => {
        if (!particlesRef.current) return;
        const positions = particlesRef.current.geometry.attributes.position.array;

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 1] += 0.02 + Math.random() * 0.02;

            if (positions[i * 3 + 1] > scale * 2.5) {
                positions[i * 3] = (Math.random() - 0.5) * scale;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = (Math.random() - 0.5) * scale;
            }

            positions[i * 3] += (Math.random() - 0.5) * 0.01;
            positions[i * 3 + 2] += (Math.random() - 0.5) * 0.01;
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={particlesRef} position={position}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={particles.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                vertexColors
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

export const SmokeParticles = ({ position = [0, 0, 0], scale = 1 }) => {
    const smokeRef = useRef();
    const count = 30;

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const opacities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * scale;
            positions[i * 3 + 1] = Math.random() * scale * 3;
            positions[i * 3 + 2] = (Math.random() - 0.5) * scale;
            opacities[i] = Math.random();
        }

        return { positions, opacities };
    }, [count, scale]);

    useFrame(() => {
        if (!smokeRef.current) return;
        const positions = smokeRef.current.geometry.attributes.position.array;

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 1] += 0.015;
            positions[i * 3] += (Math.random() - 0.5) * 0.02;

            if (positions[i * 3 + 1] > scale * 4) {
                positions[i * 3] = (Math.random() - 0.5) * scale;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = (Math.random() - 0.5) * scale;
            }
        }

        smokeRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={smokeRef} position={position}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.4}
                color="#555555"
                transparent
                opacity={0.3}
                depthWrite={false}
            />
        </points>
    );
};

export const EmberParticles = ({ position = [0, 0, 0], scale = 1 }) => {
    const embersRef = useRef();
    const count = 20;

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * scale * 0.5;
            positions[i * 3 + 1] = Math.random() * scale;
            positions[i * 3 + 2] = (Math.random() - 0.5) * scale * 0.5;
            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: 0.02 + Math.random() * 0.02,
                z: (Math.random() - 0.5) * 0.02,
            });
        }

        return { positions, velocities };
    }, [count, scale]);

    useFrame(() => {
        if (!embersRef.current) return;
        const positions = embersRef.current.geometry.attributes.position.array;

        for (let i = 0; i < count; i++) {
            positions[i * 3] += particles.velocities[i].x;
            positions[i * 3 + 1] += particles.velocities[i].y;
            positions[i * 3 + 2] += particles.velocities[i].z;

            if (positions[i * 3 + 1] > scale * 3) {
                positions[i * 3] = (Math.random() - 0.5) * scale * 0.5;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = (Math.random() - 0.5) * scale * 0.5;
            }
        }

        embersRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={embersRef} position={position}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                color="#FF6B00"
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

// ============================================
// 1. TENT - Complete
// ============================================

export const TentComplete = ({ position = [0, 0, 0], onClick, isSelected, isNew, onLand }) => {
    const groupRef = useRef();
    useBuildingDrop(groupRef, isNew, onLand);

    useFrame((state) => {
        if (groupRef.current && isSelected) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={position} onClick={onClick}>
            {/* Selection indicator */}
            {isSelected && (
                <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.2, 1.4, 32]} />
                    <meshBasicMaterial color="#FFD700" transparent opacity={0.5} />
                </mesh>
            )}

            {/* Ground shadow */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.2} />
            </mesh>

            {/* Main tent - Cone shape */}
            <mesh position={[0, 0.7, 0]}>
                <coneGeometry args={[0.9, 1.4, 4]} />
                <meshStandardMaterial
                    color="#F5A623"
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>

            {/* Tent base rim */}
            <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.95, 1, 0.1, 4]} />
                <meshStandardMaterial color="#E8920D" roughness={0.9} />
            </mesh>

            {/* Center pole */}
            <mesh position={[0, 0.9, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 1.8, 8]} />
                <meshStandardMaterial color="#8B4513" roughness={0.7} />
            </mesh>

            {/* Pole top cap */}
            <mesh position={[0, 1.85, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#5D4037" roughness={0.6} />
            </mesh>

            {/* Flag */}
            <mesh position={[0.15, 1.75, 0]} rotation={[0, 0, 0.3]}>
                <planeGeometry args={[0.25, 0.15]} />
                <meshStandardMaterial color="#E74C3C" side={THREE.DoubleSide} />
            </mesh>

            {/* Entrance flap (dark opening) */}
            <mesh position={[0, 0.35, 0.7]} rotation={[0.2, 0, 0]}>
                <planeGeometry args={[0.4, 0.6]} />
                <meshBasicMaterial color="#3D2314" side={THREE.DoubleSide} />
            </mesh>

            {/* Rope stakes */}
            {[0, 1, 2, 3].map((i) => {
                const angle = (i * Math.PI) / 2 + Math.PI / 4;
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(angle) * 1.1, 0.05, Math.sin(angle) * 1.1]}
                    >
                        <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
                        <meshStandardMaterial color="#5D4037" />
                    </mesh>
                );
            })}
        </group>
    );
};

// ============================================
// 2. TENT - Ruin
// ============================================

export const TentRuin = ({ position = [0, 0, 0], onClick, isSelected, isNew, onLand }) => {
    const groupRef = useRef();
    useBuildingDrop(groupRef, isNew, onLand);

    return (
        <group ref={groupRef} position={position} onClick={onClick}>
            {isSelected && (
                <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.2, 1.4, 32]} />
                    <meshBasicMaterial color="#FF4444" transparent opacity={0.5} />
                </mesh>
            )}

            {/* Burn mark on ground */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.2, 32]} />
                <meshBasicMaterial color="#1a1a1a" transparent opacity={0.4} />
            </mesh>

            {/* Collapsed canvas heap */}
            <mesh position={[0, 0.15, 0]}>
                <dodecahedronGeometry args={[0.6, 0]} />
                <meshStandardMaterial
                    color="#3D3D3D"
                    roughness={1}
                    metalness={0}
                />
            </mesh>

            {/* Burnt fabric pieces */}
            <mesh position={[-0.4, 0.1, 0.3]} rotation={[0.5, 0.3, 0.2]}>
                <boxGeometry args={[0.4, 0.05, 0.3]} />
                <meshStandardMaterial color="#2D2D2D" roughness={1} />
            </mesh>
            <mesh position={[0.3, 0.08, -0.2]} rotation={[-0.3, 0.5, 0.1]}>
                <boxGeometry args={[0.35, 0.04, 0.25]} />
                <meshStandardMaterial color="#4A4A4A" roughness={1} />
            </mesh>

            {/* Broken main pole - tilted */}
            <mesh position={[0.1, 0.5, 0]} rotation={[0, 0, 0.4]}>
                <cylinderGeometry args={[0.04, 0.05, 1, 8]} />
                <meshStandardMaterial color="#5D4037" roughness={0.8} />
            </mesh>

            {/* Broken pole piece on ground */}
            <mesh position={[-0.5, 0.05, 0.2]} rotation={[0, 0.5, Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
                <meshStandardMaterial color="#4E342E" roughness={0.8} />
            </mesh>

            {/* Burnt flag remnant */}
            <mesh position={[0.35, 0.95, 0.1]} rotation={[0.2, 0.3, 0.5]}>
                <planeGeometry args={[0.12, 0.08]} />
                <meshStandardMaterial color="#8B0000" side={THREE.DoubleSide} />
            </mesh>

            {/* Fire and effects */}
            <EmberParticles position={[0, 0.2, 0]} scale={0.6} />
            <SmokeParticles position={[0, 0.3, 0]} scale={0.4} />

            {/* Glowing embers on ground */}
            <pointLight position={[0, 0.2, 0]} color="#FF4500" intensity={0.5} distance={1.5} />
        </group>
    );
};

// ============================================
// 3. COZY HOUSE - Complete
// ============================================

export const CozyHouseComplete = ({ position = [0, 0, 0], onClick, isSelected, isNew, onLand }) => {
    const groupRef = useRef();
    useBuildingDrop(groupRef, isNew, onLand);

    useFrame((state) => {
        if (groupRef.current && isSelected) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.03;
        }
    });

    return (
        <group ref={groupRef} position={position} onClick={onClick}>
            {isSelected && (
                <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.5, 1.7, 32]} />
                    <meshBasicMaterial color="#FFD700" transparent opacity={0.5} />
                </mesh>
            )}

            {/* Ground shadow */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.3, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.15} />
            </mesh>

            {/* Main house body */}
            <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[1.4, 1.2, 1.2]} />
                <meshStandardMaterial color="#C0392B" roughness={0.8} />
            </mesh>

            {/* Roof */}
            <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[1.2, 0.8, 4]} />
                <meshStandardMaterial color="#5D4037" roughness={0.9} />
            </mesh>

            {/* Chimney */}
            <mesh position={[0.4, 1.6, 0.3]}>
                <boxGeometry args={[0.2, 0.5, 0.2]} />
                <meshStandardMaterial color="#757575" roughness={0.7} />
            </mesh>
            <mesh position={[0.4, 1.88, 0.3]}>
                <boxGeometry args={[0.25, 0.06, 0.25]} />
                <meshStandardMaterial color="#616161" roughness={0.7} />
            </mesh>

            {/* Front door */}
            <mesh position={[0, 0.35, 0.61]}>
                <boxGeometry args={[0.35, 0.7, 0.02]} />
                <meshStandardMaterial color="#4E342E" roughness={0.8} />
            </mesh>

            {/* Door frame */}
            <mesh position={[0, 0.55, 0.62]}>
                <boxGeometry args={[0.45, 0.15, 0.02]} />
                <meshStandardMaterial color="#5D4037" roughness={0.7} />
            </mesh>

            {/* Door knob */}
            <mesh position={[0.12, 0.35, 0.63]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#F1C40F" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Windows */}
            {[[-0.35, 0.7, 0.61], [0.35, 0.7, 0.61]].map((pos, i) => (
                <group key={i} position={pos}>
                    <mesh>
                        <boxGeometry args={[0.3, 0.35, 0.02]} />
                        <meshStandardMaterial color="#FFF9C4" emissive="#FFF9C4" emissiveIntensity={0.3} />
                    </mesh>
                    {/* Window frame */}
                    <mesh position={[0, 0, 0.01]}>
                        <boxGeometry args={[0.32, 0.02, 0.02]} />
                        <meshStandardMaterial color="#5D4037" />
                    </mesh>
                    <mesh position={[0, 0, 0.01]} rotation={[0, 0, Math.PI / 2]}>
                        <boxGeometry args={[0.37, 0.02, 0.02]} />
                        <meshStandardMaterial color="#5D4037" />
                    </mesh>
                </group>
            ))}

            {/* Side window */}
            <mesh position={[0.71, 0.6, 0]}>
                <boxGeometry args={[0.02, 0.3, 0.25]} />
                <meshStandardMaterial color="#FFF9C4" emissive="#FFF9C4" emissiveIntensity={0.2} />
            </mesh>

            {/* Flower box */}
            <mesh position={[0, 0.48, 0.68]}>
                <boxGeometry args={[0.5, 0.08, 0.1]} />
                <meshStandardMaterial color="#6D4C41" roughness={0.9} />
            </mesh>

            {/* Flowers */}
            {[-0.15, 0, 0.15].map((x, i) => (
                <mesh key={i} position={[x, 0.56, 0.68]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color={i === 1 ? "#FF5722" : "#E91E63"} />
                </mesh>
            ))}

            {/* Window light glow */}
            <pointLight position={[0, 0.6, 0.8]} color="#FFF9C4" intensity={0.3} distance={1} />
        </group>
    );
};

// ============================================
// 4. COZY HOUSE - Ruin
// ============================================

export const CozyHouseRuin = ({ position = [0, 0, 0], onClick, isSelected, isNew, onLand }) => {
    const groupRef = useRef();
    useBuildingDrop(groupRef, isNew, onLand);

    return (
        <group ref={groupRef} position={position} onClick={onClick}>
            {isSelected && (
                <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.5, 1.7, 32]} />
                    <meshBasicMaterial color="#FF4444" transparent opacity={0.5} />
                </mesh>
            )}

            {/* Burn mark on ground */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.5, 32]} />
                <meshBasicMaterial color="#1a1a1a" transparent opacity={0.3} />
            </mesh>

            {/* Debris pile */}
            <mesh position={[0, 0.15, 0.2]}>
                <dodecahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color="#3E2723" roughness={1} />
            </mesh>
            <mesh position={[0.4, 0.1, -0.1]}>
                <dodecahedronGeometry args={[0.35, 0]} />
                <meshStandardMaterial color="#4A3C3C" roughness={1} />
            </mesh>

            {/* Remaining left wall */}
            <mesh position={[-0.6, 0.5, 0]} rotation={[0, 0, 0.1]}>
                <boxGeometry args={[0.15, 1, 0.8]} />
                <meshStandardMaterial color="#4A3C3C" roughness={0.9} />
            </mesh>

            {/* Remaining back wall fragment */}
            <mesh position={[0, 0.4, -0.5]} rotation={[0.1, 0, 0]}>
                <boxGeometry args={[0.8, 0.7, 0.12]} />
                <meshStandardMaterial color="#3D2B2B" roughness={0.9} />
            </mesh>

            {/* Collapsed roof piece on ground */}
            <mesh position={[0.2, 0.12, 0.4]} rotation={[0.3, 0.2, 0.5]}>
                <boxGeometry args={[0.8, 0.08, 0.6]} />
                <meshStandardMaterial color="#3E2723" roughness={1} />
            </mesh>

            {/* Exposed roof beam */}
            <mesh position={[-0.3, 0.9, 0]} rotation={[0, 0.3, 0.4]}>
                <boxGeometry args={[0.08, 1.2, 0.08]} />
                <meshStandardMaterial color="#5D4037" roughness={0.8} />
            </mesh>

            {/* Chimney remains */}
            <mesh position={[0.5, 0.4, -0.3]} rotation={[0.2, 0, 0.15]}>
                <boxGeometry args={[0.2, 0.6, 0.2]} />
                <meshStandardMaterial color="#555555" roughness={0.8} />
            </mesh>

            {/* Scattered bricks */}
            {[
                [-0.7, 0.05, 0.4],
                [0.6, 0.05, 0.5],
                [-0.3, 0.05, 0.6],
                [0.5, 0.05, -0.5]
            ].map((pos, i) => (
                <mesh key={i} position={pos} rotation={[0, Math.random(), Math.random() * 0.3]}>
                    <boxGeometry args={[0.12, 0.06, 0.08]} />
                    <meshStandardMaterial color="#4A3C3C" roughness={1} />
                </mesh>
            ))}

            {/* Broken window frame */}
            <mesh position={[-0.53, 0.6, 0.1]} rotation={[0, 0.1, 0.05]}>
                <boxGeometry args={[0.02, 0.25, 0.2]} />
                <meshStandardMaterial color="#2D2323" />
            </mesh>

            {/* Fire and smoke effects */}
            <FireParticles position={[0, 0.3, 0]} scale={0.5} intensity={0.7} />
            <SmokeParticles position={[0, 0.5, 0]} scale={0.6} />
            <EmberParticles position={[-0.3, 0.4, 0.2]} scale={0.4} />

            {/* Fire glow */}
            <pointLight position={[0, 0.4, 0]} color="#FF4500" intensity={0.8} distance={2} />
        </group>
    );
};

// ============================================
// 5. OFFICE BUILDING - Complete
// ============================================

export const BuildingComplete = ({ position = [0, 0, 0], onClick, isSelected, isNew, onLand }) => {
    const groupRef = useRef();
    useBuildingDrop(groupRef, isNew, onLand);

    useFrame((state) => {
        if (groupRef.current && isSelected) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
        }
    });

    const windowPositions = useMemo(() => {
        const positions = [];
        for (let floor = 0; floor < 6; floor++) {
            for (let col = 0; col < 4; col++) {
                positions.push({
                    x: -0.45 + col * 0.3,
                    y: 0.4 + floor * 0.45,
                    z: 0.61
                });
            }
        }
        return positions;
    }, []);

    return (
        <group ref={groupRef} position={position} onClick={onClick}>
            {isSelected && (
                <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.3, 1.5, 32]} />
                    <meshBasicMaterial color="#FFD700" transparent opacity={0.5} />
                </mesh>
            )}

            {/* Ground shadow */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.2, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.2} />
            </mesh>

            {/* Main building body */}
            <mesh position={[0, 1.5, 0]}>
                <boxGeometry args={[1.4, 3, 1.2]} />
                <meshStandardMaterial color="#2196F3" roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Roof */}
            <mesh position={[0, 3.05, 0]}>
                <boxGeometry args={[1.5, 0.1, 1.3]} />
                <meshStandardMaterial color="#ECEFF1" roughness={0.5} />
            </mesh>

            {/* Roof equipment */}
            <mesh position={[0, 3.2, 0]}>
                <boxGeometry args={[0.5, 0.2, 0.3]} />
                <meshStandardMaterial color="#455A64" roughness={0.6} />
            </mesh>
            <mesh position={[0.1, 3.35, 0]}>
                <boxGeometry args={[0.15, 0.1, 0.12]} />
                <meshStandardMaterial color="#607D8B" roughness={0.5} />
            </mesh>

            {/* Windows - front */}
            {windowPositions.map((pos, i) => (
                <mesh key={i} position={[pos.x, pos.y, pos.z]}>
                    <boxGeometry args={[0.2, 0.3, 0.02]} />
                    <meshStandardMaterial
                        color="#90CAF9"
                        metalness={0.9}
                        roughness={0.1}
                        envMapIntensity={1}
                    />
                </mesh>
            ))}

            {/* Windows - side */}
            {[0, 1, 2, 3, 4, 5].map((floor) => (
                <mesh key={`side-${floor}`} position={[0.71, 0.4 + floor * 0.45, 0]}>
                    <boxGeometry args={[0.02, 0.3, 0.2]} />
                    <meshStandardMaterial color="#90CAF9" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}

            {/* Horizontal accent bands */}
            {[1.35, 2.2].map((y, i) => (
                <mesh key={i} position={[0, y, 0.61]}>
                    <boxGeometry args={[1.42, 0.05, 0.02]} />
                    <meshStandardMaterial color="#ECEFF1" />
                </mesh>
            ))}

            {/* Entrance */}
            <mesh position={[0, 0.25, 0.61]}>
                <boxGeometry args={[0.5, 0.5, 0.02]} />
                <meshStandardMaterial color="#0D47A1" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.25, 0.62]}>
                <boxGeometry args={[0.4, 0.4, 0.02]} />
                <meshStandardMaterial color="#E3F2FD" metalness={0.5} roughness={0.2} />
            </mesh>

            {/* Entrance canopy */}
            <mesh position={[0, 0.55, 0.7]}>
                <boxGeometry args={[0.7, 0.05, 0.2]} />
                <meshStandardMaterial color="#ECEFF1" />
            </mesh>
        </group>
    );
};

// ============================================
// 6. OFFICE BUILDING - Ruin
// ============================================

export const BuildingRuin = ({ position = [0, 0, 0], onClick, isSelected, isNew, onLand }) => {
    const groupRef = useRef();
    useBuildingDrop(groupRef, isNew, onLand);

    return (
        <group ref={groupRef} position={position} onClick={onClick}>
            {isSelected && (
                <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.5, 1.7, 32]} />
                    <meshBasicMaterial color="#FF4444" transparent opacity={0.5} />
                </mesh>
            )}

            {/* Burn mark */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.8, 32]} />
                <meshBasicMaterial color="#1a1a1a" transparent opacity={0.35} />
            </mesh>

            {/* Large debris pile */}
            <mesh position={[0, 0.25, 0.3]}>
                <dodecahedronGeometry args={[0.7, 1]} />
                <meshStandardMaterial color="#34495E" roughness={1} />
            </mesh>
            <mesh position={[0.5, 0.15, -0.2]}>
                <dodecahedronGeometry args={[0.4, 0]} />
                <meshStandardMaterial color="#2C3E50" roughness={1} />
            </mesh>

            {/* Left structure - still standing */}
            <mesh position={[-0.5, 1, 0]} rotation={[0, 0, 0.05]}>
                <boxGeometry args={[0.4, 2, 0.8]} />
                <meshStandardMaterial color="#5D6D7E" roughness={0.8} />
            </mesh>

            {/* Right structure - shorter, damaged */}
            <mesh position={[0.5, 0.6, 0]} rotation={[0.05, 0, -0.08]}>
                <boxGeometry args={[0.35, 1.2, 0.7]} />
                <meshStandardMaterial color="#4A5568" roughness={0.9} />
            </mesh>

            {/* Collapsed middle section */}
            <mesh position={[0, 0.4, 0]} rotation={[0.2, 0.1, 0.15]}>
                <boxGeometry args={[0.5, 0.6, 0.6]} />
                <meshStandardMaterial color="#5D6D7E" roughness={0.9} />
            </mesh>

            {/* Exposed rebar/steel beams */}
            <mesh position={[-0.3, 1.8, 0.2]} rotation={[0.3, 0.2, 0.4]}>
                <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
                <meshStandardMaterial color="#717171" metalness={0.8} roughness={0.4} />
            </mesh>
            <mesh position={[0.2, 1.5, -0.1]} rotation={[-0.2, 0.3, 0.5]}>
                <cylinderGeometry args={[0.025, 0.025, 0.9, 8]} />
                <meshStandardMaterial color="#717171" metalness={0.8} roughness={0.4} />
            </mesh>
            <mesh position={[0.4, 1.1, 0.3]} rotation={[0.4, -0.2, 0.3]}>
                <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
                <meshStandardMaterial color="#717171" metalness={0.8} roughness={0.4} />
            </mesh>

            {/* Broken floor slabs */}
            <mesh position={[-0.4, 0.8, 0.3]} rotation={[0.3, 0.1, 0.2]}>
                <boxGeometry args={[0.5, 0.06, 0.4]} />
                <meshStandardMaterial color="#5D6D7E" roughness={0.9} />
            </mesh>
            <mesh position={[0.3, 0.5, -0.2]} rotation={[-0.2, 0.2, 0.1]}>
                <boxGeometry args={[0.4, 0.05, 0.35]} />
                <meshStandardMaterial color="#4A5568" roughness={0.9} />
            </mesh>

            {/* Shattered window voids */}
            {[-0.5, -0.5, -0.5].map((x, i) => (
                <mesh key={i} position={[x, 0.5 + i * 0.5, 0.41]} rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.15, 0.2, 0.02]} />
                    <meshBasicMaterial color="#0a0a0a" />
                </mesh>
            ))}

            {/* Glass shards on ground */}
            {[[-0.3, 0.02, 0.5], [0.4, 0.02, 0.6], [-0.5, 0.02, 0.3]].map((pos, i) => (
                <mesh key={i} position={pos} rotation={[Math.PI / 2, Math.random(), 0]}>
                    <planeGeometry args={[0.08, 0.06]} />
                    <meshStandardMaterial
                        color="#5D6D7E"
                        metalness={0.9}
                        roughness={0.1}
                        transparent
                        opacity={0.7}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Fire at collapse point */}
            <FireParticles position={[0, 1, 0]} scale={0.8} intensity={1.2} />
            <SmokeParticles position={[0, 1.5, 0]} scale={1} />
            <SmokeParticles position={[-0.4, 1.8, 0]} scale={0.5} />
            <EmberParticles position={[0.2, 0.8, 0.2]} scale={0.6} />

            {/* Fire glow */}
            <pointLight position={[0, 1.2, 0]} color="#FF4500" intensity={1.5} distance={3} />
            <pointLight position={[-0.3, 0.5, 0.3]} color="#FF6B00" intensity={0.5} distance={1.5} />
        </group>
    );
};

// ============================================
// 7. SKYSCRAPER - Complete
// ============================================

export const SkyscraperComplete = ({ position = [0, 0, 0], onClick, isSelected, isNew, onLand }) => {
    const groupRef = useRef();
    useBuildingDrop(groupRef, isNew, onLand);
    const lightRef = useRef();

    useFrame((state) => {
        if (groupRef.current && isSelected) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
        }
        if (lightRef.current) {
            lightRef.current.intensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
        }
    });

    return (
        <group ref={groupRef} position={position} onClick={onClick}>
            {isSelected && (
                <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.4, 1.6, 32]} />
                    <meshBasicMaterial color="#FFD700" transparent opacity={0.5} />
                </mesh>
            )}

            {/* Ground shadow */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.1, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.25} />
            </mesh>

            {/* Main tower */}
            <mesh position={[0, 2.2, 0]}>
                <boxGeometry args={[1.2, 4.4, 1]} />
                <meshStandardMaterial color="#9C27B0" roughness={0.3} metalness={0.2} />
            </mesh>

            {/* Stepped section 1 */}
            <mesh position={[0, 4.55, 0]}>
                <boxGeometry args={[1, 0.3, 0.85]} />
                <meshStandardMaterial color="#AB47BC" roughness={0.3} />
            </mesh>

            {/* Stepped section 2 (crown) */}
            <mesh position={[0, 4.85, 0]}>
                <boxGeometry args={[0.8, 0.3, 0.7]} />
                <meshStandardMaterial color="#BA68C8" roughness={0.3} />
            </mesh>

            {/* Spire base */}
            <mesh position={[0, 5.15, 0]}>
                <boxGeometry args={[0.2, 0.3, 0.2]} />
                <meshStandardMaterial color="#E0E0E0" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Spire */}
            <mesh position={[0, 5.55, 0]}>
                <coneGeometry args={[0.08, 0.5, 8]} />
                <meshStandardMaterial color="#BDBDBD" metalness={0.95} roughness={0.1} />
            </mesh>

            {/* Spire light */}
            <mesh position={[0, 5.85, 0]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial
                    color="#FFD700"
                    emissive="#FFD700"
                    emissiveIntensity={2}
                />
            </mesh>
            <pointLight ref={lightRef} position={[0, 5.85, 0]} color="#FFD700" intensity={0.8} distance={2} />

            {/* Gold accent bands */}
            {[0.5, 1.5, 2.5, 3.5].map((y, i) => (
                <mesh key={i} position={[0, y, 0.51]}>
                    <boxGeometry args={[1.22, 0.06, 0.02]} />
                    <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
                </mesh>
            ))}

            {/* Windows - front (8 rows x 3 cols) */}
            {Array.from({ length: 8 }).map((_, row) =>
                Array.from({ length: 3 }).map((_, col) => (
                    <mesh key={`win-${row}-${col}`} position={[-0.35 + col * 0.35, 0.4 + row * 0.5, 0.51]}>
                        <boxGeometry args={[0.2, 0.35, 0.02]} />
                        <meshStandardMaterial
                            color="#CE93D8"
                            metalness={0.8}
                            roughness={0.2}
                        />
                    </mesh>
                ))
            )}

            {/* Crown window */}
            <mesh position={[0, 4.75, 0.36]}>
                <boxGeometry args={[0.5, 0.2, 0.02]} />
                <meshStandardMaterial
                    color="#CE93D8"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Side windows */}
            {Array.from({ length: 8 }).map((_, row) => (
                <mesh key={`side-${row}`} position={[0.61, 0.4 + row * 0.5, 0]}>
                    <boxGeometry args={[0.02, 0.3, 0.2]} />
                    <meshStandardMaterial color="#CE93D8" metalness={0.7} roughness={0.3} />
                </mesh>
            ))}

            {/* Gold corner pillars */}
            <mesh position={[-0.55, 2.2, 0.45]}>
                <boxGeometry args={[0.06, 4.4, 0.06]} />
                <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.3} transparent opacity={0.7} />
            </mesh>
            <mesh position={[0.55, 2.2, 0.45]}>
                <boxGeometry args={[0.06, 4.4, 0.06]} />
                <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.3} transparent opacity={0.7} />
            </mesh>

            {/* Entrance */}
            <mesh position={[0, 0.2, 0.51]}>
                <boxGeometry args={[0.5, 0.4, 0.02]} />
                <meshStandardMaterial color="#4A148C" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.2, 0.52]}>
                <boxGeometry args={[0.4, 0.35, 0.02]} />
                <meshStandardMaterial color="#CE93D8" metalness={0.5} roughness={0.2} />
            </mesh>

            {/* Crown accent lights */}
            {[-0.3, 0.3].map((x, i) => (
                <mesh key={i} position={[x, 4.95, 0.36]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1} />
                </mesh>
            ))}
        </group>
    );
};

// ============================================
// 8. SKYSCRAPER - Ruin
// ============================================

export const SkyscraperRuin = ({ position = [0, 0, 0], onClick, isSelected, isNew, onLand }) => {
    const groupRef = useRef();
    useBuildingDrop(groupRef, isNew, onLand);

    return (
        <group ref={groupRef} position={position} onClick={onClick}>
            {isSelected && (
                <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.8, 2, 32]} />
                    <meshBasicMaterial color="#FF4444" transparent opacity={0.5} />
                </mesh>
            )}

            {/* Large burn mark */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2.2, 32]} />
                <meshBasicMaterial color="#0D0513" transparent opacity={0.4} />
            </mesh>

            {/* Massive debris pile */}
            <mesh position={[0, 0.35, 0.4]}>
                <dodecahedronGeometry args={[0.9, 1]} />
                <meshStandardMaterial color="#1A0A26" roughness={1} />
            </mesh>
            <mesh position={[0.6, 0.2, -0.3]}>
                <dodecahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color="#3D2352" roughness={1} />
            </mesh>
            <mesh position={[-0.5, 0.15, 0.2]}>
                <dodecahedronGeometry args={[0.4, 0]} />
                <meshStandardMaterial color="#2A1538" roughness={1} />
            </mesh>

            {/* Toppled top section */}
            <group position={[0.8, 0.4, 0.5]} rotation={[0.6, 0.3, 1.2]}>
                <mesh>
                    <boxGeometry args={[0.6, 1.5, 0.5]} />
                    <meshStandardMaterial color="#3D2352" roughness={0.8} />
                </mesh>
                {/* Windows on toppled section */}
                {[0, 1, 2].map((i) => (
                    <mesh key={i} position={[0, -0.5 + i * 0.4, 0.26]}>
                        <boxGeometry args={[0.15, 0.2, 0.02]} />
                        <meshBasicMaterial color="#0D0513" />
                    </mesh>
                ))}
            </group>

            {/* Left structure - tallest remaining */}
            <mesh position={[-0.5, 1.5, 0]} rotation={[0.03, 0, 0.05]}>
                <boxGeometry args={[0.5, 3, 0.6]} />
                <meshStandardMaterial color="#3D2352" roughness={0.8} />
            </mesh>

            {/* Middle structure */}
            <mesh position={[0, 1.1, 0]} rotation={[0.05, 0.02, -0.03]}>
                <boxGeometry args={[0.45, 2.2, 0.55]} />
                <meshStandardMaterial color="#4A2D5E" roughness={0.85} />
            </mesh>

            {/* Right structure - shorter */}
            <mesh position={[0.5, 0.7, 0]} rotation={[-0.05, 0, 0.08]}>
                <boxGeometry args={[0.4, 1.4, 0.5]} />
                <meshStandardMaterial color="#3D2352" roughness={0.9} />
            </mesh>

            {/* Exposed steel beams */}
            {[
                { pos: [-0.3, 2.8, 0.2], rot: [0.4, 0.2, 0.5], len: 1.5 },
                { pos: [0.1, 2.2, -0.1], rot: [-0.3, 0.4, 0.6], len: 1.2 },
                { pos: [0.4, 1.3, 0.3], rot: [0.5, -0.3, 0.4], len: 0.9 },
                { pos: [-0.4, 2.2, -0.2], rot: [0.2, 0.5, 0.3], len: 0.8 },
                { pos: [0.2, 1.8, 0.25], rot: [-0.4, 0.2, 0.7], len: 1.0 },
            ].map((beam, i) => (
                <mesh key={i} position={beam.pos} rotation={beam.rot}>
                    <cylinderGeometry args={[0.03, 0.03, beam.len, 8]} />
                    <meshStandardMaterial color="#717171" metalness={0.9} roughness={0.3} />
                </mesh>
            ))}

            {/* Cross beams */}
            {[1.2, 1.8, 2.4].map((y, i) => (
                <mesh key={i} position={[-0.25, y, 0.31]} rotation={[0, 0, 0.1 * (i - 1)]}>
                    <boxGeometry args={[0.7, 0.04, 0.04]} />
                    <meshStandardMaterial color="#717171" metalness={0.8} roughness={0.4} />
                </mesh>
            ))}

            {/* Hanging floor sections */}
            <mesh position={[-0.3, 1.6, 0.25]} rotation={[0.3, 0.1, 0.25]}>
                <boxGeometry args={[0.6, 0.06, 0.4]} />
                <meshStandardMaterial color="#3D2352" roughness={0.9} />
            </mesh>
            <mesh position={[0.1, 2.1, -0.1]} rotation={[-0.2, 0.15, 0.15]}>
                <boxGeometry args={[0.5, 0.05, 0.35]} />
                <meshStandardMaterial color="#4A2D5E" roughness={0.9} />
            </mesh>

            {/* Window voids */}
            {[-0.5, -0.5, -0.5, -0.5].map((x, i) => (
                <mesh key={i} position={[x, 0.6 + i * 0.6, 0.31]}>
                    <boxGeometry args={[0.12, 0.25, 0.02]} />
                    <meshBasicMaterial color="#050208" />
                </mesh>
            ))}
            {[0, 0, 0].map((x, i) => (
                <mesh key={`mid-${i}`} position={[x, 0.5 + i * 0.55, 0.28]}>
                    <boxGeometry args={[0.12, 0.22, 0.02]} />
                    <meshBasicMaterial color="#050208" />
                </mesh>
            ))}

            {/* Multiple fire sources */}
            <FireParticles position={[0, 1.8, 0]} scale={1} intensity={1.5} />
            <FireParticles position={[-0.4, 2.5, 0.1]} scale={0.6} intensity={0.8} />
            <FireParticles position={[0.3, 0.6, 0.3]} scale={0.5} intensity={0.6} />

            {/* Heavy smoke */}
            <SmokeParticles position={[0, 2.5, 0]} scale={1.5} />
            <SmokeParticles position={[-0.3, 3, 0]} scale={0.8} />
            <SmokeParticles position={[0.4, 1.5, 0.2]} scale={0.6} />

            {/* Embers */}
            <EmberParticles position={[0.1, 1.5, 0.2]} scale={0.8} />
            <EmberParticles position={[-0.3, 2.2, 0]} scale={0.5} />

            {/* Fire glows */}
            <pointLight position={[0, 2, 0]} color="#FF4500" intensity={2} distance={4} />
            <pointLight position={[-0.4, 2.8, 0]} color="#FF6B00" intensity={1} distance={2} />
            <pointLight position={[0.3, 0.8, 0.3]} color="#FF4500" intensity={0.8} distance={1.5} />
        </group>
    );
};

// ============================================
// 9. LANDMARK (BURJ KHALIFA) - Complete
// ============================================

export const LandmarkComplete = ({ position = [0, 0, 0], onClick, isSelected, isNew, onLand }) => {
    const groupRef = useRef();
    useBuildingDrop(groupRef, isNew, onLand);

    useFrame((state) => {
        if (groupRef.current && isSelected) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
        }
    });

    return (
        <group ref={groupRef} position={position} onClick={onClick}>
            {isSelected && (
                <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.5, 1.8, 32]} />
                    <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
                </mesh>
            )}

            {/* Ground shadow - Larger for landmark */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.4, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.3} />
            </mesh>

            {/* Base Tier (Y-shape footprint implied) */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.8, 1.2, 3, 6]} />
                <meshStandardMaterial color="#0288D1" metalness={0.6} roughness={0.2} />
            </mesh>

            {/* Mid Tier 1 */}
            <mesh position={[0, 3.5, 0]}>
                <cylinderGeometry args={[0.6, 0.8, 2, 6]} />
                <meshStandardMaterial color="#039BE5" metalness={0.7} roughness={0.1} />
            </mesh>

            {/* Mid Tier 2 */}
            <mesh position={[0, 5, 0]}>
                <cylinderGeometry args={[0.4, 0.6, 1.5, 6]} />
                <meshStandardMaterial color="#29B6F6" metalness={0.8} roughness={0.1} />
            </mesh>

            {/* Top Tier */}
            <mesh position={[0, 6, 0]}>
                <cylinderGeometry args={[0.2, 0.4, 1.5, 6]} />
                <meshStandardMaterial color="#4FC3F7" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Spire Base */}
            <mesh position={[0, 7, 0]}>
                <cylinderGeometry args={[0.05, 0.2, 1, 6]} />
                <meshStandardMaterial color="#E1F5FE" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Needles/Spire Top */}
            <mesh position={[0, 7.8, 0]}>
                <cylinderGeometry args={[0.01, 0.05, 1, 4]} />
                <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
            </mesh>

            {/* Accent Rings (Lights) */}
            {[2.8, 4.2, 5.5, 6.5].map((y, i) => (
                <mesh key={i} position={[0, y, 0]}>
                    <torusGeometry args={[0.1 + (0.7 - i * 0.15), 0.05, 16, 32]} />
                    <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} />
                </mesh>
            ))}

            {/* Vertical Metallic Fins */}
            {[0, 120, 240].map((angle, i) => (
                <group key={i} rotation={[0, (angle * Math.PI) / 180, 0]}>
                    <mesh position={[0.7, 2, 0]}>
                        <boxGeometry args={[0.1, 4, 0.1]} />
                        <meshStandardMaterial color="#B3E5FC" metalness={1} roughness={0} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

// ============================================
// 10. LANDMARK (BURJ KHALIFA) - Ruin
// ============================================

export const LandmarkRuin = ({ position = [0, 0, 0], onClick, isSelected, isNew, onLand }) => {
    const groupRef = useRef();
    useBuildingDrop(groupRef, isNew, onLand);

    return (
        <group ref={groupRef} position={position} onClick={onClick}>
            {isSelected && (
                <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.5, 1.8, 32]} />
                    <meshBasicMaterial color="#FF4444" transparent opacity={0.6} />
                </mesh>
            )}

            {/* Large Scorch Mark */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2.5, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.6} />
            </mesh>

            {/* Base Stump (Collapsed) */}
            <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[1, 1.4, 1.2, 7]} />
                <meshStandardMaterial color="#263238" roughness={0.9} />
            </mesh>

            {/* Toppled Spire Section */}
            <group position={[1.5, 0.4, 0.5]} rotation={[0, 0, 1.4]}>
                <mesh>
                    <cylinderGeometry args={[0.3, 0.5, 2, 6]} />
                    <meshStandardMaterial color="#37474F" roughness={0.8} />
                </mesh>
                {/* Still glowing faint light on toppled section */}
                <mesh position={[0, 0.5, 0]}>
                    <torusGeometry args={[0.4, 0.04, 8, 16]} />
                    <meshStandardMaterial color="#00BCD4" emissive="#006064" emissiveIntensity={0.5} />
                </mesh>
            </group>

            {/* Middle Section - Leaning precariously */}
            <mesh position={[-0.2, 1.8, -0.2]} rotation={[0.4, 0.2, -0.1]}>
                <cylinderGeometry args={[0.7, 0.9, 2.5, 6]} />
                <meshStandardMaterial color="#455A64" roughness={0.8} metalness={0.2} />
            </mesh>

            {/* Exposed Interior/Rebar */}
            {Array.from({ length: 6 }).map((_, i) => (
                <mesh key={i} position={[(Math.random() - 0.5) * 0.8, 1.5 + Math.random() * 1.5, (Math.random() - 0.5) * 0.8]} rotation={[Math.random(), Math.random(), Math.random()]}>
                    <cylinderGeometry args={[0.02, 0.02, 1, 4]} />
                    <meshStandardMaterial color="#FF5722" emissive="#FF5722" emissiveIntensity={0.5} />
                </mesh>
            ))}

            {/* Massive Fire & Smoke */}
            <FireParticles position={[0, 1, 0]} scale={1.5} intensity={2.0} />
            <FireParticles position={[-0.5, 2.5, -0.2]} scale={0.8} intensity={1.5} />

            <SmokeParticles position={[0, 3, 0]} scale={2} />
            <SmokeParticles position={[1, 1, 0]} scale={1.2} />

            <EmberParticles position={[0, 2, 0]} scale={1.2} />

            {/* Apocalyptic Glow */}
            <pointLight position={[0, 1.5, 0]} color="#FF3D00" intensity={3} distance={5} />
        </group>
    );
};
