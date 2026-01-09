/**
 * Advanced Motion Hooks
 * 
 * Custom hooks for premium interactions:
 * - Magnetic cursor effects
 * - 3D tilt cards
 * - Parallax scrolling
 * - Velocity-based transforms
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { springs } from './motion';

// =============================================================================
// MAGNETIC ELEMENT HOOK
// =============================================================================

/**
 * Creates a magnetic effect where the element pulls towards the cursor
 * 
 * @param {number} strength - How much the element moves (default: 0.3)
 * @param {number} radius - Detection radius in pixels (default: 150)
 * @returns {object} - { ref, style, isHovered }
 * 
 * @example
 * const { ref, style, isHovered } = useMagneticElement(0.4, 200);
 * <motion.button ref={ref} style={style}>Magnetic Button</motion.button>
 */
export const useMagneticElement = (strength = 0.3, radius = 150) => {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Raw motion values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Spring-smoothed values
    const springX = useSpring(x, springs.snappy);
    const springY = useSpring(y, springs.snappy);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseMove = (e) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;
            const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

            if (distance < radius) {
                setIsHovered(true);
                x.set(distanceX * strength);
                y.set(distanceY * strength);
            } else {
                setIsHovered(false);
                x.set(0);
                y.set(0);
            }
        };

        const handleMouseLeave = () => {
            setIsHovered(false);
            x.set(0);
            y.set(0);
        };

        window.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [strength, radius, x, y]);

    return {
        ref,
        style: { x: springX, y: springY },
        isHovered,
    };
};

// =============================================================================
// 3D TILT CARD HOOK
// =============================================================================

/**
 * Creates a 3D tilt effect on cards based on mouse position
 * 
 * @param {number} maxTilt - Maximum rotation in degrees (default: 10)
 * @param {number} scale - Scale on hover (default: 1.02)
 * @param {boolean} glare - Whether to show glare effect (default: true)
 * @returns {object} - { ref, style, glareStyle, isHovered }
 * 
 * @example
 * const { ref, style, glareStyle, isHovered } = use3DTilt(15, 1.03, true);
 * <motion.div ref={ref} style={style}>
 *   <div style={glareStyle} className="glare-overlay" />
 *   Card Content
 * </motion.div>
 */
export const use3DTilt = (maxTilt = 10, scale = 1.02, glare = true) => {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Raw motion values
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const scaleValue = useMotionValue(1);

    // Glare position
    const glareX = useMotionValue(50);
    const glareY = useMotionValue(50);
    const glareOpacity = useMotionValue(0);

    // Spring-smoothed values
    const springRotateX = useSpring(rotateX, springs.snappy);
    const springRotateY = useSpring(rotateY, springs.snappy);
    const springScale = useSpring(scaleValue, springs.smooth);
    const springGlareX = useSpring(glareX, springs.snappy);
    const springGlareY = useSpring(glareY, springs.snappy);
    const springGlareOpacity = useSpring(glareOpacity, springs.smooth);

    const handleMouseMove = useCallback((e) => {
        const element = ref.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate mouse position relative to center (-1 to 1)
        const mouseX = (e.clientX - centerX) / (rect.width / 2);
        const mouseY = (e.clientY - centerY) / (rect.height / 2);

        // Invert for natural tilt direction
        rotateX.set(-mouseY * maxTilt);
        rotateY.set(mouseX * maxTilt);
        scaleValue.set(scale);

        // Update glare position (opposite to mouse for reflection effect)
        if (glare) {
            glareX.set(50 + mouseX * 30);
            glareY.set(50 + mouseY * 30);
            glareOpacity.set(0.15);
        }
    }, [maxTilt, scale, glare, rotateX, rotateY, scaleValue, glareX, glareY, glareOpacity]);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        rotateX.set(0);
        rotateY.set(0);
        scaleValue.set(1);
        glareOpacity.set(0);
    }, [rotateX, rotateY, scaleValue, glareOpacity]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

    return {
        ref,
        style: {
            rotateX: springRotateX,
            rotateY: springRotateY,
            scale: springScale,
            transformStyle: 'preserve-3d',
            transformPerspective: 1000,
        },
        glareStyle: {
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            background: useTransform(
                [springGlareX, springGlareY],
                ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.3), transparent 50%)`
            ),
            opacity: springGlareOpacity,
        },
        isHovered,
    };
};

// =============================================================================
// SPOTLIGHT EFFECT HOOK
// =============================================================================

/**
 * Creates a spotlight gradient that follows the cursor
 * 
 * @param {string} color - Spotlight color (default: 'rgba(99, 102, 241, 0.15)')
 * @param {number} size - Spotlight size in pixels (default: 400)
 * @returns {object} - { ref, spotlightStyle }
 */
export const useSpotlight = (color = 'rgba(99, 102, 241, 0.15)', size = 400) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const opacity = useMotionValue(0);

    const springX = useSpring(x, springs.instant);
    const springY = useSpring(y, springs.instant);
    const springOpacity = useSpring(opacity, springs.smooth);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseMove = (e) => {
            const rect = element.getBoundingClientRect();
            x.set(e.clientX - rect.left);
            y.set(e.clientY - rect.top);
        };

        const handleMouseEnter = () => opacity.set(1);
        const handleMouseLeave = () => opacity.set(0);

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [x, y, opacity]);

    const spotlightStyle = {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
        background: useTransform(
            [springX, springY],
            ([posX, posY]) => `radial-gradient(${size}px circle at ${posX}px ${posY}px, ${color}, transparent)`
        ),
        opacity: springOpacity,
    };

    return { ref, spotlightStyle };
};

// =============================================================================
// ANIMATED COUNTER HOOK
// =============================================================================

/**
 * Animates a number value with spring physics (slot machine effect)
 * 
 * @param {number} value - Target value to animate to
 * @param {object} options - { decimals, duration }
 * @returns {object} - { displayValue, motionValue }
 */
export const useAnimatedCounter = (value, { decimals = 0, duration = 1 } = {}) => {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        ...springs.smooth,
        duration,
    });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    useEffect(() => {
        const unsubscribe = springValue.on('change', (latest) => {
            setDisplayValue(parseFloat(latest.toFixed(decimals)));
        });
        return unsubscribe;
    }, [springValue, decimals]);

    return { displayValue, motionValue: springValue };
};

// =============================================================================
// SCROLL VELOCITY HOOK
// =============================================================================

/**
 * Tracks scroll velocity for momentum-based effects
 * 
 * @returns {object} - { scrollY, scrollVelocity, scrollDirection }
 */
export const useScrollVelocity = () => {
    const scrollY = useMotionValue(0);
    const scrollVelocity = useMotionValue(0);
    const [scrollDirection, setScrollDirection] = useState('none');
    const lastScrollY = useRef(0);
    const lastTime = useRef(Date.now());

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            const currentTime = Date.now();
            const timeDelta = currentTime - lastTime.current;

            if (timeDelta > 0) {
                const velocity = (currentY - lastScrollY.current) / timeDelta * 100;
                scrollVelocity.set(velocity);

                if (velocity > 1) setScrollDirection('down');
                else if (velocity < -1) setScrollDirection('up');
                else setScrollDirection('none');
            }

            scrollY.set(currentY);
            lastScrollY.current = currentY;
            lastTime.current = currentTime;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrollY, scrollVelocity]);

    return { scrollY, scrollVelocity, scrollDirection };
};

// =============================================================================
// PARALLAX ELEMENT HOOK
// =============================================================================

/**
 * Creates a parallax effect based on scroll position
 * 
 * @param {number} speed - Parallax speed multiplier (default: 0.5)
 * @returns {object} - { ref, style }
 */
export const useParallax = (speed = 0.5) => {
    const ref = useRef(null);
    const y = useMotionValue(0);
    const springY = useSpring(y, springs.smooth);

    useEffect(() => {
        const handleScroll = () => {
            const element = ref.current;
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const windowCenterY = window.innerHeight / 2;
            const offset = (centerY - windowCenterY) * speed * -1;

            y.set(offset);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial calculation

        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed, y]);

    return { ref, style: { y: springY } };
};

export default {
    useMagneticElement,
    use3DTilt,
    useSpotlight,
    useAnimatedCounter,
    useScrollVelocity,
    useParallax,
};
