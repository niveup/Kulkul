/**
 * JEE Capacitor Formulas & Concepts
 * Class 12 Physics - Chapter: Capacitors
 * 
 * Comprehensive coverage for JEE Main & Advanced
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 */

export const capacitor = {
    topic: "Capacitors",
    concepts: [
        // ============ BASIC CONCEPTS ============
        {
            concept: "Capacitance Definition",
            theory: "Capacitance is the ability of a system to store electric charge. It is the ratio of charge stored to the potential difference applied.",
            formula: "C = \\frac{Q}{V}",
            details: "Unit: Farad (F) = C/V. Capacitance depends only on geometry and medium, not on Q or V.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate capacitance from Q and V", "Compare capacitances of different geometries", "Unit conversions (µF, pF, nF)"],
            commonMistakes: ["Thinking C depends on Q or V", "Wrong unit conversions (1µF = 10⁻⁶F, not 10⁻³F)", "Confusing capacitance with charge"],
            tips: "C is a constant for given geometry/medium. Like a 'bucket size' - doesn't change with water (charge) amount. 1pF = 10⁻¹²F, 1nF = 10⁻⁹F, 1µF = 10⁻⁶F."
        },
        {
            concept: "Energy Stored in Capacitor",
            theory: "Work done to charge a capacitor is stored as electrostatic energy in the electric field.",
            formula: "U = \\frac{1}{2}CV^2 = \\frac{Q^2}{2C} = \\frac{1}{2}QV",
            details: "Energy is stored in the electric field between the plates, not on the plates themselves.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate stored energy", "Energy change with dielectric", "Energy in combinations"],
            commonMistakes: ["Forgetting factor of 1/2", "Using wrong formula for given quantities", "Confusing energy with charge"],
            tips: "Three forms! Use U=½CV² when V is constant, U=Q²/2C when Q is constant. Remember: energy is in the FIELD, not on plates."
        },
        {
            concept: "Energy Density in Capacitor",
            theory: "Energy stored per unit volume in the electric field between capacitor plates.",
            formula: "u = \\frac{1}{2}\\varepsilon_0 E^2 = \\frac{1}{2}\\varepsilon_0\\varepsilon_r E^2 = \\frac{1}{2}\\vec{D} \\cdot \\vec{E}",
            details: "For parallel plate: u = σ²/(2ε₀εᵣ). Total energy U = u × Volume = u × A × d.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Energy density at a point", "Total energy from field", "Compare energy densities"],
            commonMistakes: ["Missing ε₀ or εᵣ factor", "Forgetting u ∝ E²", "Using wrong volume in U = u×V"],
            tips: "u = ½ε₀E² (vacuum) or ½ε₀εᵣE² (medium). Total U = u × Ad. Same formula works for any electric field, not just capacitors!"
        },

        // ============ PARALLEL PLATE CAPACITOR ============
        {
            concept: "Parallel Plate Capacitor",
            theory: "Two parallel conducting plates separated by distance d with area A.",
            formula: "C = \\frac{\\varepsilon_0 A}{d}",
            details: "Assumes uniform field, A >> d². Edge effects neglected. This is the most fundamental capacitor geometry.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate C from dimensions", "Effect of changing A or d", "Design for specific capacitance"],
            commonMistakes: ["Using diameter instead of area", "Forgetting ε₀ value", "Not converting units properly"],
            tips: "C ∝ A, C ∝ 1/d. Double area → double C. Double separation → half C. ε₀ = 8.85×10⁻¹² F/m.",
            graph: {
                fn: 'inverse',
                xLabel: 'd',
                yLabel: 'C',
                domain: [0.1, 5],
                step: 0.1,
                question: "How does capacitance vary with plate separation?"
            }
        },
        {
            concept: "Parallel Plate with Dielectric",
            theory: "When a dielectric of constant κ fills the space between plates.",
            formula: "C = \\frac{\\kappa\\varepsilon_0 A}{d} = \\kappa C_0",
            details: "κ (kappa) = relative permittivity = ε/ε₀. Always κ ≥ 1. Capacitance increases by factor κ.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Capacitance with full dielectric", "Compare with and without dielectric", "Find dielectric constant"],
            commonMistakes: ["Putting κ in denominator instead of numerator", "Forgetting κ ≥ 1 always", "Confusing κ with ε"],
            tips: "Dielectric ALWAYS increases C (κ ≥ 1). C_new = κ × C_old. Common values: air≈1, paper≈3, glass≈5, water≈80."
        },
        {
            concept: "Partially Filled Dielectric Slab",
            theory: "When dielectric slab of thickness t < d is inserted between plates.",
            formula: "C = \\frac{\\varepsilon_0 A}{d - t + \\frac{t}{\\kappa}} = \\frac{\\varepsilon_0 A}{d - t\\left(1 - \\frac{1}{\\kappa}\\right)}",
            details: "For conducting slab (κ → ∞): C = ε₀A/(d-t). Metal slab reduces effective separation.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["C with partial dielectric", "Metal slab insertion", "Maximum capacitance"],
            commonMistakes: ["Confusing t with d", "Wrong formula for metal slab", "Not using effective distance correctly"],
            tips: "Think of it as two capacitors in series! For metal: C = ε₀A/(d-t) because metal has E=0 inside. Effective distance = d - t(1 - 1/κ)."
        },
        {
            concept: "Multiple Dielectric Slabs (Series)",
            theory: "When space between plates is filled with n dielectric slabs in series.",
            formula: "C = \\frac{\\varepsilon_0 A}{\\frac{t_1}{\\kappa_1} + \\frac{t_2}{\\kappa_2} + ... + \\frac{t_n}{\\kappa_n}}",
            details: "Each slab contributes as series capacitor. Equivalent to 1/C = 1/C₁ + 1/C₂ + ...",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Multiple layers in series", "Effective dielectric constant", "Optimal arrangement"],
            commonMistakes: ["Adding capacitances directly (should add 1/C)", "Wrong thickness assignment", "Forgetting it's distance division"],
            tips: "Series = distance (d) is divided. Use 1/C_eq = Σ(tᵢ/κᵢε₀A). Think: each slab is a separate capacitor in series."
        },
        {
            concept: "Multiple Dielectrics (Parallel)",
            theory: "When two or more dielectrics divide the plate area.",
            formula: "C = \\frac{\\varepsilon_0}{d}(\\kappa_1 A_1 + \\kappa_2 A_2 + ...)",
            details: "Parallel combination. Each dielectric region acts as separate capacitor.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Side-by-side dielectrics", "Effective dielectric for parallel", "Half-half filling"],
            commonMistakes: ["Using series formula", "Forgetting A₁ + A₂ = A_total", "Wrong area fractions"],
            tips: "Parallel = area (A) is divided. C_eq = ΣCᵢ = Σ(κᵢε₀Aᵢ/d). Two halves: C = (ε₀/d)(κ₁A/2 + κ₂A/2)."
        },

        // ============ OTHER GEOMETRIES ============
        {
            concept: "Spherical Capacitor",
            theory: "Two concentric conducting spherical shells with inner radius a and outer radius b.",
            formula: "C = 4\\pi\\varepsilon_0 \\frac{ab}{b-a}",
            details: "For b → ∞ (isolated sphere): C = 4πε₀a. Earth's capacitance ≈ 711 µF.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["C of concentric spheres", "Isolated sphere capacitance", "Earth's capacitance"],
            commonMistakes: ["Confusing a and b", "Using wrong limit for isolated sphere", "Forgetting 4π factor"],
            tips: "For isolated sphere (b→∞): C = 4πε₀R = R/9×10⁹. Earth (R=6400km) has C ≈ 711µF. Larger sphere = larger C."
        },
        {
            concept: "Cylindrical Capacitor",
            theory: "Two coaxial cylinders of length L with inner radius a and outer radius b.",
            formula: "C = \\frac{2\\pi\\varepsilon_0 L}{\\ln(b/a)}",
            details: "Used in transmission lines, coaxial cables. L >> b for this formula to apply.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Coaxial cable capacitance", "Effect of radii ratio", "Per unit length capacitance"],
            commonMistakes: ["Using log instead of ln", "Wrong ratio (b/a not a/b)", "Forgetting length L"],
            tips: "C ∝ L (longer = more C). C ∝ 1/ln(b/a). For per-unit-length: C/L = 2πε₀/ln(b/a). Natural log, not log₁₀!"
        },

        // ============ COMBINATIONS ============
        {
            concept: "Capacitors in Series",
            theory: "Same charge on each capacitor, voltages add up.",
            formula: "\\frac{1}{C_{eq}} = \\frac{1}{C_1} + \\frac{1}{C_2} + ... + \\frac{1}{C_n}",
            details: "For 2 capacitors: Ceq = C₁C₂/(C₁+C₂). Series reduces effective capacitance.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find equivalent C in series", "Voltage distribution", "Charge on series capacitors"],
            commonMistakes: ["Adding C directly (wrong for series)", "Forgetting reciprocal", "Not recognizing series connection"],
            tips: "OPPOSITE to resistors! Series C: 1/C = 1/C₁ + 1/C₂. For two: C = C₁C₂/(C₁+C₂). Charge SAME, voltage DIVIDES."
        },
        {
            concept: "Capacitors in Parallel",
            theory: "Same voltage across each capacitor, charges add up.",
            formula: "C_{eq} = C_1 + C_2 + ... + C_n",
            details: "Parallel increases effective capacitance. Total charge Q = Q₁ + Q₂ + ...",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find equivalent C in parallel", "Charge distribution", "Adding capacitors for more C"],
            commonMistakes: ["Using series formula", "Not recognizing parallel connection", "Wrong charge division"],
            tips: "Parallel C: just add C_eq = C₁ + C₂ + C₃. Voltage SAME, charge DIVIDES (Q∝C). Larger C stores more charge."
        },
        {
            concept: "Charge Distribution in Series",
            theory: "When capacitors are in series, charge is same on all.",
            formula: "Q_1 = Q_2 = ... = Q_n = Q_{total}",
            details: "Voltage divides: V₁ = Q/C₁, V₂ = Q/C₂. Smaller C gets larger V.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Find charge on capacitors in series", "Voltage across each", "Energy in each"],
            commonMistakes: ["Thinking charge divides", "Wrong voltage calculation", "Confusing Q_total with individual Q"],
            tips: "Series: Q same on all! V divides inversely as C (smaller C gets more V). V₁/V₂ = C₂/C₁. Total V = V₁+V₂+..."
        },
        {
            concept: "Infinite Ladder Network",
            theory: "Infinite series-parallel combination of identical capacitors.",
            formula: "C_{eq} = \\frac{C}{2}\\left(\\sqrt{1 + \\frac{4C_2}{C_1}} - 1\\right)",
            details: "For C₁ = C₂ = C: Ceq = C(√5 - 1)/2 ≈ 0.618C. Uses self-similarity.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Equivalent of infinite ladder", "Self-similar networks", "Recursive problems"],
            commonMistakes: ["Not using self-similarity", "Wrong quadratic solution", "Arithmetic errors"],
            tips: "Key insight: removing one unit leaves same network! If Ceq = x, then x in series/parallel with unit = x. Solve quadratic!"
        },

        // ============ DIELECTRICS ============
        {
            concept: "Dielectric Constant",
            theory: "Ratio of permittivity of material to permittivity of free space.",
            formula: "\\kappa = \\varepsilon_r = \\frac{\\varepsilon}{\\varepsilon_0} = \\frac{C}{C_0}",
            details: "κ = 1 for vacuum, ~1 for air, 80 for water, 3-6 for glass. Always κ ≥ 1.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find κ from capacitance ratio", "Effect of κ on force/field", "Compare materials"],
            commonMistakes: ["Thinking κ < 1 is possible", "Confusing κ with χ (susceptibility)", "Wrong values for common materials"],
            tips: "κ = C/C₀ = ε/ε₀. Force reduces by κ in medium. Water has high κ (80) - that's why it's a good solvent!"
        },
        {
            concept: "Effect of Dielectric on Field",
            theory: "Dielectric reduces electric field by polarization.",
            formula: "E_{medium} = \\frac{E_0}{\\kappa} = \\frac{\\sigma}{\\kappa\\varepsilon_0}",
            details: "Free charge creates E₀, induced charges create opposing field E_p = E₀(1 - 1/κ).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field inside dielectric", "Polarization field", "Net field calculation"],
            commonMistakes: ["Forgetting field reduces inside dielectric", "Wrong factor (κ in numerator)", "Confusing E and D"],
            tips: "E_inside = E₀/κ (reduces). Induced field E_p = E₀(1-1/κ). Field lines 'crowd' at dielectric boundaries."
        },
        {
            concept: "Induced Surface Charge",
            theory: "Bound charges appear on dielectric surfaces due to polarization.",
            formula: "\\sigma_p = \\sigma\\left(1 - \\frac{1}{\\kappa}\\right) = P",
            details: "These bound charges reduce the net field inside dielectric. σ_net = σ - σp = σ/κ.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find induced charge density", "Net surface charge", "Polarization problems"],
            commonMistakes: ["Confusing σ_free with σ_total", "Wrong formula for σ_p", "Sign errors"],
            tips: "σ_induced = σ(1 - 1/κ). Always < σ_free. As κ → ∞, σ_p → σ (conductor behavior). Net field uses net charge!"
        },
        {
            concept: "Dielectric with Battery Connected",
            theory: "Voltage remains constant when dielectric is inserted with battery connected.",
            formula: "V' = V, \\quad Q' = \\kappa Q, \\quad E' = E, \\quad U' = \\kappa U",
            details: "Battery supplies additional charge. Field in dielectric remains same as σ increases.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Insert dielectric with battery", "Charge/energy change", "Compare before/after"],
            commonMistakes: ["Thinking V changes", "Wrong direction of Q change", "Confusing with battery disconnected case"],
            tips: "Battery connected → V constant. C↑ by κ, so Q↑ by κ. Energy U = ½CV² ↑ by κ. Battery does positive work!"
        },
        {
            concept: "Dielectric with Battery Disconnected",
            theory: "Charge remains constant when dielectric is inserted after disconnecting battery.",
            formula: "Q' = Q, \\quad V' = \\frac{V}{\\kappa}, \\quad E' = \\frac{E}{\\kappa}, \\quad U' = \\frac{U}{\\kappa}",
            details: "Energy decreases! Where does it go? → Work done in pulling dielectric in (attractive force).",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Insert dielectric without battery", "Energy change", "Force on dielectric"],
            commonMistakes: ["Thinking Q changes", "Energy increases (it decreases!)", "Forgetting attractive force does work"],
            tips: "Battery disconnected → Q constant. C↑ by κ, so V↓ by κ. Energy U = Q²/2C ↓ by κ. Lost energy = work done pulling slab in!"
        },
        {
            concept: "Force on Dielectric Slab",
            theory: "Dielectric is pulled into charged capacitor due to fringing fields.",
            formula: "F = \\frac{\\varepsilon_0(\\kappa - 1)V^2 w}{2d}",
            details: "w = width of slab. Battery connected: F constant. Battery disconnected: F varies with x.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Force to hold slab", "Work in insertion", "Equilibrium position"],
            commonMistakes: ["Wrong formula for disconnected case", "Forgetting (κ-1) factor", "Sign of force"],
            tips: "Force is ATTRACTIVE (pulls dielectric in). F ∝ V² (battery) or ∝ Q² (no battery). Fringing field causes the force!"
        },

        // ============ RC CIRCUITS ============
        {
            concept: "Time Constant of RC Circuit",
            theory: "Characteristic time for charging/discharging processes.",
            formula: "\\tau = RC",
            details: "Unit: seconds. After τ, capacitor reaches 63.2% of final value. After 5τ, ~99.3% complete.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate time constant", "Time for given charge", "Effect of R and C"],
            commonMistakes: ["Units (R in Ω, C in F)", "Confusing 63% with 37%", "Not recognizing 5τ rule"],
            tips: "τ = RC (seconds). At t=τ: 63% charged or 37% remaining. At t=5τ: 99.3% complete. Practical 'fully charged' = 5τ."
        },
        {
            concept: "Charging of Capacitor",
            theory: "When uncharged capacitor is connected to EMF source through resistance.",
            formula: "Q(t) = CE\\left(1 - e^{-t/RC}\\right) = Q_{max}\\left(1 - e^{-t/\\tau}\\right)",
            details: "V(t) = E(1 - e^(-t/τ)), I(t) = (E/R)e^(-t/τ). Current decreases exponentially.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Charge at time t", "Voltage across C or R", "Current at time t"],
            commonMistakes: ["Using wrong exponential form", "Confusing with discharge formula", "Sign of exponent"],
            tips: "Charging: Q = Q_max(1 - e^(-t/τ)). Starts at 0, approaches Q_max. I starts at E/R, drops to 0. V_C rises, V_R falls.",
            graph: {
                fn: 'charging',
                xLabel: 't',
                yLabel: 'Q',
                domain: [0, 5],
                step: 0.1,
                question: "What is the charge at t = τ?"
            }
        },
        {
            concept: "Discharging of Capacitor",
            theory: "When charged capacitor is allowed to discharge through resistance.",
            formula: "Q(t) = Q_0 e^{-t/RC} = Q_0 e^{-t/\\tau}",
            details: "V(t) = V₀e^(-t/τ), I(t) = -(Q₀/RC)e^(-t/τ). Magnitude of current decreases exponentially.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Remaining charge at t", "Time to reach fraction", "Current during discharge"],
            commonMistakes: ["Using charging formula", "Forgetting negative sign in current", "Wrong initial conditions"],
            tips: "Discharging: Q = Q₀e^(-t/τ). Starts at Q₀, approaches 0. At t=τ, Q = Q₀/e ≈ 0.37Q₀. Current is opposite direction!",
            graph: {
                fn: 'exponential-decay',
                xLabel: 't',
                yLabel: 'Q',
                domain: [0, 5],
                step: 0.1,
                question: "What is the charge at t = τ?"
            }
        },
        {
            concept: "Energy in RC Charging",
            theory: "Energy supplied by battery, stored in capacitor, and dissipated in resistor.",
            formula: "E_{battery} = CE^2, \\quad U_{cap} = \\frac{1}{2}CE^2, \\quad H_R = \\frac{1}{2}CE^2",
            details: "Half the energy is always dissipated in resistor regardless of R value! This is a key result.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Energy distribution", "Heat in resistor", "Efficiency of charging"],
            commonMistakes: ["Thinking all energy goes to C", "Thinking heat depends on R", "Energy conservation errors"],
            tips: "ALWAYS 50% to capacitor, 50% as heat - regardless of R! This is because ∫I²Rdt = ½CE² always. Lower R = faster but same total heat."
        },

        // ============ ENERGY SHARING ============
        {
            concept: "Common Potential",
            theory: "When two capacitors are connected, charge redistributes to equalize potential.",
            formula: "V_{common} = \\frac{C_1 V_1 + C_2 V_2}{C_1 + C_2} = \\frac{Q_1 + Q_2}{C_1 + C_2}",
            details: "Charge is conserved: Q₁' + Q₂' = Q₁ + Q₂. Works for any number of capacitors.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Final voltage after redistribution", "Charge on each after connection", "Multiple capacitor sharing"],
            commonMistakes: ["Forgetting charge conservation", "Adding voltages directly", "Wrong formula for common V"],
            tips: "Charge conserved: Q_total = same. V_common = Q_total/C_total. Each gets: Q₁' = C₁V_common, Q₂' = C₂V_common."
        },
        {
            concept: "Energy Loss in Charge Sharing",
            theory: "When two charged capacitors are connected, energy is lost as heat/radiation.",
            formula: "\\Delta U = U_i - U_f = \\frac{1}{2}\\frac{C_1 C_2}{C_1 + C_2}(V_1 - V_2)^2",
            details: "Energy loss = ½ × reduced capacitance × (voltage difference)². Always positive!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Energy lost in redistribution", "Heat generated", "Compare initial/final energy"],
            commonMistakes: ["Expecting energy conservation", "Wrong formula for ΔU", "Forgetting (V₁-V₂)² factor"],
            tips: "ENERGY IS LOST! ΔU = ½ C_red (ΔV)² where C_red = C₁C₂/(C₁+C₂). Lost as heat/EM radiation. Only V₁=V₂ → no loss."
        },

        // ============ AC CIRCUITS ============
        {
            concept: "Capacitive Reactance",
            theory: "Opposition offered by capacitor to AC current flow.",
            formula: "X_C = \\frac{1}{\\omega C} = \\frac{1}{2\\pi f C}",
            details: "Unit: Ohm (Ω). XC decreases with frequency. At DC (f=0), XC → ∞ (open circuit).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate reactance", "Effect of frequency on XC", "Compare with resistance"],
            commonMistakes: ["Confusing XC with R", "Using ωC instead of 1/ωC", "Forgetting DC behavior"],
            tips: "XC = 1/ωC. High frequency → low XC (capacitor is 'short'). DC (f=0) → XC = ∞ (capacitor is 'open'). XC has no power loss!",
            graph: {
                fn: 'inverse',
                xLabel: 'f',
                yLabel: 'X_C',
                domain: [0.1, 5],
                step: 0.1,
                question: "How does reactance change with frequency?"
            }
        },
        {
            concept: "Current in Capacitive Circuit",
            theory: "In purely capacitive circuit, current leads voltage by 90°.",
            formula: "I = \\frac{V_0}{X_C}\\sin(\\omega t + 90°) = \\omega C V_0 \\cos(\\omega t)",
            details: "Phase angle φ = -90° (current leads). Impedance phasor: Z = -jXC.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Current amplitude", "Phase relationship", "Phasor diagram"],
            commonMistakes: ["Current lagging (it LEADS!)", "Wrong phase angle sign", "Confusing with inductor"],
            tips: "Mnemonic: 'CIVIL' - In Capacitor, I leads V. Current leads by 90°. I = V/XC. Power factor = 0 (no real power)."
        },
        {
            concept: "LC Oscillations",
            theory: "Energy oscillates between electric field (C) and magnetic field (L).",
            formula: "\\omega_0 = \\frac{1}{\\sqrt{LC}}, \\quad f_0 = \\frac{1}{2\\pi\\sqrt{LC}}",
            details: "Natural frequency of oscillation. Q(t) = Q₀cos(ω₀t), I(t) = -ω₀Q₀sin(ω₀t).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find resonant frequency", "Energy oscillation", "Maximum current"],
            commonMistakes: ["Putting LC under wrong root", "Forgetting 2π for frequency", "Confusing ω with f"],
            tips: "Like SHM! ω = 1/√(LC). Max Q when I=0, max I when Q=0. Total energy = ½LI²_max = Q²_max/2C = constant."
        },

        // ============ ADVANCED ============
        {
            concept: "Displacement Current",
            theory: "Current due to changing electric field, introduced by Maxwell.",
            formula: "I_d = \\varepsilon_0 \\frac{d\\Phi_E}{dt} = \\varepsilon_0 A \\frac{dE}{dt}",
            details: "Completes Ampere's law. Between capacitor plates, I_d = I_c (conduction current in wires).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate displacement current", "Magnetic field between plates", "Maxwell's correction"],
            commonMistakes: ["Thinking no current between plates", "Wrong formula for Id", "Forgetting Id = Ic in capacitor"],
            tips: "Id = ε₀ × dΦE/dt. Between capacitor plates: no actual charges flow, but changing E creates 'current'. Id = Ic always!"
        },
        {
            concept: "Kirchhoff's Laws for Capacitors",
            theory: "Apply KVL and KCL to analyze multi-loop capacitor networks.",
            formula: "\\sum V = 0 \\text{ (loop)}, \\quad \\sum Q_{in} = \\sum Q_{out} \\text{ (node)}",
            details: "In steady state, I through C = 0. Use Q = CV for each capacitor.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Multi-loop capacitor circuits", "Steady state analysis", "Charge on intermediate plates"],
            commonMistakes: ["Current through C in steady state (it's 0!)", "Wrong sign convention", "Not using Q=CV properly"],
            tips: "Steady state: I=0 through all C. Write V = Q/C for each capacitor. Apply KVL to loops. Charge conservation at nodes!"
        },
        {
            concept: "Work Done by Battery",
            theory: "Battery does work to move charge through potential difference.",
            formula: "W_{battery} = QV = CV^2 = 2U_{stored}",
            details: "Half goes to capacitor, half dissipated in resistance (for charging from zero).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Work by battery in charging", "Energy distribution", "Efficiency calculation"],
            commonMistakes: ["Thinking all work goes to C", "Wrong factor (2 times stored)", "Energy conservation errors"],
            tips: "W_battery = QV = CV². Energy stored = ½CV². So battery does 2× what capacitor stores. Other half = heat in R (always!)."
        }
    ]
};

export default capacitor;
