import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

// Use simple geometry for stones instead of loading models to keep it self-contained
const StoneGeometry = new THREE.DodecahedronGeometry(0.2, 0);
const SkullGeometry = new THREE.SphereGeometry(0.25, 8, 8); // Placeholder for skull, improved below

// ============================================
// HIDDEN SECRETS
// ============================================

const FishSkeleton = ({ position, rotation }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Spine */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.01, 0.8, 4]} />
                <meshStandardMaterial color="#E0E0E0" roughness={0.9} />
            </mesh>
            {/* Ribs */}
            {[0.1, 0.2, 0.3, 0.4, 0.5].map((x, i) => (
                <group key={i} position={[x - 0.3, 0, 0]}>
                    <mesh rotation={[0, 0, 0.5]}>
                        <cylinderGeometry args={[0.01, 0.01, 0.25, 4]} />
                        <meshStandardMaterial color="#E0E0E0" roughness={0.9} />
                    </mesh>
                    <mesh rotation={[0, 0, -0.5]}>
                        <cylinderGeometry args={[0.01, 0.01, 0.25, 4]} />
                        <meshStandardMaterial color="#E0E0E0" roughness={0.9} />
                    </mesh>
                </group>
            ))}
            {/* Head */}
            <mesh position={[0.4, 0, 0]}>
                <coneGeometry args={[0.1, 0.2, 4]} rotation={[0, 0, -Math.PI / 2]} />
                <meshStandardMaterial color="#E0E0E0" roughness={0.9} />
            </mesh>
        </group>
    );
};

const CreatureSkull = ({ position, rotation }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Cranium */}
            <mesh>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color="#F5F5F5" roughness={0.8} />
            </mesh>
            {/* Jaw/Snout */}
            <mesh position={[0.1, -0.1, 0.15]}>
                <boxGeometry args={[0.2, 0.15, 0.2]} />
                <meshStandardMaterial color="#F5F5F5" roughness={0.8} />
            </mesh>
            {/* Eye Sockets */}
            <mesh position={[0.15, 0.05, 0.2]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0.15, 0.05, -0.2]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
        </group>
    );
};

const LiveFish = ({ position, color = "#FF9800", speed = 1 }) => {
    const ref = useRef();
    const [offset] = useState(Math.random() * 100);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime * speed + offset;
        // Swim in a circle
        const radius = 0.8;
        ref.current.position.x = Math.sin(t) * radius;
        ref.current.position.z = Math.cos(t) * radius;
        ref.current.rotation.y = -t;

        // Bobbing/Jumping
        // Occasional jump
        const jumpPhase = (t % 10); // every 10 arbitrary units
        if (jumpPhase > 9) {
            ref.current.position.y = Math.sin((jumpPhase - 9) * Math.PI) * 0.5; // Jump up
            ref.current.rotation.z = Math.sin((jumpPhase - 9) * Math.PI) * 0.5; // Tilt up
        } else {
            ref.current.position.y = Math.sin(t * 3) * 0.05; // Gentle bob
            ref.current.rotation.z = 0;
        }
    });

    return (
        <group ref={ref} position={position}>
            <mesh rotation={[0, Math.PI / 2, 0]}>
                <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Tail */}
            <mesh position={[0, 0, -0.15]}>
                <planeGeometry args={[0.1, 0.1]} />
                <meshStandardMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};


// ============================================
// INTERACTIVE LAKE
// ============================================

// Internal component for the reset effect
const GenesisShockwave = ({ onComplete }) => {
    const ringRef = useRef();
    const columnRef = useRef();

    useFrame((state, delta) => {
        // Ring expansion
        if (ringRef.current) {
            ringRef.current.scale.x += delta * 20; // Faster expansion
            ringRef.current.scale.y += delta * 20;
            ringRef.current.material.opacity -= delta * 1.5;
        }

        // Column splash (water spout)
        if (columnRef.current) {
            columnRef.current.scale.y += delta * 10;
            columnRef.current.scale.x = Math.max(0, columnRef.current.scale.x - delta * 2);
            columnRef.current.scale.z = Math.max(0, columnRef.current.scale.z - delta * 2);
            columnRef.current.material.opacity -= delta * 2.0;
        }

        if (ringRef.current && ringRef.current.material.opacity <= 0) {
            onComplete();
        }
    });

    return (
        <group position={[0, 0.1, 0]}>
            {/* Expansion Ring */}
            <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 1.2, 32]} />
                <meshBasicMaterial color="#E0F7FA" transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>
            {/* Water Spout */}
            <mesh ref={columnRef} position={[0, 1, 0]}>
                <cylinderGeometry args={[0.5, 1.5, 0.5, 16]} />
                <meshBasicMaterial color="#00B0FF" transparent opacity={0.6} />
            </mesh>
        </group>
    );
};



export const InteractiveLake = ({ position, sessionHistory = [], splashTrigger = 0 }) => {
    // 1. Calculate Target Health based on History
    const targetHealth = useMemo(() => {
        return (sessionHistory && sessionHistory.length > 0) ? 1.0 : 0.0;
    }, [sessionHistory]);

    // 2. Slow Healing Animation
    const healthRef = useRef(0.0);
    const [displayHealth, setDisplayHealth] = useState(0.0);

    // Audio System
    // Audio System removed


    useFrame((state, delta) => {
        const speed = 0.5;
        healthRef.current += (targetHealth - healthRef.current) * speed * delta;

        if (Math.abs(healthRef.current - displayHealth) > 0.05) {
            setDisplayHealth(healthRef.current);
        }

        // Random Fish Sounds if healthy

    });

    // 3. Splash Effect Logic
    const [activeSplashes, setActiveSplashes] = useState([]);
    useEffect(() => {
        if (splashTrigger > 0) {
            const id = Date.now();
            setActiveSplashes(prev => [...prev, id]);

        }
    }, [splashTrigger]);

    const removeSplash = (id) => {
        setActiveSplashes(prev => prev.filter(s => s !== id));
    };

    // 3. Derived Colors

    // 0.0 (Dead) = #212121 (Dark Grey/Black) | 1.0 (Alive) = #4CAF50 (Vibrant Green)
    const plantColor = new THREE.Color().lerpColors(new THREE.Color("#263238"), new THREE.Color("#66BB6A"), displayHealth);
    const waterColor = new THREE.Color().lerpColors(new THREE.Color("#37474F"), new THREE.Color("#4FC3F7"), displayHealth);

    return (
        <group position={position}>
            {/* Water Surface */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <circleGeometry args={[1.3, 32]} />
                <meshStandardMaterial
                    color={waterColor}
                    metalness={0.8}
                    roughness={0.1}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Splashes */}
            {activeSplashes.map(id => (
                <GenesisShockwave key={id} onComplete={() => removeSplash(id)} />
            ))}

            {/* Lake Bed */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
                <circleGeometry args={[1.35, 32]} />
                <meshStandardMaterial color="#0288D1" />
            </mesh>

            {/* Ecosystem Elements */}

            {/* Dark Greenery (Vines) - Fades OUT as health increases */}
            {displayHealth < 0.8 && (
                <group>
                    {/* Twisted roots/vines taking over */}
                    <mesh position={[0.8, 0.1, 0.8]} scale={1.0 - displayHealth}>
                        <torusKnotGeometry args={[0.2, 0.05, 64, 8]} />
                        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
                    </mesh>
                    <mesh position={[-0.8, 0.1, -0.5]} scale={1.0 - displayHealth}>
                        <torusKnotGeometry args={[0.15, 0.04, 64, 8]} />
                        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
                    </mesh>
                </group>
            )}

            {/* Dead Elements (Skeletons) - Visible when health is LOW */}
            {displayHealth < 0.3 && (
                <group>
                    <FishSkeleton position={[0.2, 0.05, 0.2]} rotation={[0, 0.5, 0]} />
                    <FishSkeleton position={[-0.4, 0.05, -0.3]} rotation={[0, 2, 0]} />
                    <CreatureSkull position={[0.5, 0.08, -0.4]} rotation={[0.2, -0.5, 0]} />
                </group>
            )}

            {/* Live Fish - Visible when health is HIGH (> 0.4) */}
            {displayHealth > 0.4 && (
                <group>
                    {/* Fish swim happily */}
                    <LiveFish position={[0, -0.1, 0]} speed={1.5} color="#FF5722" />
                    <LiveFish position={[0.5, -0.2, 0.5]} speed={2} color="#FFEB3B" />
                    <LiveFish position={[-0.3, -0.15, -0.3]} speed={1.8} color="#03A9F4" />
                </group>
            )}
        </group>
    );
};

// ============================================
// STATIC ENVIRONMENT
// ============================================

export const Platform = () => {
    return (
        <group>
            {/* Main Concrete Platform */}
            <mesh receiveShadow position={[0, -0.2, 0]}>
                <boxGeometry args={[11, 0.4, 11]} />
                <meshStandardMaterial color="#90A4AE" roughness={0.6} />
            </mesh>

            {/* Darker Base/Dirt */}
            <mesh position={[0, -0.7, 0]}>
                <boxGeometry args={[11, 0.6, 11]} />
                <meshStandardMaterial color="#37474F" roughness={0.9} />
            </mesh>

            {/* Grid Lines (Subtle) */}
            <gridHelper args={[10, 10, "#546E7A", "#CFD8DC"]} position={[0, 0.01, 0]} />
        </group>
    );
};

export const Fence = () => {
    const posts = [];
    const rails = [];

    // Fences on two sides: x=-5 and z=-5 for isometric framing
    for (let i = 0; i <= 10; i += 1.25) {
        // Post at x=-5 edge
        posts.push(<mesh key={`p1-${i}`} position={[-5.1, 0.4, -5 + i]}><boxGeometry args={[0.1, 0.8, 0.1]} /><meshStandardMaterial color="#455A64" /></mesh>);
    }
    rails.push(<mesh key="r1" position={[-5.1, 0.6, 0]}><boxGeometry args={[0.05, 0.1, 10]} /><meshStandardMaterial color="#546E7A" /></mesh>);
    rails.push(<mesh key="r2" position={[-5.1, 0.3, 0]}><boxGeometry args={[0.05, 0.1, 10]} /><meshStandardMaterial color="#546E7A" /></mesh>);

    for (let i = 0; i <= 10; i += 1.25) {
        // Post at z=-5 edge
        posts.push(<mesh key={`p2-${i}`} position={[-5 + i, 0.4, -5.1]}><boxGeometry args={[0.1, 0.8, 0.1]} /><meshStandardMaterial color="#455A64" /></mesh>);
    }
    rails.push(<mesh key="r3" position={[0, 0.6, -5.1]}><boxGeometry args={[10, 0.1, 0.05]} /><meshStandardMaterial color="#546E7A" /></mesh>);
    rails.push(<mesh key="r4" position={[0, 0.3, -5.1]}><boxGeometry args={[10, 0.1, 0.05]} /><meshStandardMaterial color="#546E7A" /></mesh>);

    return (
        <group>
            {posts}
            {rails}
        </group>
    );
};
