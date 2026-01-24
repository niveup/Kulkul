/**
 * JEE Magnetic Effects of Current & Magnetism - Formulas & Concepts
 * Class 12 Physics - Chapter: Moving Charges and Magnetism, Magnetism and Matter
 * 
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 * Formulas use KaTeX notation
 */

export const magnetism = {
    topic: "Magnetic Effects of Current & Magnetism",
    concepts: [
        // ============ BIOT-SAVART LAW ============
        {
            concept: "Biot-Savart Law",
            theory: "Magnetic field dB produced by a small current element Idl at distance r.",
            formula: "d\\vec{B} = \\frac{\\mu_0}{4\\pi} \\frac{I\\, d\\vec{l} \\times \\hat{r}}{r^2}",
            details: "μ₀ = 4π × 10⁻⁷ T·m/A. Direction by right-hand rule. dB ⊥ to plane of dl and r.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at point due to current element", "Direction of field using RHR", "Integration for various shapes"],
            commonMistakes: ["Wrong direction in cross product", "Forgetting 4π in denominator", "Confusing dl direction with r direction"],
            tips: "dB = (μ₀/4π) × I dl sinθ /r². Direction: curl fingers from dl to r, thumb gives dB direction. θ is angle between dl and r."
        },
        {
            concept: "Field Due to Straight Wire (Finite)",
            theory: "Field at perpendicular distance d from finite wire carrying current I.",
            formula: "B = \\frac{\\mu_0 I}{4\\pi d}(\\sin\\theta_1 + \\sin\\theta_2)",
            details: "θ₁, θ₂ are angles subtended by ends. For semi-infinite: B = μ₀I/(4πd).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at point due to finite wire", "Semi-infinite wire", "Wire segment in polygon"],
            commonMistakes: ["Wrong angle measurement", "Using infinite wire formula for finite", "Forgetting sin sum"],
            tips: "For semi-infinite (one end at 90°): B = μ₀I/(4πd). For infinite (both at 90°): B = μ₀I/(2πd). θ is measured from perpendicular."
        },
        {
            concept: "Field Due to Infinite Straight Wire",
            theory: "Field at perpendicular distance r from infinitely long straight wire.",
            formula: "B = \\frac{\\mu_0 I}{2\\pi r}",
            details: "θ₁ = θ₂ = 90° for infinite wire. Forms concentric circles around wire.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at distance from wire", "Force between parallel wires", "Superposition of fields"],
            commonMistakes: ["Using 4π instead of 2π", "Wrong direction (use right-hand grip)", "Confusing with finite wire formula"],
            tips: "B = μ₀I/(2πr) for infinite wire. Direction: grip wire with thumb in current direction, fingers curl in B direction. B ∝ 1/r.",
            graph: {
                fn: 'inverse',
                xLabel: 'r',
                yLabel: 'B',
                domain: [0.5, 5],
                step: 0.1,
                question: "How does field vary with distance from wire?"
            }
        },
        {
            concept: "Field at Center of Circular Loop",
            theory: "Field at center of circular loop of radius R carrying current I.",
            formula: "B = \\frac{\\mu_0 I}{2R} = \\frac{\\mu_0 N I}{2R}",
            details: "N = number of turns. Direction along axis (by right-hand curl rule).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at center of coil", "Multiple coils", "Direction of field"],
            commonMistakes: ["Missing N for multiple turns", "Wrong direction using RHR", "Confusing with axis formula"],
            tips: "At center: B = μ₀NI/(2R). Direction: curl fingers in current direction, thumb gives B. More turns → stronger B."
        },
        {
            concept: "Field on Axis of Circular Loop",
            theory: "Field at distance x from center along axis of circular loop.",
            formula: "B = \\frac{\\mu_0 N I R^2}{2(R^2 + x^2)^{3/2}}",
            details: "At center (x=0): B = μ₀NI/2R. At x >> R: B ≈ μ₀NIR²/(2x³) ∝ 1/x³.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at point on axis", "Ratio of fields at different points", "Far field behavior"],
            commonMistakes: ["Wrong power in denominator (it's 3/2)", "Missing R² in numerator", "Using wrong limit for far field"],
            tips: "At center: full formula gives μ₀NI/(2R). Far away: B ∝ 1/x³ (like magnetic dipole). Same structure as electric ring field!",
            graph: {
                fn: 'ring-field',
                xLabel: 'x',
                yLabel: 'B',
                domain: [-5, 5],
                step: 0.1,
                question: "Where is the field maximum on the axis?"
            }
        },
        {
            concept: "Field Due to Arc",
            theory: "Field at center of circular arc subtending angle θ at center.",
            formula: "B = \\frac{\\mu_0 I \\theta}{4\\pi R}",
            details: "θ in radians. For half circle (θ=π): B = μ₀I/(4R). For quarter circle: B = μ₀I/(8R).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at center of arc", "Combined arc and wire problems", "Sector field"],
            commonMistakes: ["Using degrees instead of radians", "Forgetting θ factor", "Wrong center identification"],
            tips: "B = (μ₀I/4πR) × θ. Full circle (2π): B = μ₀I/(2R). Half (π): B = μ₀I/(4R). Quarter (π/2): B = μ₀I/(8R). Remember: B ∝ θ!"
        },

        // ============ AMPERE'S CIRCUITAL LAW ============
        {
            concept: "Ampere's Circuital Law",
            theory: "Line integral of B around closed loop equals μ₀ times enclosed current.",
            formula: "\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{enclosed}",
            details: "Choose Amperian loop with symmetry. Sign of I by right-hand rule.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field inside/outside conductors", "Solenoid/toroid field", "Coaxial cable problems"],
            commonMistakes: ["Using non-symmetric loop", "Wrong sign for enclosed current", "Confusing with Gauss's law"],
            tips: "Choose loop where B is constant and parallel to dl (or perpendicular). ∮B·dl = B × 2πr for circular symmetry. Only ENCLOSED current matters!"
        },
        {
            concept: "Field Inside Solenoid",
            theory: "Uniform field inside ideal solenoid (L >> R).",
            formula: "B = \\mu_0 n I = \\frac{\\mu_0 N I}{L}",
            details: "n = N/L = turns per unit length. Field outside ≈ 0. Ends have B = μ₀nI/2.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field in solenoid", "Effect of core material", "Inductance calculation"],
            commonMistakes: ["Confusing N with n", "Forgetting field is zero outside", "Using wrong formula for ends"],
            tips: "B = μ₀nI inside (uniform). Outside: B ≈ 0. At ends: B = μ₀nI/2 (half). With core: B = μ₀μᵣnI. Ideal solenoid: L >> R.",
            graph: {
                fn: 'constant',
                xLabel: 'Position',
                yLabel: 'B',
                domain: [0, 5],
                step: 1,
                question: "Is field uniform inside solenoid?"
            }
        },
        {
            concept: "Field of Toroid",
            theory: "Field inside a toroidal coil - doughnut-shaped solenoid.",
            formula: "B = \\frac{\\mu_0 N I}{2\\pi r}",
            details: "N = total turns, r = distance from center. Field confined inside, zero outside.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field inside toroid", "Variation with r", "Comparison with solenoid"],
            commonMistakes: ["Using n instead of N", "Thinking field is uniform inside", "Field exists outside (it doesn't!)"],
            tips: "B = μ₀NI/(2πr) at radius r. Field varies inside (B ∝ 1/r). Zero outside AND in central hole. All flux confined inside!"
        },

        // ============ FORCE ON MOVING CHARGE ============
        {
            concept: "Lorentz Force (Magnetic)",
            theory: "Force on charge q moving with velocity v in magnetic field B.",
            formula: "\\vec{F} = q(\\vec{v} \\times \\vec{B})",
            details: "F = qvBsinθ. Force ⊥ to both v and B. Does no work (only changes direction).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Force on moving charge", "Direction by RHR", "Circular motion radius"],
            commonMistakes: ["Forgetting F is perpendicular to v (no work!)", "Wrong direction for negative charge", "Using dot product instead of cross"],
            tips: "F = qv×B. For +q: F along v×B. For -q: F opposite. F ⊥ v always → NO WORK done by magnetic force! Speed stays constant."
        },
        {
            concept: "Circular Motion in Magnetic Field",
            theory: "Charged particle moves in circle when v ⊥ B.",
            formula: "r = \\frac{mv}{qB} = \\frac{\\sqrt{2mK}}{qB} = \\frac{p}{qB}",
            details: "K = kinetic energy, p = momentum. Larger mass/velocity → larger radius.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find radius of circular path", "Compare radii for different particles", "Momentum from radius"],
            commonMistakes: ["Confusing r = mv/qB with r = p/qB", "Wrong charge for ion", "Not using √(2mK) form when given KE"],
            tips: "r = mv/(qB) = p/(qB) = √(2mK)/(qB). For same KE: r ∝ √m/q. For same p: r ∝ 1/q. For same v: r ∝ m/q."
        },
        {
            concept: "Time Period in Magnetic Field",
            theory: "Time for one complete circular revolution.",
            formula: "T = \\frac{2\\pi m}{qB}",
            details: "Independent of velocity and radius! Basis of cyclotron principle.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Time period calculation", "Cyclotron frequency", "Independence from v"],
            commonMistakes: ["Thinking T depends on v or r", "Wrong formula for frequency", "Applying to relativistic particles"],
            tips: "T = 2πm/(qB) - INDEPENDENT of v and r! Cyclotron works because particles at all speeds complete revolution in same time. f = qB/(2πm)."
        },
        {
            concept: "Helical Motion",
            theory: "When velocity has component parallel to B, particle follows helix.",
            formula: "\\text{Pitch} = v_{\\parallel} T = \\frac{2\\pi m v \\cos\\theta}{qB}",
            details: "Radius = mv⊥/(qB) = mvsinθ/(qB). Pitch = distance along B in one revolution.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Pitch and radius of helix", "Number of revolutions", "Entry at angle θ"],
            commonMistakes: ["Confusing pitch with radius", "Using v instead of v_parallel", "Wrong component of velocity"],
            tips: "v∥ = vcosθ (along B), v⊥ = vsinθ (perpendicular). Radius = mv⊥/(qB). Pitch = v∥ × T = 2πmv∥/(qB). Helix advances along B direction."
        },

        // ============ FORCE ON CURRENT ============
        {
            concept: "Force on Current-Carrying Conductor",
            theory: "Force on wire of length L carrying current I in magnetic field B.",
            formula: "\\vec{F} = I(\\vec{L} \\times \\vec{B})",
            details: "F = BILsinθ. Direction by Fleming's left-hand rule.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Force on wire in field", "Direction by FLHR", "Equilibrium problems"],
            commonMistakes: ["Using right-hand rule instead of left", "Wrong L direction", "Forgetting sinθ factor"],
            tips: "F = BIL sinθ. Fleming's Left Hand: First finger-B, seCond finger-I, thuMb-Motion (Force). For wire, L is in current direction."
        },
        {
            concept: "Force Between Parallel Wires",
            theory: "Force per unit length between two parallel current-carrying wires.",
            formula: "\\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi d}",
            details: "Attractive if currents same direction, repulsive if opposite. Definition of Ampere.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Force between wires", "Definition of Ampere", "Three parallel wire problems"],
            commonMistakes: ["Wrong direction (same = attract!)", "Using 4π instead of 2π", "Confusing force with field"],
            tips: "Same direction currents ATTRACT (opposite to charges!). F/L = μ₀I₁I₂/(2πd). This defines 1 Ampere: 1A currents 1m apart feel 2×10⁻⁷ N/m."
        },

        // ============ MAGNETIC DIPOLE ============
        {
            concept: "Magnetic Dipole Moment",
            theory: "Magnetic moment of current loop.",
            formula: "\\vec{M} = NI\\vec{A} = NIA\\hat{n}",
            details: "Unit: A·m². Direction: normal to loop by right-hand curl rule. N = number of turns.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate magnetic moment", "Direction of M", "Effect of changing parameters"],
            commonMistakes: ["Wrong direction using RHR", "Forgetting N for coil", "Unit confusion (A·m² not Am)"],
            tips: "M = NIA, direction by RHR (curl fingers in I direction, thumb = M). Larger I, A, or N → larger M. Coil acts like bar magnet!"
        },
        {
            concept: "Torque on Magnetic Dipole",
            theory: "Torque on current loop in uniform magnetic field.",
            formula: "\\vec{\\tau} = \\vec{M} \\times \\vec{B} = NIAB\\sin\\theta",
            details: "Maximum when M ⊥ B (θ = 90°). Zero when aligned (θ = 0° or 180°).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate torque", "Equilibrium positions", "Motor principle"],
            commonMistakes: ["Using cosθ instead of sinθ", "Confusing with PE formula", "Wrong equilibrium identification"],
            tips: "τ = MB sinθ (max at 90°). U = -MB cosθ (min at 0°). Stable at θ=0° (M∥B), unstable at θ=180° (M antiparallel to B)."
        },
        {
            concept: "Potential Energy of Magnetic Dipole",
            theory: "Energy of magnetic dipole in external field.",
            formula: "U = -\\vec{M} \\cdot \\vec{B} = -MB\\cos\\theta",
            details: "Minimum (stable): θ = 0°, U = -MB. Maximum (unstable): θ = 180°, U = +MB.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate PE at angle", "Work in rotation", "Equilibrium analysis"],
            commonMistakes: ["Forgetting negative sign", "Confusing stable and unstable", "Wrong work formula"],
            tips: "U = -MB cosθ. Stable at θ=0° (lowest PE). Unstable at θ=180° (highest PE). Work to rotate: W = MB(cosθ₁ - cosθ₂)."
        },

        // ============ GALVANOMETER ============
        {
            concept: "Moving Coil Galvanometer",
            theory: "Deflection proportional to current in moving coil galvanometer.",
            formula: "\\theta = \\frac{NIAB}{k}",
            details: "k = torsional constant of spring. Radial field ensures sinθ ≈ θ.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Deflection for given current", "Sensitivity calculation", "Conversion to ammeter/voltmeter"],
            commonMistakes: ["Confusing I and k", "Not using radial field concept", "Wrong sensitivity formula"],
            tips: "θ ∝ I (linear). Sensitivity = θ/I = NAB/k. Increase N, A, B or decrease k for higher sensitivity. Radial field makes τ independent of θ."
        },

        // ============ MAGNETIC MATERIALS ============
        {
            concept: "Magnetic Susceptibility",
            theory: "Measure of how easily material gets magnetized.",
            formula: "\\chi_m = \\frac{M}{H}",
            details: "Diamagnetic: χm < 0. Paramagnetic: χm > 0 (small). Ferromagnetic: χm >> 0.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Classify material by χ", "Calculate M from H", "Compare materials"],
            commonMistakes: ["Confusing with permeability", "Wrong sign for diamagnetic", "Thinking all χm > 0"],
            tips: "χ < 0: diamagnetic (repelled). χ > 0 small: paramagnetic (weakly attracted). χ >> 0: ferromagnetic (strongly attracted). μᵣ = 1 + χm."
        },
        {
            concept: "Relative Permeability",
            theory: "Ratio of permeability of material to free space.",
            formula: "\\mu_r = 1 + \\chi_m = \\frac{\\mu}{\\mu_0} = \\frac{B}{B_0}",
            details: "μr < 1 for diamagnetic, μr > 1 for paramagnetic, μr >> 1 for ferromagnetic.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate μr from χ", "Field enhancement", "Core material selection"],
            commonMistakes: ["Confusing μr with μ", "Wrong relation μr = 1 + χ", "Forgetting diamagnetic μr < 1"],
            tips: "μr = 1 + χm. For iron μr ~ 1000-5000. B inside = μrB₀ = μ₀μrH. Ferromagnetic cores amplify B greatly."
        },
        {
            concept: "Diamagnetic Materials",
            theory: "Materials weakly repelled by magnetic field.",
            formula: "\\chi_m = -10^{-5} \\text{ to } -10^{-6}, \\quad \\mu_r < 1",
            details: "Examples: Bi, Cu, Ag, H₂O, NaCl. Induced moment opposes field.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Identify diamagnetic materials", "Behavior in field", "Levitation problems"],
            commonMistakes: ["Thinking they are attracted", "Confusing with paramagnetic", "Wrong susceptibility sign"],
            tips: "χ < 0, μr < 1. Weakly repelled. All electrons paired. Water is diamagnetic! Superconductors are perfect diamagnets (χ = -1)."
        },
        {
            concept: "Paramagnetic Materials",
            theory: "Materials weakly attracted by magnetic field.",
            formula: "\\chi_m = 10^{-5} \\text{ to } 10^{-3}, \\quad \\mu_r > 1",
            details: "Examples: Al, O₂, Pt, Mn. Random moments partially align with field.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Identify paramagnetic materials", "Curie's law", "Temperature dependence"],
            commonMistakes: ["Confusing with ferromagnetic", "Forgetting temperature effect", "Thinking χ is large"],
            tips: "χ > 0 (small), μr slightly > 1. Has unpaired electrons. χ ∝ 1/T (Curie's law). O₂ is paramagnetic (can be attracted by magnet)!"
        },
        {
            concept: "Ferromagnetic Materials",
            theory: "Materials strongly attracted by magnetic field.",
            formula: "\\chi_m \\sim 10^3 \\text{ to } 10^5, \\quad \\mu_r >> 1",
            details: "Examples: Fe, Co, Ni, Gd. Domain structure, hysteresis, saturation.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Identify ferromagnetic materials", "Domain theory", "Curie temperature"],
            commonMistakes: ["Thinking all metals are ferromagnetic", "Forgetting Curie temperature", "Confusing with paramagnetic"],
            tips: "χ >> 0, μr >> 1 (thousands!). Only Fe, Co, Ni and their alloys. Above Curie temp: become paramagnetic. Have domain structure."
        },
        {
            concept: "Hysteresis Loop",
            theory: "B-H curve showing magnetization history dependence.",
            formula: "\\text{Energy loss per cycle} = \\oint H\\, dB = \\text{Area of loop}",
            details: "Retentivity (Br): B when H=0. Coercivity (Hc): H needed to make B=0.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Interpret B-H curve", "Energy loss calculation", "Soft vs hard magnets"],
            commonMistakes: ["Confusing retentivity and coercivity", "Wrong energy formula", "Not understanding loop area"],
            tips: "Retentivity = B at H=0 (remaining magnetization). Coercivity = H to make B=0. Soft magnet: narrow loop (low loss). Hard magnet: wide loop (permanent magnet)."
        },

        // ============ EARTH'S MAGNETISM ============
        {
            concept: "Earth's Magnetic Field Components",
            theory: "Horizontal and vertical components of Earth's field.",
            formula: "B_H = B_E\\cos\\delta, \\quad B_V = B_E\\sin\\delta",
            details: "BE = total field, δ = angle of dip. tan δ = BV/BH.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find components from dip", "Total field from components", "Dip needle problems"],
            commonMistakes: ["Confusing BH and BV", "Wrong trigonometry", "Forgetting tan δ = BV/BH"],
            tips: "At equator: δ = 0°, BV = 0, B = BH. At poles: δ = 90°, BH = 0, B = BV. tan δ = BV/BH. BE² = BH² + BV²."
        },
        {
            concept: "Angle of Dip",
            theory: "Angle between Earth's field and horizontal.",
            formula: "\\tan\\delta = \\frac{B_V}{B_H}",
            details: "At equator: δ = 0°. At poles: δ = 90°. Measured by dip circle.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate dip angle", "Variation with latitude", "Dip circle measurement"],
            commonMistakes: ["Confusing dip with declination", "Using cotangent", "Forgetting geographic variation"],
            tips: "Dip = angle with horizontal. 0° at equator, 90° at poles. In India: ~45° north. Measured using dip circle aligned in magnetic meridian."
        },
        {
            concept: "Magnetic Flux",
            theory: "Total magnetic field passing through a surface.",
            formula: "\\Phi = \\vec{B} \\cdot \\vec{A} = BA\\cos\\theta",
            details: "Unit: Weber (Wb) = T·m². θ is angle between B and area normal.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate flux through surface", "Changing flux", "Faraday's law applications"],
            commonMistakes: ["Using angle with surface instead of normal", "Forgetting it's scalar", "Wrong area vector"],
            tips: "Φ = BA cosθ where θ is angle between B and normal to surface. Φ = 0 when B parallel to surface. Basis for electromagnetic induction!"
        },
        {
            concept: "Gauss's Law for Magnetism",
            theory: "Net magnetic flux through any closed surface is zero.",
            formula: "\\oint \\vec{B} \\cdot d\\vec{A} = 0",
            details: "No magnetic monopoles exist. Field lines are always closed loops.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Prove no monopoles", "Net flux through closed surface", "Field line properties"],
            commonMistakes: ["Comparing with electric Gauss's law", "Thinking monopoles could exist", "Wrong interpretation of closed surface"],
            tips: "Net Φ = 0 for any closed surface. Reason: magnetic field lines are closed loops (no beginning or end). Unlike electric charges, no magnetic monopoles!"
        }
    ]
};

export default magnetism;
