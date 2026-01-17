/**
 * JEE Electrostatics Formulas & Concepts
 * Class 12 Physics - Chapter: Electrostatics (excluding Capacitors)
 * 
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
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
            type: "formula"
        },
        {
            concept: "Vector Form of Coulomb's Law",
            theory: "Force on charge q₂ due to q₁ along the line joining them.",
            formula: "\\vec{F}_{12} = \\frac{kq_1q_2}{r^2}\\hat{r}_{12}",
            details: "r̂₁₂ is unit vector from q₁ to q₂. Like charges repel, unlike attract.",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Superposition Principle",
            theory: "Net force on a charge is the vector sum of forces due to all other charges.",
            formula: "\\vec{F}_{net} = \\vec{F}_1 + \\vec{F}_2 + \\vec{F}_3 + ...",
            details: "Each force calculated independently, then added vectorially.",
            jeeImportance: "High",
            type: "concept"
        },
        {
            concept: "Relative Permittivity",
            theory: "Force in a medium is reduced by factor K (dielectric constant).",
            formula: "F_{medium} = \\frac{F_{vacuum}}{K} = \\frac{kq_1q_2}{Kr^2}",
            details: "K = ε/ε₀. For vacuum K=1, air K≈1, water K=80.",
            jeeImportance: "Medium",
            type: "formula"
        },

        // ============ ELECTRIC FIELD ============
        {
            concept: "Electric Field Definition",
            theory: "Electric field is force per unit positive test charge at a point.",
            formula: "\\vec{E} = \\frac{\\vec{F}}{q_0} = \\frac{kQ}{r^2}\\hat{r}",
            details: "Unit: N/C or V/m. Field lines go from positive to negative charge.",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Electric Field Due to Point Charge",
            theory: "Field strength decreases with square of distance from point charge.",
            formula: "E = \\frac{kQ}{r^2} = \\frac{Q}{4\\pi\\varepsilon_0 r^2}",
            details: "Direction: radially outward for +Q, radially inward for -Q.",
            jeeImportance: "High",
            type: "formula",
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
            graph: {
                fn: 'ring-field',
                xLabel: 'x',
                yLabel: 'E',
                domain: [-5, 5],
                step: 0.1
            }
        },
        {
            concept: "Electric Field on Axis of Disc",
            theory: "Field due to uniformly charged disc of surface charge density σ.",
            formula: "E = \\frac{\\sigma}{2\\varepsilon_0}\\left[1 - \\frac{x}{\\sqrt{R^2 + x^2}}\\right]",
            details: "For x << R: E = σ/2ε₀. For x >> R: E = kQ/x².",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Electric Field - Infinite Line Charge",
            theory: "Field at perpendicular distance r from infinite line with linear charge density λ.",
            formula: "E = \\frac{\\lambda}{2\\pi\\varepsilon_0 r} = \\frac{2k\\lambda}{r}",
            details: "Direction: perpendicular to line, radially outward for +λ.",
            jeeImportance: "High",
            type: "formula",
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
            graph: {
                fn: 'constant',
                xLabel: 'r',
                yLabel: 'E',
                domain: [0, 5],
                step: 1
            }
        },
        {
            concept: "Electric Field Between Parallel Plates",
            theory: "Field between two infinite parallel plates with opposite charges.",
            formula: "E = \\frac{\\sigma}{\\varepsilon_0}",
            details: "Field is uniform between plates, zero outside. σ = surface charge density.",
            jeeImportance: "High",
            type: "formula",
            graph: {
                fn: 'constant',
                xLabel: 'x',
                yLabel: 'E',
                domain: [0, 5],
                step: 1
            }
        },

        // ============ ELECTRIC DIPOLE ============
        {
            concept: "Electric Dipole Moment",
            theory: "Product of charge and separation in a dipole, directed from -q to +q.",
            formula: "\\vec{p} = q \\times 2a",
            details: "Unit: C·m. Dipole moment is a vector from -q to +q.",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Field on Axial Line of Dipole",
            theory: "Electric field on axis (end-on) at distance r from center.",
            formula: "E_{axial} = \\frac{2kp}{r^3} = \\frac{p}{2\\pi\\varepsilon_0 r^3}",
            details: "Valid for r >> a. Direction: along dipole moment.",
            jeeImportance: "High",
            type: "formula",
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
            type: "formula"
        },
        {
            concept: "Potential Energy of Dipole",
            theory: "Work done in rotating dipole from reference position.",
            formula: "U = -\\vec{p} \\cdot \\vec{E} = -pE\\cos\\theta",
            details: "Stable: θ=0° (U=-pE). Unstable: θ=180° (U=+pE).",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Work Done in Rotating Dipole",
            theory: "Work done to rotate dipole from angle θ₁ to θ₂.",
            formula: "W = pE(\\cos\\theta_1 - \\cos\\theta_2)",
            details: "Work = Change in potential energy.",
            jeeImportance: "Medium",
            type: "formula"
        },

        // ============ GAUSS'S LAW ============
        {
            concept: "Electric Flux",
            theory: "Measure of electric field lines passing through a surface.",
            formula: "\\Phi = \\vec{E} \\cdot \\vec{A} = EA\\cos\\theta",
            details: "Unit: N·m²/C or V·m. θ is angle between E and area normal.",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Gauss's Law",
            theory: "Total electric flux through closed surface equals enclosed charge divided by ε₀.",
            formula: "\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{enclosed}}{\\varepsilon_0}",
            details: "Applicable for symmetric charge distributions.",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Field Inside Spherical Shell",
            theory: "Electric field inside a uniformly charged spherical shell.",
            formula: "E = 0 \\quad (r < R)",
            details: "All charge on surface. Field inside is zero.",
            jeeImportance: "High",
            type: "formula",
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
            type: "formula"
        },
        {
            concept: "Potential Difference",
            theory: "Work done per unit charge to move charge between two points.",
            formula: "V_{AB} = V_A - V_B = \\frac{W_{AB}}{q}",
            details: "V_AB = -∫ E⃗ · dr⃗ (from B to A).",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Relation Between E and V",
            theory: "Electric field is negative gradient of potential.",
            formula: "E = -\\frac{dV}{dr}",
            details: "E points from high V to low V. Field perpendicular to equipotential.",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Potential Due to Point Charge",
            theory: "Potential at distance r from point charge Q.",
            formula: "V = \\frac{kQ}{r} = \\frac{Q}{4\\pi\\varepsilon_0 r}",
            details: "+Q creates +V. Potential is scalar, additive.",
            jeeImportance: "High",
            type: "formula",
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
            type: "formula"
        },
        {
            concept: "Energy of System of Charges",
            theory: "Total potential energy of n point charges.",
            formula: "U = \\frac{1}{2}\\sum_i q_i V_i",
            details: "Factor 1/2 avoids counting pairs twice.",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Energy Density in Electric Field",
            theory: "Energy stored per unit volume in electric field.",
            formula: "u = \\frac{1}{2}\\varepsilon_0 E^2",
            details: "Unit: J/m³. Total energy: U = ∫u dV.",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Self Energy of Sphere",
            theory: "Energy required to assemble a uniformly charged sphere.",
            formula: "U = \\frac{3kQ^2}{5R}",
            details: "Work done against electrostatic repulsion.",
            jeeImportance: "Medium",
            type: "formula"
        },

        // ============ CONDUCTORS ============
        {
            concept: "Conductors in Electrostatic Equilibrium",
            theory: "Properties of conductors in static electric fields.",
            formula: "E_{inside} = 0, \\quad V = constant",
            details: "All charge on surface. Field at surface = σ/ε₀.",
            jeeImportance: "High",
            type: "concept"
        },
        {
            concept: "Surface Charge Density on Conductor",
            theory: "Field just outside conductor surface.",
            formula: "E = \\frac{\\sigma}{\\varepsilon_0}",
            details: "Field perpendicular to surface. σ higher at sharp points.",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Electrostatic Shielding",
            theory: "Electric field inside a hollow conductor is zero.",
            formula: "E_{inside} = 0 \\text{ (Faraday cage)}",
            details: "Protects from external electric fields.",
            jeeImportance: "Medium",
            type: "concept"
        },

        // ============ MOTION IN ELECTRIC FIELD ============
        {
            concept: "Force on Charge in Field",
            theory: "Force experienced by charge q in electric field E.",
            formula: "\\vec{F} = q\\vec{E}, \\quad \\vec{a} = \\frac{q\\vec{E}}{m}",
            details: "+q accelerates along E, -q opposite to E.",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Deflection of Charged Particle",
            theory: "Parabolic motion when charge enters field perpendicular to velocity.",
            formula: "y = \\frac{qEx^2}{2mv^2}",
            details: "Deflection angle: tan θ = qEL/(mv²).",
            jeeImportance: "High",
            type: "formula"
        },
        {
            concept: "Work-Energy Theorem",
            theory: "Work by electric field equals change in kinetic energy.",
            formula: "W = q\\Delta V = \\frac{1}{2}mv^2 - \\frac{1}{2}mu^2",
            details: "Also: W = qEd for uniform field.",
            jeeImportance: "High",
            type: "formula"
        }
    ]
};

export default electrostatics;
