import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw'; // Needed to render the HTML from user's logic
import 'katex/dist/katex.min.css';

// ── All known element symbols ──
const elements = new Set([
    'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar',
    'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
    'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr',
    'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd',
    'In', 'Sn', 'Sb', 'Te', 'I', 'Xe',
    'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy',
    'Ho', 'Er', 'Tm', 'Yb', 'Lu',
    'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi',
    'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am',
    'Cm', 'Bk', 'Cf'
]);

// ── Symbol Map ──
const symbols = {
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε',
    zeta: 'ζ', eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ',
    lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο',
    pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ',
    phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
    Alpha: 'Α', Beta: 'Β', Gamma: 'Γ', Delta: 'Δ', Epsilon: 'Ε',
    Zeta: 'Ζ', Eta: 'Η', Theta: 'Θ', Iota: 'Ι', Kappa: 'Κ',
    Lambda: 'Λ', Mu: 'Μ', Nu: 'Ν', Xi: 'Ξ', Omicron: 'Ο',
    Pi: 'Π', Rho: 'Ρ', Sigma: 'Σ', Tau: 'Τ', Upsilon: 'Υ',
    Phi: 'Φ', Chi: 'Χ', Psi: 'Ψ', Omega: 'Ω',
    infinity: '∞', inf: '∞',
    sqrt: '√', sum: '∑', product: '∏', integral: '∫', partial: '∂',
    nabla: '∇', degree: '°', deg: '°',
    plusminus: '±', '+-': '±', minus: '−',
    times: '×', cross: '×', divide: '÷', dot: '·', cdot: '·',
    '!=': '≠', noteq: '≠', neq: '≠',
    '<=': '≤', leq: '≤', '>=': '≥', geq: '≥',
    '<<': '≪', '>>': '≫',
    approx: '≈', '~~': '≈',
    equiv: '≡', prop: '∝', propto: '∝',
    forall: '∀', exists: '∃',
    in: '∈', notin: '∉', elem: '∈',
    subset: '⊂', superset: '⊃',
    union: '∪', intersect: '∩',
    and: '∧', or: '∨', not: '¬',
    therefore: '∴', because: '∵',
    angle: '∠', perpendicular: '⊥', perp: '⊥',
    parallel: '∥', congruent: '≅', similar: '∼',
    prime: '′', dprime: '″',
    rightarrow: '→', '-->': '→', '->': '→',
    leftarrow: '←', '<--': '←',
    uparrow: '↑', downarrow: '↓',
    leftrightarrow: '↔', '<-->': '↔',
    implies: '⟹', '=>': '⟹',
    iff: '⟺', equilibrium: '⇌', mapsto: '↦',
    star: '★', bullet: '•', ellipsis: '…', '...': '…',
    hbar: 'ℏ', angstrom: 'Å', micro: 'µ', ohm: 'Ω',
    celsius: '℃', fahrenheit: '℉',
    empty: '∅', emptyset: '∅',
    R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', C: 'ℂ',
};

// ── Check if a word is a chemical formula ──
function isChemFormula(word) {
    // Must have letter(s) followed by digit somewhere
    if (!/[a-zA-Z]\d/.test(word)) return false;

    // Try to parse as sequence of elements+numbers
    let regex = /^([A-Za-z][a-z]?)(\d*)/;
    let remaining = word;
    let elementCount = 0;
    let hasNumber = false;

    while (remaining.length > 0) {
        // Skip digits at start (coefficients like 2H2O)
        if (/^\d/.test(remaining)) {
            remaining = remaining.replace(/^\d+/, '');
            hasNumber = true;
            continue;
        }
        // Skip + sign
        if (/^\+/.test(remaining)) {
            remaining = remaining.substring(1).trim();
            continue;
        }
        // Try to match element
        let match = remaining.match(/^([A-Za-z][a-z]?)(\d*)(.*)/);
        if (match) {
            let el = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
            if (elements.has(el) || el.length === 1) {
                elementCount++;
                if (match[2]) hasNumber = true;
                remaining = match[3];
            } else {
                // Not a known element — might still be chemistry shorthand
                // Allow if pattern continues
                elementCount++;
                if (match[2]) hasNumber = true;
                remaining = match[3];
            }
        } else {
            return false;
        }
    }

    return elementCount >= 1 && hasNumber;
}

// ── Format a chemical formula word ──
function formatChemWord(word) {
    let t = '';
    let i = 0;
    while (i < word.length) {
        // Check for 2-letter element
        if (i + 1 < word.length && /[a-zA-Z]/.test(word[i]) && /[a-z]/.test(word[i + 1])) {
            t += word[i].toUpperCase() + word[i + 1].toLowerCase();
            i += 2;
        }
        // Single letter element
        else if (/[a-zA-Z]/.test(word[i])) {
            t += word[i].toUpperCase();
            i++;
        }
        // Number -> subscript
        else if (/\d/.test(word[i])) {
            let num = '';
            while (i < word.length && /\d/.test(word[i])) {
                num += word[i];
                i++;
            }
            t += '<sub>' + num + '</sub>';
        }
        else {
            t += word[i];
            i++;
        }
    }
    return '<span class="chem">' + t + '</span>';
}

// ── Check if entire content is just a symbol ──
function formatSymbol(raw) {
    const key = raw.trim();
    if (symbols[key] !== undefined)
        return '<span class="symbol">' + symbols[key] + '</span>';
    for (const k in symbols) {
        if (k.toLowerCase() === key.toLowerCase())
            return '<span class="symbol">' + symbols[k] + '</span>';
    }
    return null;
}

// ── frac(num, den) ──
function replaceFrac(text) {
    let result = text;
    let safety = 20;
    while (result.includes('frac(') && safety-- > 0) {
        const idx = result.indexOf('frac(');
        const start = idx + 5;
        let depth = 1, commaPos = -1, i = start;
        while (i < result.length && depth > 0) {
            if (result[i] === '(') depth++;
            else if (result[i] === ')') { depth--; if (depth === 0) break; }
            else if (result[i] === ',' && depth === 1 && commaPos === -1) commaPos = i;
            i++;
        }
        if (commaPos !== -1 && depth === 0) {
            const num = result.slice(start, commaPos).trim();
            const den = result.slice(commaPos + 1, i).trim();
            const html = '<span class="frac"><span class="num">' + num + '</span><span class="den">' + den + '</span></span>';
            result = result.slice(0, idx) + html + result.slice(i + 1);
        } else break;
    }
    return result;
}

// ── Generic func(content) ──
function replaceFunc(text, funcName, formatter) {
    let result = text;
    let safety = 20;
    while (result.includes(funcName + '(') && safety-- > 0) {
        const idx = result.indexOf(funcName + '(');
        const start = idx + funcName.length + 1;
        let depth = 1, i = start;
        while (i < result.length && depth > 0) {
            if (result[i] === '(') depth++;
            else if (result[i] === ')') depth--;
            i++;
        }
        if (depth === 0) {
            const content = result.slice(start, i - 1);
            const html = formatter(content);
            result = result.slice(0, idx) + html + result.slice(i);
        } else break;
    }
    return result;
}

// ── Unified format: handles math + chem + symbols together ──
function formatBlock(raw) {
    let t = raw.trim();

    // 1. Exact symbol match (whole block is one symbol)
    const sym = formatSymbol(t);
    if (sym) return sym;

    // 2. Replace symbol words inside expression
    const sortedKeys = Object.keys(symbols)
        .filter(k => /^[a-zA-Z]{2,}$/.test(k))
        .sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
        const regex = new RegExp('\\b' + key + '\\b', 'gi');
        t = t.replace(regex, (m) => {
            // Match exact case first, then case-insensitive
            if (symbols[m]) return symbols[m];
            for (const k in symbols) {
                if (k.toLowerCase() === m.toLowerCase()) return symbols[k];
            }
            return m;
        });
    }

    // Symbol operators
    t = t.replace(/!=/g, '≠');
    t = t.replace(/<=/g, '≤');
    t = t.replace(/>=/g, '≥');
    t = t.replace(/\+\-/g, '±');
    t = t.replace(/~~/g, '≈');
    t = t.replace(/<=>/g, '⇌');
    t = t.replace(/->/g, '→');

    // 2.5 Quick fraction shorthand: 3/4, x/y -> frac(a, b)
    // Matches numbers or words separated by /
    t = t.replace(/\b(\w+)\s*\/\s*(\w+)\b/g, 'frac($1, $2)');

    // 3. Math functions: frac, sqrt, abs, bar, vec
    t = replaceFrac(t);
    t = replaceFunc(t, 'sqrt', c =>
        '<span class="sqrt-wrap"><span class="sqrt-sign">√</span><span class="sqrt-body">' + c + '</span></span>');
    t = replaceFunc(t, 'abs', c =>
        '<span class="abs-bar">|</span>' + c + '<span class="abs-bar">|</span>');
    t = replaceFunc(t, 'bar', c =>
        '<span class="overline">' + c + '</span>');
    t = replaceFunc(t, 'vec', c =>
        '<span style="display:inline-block;text-align:center;"><span style="display:block;font-size:0.6em;line-height:0.8;">→</span>' + c + '</span>');

    // 4. Grouped superscript: ^{...}
    t = t.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
    // Grouped subscript: _{...}
    t = t.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');

    // 5. Single char superscript: ^x, ^2
    t = t.replace(/\^([a-zA-Z0-9αβγδεζηθικλμνξπρστυφχψω])/g, '<sup>$1</sup>');
    // Single char subscript: _x, _2
    t = t.replace(/_([a-zA-Z0-9αβγδεζηθικλμνξπρστυφχψω])/g, '<sub>$1</sub>');

    // 6. Charges: ^2+, ^-, ^2-  (chemistry ions)
    t = t.replace(/\^(\d*[+\-])/g, '<sup>$1</sup>');

    // 7. Multiplication shorthand: a * b
    t = t.replace(/([a-zA-Z0-9)\]])\ *\*\ *([a-zA-Z0-9(])/g, '$1 · $2');

    // 8. NOW detect chemistry words — letters followed by numbers
    //    but NOT already inside <sub>, <sup>, or HTML tags
    t = t.replace(/(?<![<\w\/])([a-zA-Z]{1,2}\d+(?:[a-zA-Z]{1,2}\d*)*)/g, (match) => {
        // Skip if it's inside an HTML tag already
        if (isChemFormula(match)) {
            return formatChemWord(match);
        }
        return match;
    });

    // Also handle standalone chemistry words separated by spaces/+/arrows
    // Find word-like tokens that look like chemical formulas
    t = t.replace(/(^|[\s=+])(\d*)([a-zA-Z]{1,2}\d+[a-zA-Z0-9]*)/g, (full, before, coeff, formula) => {
        // Don't process if already has HTML tags in it
        if (/</.test(formula)) return full;
        if (isChemFormula(formula)) {
            return before + coeff + formatChemWord(formula);
        }
        return full;
    });

    return '<span class="math">' + t + '</span>';
}

// ── Main transform function similar to user's logic ──
function preProcessContent(text) {
    if (!text) return '';

    // Restore arrows (user's code had these, keeping them)
    // Note: react-markdown might unescape things, but we prefer clean inputs
    let res = text;
    res = res.replace(/->/g, '→'); // Simple replacement if needed before logic?
    // User logic had -> replaced inside formatBlock.

    // 0. Preserve vertical spacing (multiple newlines)
    // Replaces \n that is followed by another \n with \n&nbsp;
    // This turns "empty" lines into lines with a space, preventing collapse
    res = res.replace(/\n(?=\n)/g, '\n&nbsp;');

    // Process every {content} block with unified formatter
    // This is the CRITICAL part: Only touches { } blocks
    res = res.replace(/\{([^}]+)\}/g, (match, content) => {
        return formatBlock(content);
    });

    return res;
}

const MarkdownRenderer = ({ content, className = '', as = 'div' }) => {
    // 1. Pre-process only {} blocks
    const processedContent = useMemo(() => {
        return preProcessContent(content);
    }, [content]);

    // Memoize the plugins
    const remarkPlugins = useMemo(() => [remarkMath, remarkBreaks], []);
    // WE ADD rehypeRaw to support the HTML generated by formatBlock
    const rehypePlugins = useMemo(() => [rehypeKatex, rehypeRaw], []);

    const components = useMemo(() => ({
        // Override paragraph to avoid unnecessary margins if needed
        p: ({ node, ...props }) => {
            if (as === 'span') return <span {...props} className="inline" />;
            return <p {...props} className="mb-2 last:mb-0" />;
        },
        a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />
        )
    }), [as]);

    const Wrapper = as;

    return (
        <>
            <style>{`
                /* User's Styles for Math/Chem - Neutral Colors */
                .preview sub { font-size: 0.7em; color: inherit; }
                .preview sup { font-size: 0.7em; color: inherit; }
                .preview .chem { font-weight: 600; color: inherit; }
                .preview .math { color: inherit; }
                .preview .arrow { font-size: 1.2em; color: inherit; }
                .preview .symbol { font-size: 1.1em; color: inherit; }

                .frac {
                  display: inline-flex;
                  flex-direction: column;
                  align-items: center;
                  vertical-align: middle;
                  font-size: 0.85em;
                }
                .frac .num {
                  border-bottom: 1.5px solid currentColor;
                  padding: 0 6px 2px;
                  line-height: 1.3;
                }
                .frac .den {
                  padding: 2px 6px 0;
                  line-height: 1.3;
                }

                .sqrt-wrap {
                  display: inline-flex;
                  align-items: center;
                  vertical-align: middle;
                }
                .sqrt-sign { font-size: 1.3em; margin-right: 1px; color: inherit; }
                .sqrt-body { border-top: 1.5px solid currentColor; padding: 0 4px; margin-top: 2px; }

                .overline { text-decoration: overline; }
                .abs-bar { font-weight: bold; color: inherit; }
                
                /* Dark mode compatibility fixes */
                .dark .preview sub { color: inherit; }
                .dark .frac .num { border-color: currentColor; }
            `}</style>
            <Wrapper className={`prose dark:prose-invert max-w-none whitespace-pre-wrap ${className} preview`}>
                <ReactMarkdown
                    children={processedContent}
                    remarkPlugins={remarkPlugins}
                    rehypePlugins={rehypePlugins}
                    components={components}
                />
            </Wrapper>
        </>
    );
};

export default React.memo(MarkdownRenderer);
