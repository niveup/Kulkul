# Chemical Formula Formatting Guide

## Overview

The notes section now features automatic chemical formula formatting that makes chemical names and formulas look beautiful and professional. No special syntax is required - chemical formulas are automatically detected and formatted.

## Features

### ✨ Automatic Detection
- Chemical formulas are automatically detected as you type
- No special delimiters or syntax needed
- Works with simple and complex formulas

### 🎨 Beautiful Formatting
- **Proper subscripting**: Numbers are automatically subscripted (e.g., H₂O instead of H2O)
- **Color scheme**: Beautiful blue color that stands out
- **Glow effect**: Subtle glow for visual appeal
- **Background highlighting**: Formulas in paragraphs have a subtle background
- **Dark mode support**: Automatically adapts to dark/light themes

### 🔬 Comprehensive Support

#### Simple Formulas
- H2O → H₂O
- CO2 → CO₂
- NaCl → NaCl
- CH4 → CH₄

#### Complex Organic Compounds
- C6H12O6 → C₆H₁₂O₆ (Glucose)
- CH3COOH → CH₃COOH (Acetic acid)
- C12H22O11 → C₁₂H₂₂O₁₁ (Sucrose)

#### Ionic Compounds
- NaOH → NaOH
- CaCO3 → CaCO₃
- (NH4)2SO4 → (NH₄)₂SO₄

#### Charged Ions
- Na+ → Na⁺
- Cl- → Cl⁻
- SO4^2- → SO₄²⁻
- NO3- → NO₃⁻

#### Complex Formulas with Parentheses
- Ca(OH)2 → Ca(OH)₂
- Al2(SO4)3 → Al₂(SO₄)₃
- Fe2O3 → Fe₂O₃

#### Hydrates
- CuSO4·5H2O → CuSO₄·5H₂O
- MgSO4·7H2O → MgSO₄·7H₂O

## How It Works

### Detection Logic
The system intelligently identifies chemical formulas by:
1. Checking for valid chemical element symbols (all 118 elements)
2. Looking for numbers following element symbols
3. Supporting parentheses for complex formulas
4. Recognizing charge indicators (+, -, ^2+, etc.)
5. Handling hydrate notation (·)

### Formatting Process
1. **Parse**: Break down the formula into element-number pairs
2. **Convert**: Transform to LaTeX format with proper subscripting
3. **Render**: Use KaTeX for beautiful mathematical rendering
4. **Style**: Apply custom CSS for visual appeal

## Supported Elements

All 118 chemical elements are supported, including:
- Common elements: H, He, Li, Be, B, C, N, O, F, Ne, Na, Mg, Al, Si, P, S, Cl, Ar, K, Ca
- Transition metals: Sc, Ti, V, Cr, Mn, Fe, Co, Ni, Cu, Zn
- And many more...

## Examples

### In Notes
Simply type chemical formulas in your notes:

```
Water is H2O and carbon dioxide is CO2.
The reaction is: CH4 + 2O2 → CO2 + 2H2O
```

This will automatically render as:
Water is H₂O and carbon dioxide is CO₂.
The reaction is: CH₄ + 2O₂ → CO₂ + 2H₂O

### In Lists
- H2O (water)
- CO2 (carbon dioxide)
- NaCl (sodium chloride)

### In Tables
| Compound | Formula |
|----------|---------|
| Water | H2O |
| Methane | CH4 |
| Glucose | C6H12O6 |

## Customization

The chemical formula styling can be customized by modifying the CSS in `MarkdownRenderer.jsx`:

```css
.katex {
    font-size: 1.05em;
    color: #60a5fa;  /* Blue color */
    font-weight: 500;
    letter-spacing: 0.02em;
}
```

## Tips

1. **No special syntax needed**: Just type the formula normally
2. **Case sensitivity**: Element symbols are case-sensitive (e.g., CO is carbon monoxide, Co is cobalt)
3. **Numbers**: Numbers following element symbols are automatically subscripted
4. **Charges**: Use +, -, or ^ notation for charges (e.g., Na+, Cl-, SO4^2-)
5. **Parentheses**: Use parentheses for complex formulas (e.g., Ca(OH)2)
6. **Hydrates**: Use · or . for hydrate notation (e.g., CuSO4·5H2O)

## Troubleshooting

### Formula Not Formatting?
- Ensure the formula contains valid chemical element symbols
- Check that the formula is not in the common words list
- Verify the formula length is between 1-30 characters

### Wrong Formatting?
- Make sure element symbols are properly capitalized (e.g., Na, not na)
- Check for typos in element symbols
- Ensure numbers are placed after element symbols

## Technical Details

- **Parser**: Custom chemical formula parser
- **Renderer**: KaTeX for LaTeX rendering
- **Styling**: Custom CSS with Tailwind integration
- **Performance**: Memoized for optimal rendering

## Future Enhancements

Potential improvements:
- Support for isotopic notation (e.g., ²³⁵U)
- Support for oxidation states (e.g., Fe³⁺)
- Support for reaction arrows
- Support for equilibrium notation
- Support for phase labels (s, l, g, aq)

## Support

For issues or questions about chemical formula formatting, please refer to the test file `CHEMICAL_FORMULA_TEST.md` for examples.
