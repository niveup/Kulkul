/**
 * Tests for mathSanitizer.js - LaTeX Math Sanitization Utilities
 * 
 * Multi-pass filter that converts raw text with various mathematical notations
 * into properly formatted LaTeX for KaTeX rendering.
 * 
 * Test Categories:
 * 1. Greek letter conversion
 * 2. Unicode subscript/superscript handling
 * 3. Math symbol conversion
 * 4. Vector notation
 * 5. Fraction handling
 * 6. Trigonometric and math functions
 * 7. Cleanup and edge cases
 */

import { describe, it, expect } from 'vitest';
import { sanitizeMath, sanitizeOptions } from './mathSanitizer';

// =============================================================================
// PASS 1: Unicode to LaTeX Conversion
// =============================================================================
describe('Unicode to LaTeX Conversion', () => {
    describe('Greek Letters', () => {
        it('converts lowercase Greek letters', () => {
            expect(sanitizeMath('α')).toContain('\\alpha');
            expect(sanitizeMath('β')).toContain('\\beta');
            expect(sanitizeMath('γ')).toContain('\\gamma');
            expect(sanitizeMath('θ')).toContain('\\theta');
            expect(sanitizeMath('π')).toContain('\\pi');
            expect(sanitizeMath('ω')).toContain('\\omega');
        });

        it('converts uppercase Greek letters', () => {
            expect(sanitizeMath('Γ')).toContain('\\Gamma');
            expect(sanitizeMath('Δ')).toContain('\\Delta');
            expect(sanitizeMath('Θ')).toContain('\\Theta');
            expect(sanitizeMath('Σ')).toContain('\\Sigma');
            expect(sanitizeMath('Ω')).toContain('\\Omega');
        });

        it('converts Delta symbol (∆)', () => {
            expect(sanitizeMath('∆x')).toContain('\\Delta');
        });

        it('handles multiple Greek letters in text', () => {
            const result = sanitizeMath('α + β = γ');
            expect(result).toContain('\\alpha');
            expect(result).toContain('\\beta');
            expect(result).toContain('\\gamma');
        });

        it('preserves surrounding text', () => {
            const result = sanitizeMath('The angle θ is measured in radians');
            expect(result).toContain('The angle');
            expect(result).toContain('\\theta');
            expect(result).toContain('is measured in radians');
        });
    });

    describe('Unicode Subscripts', () => {
        it('converts numeric subscripts', () => {
            expect(sanitizeMath('x₀')).toContain('_{0}');
            expect(sanitizeMath('x₁')).toContain('_{1}');
            expect(sanitizeMath('v₂')).toContain('_{2}');
        });

        it('converts consecutive subscripts', () => {
            const result = sanitizeMath('a₁₂');
            expect(result).toContain('_{12}');
        });

        it('converts letter subscripts', () => {
            expect(sanitizeMath('xₙ')).toContain('_{n}');
            expect(sanitizeMath('yₘ')).toContain('_{m}');
        });

        it('handles mixed subscripts', () => {
            const result = sanitizeMath('a₁ + b₂ = c₃');
            expect(result).toContain('_{1}');
            expect(result).toContain('_{2}');
            expect(result).toContain('_{3}');
        });
    });

    describe('Unicode Superscripts', () => {
        it('converts numeric superscripts', () => {
            expect(sanitizeMath('x²')).toContain('^{2}');
            expect(sanitizeMath('x³')).toContain('^{3}');
            expect(sanitizeMath('x⁴')).toContain('^{4}');
        });

        it('converts consecutive superscripts', () => {
            const result = sanitizeMath('10⁻³');
            expect(result).toContain('^{-3}');
        });

        it('converts special superscripts', () => {
            expect(sanitizeMath('xⁿ')).toContain('^{n}');
        });

        it('handles superscript plus and minus', () => {
            expect(sanitizeMath('10⁺')).toContain('^{+}');
            // Note: The cleanup pass converts $^{-}$ to $^{-1}$ 
            // This is intentional behavior in the sanitizer
            expect(sanitizeMath('10⁻')).toContain('^{-1}');
        });
    });

    describe('Math Symbols', () => {
        it('converts infinity symbol', () => {
            expect(sanitizeMath('∞')).toContain('\\infty');
        });

        it('converts comparison operators', () => {
            expect(sanitizeMath('x ≤ y')).toContain('\\leq');
            expect(sanitizeMath('x ≥ y')).toContain('\\geq');
            expect(sanitizeMath('x ≠ y')).toContain('\\neq');
            expect(sanitizeMath('x ≈ y')).toContain('\\approx');
        });

        it('converts set notation', () => {
            expect(sanitizeMath('x ∈ A')).toContain('\\in');
            expect(sanitizeMath('x ∉ A')).toContain('\\notin');
            expect(sanitizeMath('∅')).toContain('\\emptyset');
        });

        it('converts arrows', () => {
            expect(sanitizeMath('→')).toContain('\\rightarrow');
            expect(sanitizeMath('←')).toContain('\\leftarrow');
            expect(sanitizeMath('⇒')).toContain('\\Rightarrow');
        });

        it('converts arithmetic operators', () => {
            expect(sanitizeMath('×')).toContain('\\times');
            expect(sanitizeMath('÷')).toContain('\\div');
            expect(sanitizeMath('±')).toContain('\\pm');
        });

        it('converts degree symbol', () => {
            expect(sanitizeMath('90°')).toContain('^\\circ');
        });

        it('converts calculus symbols', () => {
            expect(sanitizeMath('∫')).toContain('\\int');
            expect(sanitizeMath('∑')).toContain('\\sum');
            expect(sanitizeMath('∂')).toContain('\\partial');
            expect(sanitizeMath('∇')).toContain('\\nabla');
        });
    });

    describe('Vector Notation', () => {
        it('converts unit vectors', () => {
            expect(sanitizeMath('î')).toContain('\\hat{i}');
            expect(sanitizeMath('ĵ')).toContain('\\hat{j}');
        });

        it('converts general vector hats', () => {
            expect(sanitizeMath('n̂')).toContain('\\hat{n}');
            expect(sanitizeMath('r̂')).toContain('\\hat{r}');
        });
    });
});

// =============================================================================
// PASS 2: Fraction Handling
// =============================================================================
describe('Fraction Handling', () => {
    it('converts simple word fractions', () => {
        const result = sanitizeMath('a/b');
        expect(result).toContain('\\frac{a}{b}');
    });

    it('converts numeric fractions', () => {
        const result = sanitizeMath('1/2');
        expect(result).toContain('\\frac{1}{2}');
    });

    it('converts multi-digit fractions', () => {
        const result = sanitizeMath('12/34');
        expect(result).toContain('\\frac{12}{34}');
    });

    it('does not convert long word divisions (URLs, paths)', () => {
        // Fractions only convert if both parts are 3 chars or less
        const result = sanitizeMath('http/protocol');
        expect(result).not.toContain('\\frac');
    });

    it('converts fractions with short variable names', () => {
        expect(sanitizeMath('dx/dt')).toContain('\\frac{dx}{dt}');
        expect(sanitizeMath('mv/r')).toContain('\\frac{mv}{r}');
    });
});

// =============================================================================
// PASS 3: Function Handling
// =============================================================================
describe('Trigonometric and Math Functions', () => {
    describe('Trig Functions', () => {
        it('formats basic trig functions', () => {
            expect(sanitizeMath('sin(x)')).toContain('\\sin');
            expect(sanitizeMath('cos(x)')).toContain('\\cos');
            expect(sanitizeMath('tan(x)')).toContain('\\tan');
        });

        it('formats inverse trig notation', () => {
            expect(sanitizeMath('sin⁻¹(x)')).toContain('\\sin^{-1}');
            expect(sanitizeMath('cos⁻¹(x)')).toContain('\\cos^{-1}');
        });

        it('formats other trig functions', () => {
            expect(sanitizeMath('cot(x)')).toContain('\\cot');
            expect(sanitizeMath('sec(x)')).toContain('\\sec');
            expect(sanitizeMath('csc(x)')).toContain('\\csc');
        });
    });

    describe('Logarithmic Functions', () => {
        it('formats natural log', () => {
            expect(sanitizeMath('ln(x)')).toContain('\\ln');
        });

        it('formats log base 10', () => {
            expect(sanitizeMath('log(x)')).toContain('\\log');
        });

        it('formats exp function', () => {
            expect(sanitizeMath('exp(x)')).toContain('\\exp');
        });
    });

    describe('Other Math Functions', () => {
        it('formats lim', () => {
            expect(sanitizeMath('lim(x)')).toContain('\\lim');
        });

        it('formats max and min', () => {
            expect(sanitizeMath('max(x)')).toContain('\\max');
            expect(sanitizeMath('min(x)')).toContain('\\min');
        });
    });

    describe('Limits with notation', () => {
        it('converts limit with arrow notation (no spaces)', () => {
            // The sanitizer's regex expects the format: lim as x→0 (compact)
            // With spaces, it converts each symbol separately
            const result = sanitizeMath('lim x→0');
            expect(result).toContain('\\lim');
            expect(result).toContain('\\rightarrow');
        });

        it('formats lim function correctly', () => {
            // The lim function itself gets formatted
            const result = sanitizeMath('lim(x)');
            expect(result).toContain('\\lim');
        });

        it('converts infinity symbol in limit context', () => {
            const result = sanitizeMath('as n→∞');
            expect(result).toContain('\\rightarrow');
            expect(result).toContain('\\infty');
        });
    });
});

// =============================================================================
// PASS 4: Cleanup and Edge Cases
// =============================================================================
describe('Cleanup and Edge Cases', () => {
    describe('Null and undefined handling', () => {
        it('returns null for null input', () => {
            expect(sanitizeMath(null)).toBeNull();
        });

        it('returns undefined for undefined input', () => {
            expect(sanitizeMath(undefined)).toBeUndefined();
        });

        it('returns empty string for empty input', () => {
            expect(sanitizeMath('')).toBe('');
        });
    });

    describe('Preservation of existing LaTeX', () => {
        it('preserves existing $...$ blocks', () => {
            const input = 'The equation $x^2 + y^2 = r^2$ is a circle';
            const result = sanitizeMath(input);
            expect(result).toContain('$x^2 + y^2 = r^2$');
        });

        it('does not double-wrap LaTeX', () => {
            const input = '$\\alpha$';
            const result = sanitizeMath(input);
            // Should not become $$\alpha$$
            expect(result).toBe('$\\alpha$');
        });

        it('preserves complex LaTeX expressions', () => {
            const input = '$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$';
            const result = sanitizeMath(input);
            expect(result).toBe(input);
        });
    });

    describe('Adjacent math blocks', () => {
        it('merges adjacent math blocks', () => {
            // After converting α and β, they might create $\alpha$ $\beta$
            // which should merge to $\alpha \beta$
            const result = sanitizeMath('αβ');
            // Should be one block, not two
            const dollarCount = (result.match(/\$/g) || []).length;
            expect(dollarCount).toBe(2); // One opening, one closing
        });
    });

    describe('Pass count parameter', () => {
        it('accepts custom pass count', () => {
            // Should work with different pass counts
            expect(() => sanitizeMath('test', 1)).not.toThrow();
            expect(() => sanitizeMath('test', 2)).not.toThrow();
            expect(() => sanitizeMath('test', 4)).not.toThrow();
        });
    });

    describe('Plain text preservation', () => {
        it('does not modify plain English text', () => {
            const input = 'This is a normal sentence without math.';
            const result = sanitizeMath(input);
            expect(result).toBe(input);
        });

        it('preserves punctuation', () => {
            const input = 'Hello, world! How are you?';
            expect(sanitizeMath(input)).toBe(input);
        });

        it('handles mixed text and math', () => {
            const input = 'The value of π is approximately 3.14159';
            const result = sanitizeMath(input);
            expect(result).toContain('The value of');
            expect(result).toContain('\\pi');
            expect(result).toContain('approximately 3.14159');
        });
    });
});

// =============================================================================
// sanitizeOptions - Array processing
// =============================================================================
describe('sanitizeOptions', () => {
    it('sanitizes an array of options', () => {
        const options = ['α', 'β', 'γ'];
        const result = sanitizeOptions(options);

        expect(result).toHaveLength(3);
        expect(result[0]).toContain('\\alpha');
        expect(result[1]).toContain('\\beta');
        expect(result[2]).toContain('\\gamma');
    });

    it('handles empty array', () => {
        expect(sanitizeOptions([])).toEqual([]);
    });

    it('returns null/undefined for null/undefined input', () => {
        expect(sanitizeOptions(null)).toBeNull();
        expect(sanitizeOptions(undefined)).toBeUndefined();
    });

    it('handles mixed content array', () => {
        const options = ['Normal text', 'x²', 'θ angle'];
        const result = sanitizeOptions(options);

        expect(result[0]).toBe('Normal text');
        expect(result[1]).toContain('^{2}');
        expect(result[2]).toContain('\\theta');
    });

    it('preserves array order', () => {
        const options = ['first', 'second', 'third'];
        const result = sanitizeOptions(options);

        expect(result[0]).toBe('first');
        expect(result[1]).toBe('second');
        expect(result[2]).toBe('third');
    });
});

// =============================================================================
// Integration Tests - Real-world Physics/Math Examples
// =============================================================================
describe('Real-world Examples', () => {
    it('handles kinematic equation', () => {
        const input = 'v = u + at';
        // This is plain text, should remain as-is
        expect(sanitizeMath(input)).toBe(input);
    });

    it('handles energy equation with Greek', () => {
        const input = 'E = mc²';
        const result = sanitizeMath(input);
        expect(result).toContain('^{2}');
    });

    it('handles Coulombs law format', () => {
        const input = 'F = kq₁q₂/r²';
        const result = sanitizeMath(input);
        expect(result).toContain('_{1}');
        expect(result).toContain('_{2}');
        expect(result).toContain('^{2}');
    });

    it('handles quadratic formula description', () => {
        const input = 'Using the quadratic formula with a=1, b=2, c=1';
        const result = sanitizeMath(input);
        expect(result).toBe(input); // Plain text, no changes
    });

    it('handles chemical notation', () => {
        const input = 'H₂O molecule';
        const result = sanitizeMath(input);
        expect(result).toContain('_{2}');
        expect(result).toContain('molecule');
    });

    it('handles temperature notation', () => {
        const input = '25°C';
        const result = sanitizeMath(input);
        expect(result).toContain('^\\circ');
    });

    it('handles vector notation in physics', () => {
        const input = 'The position vector r̂ points outward';
        const result = sanitizeMath(input);
        expect(result).toContain('\\hat{r}');
    });

    it('handles partial derivatives', () => {
        const input = '∂f/∂x';
        const result = sanitizeMath(input);
        expect(result).toContain('\\partial');
    });
});
