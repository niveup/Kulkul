/**
 * JEE Wave Optics - Formulas & Concepts
 * Class 12 Physics - Chapter: Wave Optics
 * 
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 * Formulas use KaTeX notation
 */

export const waveOptics = {
    topic: "Wave Optics",
    concepts: [
        // ============ HUYGENS PRINCIPLE ============
        {
            concept: "Huygens Principle",
            theory: "Every point on wavefront acts as source of secondary wavelets.",
            formula: "\\text{New wavefront = envelope of secondary wavelets}",
            details: "Explains reflection, refraction. Secondary wavelets spread in all directions.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Explain reflection/refraction", "Wavefront construction", "Direction of propagation"],
            commonMistakes: ["Backward wavelet issue", "Not taking envelope", "Confusing ray with wavefront"],
            tips: "Each point on wavefront is a new source. New wavefront = forward envelope. Rays are ⊥ to wavefront. Explains why light bends in denser medium (slower wavelets)."
        },
        {
            concept: "Path vs Phase Difference",
            theory: "Relationship between path and phase difference.",
            formula: "\\Delta\\phi = \\frac{2\\pi}{\\lambda} \\Delta x",
            details: "Δx = path difference. Δφ = phase difference. 2π radians = 1 wavelength.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Convert path to phase", "Interference conditions", "Optical path"],
            commonMistakes: ["Using degrees instead of radians", "Wrong factor of 2π", "Forgetting optical path = n × geometric path"],
            tips: "Δφ = (2π/λ)Δx. λ path difference = 2π phase difference. Optical path = n × geometric path (in medium of refractive index n)."
        },

        // ============ INTERFERENCE ============
        {
            concept: "Constructive Interference",
            theory: "Maximum intensity when waves are in phase.",
            formula: "\\Delta x = n\\lambda, \\quad \\Delta\\phi = 2n\\pi",
            details: "n = 0, 1, 2, 3... (integers). Amplitudes add.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Bright fringe condition", "Position of maxima", "Phase for maximum"],
            commonMistakes: ["Using (n+½)λ for bright", "Wrong phase (should be even multiple of π)", "Confusing with destructive"],
            tips: "Bright when Δx = nλ (n = 0,1,2...) or Δφ = 2nπ. Waves add in phase. I_max = (A₁ + A₂)² = 4I₀ for equal amplitudes."
        },
        {
            concept: "Destructive Interference",
            theory: "Minimum intensity when waves are out of phase.",
            formula: "\\Delta x = (2n+1)\\frac{\\lambda}{2}, \\quad \\Delta\\phi = (2n+1)\\pi",
            details: "n = 0, 1, 2... (integers). Amplitudes subtract.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Dark fringe condition", "Position of minima", "Phase for minimum"],
            commonMistakes: ["Using nλ for dark", "Wrong phase (should be odd multiple of π)", "Sign of subtraction"],
            tips: "Dark when Δx = (n+½)λ or Δφ = (2n+1)π. Waves cancel. I_min = (A₁ - A₂)² = 0 for equal amplitudes."
        },
        {
            concept: "Resultant Intensity",
            theory: "Intensity of superposed waves.",
            formula: "I = I_1 + I_2 + 2\\sqrt{I_1I_2}\\cos\\phi",
            details: "I_max = (√I₁ + √I₂)². I_min = (√I₁ - √I₂)².",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Intensity at a point", "Ratio calculations", "Effect of phase"],
            commonMistakes: ["Forgetting 2√(I₁I₂) term", "Using A instead of √I", "Wrong cos vs sin"],
            tips: "I = I₁ + I₂ + 2√(I₁I₂)cosφ. For equal intensities I₀: I = 4I₀cos²(φ/2). At φ=0: I=4I₀. At φ=π: I=0."
        },
        {
            concept: "Intensity Ratio",
            theory: "Ratio of maximum to minimum intensity.",
            formula: "\\frac{I_{max}}{I_{min}} = \\left(\\frac{\\sqrt{I_1} + \\sqrt{I_2}}{\\sqrt{I_1} - \\sqrt{I_2}}\\right)^2",
            details: "For equal intensities: I_max = 4I, I_min = 0. Perfect contrast.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find I_max/I_min", "Intensity ratio from amplitude", "Fringe visibility"],
            commonMistakes: ["Not squaring", "Wrong ratio formula", "Confusing amplitude and intensity"],
            tips: "I_max/I_min = [(A₁+A₂)/(A₁-A₂)]². If A₁ = A₂: I_max = 4I₀, I_min = 0. Visibility = (I_max-I_min)/(I_max+I_min)."
        },

        // ============ YDSE ============
        {
            concept: "YDSE Path Difference",
            theory: "Path difference at point P on screen.",
            formula: "\\Delta x = d\\sin\\theta \\approx \\frac{dy}{D}",
            details: "d = slit separation, D = screen distance, y = position on screen.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Path difference at point", "Angular position", "Approximation validity"],
            commonMistakes: ["Using d instead of D", "Large angle approximation", "Wrong geometry"],
            tips: "Δx = d sinθ (exact) ≈ dy/D (for small θ). Small angle: sinθ ≈ tanθ ≈ θ. y = D tanθ ≈ Dθ."
        },
        {
            concept: "Bright Fringe Position",
            theory: "Location of constructive interference maxima.",
            formula: "y_n = \\frac{n\\lambda D}{d}, \\quad n = 0, \\pm 1, \\pm 2...",
            details: "Central bright at n = 0. Bright fringes equally spaced.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Position of nth bright", "Number of fringes", "Distance between fringes"],
            commonMistakes: ["Using (n+½) for bright", "Wrong sign convention", "Forgetting central fringe is n=0"],
            tips: "y_n = nλD/d for bright. n = 0 is central maximum. Both +n and -n give fringes on either side."
        },
        {
            concept: "Dark Fringe Position",
            theory: "Location of destructive interference minima.",
            formula: "y_n = \\frac{(2n+1)\\lambda D}{2d}",
            details: "First dark fringe at n = 0: y = λD/(2d).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Position of nth dark", "First dark fringe", "Dark-bright separation"],
            commonMistakes: ["Using nλ for dark", "Confusing n values", "Mixed formulas"],
            tips: "y_n = (n+½)λD/d for dark. First dark (n=0) is at y = λD/(2d). Distance from central bright to first dark = β/2."
        },
        {
            concept: "Fringe Width",
            theory: "Separation between consecutive bright (or dark) fringes.",
            formula: "\\beta = \\frac{\\lambda D}{d}",
            details: "Same for bright and dark. β ∝ λ, β ∝ D, β ∝ 1/d.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate fringe width", "Effect of changing parameters", "Compare experiments"],
            commonMistakes: ["Confusing with slit width", "Wrong proportionalities", "Different β for bright/dark"],
            tips: "β = λD/d. Same for all fringes (equally spaced). Red fringes wider than blue (λ_red > λ_blue). Increase D or decrease d for wider fringes."
        },
        {
            concept: "Thin Film in YDSE",
            theory: "Fringe shift when transparent film placed in one path.",
            formula: "\\text{Shift} = \\frac{(n-1)t \\cdot D}{d} = \\frac{(n-1)t}{\\lambda}\\beta",
            details: "Optical path increases by (n-1)t. Central fringe shifts toward film.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate fringe shift", "Number of fringes shifted", "Effect on pattern"],
            commonMistakes: ["Wrong direction of shift", "Using nt instead of (n-1)t", "Forgetting film location matters"],
            tips: "Extra optical path = (n-1)t. Shift = (n-1)t × D/d = [(n-1)t/λ] × β fringes. Central fringe moves TOWARD the film (compensates for slower light)."
        },
        {
            concept: "YDSE in Medium",
            theory: "Experiment performed in medium of refractive index n.",
            formula: "\\lambda_{medium} = \\frac{\\lambda}{n}, \\quad \\beta_{medium} = \\frac{\\beta}{n}",
            details: "Wavelength decreases. Fringe width decreases.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Fringe width in water", "Effect of immersion", "Compare air vs medium"],
            commonMistakes: ["λ increases in medium (wrong!)", "Forgetting β changes", "Using wrong n"],
            tips: "In medium: λ' = λ/n, so β' = β/n. Fringes become narrower. In water (n=4/3), β reduces to 3β/4."
        },

        // ============ DIFFRACTION ============
        {
            concept: "Single Slit Central Maximum",
            theory: "Width of central bright fringe.",
            formula: "\\text{Angular width} = \\frac{2\\lambda}{a}, \\quad \\text{Linear width} = \\frac{2\\lambda D}{a}",
            details: "a = slit width. Central max is TWICE width of secondary maxima.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Central fringe width", "Ratio to secondary", "Effect of slit width"],
            commonMistakes: ["Using d instead of a", "Forgetting factor of 2", "Confusing with interference"],
            tips: "Central max width = 2λ/a (angular) = 2λD/a (linear). Secondary maxima are half this width. Narrower slit → wider diffraction pattern!"
        },
        {
            concept: "Single Slit Minima",
            theory: "Positions of dark fringes (minima).",
            formula: "a\\sin\\theta = n\\lambda, \\quad n = \\pm 1, \\pm 2...",
            details: "First minimum at sinθ = λ/a. n ≠ 0 for minima.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Position of nth minimum", "Condition for dark", "Angular position"],
            commonMistakes: ["n = 0 giving minimum (wrong!)", "Confusing with YDSE formula", "Using wrong variable (a not d)"],
            tips: "Dark at a sinθ = nλ (n ≠ 0). Note: n = 0 is NOT a minimum, it's the central maximum! Different from YDSE where n=0 is bright."
        },
        {
            concept: "Diffraction Grating",
            theory: "Multiple slits for dispersing light.",
            formula: "(a + b)\\sin\\theta = n\\lambda",
            details: "(a+b) = grating element. N = lines per mm. Sharp maxima.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Angular position of order", "Maximum order possible", "Resolving power"],
            commonMistakes: ["Using a alone instead of (a+b)", "Missing maximum order condition", "Wrong N interpretation"],
            tips: "Grating equation: d sinθ = nλ where d = a+b = grating element. Max order: n_max = d/λ. More lines → sharper peaks, better resolution."
        },

        // ============ POLARIZATION ============
        {
            concept: "Malus's Law",
            theory: "Intensity after analyzer when polarized light passes through.",
            formula: "I = I_0 \\cos^2\\theta",
            details: "θ = angle between polarizer and analyzer axes. I = 0 when θ = 90°.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Transmitted intensity", "Multiple polarizers", "Angle for given I"],
            commonMistakes: ["Using sin instead of cos", "Forgetting I₀/2 after first polarizer", "Wrong angle measurement"],
            tips: "I = I₀ cos²θ. After unpolarized → polarizer: I = I₀/2. Then through analyzer at θ: I = (I₀/2)cos²θ. Crossed polarizers (θ=90°): I = 0.",
            graph: {
                fn: 'cosine-squared',
                xLabel: 'θ',
                yLabel: 'I',
                domain: [0, 3.14],
                step: 0.1,
                question: "At what angle is transmitted intensity half?"
            }
        },
        {
            concept: "Brewster's Law",
            theory: "Light becomes polarized when reflected at certain angle.",
            formula: "\\tan\\theta_B = n",
            details: "θB = Brewster's angle. Reflected ray ⊥ refracted ray.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate Brewster angle", "Reflected ray properties", "Refracted ray angle"],
            commonMistakes: ["Using sin or cos instead of tan", "Not recognizing 90° between reflected and refracted", "Wrong n value"],
            tips: "tan θB = n. At Brewster's angle: reflected light is completely polarized. Reflected ⊥ refracted (θB + θr = 90°). For glass (n=1.5): θB ≈ 57°."
        },
        {
            concept: "Unpolarized Through Polarizer",
            theory: "Intensity reduction when unpolarized light passes through polarizer.",
            formula: "I = \\frac{I_0}{2}",
            details: "Half intensity transmitted. Output is plane polarized.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Intensity after polarizer", "Multiple polarizer problems", "Degree of polarization"],
            commonMistakes: ["Forgetting the ½ factor", "Applying Malus's law to unpolarized", "Wrong order of operations"],
            tips: "Unpolarized → Polarizer: I = I₀/2. This is NOT Malus's law (that's for already polarized light). Remember this step before applying cos²θ."
        },

        // ============ THIN FILMS ============
        {
            concept: "Thin Film Interference",
            theory: "Interference in thin transparent films.",
            formula: "2nt\\cos r = (2m+1)\\frac{\\lambda}{2} \\text{ (bright)}",
            details: "n = film refractive index, t = thickness. Phase change at denser medium.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Minimum thickness for color", "Color of film", "Effect of viewing angle"],
            commonMistakes: ["Forgetting phase change at reflection", "Using i instead of r", "Wrong interference condition"],
            tips: "For reflected light: 2nt cos r = (m+½)λ for bright (includes π phase shift at top surface). For transmitted: 2nt cos r = mλ for bright."
        },
        {
            concept: "Newton's Rings",
            theory: "Circular interference pattern with plano-convex lens on glass.",
            formula: "r_n = \\sqrt{n\\lambda R}",
            details: "R = radius of curvature. Central spot dark in reflection.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Radius of nth ring", "Diameter measurements", "Determine wavelength or R"],
            commonMistakes: ["Wrong formula (n vs 2n+1)", "Bright vs dark ring formula", "Missing √ sign"],
            tips: "Dark rings: r_n = √(nλR). Bright rings: r_n = √[(n+½)λR]. Central is DARK in reflection (phase change at bottom surface). Diameter² ∝ n."
        }
    ]
};

export default waveOptics;
