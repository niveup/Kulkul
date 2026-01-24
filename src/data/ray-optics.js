/**
 * JEE Ray Optics - Formulas & Concepts
 * Class 12 Physics - Chapter: Ray Optics and Optical Instruments
 * 
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 * Formulas use KaTeX notation
 */

export const rayOptics = {
    topic: "Ray Optics",
    concepts: [
        // ============ REFLECTION ============
        {
            concept: "Law of Reflection",
            theory: "Angle of incidence equals angle of reflection.",
            formula: "\\theta_i = \\theta_r",
            details: "Both angles measured from normal. Incident ray, reflected ray, normal coplanar.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find angle of reflection", "Mirror rotation problems", "Multiple reflections"],
            commonMistakes: ["Measuring angle from surface instead of normal", "Confusing i and r", "Forgetting coplanarity"],
            tips: "Angles ALWAYS from normal, not from surface! If surface angle given, convert: θ from normal = 90° - θ from surface."
        },
        {
            concept: "Plane Mirror Image",
            theory: "Image is virtual, erect, and laterally inverted.",
            formula: "v = -u, \\quad m = 1",
            details: "Image same size, same distance behind mirror. Always virtual and erect.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Image position", "Multiple mirror images", "Lateral inversion"],
            commonMistakes: ["Image distance sign", "Confusing lateral with vertical inversion", "Object moving towards mirror"],
            tips: "Image is as far behind mirror as object is in front. v_image = -v_object (opposite direction). Lateral inversion: left-right swap."
        },
        {
            concept: "Mirror Rotation",
            theory: "When mirror rotates, reflected ray rotates by double angle.",
            formula: "\\text{Rotation of reflected ray} = 2\\theta",
            details: "If mirror rotates by θ, reflected ray rotates by 2θ.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Reflected ray rotation", "Sextant problems", "Galvanometer mirror"],
            commonMistakes: ["Using θ instead of 2θ", "Wrong rotation direction", "Confusing incident with reflected"],
            tips: "Reflected ray rotates 2× mirror rotation. Used in galvanometer (amplifies small rotations). Direction follows the rotation."
        },
        {
            concept: "Multiple Images",
            theory: "Images formed by two plane mirrors at angle θ.",
            formula: "n = \\frac{360°}{\\theta} - 1",
            details: "If 360°/θ is even: n images always. If odd: depends on object position.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Number of images", "Object on bisector", "Parallel mirrors"],
            commonMistakes: ["Forgetting -1", "Not checking even/odd", "Parallel mirror case (infinite images)"],
            tips: "n = 360°/θ - 1. If 360°/θ is even, n images regardless of object position. If odd, n images only if object NOT on bisector."
        },

        // ============ SPHERICAL MIRRORS ============
        {
            concept: "Mirror Formula",
            theory: "Relation between object distance, image distance, and focal length.",
            formula: "\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}",
            details: "Use sign convention: Cartesian convention - distances measured from pole.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find image position", "Object at different positions", "Real vs virtual image"],
            commonMistakes: ["Wrong sign convention", "Confusing u and v", "Forgetting 1/f = 1/v + 1/u not 1/v - 1/u"],
            tips: "Cartesian: pole is origin, principal axis is x-axis. Light goes left to right. u always negative for real object. Concave f < 0, Convex f > 0."
        },
        {
            concept: "Magnification by Mirror",
            theory: "Ratio of image height to object height.",
            formula: "m = \\frac{h'}{h} = -\\frac{v}{u}",
            details: "m > 0: erect. m < 0: inverted. |m| > 1: magnified. |m| < 1: diminished.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Image size calculation", "Nature of image", "Magnification sign"],
            commonMistakes: ["Forgetting negative sign", "Using |v/u| instead of -v/u", "Confusing m > 1 with enlarged"],
            tips: "m = -v/u. Negative m = inverted image. |m| > 1 = enlarged. For concave: real image m < 0, virtual image m > 0."
        },
        {
            concept: "Image Velocity",
            theory: "Speed of image when object moves.",
            formula: "v_{image} = m^2 \\cdot v_{object}",
            details: "For motion along principal axis. Perpendicular motion: v_image = m × v_object.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Image velocity", "Relative motion", "Object approaching mirror"],
            commonMistakes: ["Using m instead of m²", "Wrong direction of velocity", "Forgetting m changes with position"],
            tips: "Along axis: v_i = m² × v_o. Perpendicular: v_i = m × v_o. Note m changes as object moves, so acceleration problems are tricky!"
        },

        // ============ REFRACTION ============
        {
            concept: "Snell's Law",
            theory: "Relation between angles during refraction.",
            formula: "n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2",
            details: "n = c/v = refractive index. Light bends toward normal when entering denser medium.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find angle of refraction", "Multiple interface problems", "Apparent depth"],
            commonMistakes: ["Confusing n₁ and n₂", "Measuring from surface instead of normal", "Forgetting sin function"],
            tips: "n₁sinθ₁ = n₂sinθ₂. Denser to rarer: bends away from normal. Rarer to denser: bends toward normal. n = c/v (higher n = slower light)."
        },
        {
            concept: "Refractive Index",
            theory: "Ratio of speed of light in vacuum to speed in medium.",
            formula: "n = \\frac{c}{v} = \\frac{\\lambda_{vacuum}}{\\lambda_{medium}}",
            details: "Frequency stays constant. Wavelength changes. n always ≥ 1.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Speed of light in medium", "Wavelength change", "Compare media"],
            commonMistakes: ["Thinking frequency changes", "n < 1 (impossible for normal media)", "Confusing λ ratio direction"],
            tips: "n = c/v = λ₀/λ. Frequency is CONSTANT (f = c/λ₀ = v/λ). Higher n → slower light → shorter wavelength inside medium."
        },
        {
            concept: "Apparent Depth",
            theory: "Object appears closer when viewed through denser medium.",
            formula: "\\text{Apparent depth} = \\frac{\\text{Real depth}}{n}",
            details: "Looking from rarer to denser. Object appears raised by d(1 - 1/n).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Apparent position", "Shift calculation", "Multiple slabs"],
            commonMistakes: ["Dividing by n vs multiplying", "Wrong viewing direction", "Multiple slab addition"],
            tips: "Apparent = Real/n (looking from outside into denser). Shift = d(1-1/n). For multiple slabs: add individual shifts."
        },
        {
            concept: "Critical Angle",
            theory: "Angle of incidence for which refracted ray grazes interface.",
            formula: "\\sin\\theta_c = \\frac{n_2}{n_1} = \\frac{1}{n}",
            details: "Only from denser to rarer. At θc, refracted angle = 90°.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate critical angle", "TIR conditions", "Fiber optics"],
            commonMistakes: ["TIR from rarer to denser (impossible!)", "Wrong ratio n₂/n₁", "Forgetting sin inverse"],
            tips: "sin θc = n₂/n₁ = 1/n (if n₂ = 1). For glass (n=1.5): θc = 42°. For water (n=4/3): θc = 49°. TIR only from denser to rarer!"
        },

        // ============ LENSES ============
        {
            concept: "Lens Maker's Formula",
            theory: "Focal length in terms of radii and refractive index.",
            formula: "\\frac{1}{f} = (n - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)",
            details: "R₁ = first surface radius, R₂ = second surface. Use sign convention for R.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate focal length", "Effect of medium", "Plano-convex lens"],
            commonMistakes: ["Wrong sign for R₁, R₂", "Forgetting (n-1) factor", "Using n of medium instead of lens"],
            tips: "R₁ = first surface hit by light. Convex surface toward light: R > 0. For biconvex: R₁ > 0, R₂ < 0. For plano-convex: one R = ∞."
        },
        {
            concept: "Lens Formula",
            theory: "Relation between object distance, image distance, and focal length.",
            formula: "\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}",
            details: "Note: 1/v - 1/u, not 1/v + 1/u like mirror!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find image position", "Object at 2f, f, etc.", "Nature of image"],
            commonMistakes: ["Using mirror formula sign", "Wrong sign convention", "Confusing converging/diverging"],
            tips: "1/f = 1/v - 1/u. For lens: u always negative (object on left). Convex: f > 0, Concave: f < 0. Remember: LENS uses minus, MIRROR uses plus!"
        },
        {
            concept: "Magnification by Lens",
            theory: "Ratio of image size to object size.",
            formula: "m = \\frac{h'}{h} = \\frac{v}{u}",
            details: "m > 0: erect (virtual). m < 0: inverted (real).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Image size", "Sign of magnification", "Erect vs inverted"],
            commonMistakes: ["Using -v/u instead of v/u", "Confusing with mirror formula", "Sign interpretation"],
            tips: "m = v/u (NO negative sign unlike mirror!). m > 0: erect. m < 0: inverted. Convex lens: real image is inverted (m < 0)."
        },
        {
            concept: "Power of Lens",
            theory: "Measure of converging or diverging ability.",
            formula: "P = \\frac{1}{f}",
            details: "Unit: Diopter (D) = m⁻¹. Convex: P > 0. Concave: P < 0.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate power", "Lens combinations", "Spectacle prescription"],
            commonMistakes: ["Using cm instead of m for f", "Wrong sign for concave", "Adding powers incorrectly"],
            tips: "P = 1/f (f in meters!). P = 100/f if f in cm. Powers add directly: P_total = P₁ + P₂. +2D means f = 0.5m convex lens."
        },
        {
            concept: "Combination of Lenses",
            theory: "Equivalent power of lenses in contact.",
            formula: "P_{eq} = P_1 + P_2, \\quad \\frac{1}{f_{eq}} = \\frac{1}{f_1} + \\frac{1}{f_2}",
            details: "For lenses in contact. Separated: 1/f = 1/f₁ + 1/f₂ - d/(f₁f₂).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Equivalent focal length", "Achromatic doublet", "Lens separation"],
            commonMistakes: ["Forgetting separation term", "Wrong sign when combining", "Using formula for separated lenses"],
            tips: "In contact: P = P₁ + P₂. Separated by d: 1/f = 1/f₁ + 1/f₂ - d/(f₁f₂). Achromatic: ω₁/f₁ + ω₂/f₂ = 0."
        },
        {
            concept: "Lens in Medium",
            theory: "Focal length changes when lens placed in medium.",
            formula: "\\frac{f_{medium}}{f_{air}} = \\frac{n_L - 1}{(n_L/n_M) - 1}",
            details: "If n_M > n_L, lens behavior reverses!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Focal length in water", "Behavior change", "Achromatic combination"],
            commonMistakes: ["Using wrong n ratio", "Forgetting sign change", "Ignoring medium effect"],
            tips: "f_medium/f_air = (n-1)/[(n/n_m)-1]. Glass lens (n=1.5) in water (n=4/3): f increases 4×. In medium with n > n_lens: convex becomes diverging!"
        },

        // ============ PRISM ============
        {
            concept: "Deviation by Prism",
            theory: "Angle through which light is deviated.",
            formula: "\\delta = i + e - A",
            details: "i = incidence, e = emergence, A = prism angle. Also A = r₁ + r₂.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate deviation", "Minimum deviation", "Prism angle"],
            commonMistakes: ["Wrong formula δ = i + e - A", "Confusing r₁, r₂ with i, e", "Forgetting A = r₁ + r₂"],
            tips: "δ = i + e - A. Inside prism: A = r₁ + r₂. At minimum deviation: i = e, r₁ = r₂ = A/2. Ray passes symmetrically."
        },
        {
            concept: "Minimum Deviation",
            theory: "Condition when deviation is minimum.",
            formula: "n = \\frac{\\sin\\left(\\frac{A + \\delta_m}{2}\\right)}{\\sin\\left(\\frac{A}{2}\\right)}",
            details: "At δ_min: i = e, ray passes symmetrically.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find n from δ_min", "Condition for δ_min", "Prism spectrometer"],
            commonMistakes: ["Wrong formula", "Not using A+δ_min", "Forgetting sin in both"],
            tips: "At δ_min: i = e, r = A/2. n = sin[(A+δ_min)/2] / sin(A/2). Most accurate method to find n experimentally."
        },
        {
            concept: "Thin Prism",
            theory: "Deviation for prism with small angle A.",
            formula: "\\delta = (n - 1)A",
            details: "Valid for small A. Independent of angle of incidence.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Thin prism deviation", "Achromatic combination", "Direct vision prism"],
            commonMistakes: ["Using for thick prism", "Forgetting (n-1) factor", "Angle in radians vs degrees"],
            tips: "δ = (n-1)A for small A. Simple and very useful! Dispersion = (n_v - n_r)A. For achromat: δ₁ + δ₂ = 0 gives (n₁-1)A₁ = (n₂-1)A₂."
        },
        {
            concept: "Dispersive Power",
            theory: "Ability of prism material to disperse light.",
            formula: "\\omega = \\frac{n_v - n_r}{n_y - 1}",
            details: "Higher ω = more dispersion. Crown glass: ω ≈ 0.03. Flint glass: ω ≈ 0.05.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate dispersive power", "Achromatic combinations", "Compare materials"],
            commonMistakes: ["Wrong formula", "Using n_mean instead of n_y - 1", "Confusing with angular dispersion"],
            tips: "ω = (n_v - n_r)/(n_y - 1) = angular dispersion/mean deviation. Flint has higher ω than crown. Used for achromatic lens design."
        },

        // ============ OPTICAL INSTRUMENTS ============
        {
            concept: "Simple Microscope",
            theory: "Single convex lens for magnification.",
            formula: "M = 1 + \\frac{D}{f}",
            details: "D = 25 cm = least distance of distinct vision. At infinity: M = D/f.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Magnifying power", "Image at D vs ∞", "Compare magnifications"],
            commonMistakes: ["Using wrong D value", "Confusing M formulas", "Forgetting +1 term"],
            tips: "Image at D: M = 1 + D/f (max strain). Image at ∞: M = D/f (relaxed eye). D = 25 cm for normal eye."
        },
        {
            concept: "Compound Microscope",
            theory: "Two lens system for high magnification.",
            formula: "M = \\frac{L}{f_o} \\times \\frac{D}{f_e}",
            details: "L = tube length. f_o < f_e. Image inverted.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Total magnification", "Objective vs eyepiece", "Tube length effect"],
            commonMistakes: ["Wrong order of f_o, f_e", "Forgetting L or D", "Confusing with telescope"],
            tips: "M = (L/f_o)(D/f_e) for image at D. Objective creates real, magnified image. Eyepiece magnifies that image. Short f_o for high M."
        },
        {
            concept: "Astronomical Telescope",
            theory: "For viewing distant objects.",
            formula: "M = \\frac{f_o}{f_e}",
            details: "f_o > f_e. Image inverted. Length = f_o + f_e (normal adjustment).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Magnifying power", "Tube length", "Aperture and resolution"],
            commonMistakes: ["Ratio inverted", "Wrong length formula", "Not recognizing f_o > f_e"],
            tips: "M = f_o/f_e. Large f_o for high M. Length L = f_o + f_e (normal). Image at D: M = f_o/f_e(1 + f_e/D). Large aperture for light gathering."
        },
        {
            concept: "Eye Defects and Correction",
            theory: "Common vision defects and lens corrections.",
            formula: "\\text{Myopia: concave}, \\quad \\text{Hypermetropia: convex}",
            details: "Myopia: far point < ∞, use diverging lens. Hypermetropia: near point > 25cm, use converging lens.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Identify defect", "Calculate lens power", "Corrective lens prescription"],
            commonMistakes: ["Confusing myopia and hypermetropia", "Wrong lens type", "Wrong power calculation"],
            tips: "Myopia (short-sight): can't see far, use concave lens (P < 0). Hypermetropia (long-sight): can't see near, use convex lens (P > 0). P = 1/f in meters."
        }
    ]
};

export default rayOptics;
