/**
 * Math Sanitizer Utility
 * 
 * Multi-pass filter that converts raw text with various mathematical notations
 * into properly formatted LaTeX for KaTeX rendering.
 * 
 * Handles:
 * - Basic: subscripts, superscripts, fractions, square roots
 * - Greek letters: α, β, γ, θ, π, etc.
 * - Trigonometry: sin, cos, tan with inverse notation
 * - Calculus: integrals, limits, summations, derivatives
 * - Physics: units, vectors, scientific notation
 * - Chemistry: chemical formulas, subscripts for elements
 */

// Greek letter mappings
const GREEK_MAP = {
    'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta',
    'ε': '\\epsilon', 'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta',
    'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda', 'μ': '\\mu',
    'ν': '\\nu', 'ξ': '\\xi', 'π': '\\pi', 'ρ': '\\rho',
    'σ': '\\sigma', 'τ': '\\tau', 'υ': '\\upsilon', 'φ': '\\phi',
    'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega',
    'Γ': '\\Gamma', 'Δ': '\\Delta', 'Θ': '\\Theta', 'Λ': '\\Lambda',
    'Ξ': '\\Xi', 'Π': '\\Pi', 'Σ': '\\Sigma', 'Φ': '\\Phi',
    'Ψ': '\\Psi', 'Ω': '\\Omega', '∆': '\\Delta'
};

// Unicode subscript/superscript mappings
const SUBSCRIPT_MAP = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
    'ₐ': 'a', 'ₑ': 'e', 'ₕ': 'h', 'ᵢ': 'i', 'ⱼ': 'j',
    'ₖ': 'k', 'ₗ': 'l', 'ₘ': 'm', 'ₙ': 'n', 'ₒ': 'o',
    'ₚ': 'p', 'ᵣ': 'r', 'ₛ': 's', 'ₜ': 't', 'ᵤ': 'u',
    'ᵥ': 'v', 'ₓ': 'x'
};

const SUPERSCRIPT_MAP = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '⁺': '+', '⁻': '-', '⁼': '=', '⁽': '(', '⁾': ')',
    'ⁿ': 'n', 'ᵃ': 'a', 'ᵇ': 'b', 'ᶜ': 'c', 'ᵈ': 'd',
    'ᵉ': 'e', 'ᶠ': 'f', 'ᵍ': 'g', 'ʰ': 'h', 'ⁱ': 'i',
    'ʲ': 'j', 'ᵏ': 'k', 'ˡ': 'l', 'ᵐ': 'm', 'ᵒ': 'o',
    'ᵖ': 'p', 'ʳ': 'r', 'ˢ': 's', 'ᵗ': 't', 'ᵘ': 'u',
    'ᵛ': 'v', 'ʷ': 'w', 'ˣ': 'x', 'ʸ': 'y', 'ᶻ': 'z'
};

// Math symbols (√ removed - browsers render it natively, and \\sqrt without arg is invalid)
const SYMBOL_MAP = {
    '∞': '\\infty', '∫': '\\int', '∑': '\\sum',
    '∏': '\\prod', '∂': '\\partial', '∇': '\\nabla',
    '≤': '\\leq', '≥': '\\geq', '≠': '\\neq', '≈': '\\approx',
    '≡': '\\equiv', '∈': '\\in', '∉': '\\notin', '⊂': '\\subset',
    '⊃': '\\supset', '∪': '\\cup', '∩': '\\cap', '∅': '\\emptyset',
    '→': '\\rightarrow', '←': '\\leftarrow', '↔': '\\leftrightarrow',
    '⇒': '\\Rightarrow', '⇐': '\\Leftarrow', '⇔': '\\Leftrightarrow',
    '×': '\\times', '÷': '\\div', '±': '\\pm', '∓': '\\mp',
    '·': '\\cdot', '°': '^\\circ', '′': "'", '″': "''",
    'Å': '\\text{Å}', '⊕': '\\oplus', '⊗': '\\otimes'
};

// Vector notation
const VECTOR_MAP = {
    'î': '\\hat{i}', 'ĵ': '\\hat{j}', 'k̂': '\\hat{k}',
    'â': '\\hat{a}', 'b̂': '\\hat{b}', 'n̂': '\\hat{n}',
    'r̂': '\\hat{r}', 'x̂': '\\hat{x}', 'ŷ': '\\hat{y}', 'ẑ': '\\hat{z}'
};

/**
 * Pass 1: Convert Unicode characters to LaTeX equivalents
 */
function pass1_unicodeToLatex(text) {
    if (!text) return text;
    let result = text;

    // Greek letters
    for (const [unicode, latex] of Object.entries(GREEK_MAP)) {
        result = result.replace(new RegExp(unicode, 'g'), `$${latex}$`);
    }

    // Vectors
    for (const [unicode, latex] of Object.entries(VECTOR_MAP)) {
        result = result.replace(new RegExp(unicode, 'g'), `$${latex}$`);
    }

    // Math symbols
    for (const [unicode, latex] of Object.entries(SYMBOL_MAP)) {
        // Escape special regex chars
        const escaped = unicode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(escaped, 'g'), `$${latex}$`);
    }

    // Subscripts: collect consecutive subscript chars
    result = result.replace(/([₀₁₂₃₄₅₆₇₈₉ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ]+)/g, (match) => {
        const converted = match.split('').map(c => SUBSCRIPT_MAP[c] || c).join('');
        return `$_{${converted}}$`;
    });

    // Superscripts: collect consecutive superscript chars
    result = result.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ]+)/g, (match) => {
        const converted = match.split('').map(c => SUPERSCRIPT_MAP[c] || c).join('');
        return `$^{${converted}}$`;
    });

    return result;
}

/**
 * Pass 2: Fix common fraction patterns
 * Converts a/b, x²/y², etc. to proper fractions
 */
function pass2_fixFractions(text) {
    if (!text) return text;
    let result = text;

    // Pattern: $something$/$something$ -> $\frac{something}{something}$
    result = result.replace(/\$([^$]+)\$\s*\/\s*\$([^$]+)\$/g, '$\\frac{$1}{$2}$');

    // Pattern: word/word (simple fractions like x/y, a/b)
    result = result.replace(/\b([a-zA-Z0-9]+)\s*\/\s*([a-zA-Z0-9]+)\b/g, (match, num, den) => {
        // Only convert if it looks like a math fraction (not URLs, etc.)
        if (num.length <= 3 && den.length <= 3) {
            return `$\\frac{${num}}{${den}}$`;
        }
        return match;
    });

    return result;
}

/**
 * Pass 3: Fix trig, log, and calculus functions
 */
function pass3_fixFunctions(text) {
    if (!text) return text;
    let result = text;

    // Trig functions with inverse: sin⁻¹, cos⁻¹, tan⁻¹
    result = result.replace(/\b(sin|cos|tan|cot|sec|csc)\s*\$\^\{-1\}\$/gi, '$\\$1^{-1}$');
    result = result.replace(/\b(sin|cos|tan|cot|sec|csc)\s*⁻¹/gi, '$\\$1^{-1}$');
    result = result.replace(/\b(sin|cos|tan|cot|sec|csc)\^-1/gi, '$\\$1^{-1}$');

    // Standalone trig/log functions not in math mode
    const funcs = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'ln', 'log', 'exp', 'lim', 'max', 'min'];
    funcs.forEach(fn => {
        // Match function followed by space or ( but not already escaped
        const regex = new RegExp(`(?<!\\\\)\\b${fn}\\s*(?=\\(|\\s|$)`, 'gi');
        result = result.replace(regex, `$\\${fn}$`);
    });

    // Fix integrals with limits
    result = result.replace(/\$\\int\$\s*_\{?([^}\s]+)\}?\s*\^\{?([^}\s]+)\}?/g, '$\\int_{$1}^{$2}$');
    result = result.replace(/∫\s*_\{?([^}\s]+)\}?\s*\^\{?([^}\s]+)\}?/g, '$\\int_{$1}^{$2}$');

    // Fix summation with limits
    result = result.replace(/\$\\sum\$\s*_\{?([^}\s]+)\}?\s*\^\{?([^}\s]+)\}?/g, '$\\sum_{$1}^{$2}$');

    // Fix limits
    result = result.replace(/\blim\s*(?:as\s*)?([a-zA-Z])\s*(?:→|->|to)\s*([a-zA-Z0-9∞]+)/gi,
        (match, variable, target) => `$\\lim_{${variable} \\to ${target}}$`);

    return result;
}

/**
 * Pass 4: Clean up and merge adjacent math blocks
 */
function pass4_cleanup(text) {
    if (!text) return text;
    let result = text;

    // Remove empty math blocks
    result = result.replace(/\$\s*\$/g, '');

    // Merge adjacent math blocks: $a$ $b$ -> $a b$
    let prev;
    do {
        prev = result;
        result = result.replace(/\$([^$]+)\$\s*\$([^$]+)\$/g, '$$$1 $2$$');
    } while (result !== prev);

    // Fix double backslashes that might break KaTeX
    result = result.replace(/\\\\\\\\(?=[a-zA-Z])/g, '\\');

    // REMOVED: This was causing "He$^+$" to render as "Hex+"
    // result = result.replace(/(?<!\$)\$\^/g, '$x^'); // Add placeholder

    // Fix $^{-}$ patterns (should be $^{-1}$ or similar)
    result = result.replace(/\$\^\{-\}\$/g, '$^{-1}$');

    return result;
}

/**
 * Main sanitizer function - runs all 4 passes
 * IMPORTANT: Preserves existing $...$ LaTeX blocks to avoid nested delimiters
 */
export function sanitizeMath(text, passes = 4) {
    if (!text) return text;

    // Extract existing LaTeX blocks to preserve them
    const latexBlocks = [];
    const placeholder = '___LATEX_BLOCK___';

    // Replace all $...$ blocks with placeholders
    let processedText = text.replace(/\$([^$]+)\$/g, (match) => {
        latexBlocks.push(match);
        return placeholder + (latexBlocks.length - 1) + '___';
    });

    // Run sanitization passes only on non-LaTeX content
    for (let i = 0; i < passes; i++) {
        processedText = pass1_unicodeToLatex(processedText);
        processedText = pass2_fixFractions(processedText);
        processedText = pass3_fixFunctions(processedText);
        processedText = pass4_cleanup(processedText);
    }

    // Restore the original LaTeX blocks
    processedText = processedText.replace(/___LATEX_BLOCK___(\d+)___/g, (match, index) => {
        return latexBlocks[parseInt(index)];
    });

    return processedText;
}

/**
 * Sanitize an array of options
 */
export function sanitizeOptions(options) {
    if (!options) return options;
    return options.map(opt => sanitizeMath(opt));
}

export default sanitizeMath;
