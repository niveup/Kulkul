import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const KatexRenderer = ({ math, block = false }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            try {
                katex.render(math, containerRef.current, {
                    displayMode: block,
                    throwOnError: false, // Render error message instead of crashing
                    strict: false,
                });
            } catch (error) {
                console.error('KaTeX rendering error:', error);
                containerRef.current.textContent = math; // Fallback to raw text
            }
        }
    }, [math, block]);

    return <span ref={containerRef} />;
};

export default KatexRenderer;
