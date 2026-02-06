import React, { useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export const KatexRenderer = ({ latex }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (containerRef.current && latex) {
            try {
                katex.render(latex, containerRef.current, {
                    throwOnError: false,
                    displayMode: true,
                    trust: true
                });
            } catch (error) {
                containerRef.current.textContent = latex;
            }
        }
    }, [latex]);
    return <span ref={containerRef} className="katex-display-wrapper" />;
};

export const MixedTextRenderer = ({ text, isDarkMode }) => {
    if (!text) return null;
    const processedText = text.replace(/\s+(\d+\.)\s/g, '\n$1 ');
    const lines = processedText.split(/\\n|\n/);

    const renderWithSubscripts = (str, key) => {
        const parts = str.split(/([A-Za-zλαβγδ]+_[A-Za-z0-9/]+)/g);
        return parts.map((part, i) => {
            if (part.includes('_')) {
                const [base, sub] = part.split('_');
                return (
                    <span key={`${key}-${i}`}>
                        {base}<sub className="text-xs opacity-70">{sub}</sub>
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <>
            {lines.map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    {line.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                                <strong
                                    key={i}
                                    className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                                >
                                    {renderWithSubscripts(part.slice(2, -2), `b-${i}`)}
                                </strong>
                            );
                        }
                        return (
                            <span
                                key={i}
                                className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}
                            >
                                {renderWithSubscripts(part, `p-${i}`)}
                            </span>
                        );
                    })}
                </React.Fragment>
            ))}
        </>
    );
};
