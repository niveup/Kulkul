/**
 * JEE Current Electricity Formulas & Concepts
 * Class 12 Physics - Chapter: Current Electricity
 * 
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 * Formulas use KaTeX notation
 */

export const currentElectricity = {
    topic: "Current Electricity",
    concepts: [
        // ============ FUNDAMENTALS ============
        {
            concept: "Electric Current",
            theory: "Rate of flow of electric charge through a conductor.",
            formula: "I = \\frac{dq}{dt} = neAv_d",
            details: "Unit: Ampere (A). Scalar quantity. Conventional current opposite to electron flow.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate current from charge", "Current in terms of drift velocity", "Direction of current"],
            commonMistakes: ["Treating current as vector", "Confusing electron flow with conventional current", "Wrong units in neAv_d"],
            tips: "Current is SCALAR (has only + or - indicating direction along wire). Conventional I is opposite to electron motion. I = dq/dt gives instantaneous; I = q/t gives average."
        },
        {
            concept: "Drift Velocity",
            theory: "Average velocity acquired by free electrons under applied field.",
            formula: "v_d = \\frac{eE\\tau}{m} = \\frac{I}{neA}",
            details: "τ = relaxation time (~10⁻¹⁴ s). Typical vd ~ mm/s, but signal speed ≈ c.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate drift velocity", "Compare vd for different wires", "Effect of stretching on vd"],
            commonMistakes: ["Confusing vd with signal speed", "Using wrong formula for n", "Forgetting vd is very small (~mm/s)"],
            tips: "vd ∝ I, vd ∝ 1/A. If wire stretched to 2L: A→A/2, so vd→2vd for same I. Signal speed ≈ c (not vd!) due to EM field propagation."
        },
        {
            concept: "Current Density",
            theory: "Current per unit cross-sectional area.",
            formula: "\\vec{J} = nev_d = \\sigma\\vec{E}",
            details: "Unit: A/m². Vector quantity. J = σE is microscopic Ohm's law.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate J from I and A", "J in non-uniform cross-section", "Relation between J and E"],
            commonMistakes: ["Thinking J is scalar", "Using area instead of cross-sectional area", "Confusing J = I/A with J = σE cases"],
            tips: "J is a VECTOR (unlike I). J = σE is the microscopic form of Ohm's law. In non-uniform wire, J is higher where A is smaller."
        },
        {
            concept: "Mobility",
            theory: "Drift velocity per unit electric field.",
            formula: "\\mu = \\frac{v_d}{E} = \\frac{e\\tau}{m}",
            details: "Unit: m²/(V·s). Higher mobility → better conductor.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate mobility", "Compare materials by mobility", "Relation to conductivity"],
            commonMistakes: ["Wrong units", "Confusing with conductivity", "Not relating to drift velocity"],
            tips: "μ = vd/E = eτ/m. Conductivity σ = neμ. Electrons have higher μ than holes in most semiconductors."
        },

        // ============ RESISTANCE & TEMPERATURE ============
        {
            concept: "Resistance Definition",
            theory: "Opposition to current flow. Depends on geometry and material.",
            formula: "R = \\rho\\frac{L}{A} = \\frac{V}{I}",
            details: "Unit: Ohm (Ω). L = length, A = area, ρ = resistivity.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate R from dimensions", "Effect of stretching/doubling", "Compare resistances"],
            commonMistakes: ["Confusing ρ with R", "Wrong area formula (πr², not 2πr)", "Not converting units properly"],
            tips: "R = ρL/A. Double length → 2R. Double radius → R/4 (area ∝ r²). For wire stretched n times: R' = n²R."
        },
        {
            concept: "Resistivity (Microscopic)",
            theory: "Resistivity derived from drift velocity and current density equations.",
            formula: "\\rho = \\frac{m}{ne^2\\tau}",
            details: "ρ depends on material (n, τ), not geometry. Key formula from free electron theory.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Derive ρ from microscopic quantities", "Effect of temperature on ρ", "Compare materials"],
            commonMistakes: ["Confusing resistivity (ρ) with resistance (R)", "Forgetting τ decreases with T for metals", "Wrong n for semiconductors"],
            tips: "ρ = m/(ne²τ). For metals: as T↑, τ↓, so ρ↑. For semiconductors: as T↑, n↑ dominates, so ρ↓."
        },
        {
            concept: "Conductivity",
            theory: "Reciprocal of resistivity - measures ease of current flow.",
            formula: "\\sigma = \\frac{1}{\\rho} = \\frac{ne^2\\tau}{m}",
            details: "Unit: S/m. Good conductors: σ ~ 10⁷ S/m. Insulators: σ ~ 10⁻¹⁴ S/m.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate conductivity", "Compare materials", "Relation to J and E"],
            commonMistakes: ["Confusing σ with ρ", "Wrong units (S/m not Ω/m)", "Not using J = σE properly"],
            tips: "σ = 1/ρ = ne²τ/m. Copper σ ≈ 6×10⁷ S/m. J = σE is the microscopic Ohm's law."
        },
        {
            concept: "Ohmic Conductors",
            theory: "Conductors that obey Ohm's law - linear V-I graph.",
            formula: "V = IR \\text{ (straight line through origin)}",
            details: "Slope = R. Examples: metals at constant temperature. V ∝ I strictly.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Identify ohmic from V-I graph", "Calculate R from slope", "Conditions for Ohm's law"],
            commonMistakes: ["Thinking all materials are ohmic", "Not recognizing non-linear as non-ohmic", "Confusing dynamic and static resistance"],
            tips: "Ohmic: V-I is straight line through origin, constant R. Most metals are ohmic at constant T. Slope of V-I graph = R.",
            graph: {
                fn: 'linear-positive',
                xLabel: 'I',
                yLabel: 'V',
                domain: [0, 5],
                step: 0.1,
                question: "What does the slope of V-I graph represent?"
            }
        },
        {
            concept: "Temperature Coefficient (Metals)",
            theory: "Resistance of metals increases linearly with temperature.",
            formula: "R_T = R_0[1 + \\alpha(T - T_0)]",
            details: "α > 0 for metals. α for Cu ≈ 3.9×10⁻³ /°C. More lattice vibrations → more collisions.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find R at temperature T", "Calculate α from data", "Temperature for given R"],
            commonMistakes: ["Wrong sign of α for metals", "Confusing (T-T₀) with T alone", "Using wrong α value"],
            tips: "Metals: α > 0 (R increases with T). Use RT = R₀(1+αΔT). At higher T, more lattice vibrations → shorter τ → higher ρ.",
            graph: {
                fn: 'linear-positive',
                xLabel: 'T',
                yLabel: 'R',
                domain: [0, 100],
                step: 1,
                question: "Why does α differ for different materials?"
            }
        },
        {
            concept: "Temperature Coefficient (Semiconductors)",
            theory: "Resistance of semiconductors DECREASES with temperature.",
            formula: "R_T = R_0[1 + \\alpha(T - T_0)], \\quad \\alpha < 0",
            details: "Higher T → more free carriers → lower resistance. Thermistors use this property.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Compare metal vs semiconductor R with T", "Thermistor problems", "NTC behavior"],
            commonMistakes: ["Using positive α for semiconductors", "Forgetting temperature effect on n", "Confusing intrinsic with doped behavior"],
            tips: "Semiconductors: α < 0 (R decreases with T). Reason: n increases faster than τ decreases. NTC thermistors use this for temperature sensing."
        },
        {
            concept: "Wire Stretching",
            theory: "When wire is stretched, both L and A change (volume constant).",
            formula: "R' = R \\cdot n^2 = R\\left(\\frac{L'}{L}\\right)^2",
            details: "If stretched to n times length: L' = nL, A' = A/n. So R' = ρ(nL)/(A/n) = n²R.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["R after stretching", "% change in R", "New dimensions after stretching"],
            commonMistakes: ["Forgetting volume is constant", "Using n instead of n²", "Confusing with length halving"],
            tips: "Volume = LA = constant. If L→nL, then A→A/n. So R = ρL/A → n²R. Stretched to double length → 4× resistance!"
        },

        // ============ POWER & HEATING ============
        {
            concept: "Electrical Power",
            theory: "Rate of electrical energy consumption or delivery.",
            formula: "P = VI = I^2R = \\frac{V^2}{R}",
            details: "Unit: Watt (W). Three forms - choose based on what's constant!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate power", "Power in series/parallel", "Power ratio comparisons"],
            commonMistakes: ["Using wrong formula for the situation", "Forgetting P ∝ I² or P ∝ 1/R depending on circuit", "Unit errors"],
            tips: "Use P = I²R when I is constant (series). Use P = V²/R when V is constant (parallel). P = VI always works!"
        },
        {
            concept: "Joule's Law of Heating",
            theory: "Heat produced in conductor is proportional to I²Rt.",
            formula: "H = I^2Rt = \\frac{V^2t}{R} = Pt",
            details: "Doubling current = 4× the heat! Basis for electric heaters, fuses, kettles.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Heat generated in time t", "Compare heating in different resistors", "Fuse melting problems"],
            commonMistakes: ["Forgetting t in the formula", "Using wrong current (through that specific R)", "Not converting kWh to J"],
            tips: "H = I²Rt = V²t/R = Pt. Double current → 4× heat (I² effect). For fuse: H must exceed melting threshold."
        },
        {
            concept: "Bulbs in Series",
            theory: "In series, bulb with higher resistance glows brighter.",
            formula: "P_i = I^2 R_i \\Rightarrow P \\propto R",
            details: "LOWEST wattage (highest R) bulb glows brightest! Same current through all.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Which bulb is brighter in series?", "Power consumed by each bulb", "Effect of removing one bulb"],
            commonMistakes: ["Thinking higher wattage = brighter (wrong in series!)", "Using rated power instead of actual", "Forgetting R = V²/P"],
            tips: "Series: same I. P = I²R, so higher R → more power → brighter. Lower rated wattage bulb has HIGHER R, so it's brighter in series!"
        },
        {
            concept: "Bulbs in Parallel",
            theory: "In parallel, bulb with lower resistance glows brighter.",
            formula: "P_i = \\frac{V^2}{R_i} \\Rightarrow P \\propto \\frac{1}{R}",
            details: "HIGHEST wattage (lowest R) bulb glows brightest! Same voltage across all.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Which bulb is brighter in parallel?", "Total power consumed", "Current through each bulb"],
            commonMistakes: ["Confusing with series behavior", "Forgetting V is same in parallel", "Wrong R calculation from ratings"],
            tips: "Parallel: same V. P = V²/R, so lower R → more power → brighter. Higher rated wattage bulb has LOWER R, so it's brighter in parallel!"
        },
        {
            concept: "Rated vs Actual Power",
            theory: "Actual power depends on applied voltage, not just rating.",
            formula: "P_{actual} = \\frac{V_{applied}^2}{R} = P_{rated}\\left(\\frac{V_{applied}}{V_{rated}}\\right)^2",
            details: "Brightness = actual power consumed, NOT rated power. R = V²rated/Prated.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Actual power at different voltage", "Power in combination circuits", "Bulb brightness comparison"],
            commonMistakes: ["Using rated power directly", "Forgetting R is constant", "Wrong voltage in formula"],
            tips: "First find R = V²_rated/P_rated. Then P_actual = V²_applied/R. Bulb rated 100W, 220V at 110V: P = 100×(110/220)² = 25W!"
        },
        {
            concept: "Maximum Power Transfer",
            theory: "Power to load is maximum when load resistance equals source resistance.",
            formula: "R_{load} = r \\Rightarrow P_{max} = \\frac{E^2}{4r}",
            details: "At max power, efficiency is exactly 50%! Half power lost in internal resistance.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find load R for max power", "Calculate max power", "Efficiency at max power"],
            commonMistakes: ["Forgetting efficiency is 50% at max power", "Wrong P_max formula", "Confusing with max efficiency"],
            tips: "For max power: R_load = r. P_max = E²/4r. Efficiency = 50% (not maximum!). For max efficiency, need R >> r (but less power)."
        },

        // ============ CELLS & EMF ============
        {
            concept: "Electromotive Force (EMF)",
            theory: "Work done per unit charge by source in complete circuit.",
            formula: "E = \\frac{W}{q}",
            details: "EMF measured at open circuit. Unit: Volt. E is property of source, not circuit.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Define EMF vs potential difference", "Measure EMF using potentiometer", "EMF in different cells"],
            commonMistakes: ["EMF is not a force!", "Confusing EMF with terminal voltage", "Thinking EMF depends on external circuit"],
            tips: "EMF = energy per unit charge provided by cell. Open circuit: V = E. Closed circuit: V = E - Ir < E."
        },
        {
            concept: "Terminal Voltage",
            theory: "Voltage across cell terminals when current flows.",
            formula: "V = E - Ir \\text{ (discharging)}, \\quad V = E + Ir \\text{ (charging)}",
            details: "V < E during discharge. V > E during charging.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate terminal voltage", "Internal resistance problems", "Charging vs discharging"],
            commonMistakes: ["Wrong sign for charging case", "Forgetting internal resistance drop", "Using V = E always"],
            tips: "Discharging: V = E - Ir (V < E). Charging: V = E + Ir (V > E, external source pushes current in). Ir is 'lost' voltage inside cell."
        },
        {
            concept: "Short Circuit Current",
            theory: "Maximum current when external resistance is zero.",
            formula: "I_{max} = \\frac{E}{r}",
            details: "All power dissipated inside cell. Dangerous - can cause heating/explosion.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate short circuit current", "Power dissipated in cell", "Safety problems"],
            commonMistakes: ["Thinking I can be infinite", "Forgetting about internal resistance", "Not recognizing danger"],
            tips: "Short circuit: R = 0, so I = E/r (max possible). All power P = I²r lost inside cell → heating. Practical cells have high r for safety."
        },

        // ============ NETWORK THEOREMS ============
        {
            concept: "Resistors in Series",
            theory: "Same current, voltages add.",
            formula: "R_{eq} = R_1 + R_2 + ... + R_n",
            details: "Voltage divider: Vi = IR_i. Series increases total resistance.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find equivalent R", "Voltage across each R", "Current in series circuit"],
            commonMistakes: ["Using parallel formula", "Forgetting all R must carry same I", "Wrong voltage division"],
            tips: "Series: I same, V adds. R_eq = ΣRᵢ. Voltage divider: Vᵢ = V_total × Rᵢ/R_eq. Larger R gets larger V."
        },
        {
            concept: "Resistors in Parallel",
            theory: "Same voltage, currents add.",
            formula: "\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + ... + \\frac{1}{R_n}",
            details: "For 2 resistors: Req = R₁R₂/(R₁+R₂). Current divider applies.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find equivalent R", "Current through each R", "Power in parallel"],
            commonMistakes: ["Adding R directly", "Forgetting reciprocal at end", "Wrong current division"],
            tips: "Parallel: V same, I adds. 1/R_eq = Σ(1/Rᵢ). For two: R = R₁R₂/(R₁+R₂). Current divider: Iᵢ = I_total × R_eq/Rᵢ."
        },
        {
            concept: "Kirchhoff's Current Law (KCL)",
            theory: "Sum of currents at a junction is zero.",
            formula: "\\sum I_{in} = \\sum I_{out}",
            details: "Based on charge conservation. Apply at each node/junction.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Apply KCL at junction", "Find unknown current", "Multi-node problems"],
            commonMistakes: ["Wrong sign convention", "Missing a branch current", "Not consistent with direction"],
            tips: "ΣI_in = ΣI_out (charge conserved). Choose current directions first, solve - negative answer means opposite direction."
        },
        {
            concept: "Kirchhoff's Voltage Law (KVL)",
            theory: "Sum of potential differences around closed loop is zero.",
            formula: "\\sum V = \\sum IR + \\sum E = 0",
            details: "Based on energy conservation. Sign convention is crucial!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Apply KVL around loop", "Multi-loop circuits", "Find EMF or current"],
            commonMistakes: ["Inconsistent sign convention", "Missing an element in loop", "Wrong direction for EMF"],
            tips: "Go around loop: +IR if I is in direction of traversal, +E if - to + terminal. ΣV = 0 around closed loop."
        },
        {
            concept: "Cells in Series",
            theory: "EMFs add algebraically, internal resistances add.",
            formula: "E_{eq} = E_1 + E_2 + ..., \\quad r_{eq} = r_1 + r_2 + ...",
            details: "For opposing cells: Eeq = |E₁ - E₂|. Increases voltage capacity.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find equivalent EMF and r", "Opposing cells in series", "Current in circuit"],
            commonMistakes: ["Forgetting to add internal resistances", "Wrong sign for opposing cells", "Confusing with parallel"],
            tips: "Series cells: E_eq = ΣEᵢ (with sign), r_eq = Σrᵢ (always add). Opposing: subtract EMFs. Same polarity: add EMFs."
        },
        {
            concept: "Cells in Parallel (Identical)",
            theory: "Same EMF, internal resistance decreases.",
            formula: "E_{eq} = E, \\quad r_{eq} = \\frac{r}{n}",
            details: "n identical cells: EMF unchanged but can supply more current.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Equivalent of n parallel cells", "Maximum current from combination", "Power delivery"],
            commonMistakes: ["Thinking EMF adds in parallel", "Wrong r calculation", "Confusing with series"],
            tips: "n identical cells in parallel: E_eq = E (same), r_eq = r/n (divided). Benefit: can supply n times more current!"
        },

        // ============ MEASURING INSTRUMENTS ============
        {
            concept: "Wheatstone Bridge",
            theory: "Four-resistor network for precise resistance measurement.",
            formula: "\\frac{P}{Q} = \\frac{R}{S} \\text{ (balanced condition)}",
            details: "At balance, no current through galvanometer. Unknown R = S(P/Q).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find unknown resistance", "Balance condition", "Sensitivity of bridge"],
            commonMistakes: ["Wrong ratio arrangement", "Forgetting no current through G at balance", "Unbalanced bridge calculations"],
            tips: "At balance: P/Q = R/S, I_G = 0. Unknown X = known R × (P/Q). For sensitivity, balance near middle of wire (P ≈ Q)."
        },
        {
            concept: "Meter Bridge",
            theory: "Practical Wheatstone bridge using uniform wire.",
            formula: "X = R \\cdot \\frac{l}{100 - l}",
            details: "l = balance length. Wire must be uniform. End corrections may apply.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find unknown resistance", "Effect of end corrections", "Sensitivity improvement"],
            commonMistakes: ["Wrong length ratio", "Forgetting end corrections", "Non-uniform wire errors"],
            tips: "X/R = l/(100-l). Balance near middle (l ≈ 50 cm) for best accuracy. End corrections: replace l with (l+α), (100-l+β)."
        },
        {
            concept: "Ammeter Conversion",
            theory: "Galvanometer + low shunt resistance in parallel.",
            formula: "S = \\frac{I_g G}{I - I_g} = \\frac{G}{n-1}",
            details: "Most current bypasses galvanometer. n = I/Ig = multiplying factor.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate shunt value", "Extend ammeter range", "Error analysis"],
            commonMistakes: ["Using series instead of parallel", "Wrong formula for S", "Forgetting n = I/Ig"],
            tips: "Shunt S in PARALLEL with G. S = G/(n-1) where n = I_max/I_g. Very small S carries most current, protects galvanometer."
        },
        {
            concept: "Voltmeter Conversion",
            theory: "Galvanometer + high resistance in series.",
            formula: "R = \\frac{V}{I_g} - G = G(n-1)",
            details: "High R ensures negligible current. n = V/Vg = multiplying factor.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate series resistance", "Extend voltmeter range", "Loading effect"],
            commonMistakes: ["Using parallel instead of series", "Wrong formula for R", "Forgetting n = V/(Ig×G)"],
            tips: "Multiplier R in SERIES with G. R = G(n-1) where n = V_max/(Ig×G). High R → low current → minimal circuit disturbance."
        },

        // ============ POTENTIOMETER ============
        {
            concept: "Potentiometer Principle",
            theory: "Potential drop along uniform wire is proportional to length.",
            formula: "V \\propto L \\Rightarrow k = \\frac{V}{L}",
            details: "k = potential gradient (V/m). Null method - no current drawn at balance.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find potential gradient", "Compare EMFs", "Measure internal resistance"],
            commonMistakes: ["Current flowing at balance point", "Non-uniform wire assumption", "Wrong potential gradient"],
            tips: "At null point: no current from test cell → measures true EMF. k = V/L = iρ/A. Lower k = more sensitive (longer wire)."
        },
        {
            concept: "Comparing EMFs",
            theory: "Ratio of EMFs equals ratio of balancing lengths.",
            formula: "\\frac{E_1}{E_2} = \\frac{L_1}{L_2}",
            details: "Very accurate method. No current at balance point.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Compare two EMFs", "Standard cell comparison", "Unknown EMF calculation"],
            commonMistakes: ["Taking ratio incorrectly", "Current at balance disturbs reading", "Not using same k"],
            tips: "E₁/E₂ = l₁/l₂. At balance, I = 0 from cell being measured → true EMF (not terminal voltage). Most accurate EMF comparison method!"
        },
        {
            concept: "Internal Resistance Measurement",
            theory: "Measure internal resistance using potentiometer.",
            formula: "r = R\\left(\\frac{L_1 - L_2}{L_2}\\right) = R\\left(\\frac{L_1}{L_2} - 1\\right)",
            details: "L₁ for EMF, L₂ for terminal voltage with R connected. Classic JEE problem type.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find internal resistance", "Effect of external R", "Error analysis"],
            commonMistakes: ["Confusing L₁ and L₂", "Wrong formula arrangement", "Forgetting R in formula"],
            tips: "l₁ for E (open circuit), l₂ for V (with R connected). r = R(l₁-l₂)/l₂. As R→∞, l₂→l₁ (V→E). Very popular JEE question!"
        }
    ]
};

export default currentElectricity;
