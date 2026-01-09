/**
 * Animated Counter Component
 * 
 * "Slot machine" style number animation using spring physics.
 * Numbers roll up from 0 to the target value.
 */

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { springs } from '../../lib/motion';

const AnimatedCounter = ({
    value,
    decimals = 0,
    prefix = '',
    suffix = '',
    className = '',
    duration = 1.5,
}) => {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        ...springs.smooth,
        duration,
    });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        // Parse the value (handle strings like "2.5h" or "45 min")
        const numericValue = parseFloat(value) || 0;
        motionValue.set(numericValue);
    }, [value, motionValue]);

    useEffect(() => {
        const unsubscribe = springValue.on('change', (latest) => {
            setDisplayValue(parseFloat(latest.toFixed(decimals)));
        });
        return unsubscribe;
    }, [springValue, decimals]);

    // Format the display value
    const formattedValue = displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return (
        <motion.span
            className={className}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.smooth}
        >
            {prefix}{formattedValue}{suffix}
        </motion.span>
    );
};

export default AnimatedCounter;
