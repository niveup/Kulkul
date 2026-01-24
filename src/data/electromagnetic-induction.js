/**
 * JEE Electromagnetic Induction - Formulas & Concepts
 * Class 12 Physics - Chapter: Electromagnetic Induction
 * 
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 * Formulas use KaTeX notation
 */

export const electromagneticInduction = {
    topic: "Electromagnetic Induction",
    concepts: [
        // ============ MAGNETIC FLUX ============
        {
            concept: "Magnetic Flux",
            theory: "Total magnetic field passing through a surface area.",
            formula: "\\Phi = \\vec{B} \\cdot \\vec{A} = BA\\cos\\theta",
            details: "Unit: Weber (Wb) = T·m². θ is angle between B and area normal.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate flux through surface", "Flux change problems", "Tilted surface calculations"],
            commonMistakes: ["Using angle with surface instead of normal", "Forgetting flux is scalar", "Wrong direction of area vector"],
            tips: "Φ = BA cosθ where θ is angle between B and NORMAL (not surface). Max flux when B ⊥ to surface (θ=0°). Zero flux when B ∥ to surface (θ=90°)."
        },
        {
            concept: "Flux Linkage",
            theory: "Total flux through a coil with N turns.",
            formula: "\\Lambda = N\\Phi = NBA\\cos\\theta",
            details: "Flux linkage is what matters for EMF calculation. Unit: Weber-turns.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate total flux linkage", "EMF from flux linkage change", "Multi-turn coil problems"],
            commonMistakes: ["Forgetting N factor", "Using Φ instead of NΦ for EMF", "Wrong interpretation of Weber-turns"],
            tips: "Always use NΦ for EMF calculation! EMF = -d(NΦ)/dt. More turns → more flux linkage → more induced EMF."
        },

        // ============ FARADAY'S LAW ============
        {
            concept: "Faraday's Law",
            theory: "Induced EMF equals negative rate of change of magnetic flux.",
            formula: "\\varepsilon = -\\frac{d\\Phi}{dt} = -N\\frac{d\\Phi}{dt}",
            details: "EMF induced whenever flux changes. Negative sign represents Lenz's law.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate induced EMF", "Rate of flux change", "Instantaneous vs average EMF"],
            commonMistakes: ["Forgetting negative sign", "Not using N for coils", "Confusing instantaneous with average"],
            tips: "EMF = -NdΦ/dt. Faster change → more EMF. Average EMF = NΔΦ/Δt. Lenz's law gives direction (opposes change)."
        },
        {
            concept: "Lenz's Law",
            theory: "Induced current opposes the change that produces it.",
            formula: "\\text{Direction of } I_{induced} \\text{ opposes } \\frac{d\\Phi}{dt}",
            details: "Conservation of energy. If flux increases, induced current creates opposing field.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Find direction of induced current", "Opposing field direction", "Energy conservation check"],
            commonMistakes: ["Opposing the flux instead of the CHANGE", "Wrong right-hand rule application", "Confusing increase vs decrease"],
            tips: "Induced current opposes the CHANGE, not the flux itself! Flux increasing → induced B opposes external B. Flux decreasing → induced B supports external B."
        },
        {
            concept: "Induced Charge",
            theory: "Total charge flowed independent of time taken.",
            formula: "Q = \\frac{N\\Delta\\Phi}{R} = \\frac{N(\\Phi_f - \\Phi_i)}{R}",
            details: "Q doesn't depend on how fast flux changes, only on total change!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Total charge in ballistic galvanometer", "Charge from coil flip", "Independence from time"],
            commonMistakes: ["Thinking Q depends on dΦ/dt", "Wrong ΔΦ calculation", "Forgetting N factor"],
            tips: "Q = NΔΦ/R - only depends on flux CHANGE, not rate! Used in ballistic galvanometer. For coil flip: ΔΦ = 2Φ (reversal)."
        },

        // ============ MOTIONAL EMF ============
        {
            concept: "Motional EMF",
            theory: "EMF induced in conductor moving through magnetic field.",
            formula: "\\varepsilon = Blv",
            details: "B, l, v mutually perpendicular. Due to Lorentz force on free electrons.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["EMF of moving rod", "Direction by Lenz's law", "Force on rod calculations"],
            commonMistakes: ["Using parallel components", "Wrong direction of induced EMF", "Forgetting perpendicular requirement"],
            tips: "ε = Blv when all three are mutually perpendicular. Use right-hand rule: v×B gives direction of force on +ve charge. Higher end is +ve terminal.",
            graph: {
                fn: 'linear-positive',
                xLabel: 'v',
                yLabel: 'ε',
                domain: [0, 5],
                step: 0.1,
                question: "How does EMF vary with velocity?"
            }
        },
        {
            concept: "Sliding Rod on Rails",
            theory: "Rod sliding on parallel rails in magnetic field.",
            formula: "\\varepsilon = Blv, \\quad I = \\frac{Blv}{R}",
            details: "Force on rod: F = BIl = B²l²v/R. Rod experiences retarding force.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Current in circuit", "Force on rod", "Acceleration problems"],
            commonMistakes: ["Wrong force direction", "Forgetting opposing force", "Using wrong R in circuit"],
            tips: "I = Blv/R. Retarding force F = BIl = B²l²v/R. Power dissipated = Fv = B²l²v²/R. Energy comes from external agent pushing rod!"
        },
        {
            concept: "Terminal Velocity",
            theory: "When gravitational and magnetic forces balance.",
            formula: "v_{terminal} = \\frac{mgR}{B^2l^2}",
            details: "At terminal velocity: mg = B²l²v/R. Rod falls at constant speed.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find terminal velocity", "Time to reach terminal velocity", "Energy considerations"],
            commonMistakes: ["Equating wrong forces", "Forgetting it's a limit", "Wrong expression for magnetic force"],
            tips: "At terminal velocity: mg = B²l²v/R (forces balance). v_terminal = mgR/(B²l²). After this, KE doesn't increase - all PE goes to heat!"
        },
        {
            concept: "Rotating Rod",
            theory: "EMF induced in rod rotating about one end in uniform B field.",
            formula: "\\varepsilon = \\frac{1}{2}B\\omega l^2 = \\frac{1}{2}Bl^2 \\cdot \\frac{2\\pi}{T}",
            details: "Equivalent to area swept per unit time. ω = angular velocity.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["EMF of rotating rod", "Rotating disc problems", "Charge flow in one rotation"],
            commonMistakes: ["Missing 1/2 factor", "Using l instead of l²", "Confusing with translating rod"],
            tips: "ε = ½Bωl². The ½ comes from integration (different parts of rod move at different speeds). Center is at lower potential than tip."
        },
        {
            concept: "Rotating Coil (Generator)",
            theory: "EMF in rectangular coil rotating in magnetic field.",
            formula: "\\varepsilon = NBA\\omega\\sin(\\omega t) = \\varepsilon_0\\sin(\\omega t)",
            details: "ε₀ = NBAω = peak EMF. Basis of AC generator.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Peak and instantaneous EMF", "Frequency and angular velocity", "RMS calculations"],
            commonMistakes: ["Using cosωt when sinωt is correct", "Wrong phase at t=0", "Confusing ω with f"],
            tips: "ε = NBAω sin(ωt). At t=0 (plane ⊥ to B): ε=0. Max EMF when plane ∥ to B. ε₀ = NBAω. RMS = ε₀/√2.",
            graph: {
                fn: 'sine',
                xLabel: 't',
                yLabel: 'ε',
                domain: [0, 6.28],
                step: 0.1,
                question: "When is induced EMF maximum?"
            }
        },

        // ============ SELF INDUCTANCE ============
        {
            concept: "Self Inductance",
            theory: "Property of coil to oppose change in its own current.",
            formula: "N\\Phi = LI \\quad \\text{or} \\quad L = \\frac{N\\Phi}{I}",
            details: "Unit: Henry (H). Analogous to inertia in mechanics.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate L from flux and current", "Inductance of solenoid", "Energy in inductor"],
            commonMistakes: ["Wrong formula for solenoid L", "Confusing L with M", "Unit errors"],
            tips: "L = NΦ/I. For solenoid: L = μ₀n²Al = μ₀N²A/l. L ∝ N². Inductor opposes change in current like inertia opposes change in velocity."
        },
        {
            concept: "Self-Induced EMF",
            theory: "EMF induced in coil due to changing current in itself.",
            formula: "\\varepsilon_L = -L\\frac{dI}{dt}",
            details: "Back EMF opposes change in current. Negative sign: Lenz's law.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate back EMF", "LR circuit problems", "Rate of current change"],
            commonMistakes: ["Forgetting negative sign", "Confusing with source EMF", "Wrong sign convention"],
            tips: "Back EMF = -L(dI/dt). Opposes CHANGE in current. If I increasing: back EMF opposes source. If I decreasing: back EMF tries to maintain current."
        },
        {
            concept: "Inductance of Solenoid",
            theory: "Inductance of ideal solenoid.",
            formula: "L = \\mu_0 n^2 Al = \\frac{\\mu_0 N^2 A}{l}",
            details: "n = N/l = turns per unit length. L ∝ N², L ∝ A, L ∝ 1/l.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate L from dimensions", "Effect of core material", "Comparison of inductances"],
            commonMistakes: ["Confusing n with N", "Forgetting μ₀", "Wrong dependence on l"],
            tips: "L = μ₀N²A/l = μ₀n²V. Double turns → 4× L. Double length → ½ L. Iron core: multiply by μᵣ (can be 1000+)."
        },

        // ============ MUTUAL INDUCTANCE ============
        {
            concept: "Mutual Inductance",
            theory: "Flux linkage in one coil due to current in another.",
            formula: "N_2\\Phi_{21} = MI_1 \\quad \\text{or} \\quad M = \\frac{N_2\\Phi_{21}}{I_1}",
            details: "Unit: Henry. M₁₂ = M₂₁ = M (reciprocity).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate M for coaxial solenoids", "Induced EMF in secondary", "Coupling coefficient"],
            commonMistakes: ["Thinking M₁₂ ≠ M₂₁", "Wrong flux linkage", "Confusing with L"],
            tips: "M = k√(L₁L₂) where k is coupling coefficient. For coaxial solenoids: M = μ₀N₁N₂A/l. M₁₂ = M₂₁ always!"
        },
        {
            concept: "Coupling Coefficient",
            theory: "Measure of magnetic coupling between two coils.",
            formula: "M = k\\sqrt{L_1 L_2}, \\quad 0 \\leq k \\leq 1",
            details: "k = 1 for perfect coupling. k < 1 for partial coupling.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate k from L and M", "Perfect coupling problems", "Flux leakage effects"],
            commonMistakes: ["k > 1 (impossible!)", "Wrong formula for M", "Forgetting k factor"],
            tips: "k = M/√(L₁L₂). k = 1: all flux links both coils (ideal transformer). k = 0: no coupling. Practical transformers: k ≈ 0.95-0.99."
        },
        {
            concept: "Inductors in Series",
            theory: "Equivalent inductance with mutual inductance.",
            formula: "L_{eq} = L_1 + L_2 \\pm 2M",
            details: "+ for aiding (same sense), − for opposing.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find L_eq for coupled inductors", "Aiding vs opposing", "Maximum and minimum L"],
            commonMistakes: ["Wrong sign for M", "Forgetting 2M factor", "Confusing series with parallel"],
            tips: "Aiding (+2M): fluxes add. Opposing (−2M): fluxes subtract. Max L_eq = L₁+L₂+2M. Min L_eq = L₁+L₂−2M."
        },

        // ============ ENERGY IN INDUCTOR ============
        {
            concept: "Energy Stored in Inductor",
            theory: "Magnetic energy stored in inductor carrying current I.",
            formula: "U = \\frac{1}{2}LI^2",
            details: "Analogous to ½mv² kinetic energy. Energy in magnetic field.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate stored energy", "Energy in LC oscillations", "Power in LR circuits"],
            commonMistakes: ["Forgetting ½ factor", "Using wrong I (max vs instantaneous)", "Confusing with ½CV²"],
            tips: "U = ½LI². Energy stored in B field, not in wire. Like KE = ½mv²: L ↔ m, I ↔ v. In LC circuit: oscillates between L and C."
        },
        {
            concept: "Magnetic Energy Density",
            theory: "Energy stored per unit volume in magnetic field.",
            formula: "u = \\frac{B^2}{2\\mu_0} = \\frac{1}{2}\\mu_0 H^2",
            details: "Unit: J/m³. Compare with electric: u = ½ε₀E².",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Energy density in solenoid", "Total energy from field", "Comparison with electric"],
            commonMistakes: ["Using ε₀ instead of μ₀", "Wrong factor of 2", "Confusing B and H"],
            tips: "u = B²/(2μ₀). Electric: u = ½ε₀E². Total U = u × volume. For solenoid: U = (B²/2μ₀) × Al."
        },

        // ============ LR CIRCUITS ============
        {
            concept: "LR Circuit: Growth",
            theory: "Current growth when battery connected to LR circuit.",
            formula: "I(t) = I_0(1 - e^{-t/\\tau}) = \\frac{V}{R}(1 - e^{-Rt/L})",
            details: "τ = L/R = time constant. At t = τ: I = 0.632I₀.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Current at time t", "Time to reach fraction of I₀", "Time constant calculation"],
            commonMistakes: ["Confusing with decay formula", "Wrong time constant (τ = L/R not RC)", "Forgetting exponential form"],
            tips: "Growth: I = I₀(1 - e^(-t/τ)). At t=0: I=0. At t=τ: I=0.63I₀. At t=5τ: I≈I₀. τ = L/R (not RC!).",
            graph: {
                fn: 'charging',
                xLabel: 't',
                yLabel: 'I',
                domain: [0, 5],
                step: 0.1,
                question: "What is the current at t = τ?"
            }
        },
        {
            concept: "LR Circuit: Decay",
            theory: "Current decay when battery removed from LR circuit.",
            formula: "I(t) = I_0 e^{-t/\\tau} = I_0 e^{-Rt/L}",
            details: "At t = τ: I = I₀/e = 0.368I₀. Back EMF maintains current.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Current decay at time t", "Time for current to halve", "Energy dissipated"],
            commonMistakes: ["Confusing with growth formula", "Wrong half-life formula", "Forgetting back EMF role"],
            tips: "Decay: I = I₀e^(-t/τ). At t=τ: I=0.37I₀. Half-life: t = τ ln2 = 0.693τ. Back EMF keeps current flowing temporarily.",
            graph: {
                fn: 'exponential-decay',
                xLabel: 't',
                yLabel: 'I',
                domain: [0, 5],
                step: 0.1,
                question: "What is the current at t = τ?"
            }
        },

        // ============ LC OSCILLATIONS ============
        {
            concept: "LC Oscillations",
            theory: "Energy oscillates between electric (C) and magnetic (L) fields.",
            formula: "\\omega_0 = \\frac{1}{\\sqrt{LC}}, \\quad f_0 = \\frac{1}{2\\pi\\sqrt{LC}}",
            details: "Undamped oscillations. Analogous to SHM: L ↔ m, 1/C ↔ k.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find resonant frequency", "Time period of oscillation", "Energy at any instant"],
            commonMistakes: ["Wrong formula for ω", "Forgetting 2π for frequency", "Confusing with LR time constant"],
            tips: "ω = 1/√(LC), T = 2π√(LC). At t=0: all energy in C (q=Q₀, I=0). At t=T/4: all energy in L (q=0, I=I₀). Like pendulum energy exchange!"
        },
        {
            concept: "Energy Conservation in LC",
            theory: "Total energy is constant, oscillates between L and C.",
            formula: "U_{total} = \\frac{q^2}{2C} + \\frac{1}{2}LI^2 = \\frac{Q_0^2}{2C}",
            details: "At max charge: all energy in C. At max current: all energy in L.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Energy at given q or I", "Maximum current", "Energy ratio at any instant"],
            commonMistakes: ["Forgetting energy conservation", "Wrong energy form", "Phase relationship errors"],
            tips: "U_total = Q₀²/(2C) = ½LI₀². At q=Q₀: U_C = max, U_L = 0. At I=I₀: U_L = max, U_C = 0. I₀ = Q₀ω = Q₀/√(LC)."
        },

        // ============ TRANSFORMER ============
        {
            concept: "Transformer Principle",
            theory: "Device using mutual induction to change AC voltage.",
            formula: "\\frac{V_s}{V_p} = \\frac{N_s}{N_p} = \\frac{I_p}{I_s}",
            details: "Step-up: Ns > Np. Step-down: Ns < Np. Ideal: no energy loss.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate secondary voltage", "Turns ratio problems", "Power in transformer"],
            commonMistakes: ["Confusing step-up with step-down", "Wrong current ratio", "Thinking power multiplies"],
            tips: "Vs/Vp = Ns/Np. Step-up: V↑, I↓ (Ns>Np). Step-down: V↓, I↑ (Ns<Np). Power: VpIp = VsIs (ideal). Power NOT amplified!"
        },
        {
            concept: "Power Transmission",
            theory: "High voltage transmission reduces power loss.",
            formula: "P_{loss} = I^2 R = \\frac{P^2 R}{V^2}",
            details: "Higher V → lower I → much less I²R loss.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate transmission losses", "Optimal voltage", "Efficiency of transmission"],
            commonMistakes: ["Thinking higher V means more loss", "Forgetting I = P/V", "Wrong loss formula"],
            tips: "P_loss = I²R = P²R/V². Double V → ¼ loss! That's why power transmitted at 400kV+. Step-up before transmission, step-down before use."
        }
    ]
};

export default electromagneticInduction;
