/**
 * JEE Electrostatics Formulas & Concepts
 * Class 12 Physics - Chapter: Electrostatics (excluding Capacitors)
 * 
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 */

export const electrostatics = {
    topic: "Electrostatics",
    concepts: [
        // ============ COULOMB'S LAW ============
        {
            concept: "Coulomb's Law",
            theory: "The electrostatic force between two point charges is directly proportional to the product of charges and inversely proportional to the square of distance between them.",
            formula: "F = \\frac{1}{4\\pi\\varepsilon_0} \\cdot \\frac{q_1 q_2}{r^2} = k\\frac{q_1 q_2}{r^2}",
            details: "k = 9 × 10⁹ N·m²/C², ε₀ = 8.85 × 10⁻¹² C²/N·m²",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find force between two charges", "Equilibrium position of third charge", "Force in medium with dielectric"],
            commonMistakes: ["Forgetting to convert cm to m", "Using scalar addition instead of vector", "Sign confusion: force magnitude is always positive"],
            tips: "For equilibrium problems, place coordinate origin at one charge. For 3 collinear charges, third charge must be between like charges for stable equilibrium."
        },
        {
            concept: "Vector Form of Coulomb's Law",
            theory: "Force on charge q₂ due to q₁ along the line joining them.",
            formula: "\\vec{F}_{12} = \\frac{kq_1q_2}{r^2}\\hat{r}_{12}",
            details: "r̂₁₂ is unit vector from q₁ to q₂. Like charges repel, unlike attract.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find force vector between charges in 3D", "Direction of force on charge"],
            commonMistakes: ["Wrong direction of unit vector r̂", "Confusing F₁₂ with F₂₁ (they are equal and opposite)"],
            tips: "F₁₂ = -F₂₁ always. Unit vector r̂₁₂ points from 1 to 2. For repulsion, force on 2 is along r̂₁₂; for attraction, opposite."
        },
        {
            concept: "Superposition Principle",
            theory: "Net force on a charge is the vector sum of forces due to all other charges.",
            formula: "\\vec{F}_{net} = \\vec{F}_1 + \\vec{F}_2 + \\vec{F}_3 + ...",
            details: "Each force calculated independently, then added vectorially.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Net force on charge in a system", "Charges at vertices of polygon", "Continuous charge distributions"],
            commonMistakes: ["Adding magnitudes directly without considering direction", "Forgetting to resolve into components", "Missing the negative sign for opposite directions"],
            tips: "Use symmetry! In symmetric arrangements, many components cancel. Break into x,y components when dealing with 2D problems."
        },
        {
            concept: "Relative Permittivity",
            theory: "Force in a medium is reduced by factor K (dielectric constant).",
            formula: "F_{medium} = \\frac{F_{vacuum}}{K} = \\frac{kq_1q_2}{Kr^2}",
            details: "K = ε/ε₀. For vacuum K=1, air K≈1, water K=80.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Force in different media", "Effective distance in medium", "Comparison of forces"],
            commonMistakes: ["Forgetting K in denominator", "Confusing K with ε", "K for air is NOT exactly 1"],
            tips: "In medium, force decreases by K. Effective distance = r√K. Water has high K (80) so ionic compounds dissolve easily!"
        },

        // ============ ELECTRIC FIELD ============
        {
            concept: "Electric Field Definition",
            theory: "Electric field is force per unit positive test charge at a point.",
            formula: "\\vec{E} = \\frac{\\vec{F}}{q_0} = \\frac{kQ}{r^2}\\hat{r}",
            details: "Unit: N/C or V/m. Field lines go from positive to negative charge.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find field at a point due to charges", "Field line problems", "Force on charge in field"],
            commonMistakes: ["Confusing E (field) with F (force)", "Forgetting E is a vector", "Wrong direction of field for negative source charge"],
            tips: "Electric field exists independent of test charge. Always draw field direction from + to –. Use E = F/q to find field from force."
        },
        {
            concept: "Electric Field Due to Point Charge",
            theory: "Field strength decreases with square of distance from point charge.",
            formula: "E = \\frac{kQ}{r^2} = \\frac{Q}{4\\pi\\varepsilon_0 r^2}",
            details: "Direction: radially outward for +Q, radially inward for -Q.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find null point between charges", "Field at point due to multiple charges", "Graph of E vs r"],
            commonMistakes: ["Forgetting direction depends on sign of source charge", "Not using vector addition for multiple charges"],
            tips: "For null point between two positive charges: closer to smaller charge. For +/- charges: null point outside, beyond smaller charge.",
            graph: {
                fn: 'inverse-square',
                xLabel: 'r',
                yLabel: 'E',
                domain: [0.5, 5],
                step: 0.1
            }
        },
        {
            concept: "Electric Field on Axis of Ring",
            theory: "Electric field at distance x from center of uniformly charged ring of radius R.",
            formula: "E = \\frac{kQx}{(R^2 + x^2)^{3/2}}",
            details: "At center (x=0): E=0. Maximum at x = R/√2.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find distance of maximum field", "Compare field at different points", "Time period of oscillation of charge"],
            commonMistakes: ["Forgetting E=0 at center", "Wrong power in denominator (it's 3/2 not 2)", "Not memorizing x=R/√2 for E_max"],
            tips: "Memorize: E_max = 2kQ/(3√3R²) at x=R/√2. Field is zero at center and infinity, max in between. Graph looks like a bell curve!",
            graph: {
                fn: 'ring-field',
                xLabel: 'x',
                yLabel: 'E',
                domain: [-5, 5],
                step: 0.1,
                question: "At what distance (x) is the electric field maximum?"
            }
        },
        {
            concept: "Electric Field on Axis of Disc",
            theory: "Field due to uniformly charged disc of surface charge density σ.",
            formula: "E = \\frac{\\sigma}{2\\varepsilon_0}\\left[1 - \\frac{x}{\\sqrt{R^2 + x^2}}\\right]",
            details: "For x << R: E = σ/2ε₀. For x >> R: E = kQ/x².",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at various distances from disc", "Limiting cases", "Comparison with ring and sheet"],
            commonMistakes: ["Confusing disc formula with ring formula", "Wrong limiting case analysis", "Forgetting the bracket term"],
            tips: "Near disc (x→0): behaves like infinite sheet (E=σ/2ε₀). Far from disc (x→∞): behaves like point charge. Disc is integration of rings!"
        },
        {
            concept: "Electric Field - Infinite Line Charge",
            theory: "Field at perpendicular distance r from infinite line with linear charge density λ.",
            formula: "E = \\frac{\\lambda}{2\\pi\\varepsilon_0 r} = \\frac{2k\\lambda}{r}",
            details: "Direction: perpendicular to line, radially outward for +λ.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at distance from wire", "Force on charge near wire", "Work done moving charge"],
            commonMistakes: ["Using 1/r² instead of 1/r", "Forgetting factor of 2 in numerator", "Wrong direction (must be perpendicular)"],
            tips: "E ∝ 1/r (not 1/r²). Use Gauss's law with cylindrical surface. Field lines are radial, perpendicular to wire.",
            graph: {
                fn: 'inverse',
                xLabel: 'r',
                yLabel: 'E',
                domain: [0.5, 5],
                step: 0.1
            }
        },
        {
            concept: "Electric Field - Infinite Plane Sheet",
            theory: "Field due to infinite plane sheet with surface charge density σ.",
            formula: "E = \\frac{\\sigma}{2\\varepsilon_0}",
            details: "Field is uniform and independent of distance. Direction: perpendicular to sheet.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field due to charged sheet", "Force on charge near sheet", "Two parallel sheets problems"],
            commonMistakes: ["Forgetting factor of 2 in denominator", "Thinking field varies with distance", "Wrong direction near sheet"],
            tips: "Field is CONSTANT everywhere (doesn't depend on distance)! For two parallel sheets: E=σ/ε₀ between, zero outside.",
            graph: {
                fn: 'constant',
                xLabel: 'r',
                yLabel: 'E',
                domain: [0, 5],
                step: 1,
                question: "Does the field strength depend on the distance from the sheet?"
            }
        },
        {
            concept: "Electric Field Between Parallel Plates",
            theory: "Field between two infinite parallel plates with opposite charges.",
            formula: "E = \\frac{\\sigma}{\\varepsilon_0}",
            details: "Field is uniform between plates, zero outside. σ = surface charge density.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Capacitor field problems", "Motion of charge between plates", "Force on charge in capacitor"],
            commonMistakes: ["Using σ/2ε₀ instead of σ/ε₀", "Forgetting field is zero outside", "Confusing with single sheet formula"],
            tips: "Two sheets add: (σ/2ε₀) + (σ/2ε₀) = σ/ε₀ between plates. Outside: fields cancel to zero. This is the capacitor field!",
            graph: {
                fn: 'constant',
                xLabel: 'x',
                yLabel: 'E',
                domain: [0, 5],
                step: 1,
                question: "How does the field vary between the plates vs outside?"
            }
        },

        // ============ ELECTRIC DIPOLE ============
        {
            concept: "Electric Dipole Moment",
            theory: "Product of charge and separation in a dipole, directed from -q to +q.",
            formula: "\\vec{p} = q \\times 2a",
            details: "Unit: C·m. Dipole moment is a vector from -q to +q.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate dipole moment", "Direction of dipole moment", "Dipole in external field"],
            commonMistakes: ["Wrong direction (it's from -q to +q, not + to -)", "Forgetting 2a is full separation", "Unit confusion (C·m not C/m)"],
            tips: "Direction: -q → +q (like an arrow pointing to positive). Magnitude = q × (2a). Think of it as 'charge × separation'."
        },
        {
            concept: "Field on Axial Line of Dipole",
            theory: "Electric field on axis (end-on) at distance r from center.",
            formula: "E_{axial} = \\frac{2kp}{r^3} = \\frac{p}{2\\pi\\varepsilon_0 r^3}",
            details: "Valid for r >> a. Direction: along dipole moment.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Compare axial and equatorial fields", "Force on charge on axis", "Field at given distance"],
            commonMistakes: ["Confusing 2kp/r³ with kp/r³", "Forgetting it's 1/r³ not 1/r²", "Wrong direction (along p, not opposite)"],
            tips: "Axial field has factor 2: E_axial = 2 × E_equatorial. Direction is along p⃗. Remember: E ∝ 1/r³ for dipole!",
            graph: {
                fn: 'inverse-cube',
                xLabel: 'r',
                yLabel: 'E',
                domain: [1, 5],
                step: 0.1
            }
        },
        {
            concept: "Field on Equatorial Line of Dipole",
            theory: "Electric field on perpendicular bisector at distance r from center.",
            formula: "E_{eq} = \\frac{kp}{r^3} = \\frac{p}{4\\pi\\varepsilon_0 r^3}",
            details: "Valid for r >> a. Direction: opposite to dipole moment.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at equatorial point", "Compare with axial field", "Direction of field"],
            commonMistakes: ["Forgetting direction is opposite to p⃗", "Using 2kp instead of kp", "Confusing equatorial with axial"],
            tips: "E_equatorial = ½ × E_axial. Direction is opposite to p⃗. On equator, both charges pull/push in same direction!",
            graph: {
                fn: 'inverse-cube',
                xLabel: 'r',
                yLabel: 'E',
                domain: [1, 5],
                step: 0.1
            }
        },
        {
            concept: "Torque on Dipole in Uniform Field",
            theory: "Dipole experiences no net force but a torque in uniform field.",
            formula: "\\vec{\\tau} = \\vec{p} \\times \\vec{E} = pE\\sin\\theta",
            details: "Torque aligns dipole along field. Max at θ = 90°, zero at θ = 0° or 180°.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate torque at angle", "Equilibrium position", "Angular acceleration of dipole"],
            commonMistakes: ["Using cosθ instead of sinθ", "Forgetting max torque is at 90°", "Confusing torque with potential energy"],
            tips: "τ = pE sinθ (cross product), U = -pE cosθ (dot product). Max τ at θ=90°, stable equilibrium at θ=0°."
        },
        {
            concept: "Potential Energy of Dipole",
            theory: "Work done in rotating dipole from reference position.",
            formula: "U = -\\vec{p} \\cdot \\vec{E} = -pE\\cos\\theta",
            details: "Stable: θ=0° (U=-pE). Unstable: θ=180° (U=+pE).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate PE at angle", "Work done in rotation", "Stable/unstable equilibrium"],
            commonMistakes: ["Forgetting negative sign", "Confusing stable (θ=0°) with unstable (θ=180°)", "Using sinθ instead of cosθ"],
            tips: "U = -pE cosθ. Minimum U (stable) when p∥E (θ=0°). Maximum U (unstable) when p antiparallel to E (θ=180°)."
        },
        {
            concept: "Work Done in Rotating Dipole",
            theory: "Work done to rotate dipole from angle θ₁ to θ₂.",
            formula: "W = pE(\\cos\\theta_1 - \\cos\\theta_2)",
            details: "Work = Change in potential energy.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Work to rotate from one angle to another", "Work to rotate from equilibrium", "Energy released in rotation"],
            commonMistakes: ["Wrong sign in formula", "Confusing θ₁ and θ₂", "Forgetting W = ΔU = U_final - U_initial"],
            tips: "W = U₂ - U₁ = pE(cosθ₁ - cosθ₂). To go from θ=0° to θ=90°: W = pE(1-0) = pE. Remember order matters!"
        },

        // ============ GAUSS'S LAW ============
        {
            concept: "Electric Flux",
            theory: "Measure of electric field lines passing through a surface.",
            formula: "\\Phi = \\vec{E} \\cdot \\vec{A} = EA\\cos\\theta",
            details: "Unit: N·m²/C or V·m. θ is angle between E and area normal.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Flux through tilted surface", "Flux through cube face", "Net flux through closed surface"],
            commonMistakes: ["Taking θ as angle with surface instead of normal", "Not considering area vector direction", "Forgetting flux is scalar (can be negative)"],
            tips: "Area vector is always perpendicular to surface, pointing outward for closed surfaces. For θ=90°, flux=0 (field parallel to surface)."
        },
        {
            concept: "Gauss's Law",
            theory: "Total electric flux through closed surface equals enclosed charge divided by ε₀.",
            formula: "\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{enclosed}}{\\varepsilon_0}",
            details: "Applicable for symmetric charge distributions.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field due to spherical shell", "Field inside conductor", "Field due to infinite charged plane/cylinder"],
            commonMistakes: ["Using Gauss's Law for non-symmetric distributions", "Confusing charge enclosed vs total charge", "Wrong Gaussian surface choice"],
            tips: "Choose Gaussian surface such that E is constant on it and parallel/perpendicular to area element. Flux only depends on charge INSIDE!"
        },
        {
            concept: "Field Inside Spherical Shell",
            theory: "Electric field inside a uniformly charged spherical shell.",
            formula: "E = 0 \\quad (r < R)",
            details: "All charge on surface. Field inside is zero.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at point inside shell", "Force on charge inside shell", "Potential inside shell"],
            commonMistakes: ["Thinking field is non-zero inside", "Confusing shell with solid sphere", "Forgetting potential is NOT zero inside"],
            tips: "Field ZERO inside, but potential is CONSTANT (= kQ/R). This is electrostatic shielding! Faraday cage principle.",
            graph: {
                fn: 'shell-field',
                xLabel: 'r',
                yLabel: 'E',
                domain: [0, 5],
                step: 0.1
            }
        },
        {
            concept: "Field Outside Spherical Shell",
            theory: "Electric field outside uniformly charged spherical shell behaves like point charge.",
            formula: "E = \\frac{kQ}{r^2} \\quad (r > R)",
            details: "Shell behaves as if all charge concentrated at center.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at distance from shell", "Compare with point charge", "Force on external charge"],
            commonMistakes: ["Using surface charge density instead of total charge", "Forgetting it's same as point charge", "Wrong r (should be from center)"],
            tips: "Outside any spherically symmetric charge: E = kQ/r². Treat as point charge at center. Distance r is from CENTER!",
            graph: {
                fn: 'shell-field',
                xLabel: 'r',
                yLabel: 'E',
                domain: [0, 5],
                step: 0.1
            }
        },
        {
            concept: "Field Due to Solid Sphere (Inside)",
            theory: "Electric field inside uniformly charged solid sphere.",
            formula: "E = \\frac{kQr}{R^3} \\quad (r < R)",
            details: "Inside: E ∝ r. At surface: E = kQ/R².",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at distance r inside sphere", "Graph of E vs r", "Compare with shell"],
            commonMistakes: ["Using total Q instead of enclosed charge", "Confusing with shell (where E=0 inside)", "Wrong power of R"],
            tips: "Inside solid sphere: E ∝ r (linear). Only charge enclosed contributes! q_enc = Q(r³/R³). At center, E=0.",
            graph: {
                fn: 'solid-sphere-field',
                xLabel: 'r',
                yLabel: 'E',
                domain: [0, 5],
                step: 0.1
            }
        },
        {
            concept: "Field Due to Solid Sphere (Outside)",
            theory: "Electric field outside uniformly charged solid sphere.",
            formula: "E = \\frac{kQ}{r^2} \\quad (r > R)",
            details: "Outside: E ∝ 1/r². Same as point charge at center.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field outside solid sphere", "Maximum field location", "Complete E vs r graph"],
            commonMistakes: ["Thinking outside field differs from shell", "Not recognizing E_max at surface", "Wrong formula for r > R"],
            tips: "For sphere, E_max at surface (r=R). Inside: E ∝ r, Outside: E ∝ 1/r². Same as shell outside!",
            graph: {
                fn: 'solid-sphere-field',
                xLabel: 'r',
                yLabel: 'E',
                domain: [0, 5],
                step: 0.1
            }
        },

        // ============ ELECTRIC POTENTIAL ============
        {
            concept: "Electric Potential Definition",
            theory: "Work done per unit charge to bring a test charge from infinity to a point.",
            formula: "V = \\frac{W}{q} = \\frac{kQ}{r}",
            details: "Unit: Volt (V) = J/C. Scalar quantity. V = 0 at infinity.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate potential at point", "Work to move charge", "Potential energy of system"],
            commonMistakes: ["Confusing potential (scalar) with field (vector)", "Forgetting V is relative to infinity", "Sign errors with negative charges"],
            tips: "Potential is SCALAR - just add algebraically (no vector addition). V due to +Q is positive, due to -Q is negative."
        },
        {
            concept: "Potential Difference",
            theory: "Work done per unit charge to move charge between two points.",
            formula: "V_{AB} = V_A - V_B = \\frac{W_{AB}}{q}",
            details: "V_AB = -∫ E⃗ · dr⃗ (from B to A).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Work to move charge between points", "Potential difference in uniform field", "Equipotential surfaces"],
            commonMistakes: ["Sign confusion in V_A - V_B", "Forgetting negative sign in integral", "Confusing path with displacement"],
            tips: "Work by field: W = q(V_A - V_B). Work against field: W = q(V_B - V_A). Potential decreases along field direction!"
        },
        {
            concept: "Relation Between E and V",
            theory: "Electric field is negative gradient of potential.",
            formula: "E = -\\frac{dV}{dr}",
            details: "E points from high V to low V. Field perpendicular to equipotential.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find E from V(x)", "Equipotential surface problems", "Direction of field from potential"],
            commonMistakes: ["Forgetting negative sign", "Confusing gradient direction", "Not recognizing E⊥equipotential"],
            tips: "E points from high to low potential (downhill). Closer equipotentials = stronger field. E = -dV/dr gives magnitude."
        },
        {
            concept: "Potential Due to Point Charge",
            theory: "Potential at distance r from point charge Q.",
            formula: "V = \\frac{kQ}{r} = \\frac{Q}{4\\pi\\varepsilon_0 r}",
            details: "+Q creates +V. Potential is scalar, additive.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Potential at point due to charges", "Zero potential surface", "Work to bring charge"],
            commonMistakes: ["Forgetting it's 1/r not 1/r²", "Not using algebraic signs for charges", "Confusing potential with field"],
            tips: "V ∝ 1/r (not 1/r² like E). For multiple charges: V_net = V₁ + V₂ + V₃ (scalar addition). Easier than field!",
            graph: {
                fn: 'inverse',
                xLabel: 'r',
                yLabel: 'V',
                domain: [0.5, 5],
                step: 0.1
            }
        },
        {
            concept: "Potential Due to Dipole",
            theory: "Potential at point (r, θ) from dipole center.",
            formula: "V = \\frac{kp\\cos\\theta}{r^2}",
            details: "On axis (θ=0°): V=kp/r². On equator (θ=90°): V=0.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Potential at axial/equatorial point", "Zero potential surface", "Work to move charge around dipole"],
            commonMistakes: ["Using sinθ instead of cosθ", "Wrong power of r", "Forgetting V=0 on equator"],
            tips: "V ∝ cosθ/r². On equator (θ=90°): V=0. Equatorial plane is equipotential surface with V=0!",
            graph: {
                fn: 'inverse-square',
                xLabel: 'r',
                yLabel: 'V',
                domain: [0.5, 5],
                step: 0.1
            }
        },
        {
            concept: "Potential of Spherical Shell (Inside)",
            theory: "Potential inside and at surface of charged shell.",
            formula: "V = \\frac{kQ}{R} \\quad (r \\leq R)",
            details: "Potential is constant inside shell.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Potential at center of shell", "Work to move charge inside", "Potential on surface"],
            commonMistakes: ["Thinking V=0 inside (it's constant, not zero)", "Confusing with field (E=0 but V≠0)", "Using r instead of R"],
            tips: "V = kQ/R everywhere inside (constant). E=0 but V≠0 inside! At surface and inside, V is same.",
            graph: {
                fn: 'shell-potential',
                xLabel: 'r',
                yLabel: 'V',
                domain: [0, 5],
                step: 0.1
            }
        },
        {
            concept: "Potential of Spherical Shell (Outside)",
            theory: "Potential outside a charged shell.",
            formula: "V = \\frac{kQ}{r} \\quad (r > R)",
            details: "Same as point charge outside.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Potential at distance from shell", "Graph of V vs r", "Work to bring charge from infinity"],
            commonMistakes: ["Using R instead of r for outside", "Confusing with inside formula", "Not recognizing continuity at surface"],
            tips: "Outside: V ∝ 1/r. At surface: inside and outside formulas give same value (V continuous). Graph shows kink at r=R.",
            graph: {
                fn: 'shell-potential',
                xLabel: 'r',
                yLabel: 'V',
                domain: [0, 5],
                step: 0.1
            }
        },

        // ============ ELECTROSTATIC ENERGY ============
        {
            concept: "Potential Energy of Two Charges",
            theory: "Energy stored in system of two point charges.",
            formula: "U = \\frac{kq_1q_2}{r}",
            details: "U > 0 for like charges, U < 0 for unlike.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate PE of charge system", "Minimum separation of charges", "Energy released/absorbed"],
            commonMistakes: ["Forgetting sign of U depends on charge signs", "Not counting pairs correctly for multiple charges", "Confusing PE with work"],
            tips: "U > 0 (like charges): energy needed to assemble. U < 0 (unlike): energy released. Use KE + PE = constant for motion problems."
        },
        {
            concept: "Energy of System of Charges",
            theory: "Total potential energy of n point charges.",
            formula: "U = \\frac{1}{2}\\sum_i q_i V_i",
            details: "Factor 1/2 avoids counting pairs twice.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Total PE of multiple charges", "Energy to assemble system", "Number of pairs calculation"],
            commonMistakes: ["Forgetting factor of 1/2", "Counting same pair twice", "Not using V due to other charges"],
            tips: "No. of pairs = n(n-1)/2. For 3 charges: 3 pairs. For 4 charges: 6 pairs. Use U = Σ(kqᵢqⱼ/rᵢⱼ) over all pairs."
        },
        {
            concept: "Energy Density in Electric Field",
            theory: "Energy stored per unit volume in electric field.",
            formula: "u = \\frac{1}{2}\\varepsilon_0 E^2",
            details: "Unit: J/m³. Total energy: U = ∫u dV.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Energy density at a point", "Total energy in field region", "Energy stored in capacitor"],
            commonMistakes: ["Forgetting factor of 1/2", "Missing ε₀", "Confusing with magnetic energy density"],
            tips: "u = ½ε₀E² (electric) vs u = B²/2μ₀ (magnetic). In capacitor: U = ½CV² = ½ε₀E²(Ad). Energy is in the field, not on plates!"
        },
        {
            concept: "Self Energy of Sphere",
            theory: "Energy required to assemble a uniformly charged sphere.",
            formula: "U = \\frac{3kQ^2}{5R}",
            details: "Work done against electrostatic repulsion.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Self energy of charged sphere", "Energy released in expansion", "Comparison with different radii"],
            commonMistakes: ["Confusing 3/5 factor with other shells/spheres", "Forgetting this is self-energy not interaction", "Using wrong formula for shell"],
            tips: "Solid sphere: U = 3kQ²/5R. Hollow shell: U = kQ²/2R. Self-energy is work to bring charges from infinity to this configuration."
        },

        // ============ CONDUCTORS ============
        {
            concept: "Conductors in Electrostatic Equilibrium",
            theory: "Properties of conductors in static electric fields.",
            formula: "E_{inside} = 0, \\quad V = constant",
            details: "All charge on surface. Field at surface = σ/ε₀.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Field inside conductor", "Charge distribution on conductor", "Induced charges"],
            commonMistakes: ["Thinking charge can exist inside conductor", "Forgetting potential is constant throughout", "Confusing equilibrium with non-equilibrium"],
            tips: "5 properties: (1) E=0 inside, (2) V=constant, (3) charge on surface, (4) E⊥surface, (5) σ higher at sharp points."
        },
        {
            concept: "Surface Charge Density on Conductor",
            theory: "Field just outside conductor surface.",
            formula: "E = \\frac{\\sigma}{\\varepsilon_0}",
            details: "Field perpendicular to surface. σ higher at sharp points.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field near conductor surface", "Charge density at different points", "Corona discharge"],
            commonMistakes: ["Using σ/2ε₀ instead of σ/ε₀", "Forgetting direction is perpendicular", "Not recognizing σ varies on surface"],
            tips: "Near conductor: E = σ/ε₀ (not σ/2ε₀). At sharp points: higher σ → higher E → corona discharge/lightning rods."
        },
        {
            concept: "Electrostatic Shielding",
            theory: "Electric field inside a hollow conductor is zero.",
            formula: "E_{inside} = 0 \\text{ (Faraday cage)}",
            details: "Protects from external electric fields.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Faraday cage principle", "Charge on inner surface", "Field inside cavity"],
            commonMistakes: ["Thinking external charges affect inside", "Confusing cavity with charge inside", "Not understanding Faraday cage"],
            tips: "Empty cavity in conductor: E=0 always (shielded from outside). Cavity with charge: field exists due to that charge only."
        },

        // ============ MOTION IN ELECTRIC FIELD ============
        {
            concept: "Force on Charge in Field",
            theory: "Force experienced by charge q in electric field E.",
            formula: "\\vec{F} = q\\vec{E}, \\quad \\vec{a} = \\frac{q\\vec{E}}{m}",
            details: "+q accelerates along E, -q opposite to E.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Acceleration of charge in field", "Motion in uniform field", "Force on dipole in non-uniform field"],
            commonMistakes: ["Forgetting sign of charge affects direction", "Not using vector addition", "Confusing force with field"],
            tips: "F = qE. For +q: force along E. For -q: force opposite to E. Uniform field → constant acceleration (like gravity!)."
        },
        {
            concept: "Deflection of Charged Particle",
            theory: "Parabolic motion when charge enters field perpendicular to velocity.",
            formula: "y = \\frac{qEx^2}{2mv^2}",
            details: "Deflection angle: tan θ = qEL/(mv²).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Deflection in capacitor", "Angle of emergence", "Range of particle"],
            commonMistakes: ["Forgetting horizontal velocity is constant", "Wrong formula for deflection angle", "Not using correct L (length in field)"],
            tips: "Like projectile motion! Horizontal: uniform motion, Vertical: uniformly accelerated. y = ½at² with t = x/v. tanθ = vy/vx."
        },
        {
            concept: "Work-Energy Theorem",
            theory: "Work by electric field equals change in kinetic energy.",
            formula: "W = q\\Delta V = \\frac{1}{2}mv^2 - \\frac{1}{2}mu^2",
            details: "Also: W = qEd for uniform field.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Speed gained by charge", "Stopping potential", "Minimum separation problems"],
            commonMistakes: ["Sign error in ΔV", "Forgetting KE can be negative work", "Not using energy conservation"],
            tips: "W = qΔV = q(V_initial - V_final). For +q moving to lower V: positive work, gains KE. Use energy conservation for complex paths!"
        }
    ]
};

export default electrostatics;
