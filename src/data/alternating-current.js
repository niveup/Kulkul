/**
 * JEE Alternating Current - Formulas & Concepts
 * Class 12 Physics - Chapter: Alternating Current
 * 
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 * Formulas use KaTeX notation
 */

export const alternatingCurrent = {
    topic: "Alternating Current",
    concepts: [
        // ============ AC FUNDAMENTALS ============
        {
            concept: "Alternating Current Definition",
            theory: "Current that varies sinusoidally with time.",
            formula: "I = I_0 \\sin(\\omega t) = I_0 \\sin(2\\pi f t)",
            details: "I₀ = peak/amplitude. ω = 2πf = angular frequency. T = 1/f = time period.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Instantaneous value at time t", "Time period and frequency", "Phase calculations"],
            commonMistakes: ["Confusing I₀ with I_rms", "Wrong ω calculation", "Radians vs degrees in sinωt"],
            tips: "I = I₀ sin(ωt). ω = 2πf = 2π/T. In India: f = 50 Hz, ω = 100π rad/s, T = 20 ms. Peak occurs at ωt = π/2."
        },
        {
            concept: "RMS (Root Mean Square) Value",
            theory: "Effective value that produces same heating as equivalent DC.",
            formula: "I_{rms} = \\frac{I_0}{\\sqrt{2}} = 0.707 I_0",
            details: "Derived from average of I² over one cycle. Standard AC meters show RMS.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Convert peak to RMS", "Heating effect problems", "Meter readings"],
            commonMistakes: ["Using I₀ instead of I_rms for power", "Wrong factor (√2 not 2)", "Confusing RMS with average"],
            tips: "I_rms = I₀/√2 ≈ 0.707I₀. V_rms = V₀/√2. Power uses RMS values: P = I²_rms × R. AC meters show RMS, not peak!"
        },
        {
            concept: "Average Value (Half Cycle)",
            theory: "Average over positive (or negative) half cycle.",
            formula: "I_{avg} = \\frac{2I_0}{\\pi} = 0.637 I_0",
            details: "Full cycle average = 0. Half cycle average used for rectified AC.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Average value calculation", "Rectified DC problems", "Form factor"],
            commonMistakes: ["Using for full cycle (it's 0!)", "Confusing with RMS", "Wrong π factor"],
            tips: "I_avg = 2I₀/π ≈ 0.637I₀ (half cycle). Full cycle average = 0 (positive and negative cancel). Form factor = I_rms/I_avg ≈ 1.11."
        },

        // ============ PURE CIRCUITS ============
        {
            concept: "AC Through Resistor",
            theory: "Current and voltage are in phase for pure resistance.",
            formula: "I = \\frac{V_0}{R}\\sin(\\omega t), \\quad \\phi = 0°",
            details: "No phase difference. Power is dissipated. V and I in phase.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Current in R circuit", "Power in resistor", "Phasor diagram"],
            commonMistakes: ["Thinking there's a phase difference", "Not using Ohm's law correctly", "Forgetting power is dissipated"],
            tips: "Pure R: V and I in phase (φ = 0). P = I²R = V²/R (full power dissipated). Power factor = cos0° = 1."
        },
        {
            concept: "AC Through Inductor",
            theory: "Current lags voltage by 90° in pure inductor.",
            formula: "I = \\frac{V_0}{X_L}\\sin(\\omega t - 90°)",
            details: "Back EMF opposes current change. I lags V by π/2.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Inductive reactance", "Phase in L circuit", "Wattless current"],
            commonMistakes: ["Current leads (it LAGS!)", "Using R instead of X_L", "Forgetting P = 0"],
            tips: "Mnemonic: 'ELI' - E leads I in L. I lags V by 90°. X_L = ωL. P_avg = 0 (wattless current). Energy oscillates."
        },
        {
            concept: "Inductive Reactance",
            theory: "Opposition to AC by inductor.",
            formula: "X_L = \\omega L = 2\\pi f L",
            details: "Unit: Ohm (Ω). XL increases with frequency. XL = 0 at DC.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate X_L", "Effect of frequency on X_L", "Impedance with L"],
            commonMistakes: ["X_L = L (forgetting ω)", "Using X_L at DC", "Confusing with X_C"],
            tips: "X_L = ωL = 2πfL. At DC (f=0): X_L = 0 (short circuit). X_L ∝ f. Choke uses high X_L at high f.",
            graph: {
                fn: 'linear-positive',
                xLabel: 'f',
                yLabel: 'X_L',
                domain: [0, 5],
                step: 0.1,
                question: "How does inductive reactance vary with frequency?"
            }
        },
        {
            concept: "AC Through Capacitor",
            theory: "Current leads voltage by 90° in pure capacitor.",
            formula: "I = V_0 \\omega C \\sin(\\omega t + 90°)",
            details: "Capacitor charges and discharges. I leads V by π/2.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Capacitive reactance", "Phase in C circuit", "High-pass behavior"],
            commonMistakes: ["Current lags (it LEADS!)", "Using R instead of X_C", "Forgetting P = 0"],
            tips: "Mnemonic: 'ICE' - I leads E in C. I leads V by 90°. X_C = 1/(ωC). P_avg = 0. Capacitor blocks DC (X_C → ∞)."
        },
        {
            concept: "Capacitive Reactance",
            theory: "Opposition to AC by capacitor.",
            formula: "X_C = \\frac{1}{\\omega C} = \\frac{1}{2\\pi f C}",
            details: "Unit: Ohm (Ω). XC decreases with frequency. XC → ∞ at DC.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate X_C", "Effect of frequency on X_C", "DC blocking"],
            commonMistakes: ["X_C = ωC (it's 1/ωC)", "Forgetting DC behavior (open circuit)", "Confusing with X_L"],
            tips: "X_C = 1/(ωC) = 1/(2πfC). At DC (f=0): X_C = ∞ (open circuit). X_C ∝ 1/f. Capacitor blocks DC, passes AC.",
            graph: {
                fn: 'inverse',
                xLabel: 'f',
                yLabel: 'X_C',
                domain: [0.5, 5],
                step: 0.1,
                question: "How does capacitive reactance vary with frequency?"
            }
        },

        // ============ SERIES LCR CIRCUIT ============
        {
            concept: "Impedance of Series LCR",
            theory: "Total opposition to AC in series LCR circuit.",
            formula: "Z = \\sqrt{R^2 + (X_L - X_C)^2}",
            details: "Unit: Ohm. Z ≥ R always. Minimum Z = R at resonance.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate impedance", "Current in LCR", "Resonance condition"],
            commonMistakes: ["Adding X_L and X_C (subtract!)", "Forgetting square root", "Using X_L + X_C"],
            tips: "Z = √[R² + (X_L - X_C)²]. Subtract reactances! At resonance: X_L = X_C, so Z = R (minimum). I = V/Z."
        },
        {
            concept: "Phase Angle in LCR",
            theory: "Phase difference between voltage and current.",
            formula: "\\tan\\phi = \\frac{X_L - X_C}{R}",
            details: "φ > 0: inductive (V leads I). φ < 0: capacitive (I leads V). φ = 0: resonance.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find phase angle", "Leading or lagging", "Power factor from φ"],
            commonMistakes: ["Wrong sign convention", "Confusing X_L - X_C order", "Using X_C - X_L"],
            tips: "tan φ = (X_L - X_C)/R. If X_L > X_C: φ > 0, inductive, V leads I. If X_C > X_L: φ < 0, capacitive, I leads V."
        },
        {
            concept: "Voltage Relations in LCR",
            theory: "Phasor addition of voltages.",
            formula: "V = \\sqrt{V_R^2 + (V_L - V_C)^2}",
            details: "VR in phase with I, VL leads I by 90°, VC lags I by 90°.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find individual voltages", "Phasor diagrams", "Voltage magnification"],
            commonMistakes: ["Adding all voltages directly", "Wrong phasor directions", "Forgetting V_L and V_C oppose"],
            tips: "V_R = IR, V_L = IX_L, V_C = IX_C. V_L and V_C are 180° apart (oppose each other). V = √[V_R² + (V_L-V_C)²]."
        },

        // ============ RESONANCE ============
        {
            concept: "Resonance Condition",
            theory: "When inductive and capacitive reactances are equal.",
            formula: "X_L = X_C \\Rightarrow \\omega_0 = \\frac{1}{\\sqrt{LC}}",
            details: "Net reactance = 0. Circuit behaves as purely resistive.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find resonant frequency", "Condition for resonance", "Effect on impedance"],
            commonMistakes: ["Forgetting condition X_L = X_C", "Wrong formula for ω₀", "Thinking Z = 0 at resonance (it's R)"],
            tips: "At resonance: X_L = X_C, so (X_L - X_C) = 0. Z = R (minimum). I = V/R (maximum). φ = 0 (resistive). ω₀ = 1/√(LC)."
        },
        {
            concept: "Resonant Frequency",
            theory: "Frequency at which resonance occurs.",
            formula: "f_0 = \\frac{1}{2\\pi\\sqrt{LC}}, \\quad \\omega_0 = \\frac{1}{\\sqrt{LC}}",
            details: "Independent of R. Same as natural frequency of LC oscillations.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate f₀", "Effect of L and C on f₀", "Tuning circuits"],
            commonMistakes: ["Forgetting 2π for f", "Dependence on R (it doesn't!)", "Wrong LC formula"],
            tips: "f₀ = 1/(2π√LC). Independent of R! Same formula as LC oscillation frequency. To increase f₀: decrease L or C."
        },
        {
            concept: "Quality Factor (Q-Factor)",
            theory: "Measure of sharpness of resonance.",
            formula: "Q = \\frac{\\omega_0 L}{R} = \\frac{1}{\\omega_0 CR} = \\frac{1}{R}\\sqrt{\\frac{L}{C}}",
            details: "Higher Q = sharper resonance = narrower bandwidth. Q = voltage magnification.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate Q factor", "Bandwidth from Q", "Voltage magnification"],
            commonMistakes: ["Wrong Q formula", "Confusing with power factor", "Forgetting Q = V_L/V or V_C/V"],
            tips: "Q = ω₀L/R = 1/(ω₀CR) = (1/R)√(L/C). High Q: sharp peak, narrow bandwidth. V_L = V_C = QV at resonance (can be >> V!)."
        },
        {
            concept: "Bandwidth",
            theory: "Frequency range between half-power points.",
            formula: "\\Delta\\omega = \\frac{R}{L} = \\frac{\\omega_0}{Q}, \\quad \\Delta f = \\frac{f_0}{Q}",
            details: "At half-power: I = I_max/√2, P = P_max/2.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate bandwidth", "Relation with Q", "Selectivity of circuit"],
            commonMistakes: ["Bandwidth = Q (it's inverse!)", "Wrong half-power current", "Confusing Δω with ω₀"],
            tips: "Δf = f₀/Q. High Q → narrow bandwidth (selective). Low Q → wide bandwidth (less selective). Bandwidth = f₂ - f₁."
        },

        // ============ POWER ============
        {
            concept: "Average Power",
            theory: "Real power dissipated in circuit.",
            formula: "P_{avg} = V_{rms} I_{rms} \\cos\\phi = I_{rms}^2 R",
            details: "Only R dissipates power. Unit: Watt (W).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate average power", "Power at resonance", "Effect of power factor"],
            commonMistakes: ["Forgetting cos φ", "Using peak values instead of RMS", "Thinking L and C dissipate power"],
            tips: "P = VIcosφ = I²R. Only resistance dissipates power! L and C store/return energy. At resonance: cosφ = 1, P = V²/R (max)."
        },
        {
            concept: "Power Factor",
            theory: "Ratio of true power to apparent power.",
            formula: "\\cos\\phi = \\frac{P}{S} = \\frac{R}{Z}",
            details: "0 ≤ cos φ ≤ 1. Unity power factor desirable.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate power factor", "Leading vs lagging", "Power factor correction"],
            commonMistakes: ["Power factor > 1", "Confusing with phase angle", "Wrong formula R/Z"],
            tips: "cosφ = R/Z = P/S. cosφ = 1: purely resistive (ideal). cosφ = 0: purely reactive (wattless). Industries aim for cosφ ≈ 0.9+."
        },
        {
            concept: "Wattless Current",
            theory: "Component of current that consumes no power.",
            formula: "I_{wattless} = I_{rms}\\sin\\phi",
            details: "Current through pure L or C. Contributes to reactive power only.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate wattless current", "Reactive power problems", "Current components"],
            commonMistakes: ["Thinking all current is useful", "Wrong formula (sin not cos)", "Confusing with power current"],
            tips: "I_wattless = I sinφ. I_power = I cosφ. Total I² = I²_power + I²_wattless. Pure L or C: all current is wattless (P = 0)."
        },
        {
            concept: "Power Triangle",
            theory: "Relationship between P, Q, and S.",
            formula: "S^2 = P^2 + Q^2, \\quad P = S\\cos\\phi",
            details: "S = apparent power (VA), P = true power (W), Q = reactive power (VAR).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Power triangle problems", "Calculate S, P, Q", "Power factor from triangle"],
            commonMistakes: ["Adding P and Q directly", "Wrong units (VA, W, VAR)", "Confusing S with total power"],
            tips: "S = VI (apparent), P = VI cosφ (true), Q = VI sinφ (reactive). S² = P² + Q². Units: S in VA, P in W, Q in VAR."
        },

        // ============ TRANSFORMER ============
        {
            concept: "Transformer Principle",
            theory: "Device using mutual induction to change AC voltage.",
            formula: "\\frac{V_s}{V_p} = \\frac{N_s}{N_p} = \\frac{I_p}{I_s}",
            details: "Step-up: Ns > Np. Step-down: Ns < Np. Ideal: no energy loss.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate secondary voltage", "Turns ratio", "Current transformation"],
            commonMistakes: ["Wrong ratio direction", "Thinking power increases", "Current ratio inverted"],
            tips: "V_s/V_p = N_s/N_p = I_p/I_s. Step-up: V↑, I↓. Step-down: V↓, I↑. Power conserved: V_p I_p = V_s I_s (ideal)."
        },
        {
            concept: "Transformer Efficiency",
            theory: "Ratio of output to input power.",
            formula: "\\eta = \\frac{P_{out}}{P_{in}} = \\frac{V_s I_s \\cos\\phi_s}{V_p I_p \\cos\\phi_p}",
            details: "Losses: copper (I²R), iron (hysteresis + eddy). Real η ≈ 90-99%.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate efficiency", "Identify losses", "Reduce losses"],
            commonMistakes: ["η > 100%", "Ignoring power factor", "Forgetting loss types"],
            tips: "η = P_out/P_in < 100%. Losses: (1) Copper loss = I²R in windings, (2) Iron loss = hysteresis + eddy currents. Use laminated core to reduce eddy losses."
        },
        {
            concept: "Power Transmission",
            theory: "High voltage transmission reduces power loss.",
            formula: "P_{loss} = I^2 R = \\frac{P^2 R}{V^2}",
            details: "Higher V → lower I → much less I²R loss.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate transmission loss", "Optimal voltage", "Efficiency improvement"],
            commonMistakes: ["Higher V = more loss (wrong!)", "Forgetting I = P/V", "Not squaring for loss"],
            tips: "P_loss = I²R = P²R/V². Double V → quarter the loss (I²R effect). Transmit at high V (400kV+), step down for use."
        }
    ]
};

export default alternatingCurrent;
