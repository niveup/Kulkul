/**
 * JEE Kinetic Theory of Gases
 * Class 11 Physics - Chapter: Kinetic Theory
 * 
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 */

export const kineticTheory = {
    topic: "Kinetic Theory of Gases",
    concepts: [
        // ============ IDEAL GAS LAWS ============
        {
            concept: "Ideal Gas Equation",
            uid: "KTG01",
            theory: "Equation of state relating P, V, T for ideal gas.",
            formula: "PV = nRT = NkT",
            details: "R = 8.314 J/mol·K. k = 1.38×10⁻²³ J/K (Boltzmann). n = moles, N = molecules.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["P-V-T calculations", "Find moles from conditions", "Compare states"],
            commonMistakes: ["Using wrong R value", "Confusing n and N", "Temperature not in Kelvin"],
            tips: "PV = nRT. Always use T in Kelvin! R = 8.314 J/mol·K. Also: PV = (m/M)RT where m = mass, M = molar mass. Check units carefully!"
        },
        {
            concept: "Boyle's Law",
            uid: "KTG02",
            theory: "At constant temperature, pressure inversely proportional to volume.",
            formula: "PV = \\text{constant}, \\quad P_1V_1 = P_2V_2",
            details: "Isothermal process. Hyperbolic P-V curve.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Volume change with pressure", "Isothermal compression", "Verify Boyle's law"],
            commonMistakes: ["Temperature must be constant", "Using when T changes", "Wrong pressure units"],
            tips: "PV = const at fixed T. Double P → halve V. Graph: P vs V is hyperbola, P vs 1/V is straight line through origin."
        },
        {
            concept: "Charles's Law",
            uid: "KTG03",
            theory: "At constant pressure, volume directly proportional to temperature.",
            formula: "\\frac{V}{T} = \\text{constant}, \\quad \\frac{V_1}{T_1} = \\frac{V_2}{T_2}",
            details: "Isobaric process. V → 0 as T → 0 K.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Volume at different temperature", "Expansion on heating", "Absolute zero concept"],
            commonMistakes: ["Using Celsius instead of Kelvin", "Forgetting pressure constant", "Extrapolating to negative V"],
            tips: "V/T = const at fixed P. Must use Kelvin! V ∝ T. Gas would have zero volume at 0 K (ideal). Graph: V vs T is straight line through origin (in K)."
        },
        {
            concept: "Gay-Lussac's Law",
            uid: "KTG04",
            theory: "At constant volume, pressure directly proportional to temperature.",
            formula: "\\frac{P}{T} = \\text{constant}, \\quad \\frac{P_1}{T_1} = \\frac{P_2}{T_2}",
            details: "Isochoric process. Used in constant volume gas thermometers.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Pressure change on heating", "Gas thermometer", "Tire pressure in sun"],
            commonMistakes: ["Volume must be constant", "Using Celsius", "Confusing with Boyle's"],
            tips: "P/T = const at fixed V. P ∝ T (in Kelvin). Heating gas in rigid container increases pressure. Car tire pressure increases on hot day."
        },
        {
            concept: "Avogadro's Law",
            uid: "KTG05",
            theory: "Equal volumes of gases at same T and P contain equal number of molecules.",
            formula: "V \\propto n \\text{ (at same P, T)}, \\quad N_A = 6.022 \\times 10^{23}",
            details: "At STP: 1 mole of any gas ≈ 22.4 L. NA = Avogadro's number.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Compare moles from volumes", "STP calculations", "Molecular count"],
            commonMistakes: ["Forgetting STP conditions", "Using for non-ideal gases", "Wrong NA value"],
            tips: "V ∝ n at same P, T. STP: 0°C, 1 atm → 1 mole = 22.4 L. At 25°C, 1 atm: ~24.5 L. NA = 6.022×10²³. N = n × NA."
        },
        {
            concept: "Dalton's Law of Partial Pressures",
            uid: "KTG06",
            theory: "Total pressure equals sum of partial pressures.",
            formula: "P_{total} = P_1 + P_2 + P_3 + ..., \\quad P_i = x_i P_{total}",
            details: "Each gas exerts pressure independently. xi = mole fraction.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Mixture pressure", "Partial pressure calculation", "Mole fraction problems"],
            commonMistakes: ["Confusing with volume fractions", "Not using mole fractions", "Wrong partial pressure"],
            tips: "P_total = ΣPᵢ. Pᵢ = xᵢP_total where xᵢ = nᵢ/n_total. At same T: partial pressure = pressure if gas alone occupied whole volume."
        },

        // ============ KINETIC THEORY BASICS ============
        {
            concept: "Assumptions of Kinetic Theory",
            uid: "KTG07",
            theory: "Model treating gas as large number of randomly moving molecules.",
            formula: "\\text{Assumptions: (1) point masses, (2) elastic collisions, (3) random motion}",
            details: "Also: no intermolecular forces (except collision), collision time << free time.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["State assumptions", "When assumptions fail", "Ideal vs real gas"],
            commonMistakes: ["Forgetting key assumptions", "Applying to liquids/solids", "Not understanding 'ideal' limitations"],
            tips: "Key assumptions: (1) Molecules are point masses, (2) No forces except during collision, (3) Elastic collisions, (4) Random motion, (5) Many molecules!"
        },
        {
            concept: "Pressure from Kinetic Theory",
            uid: "KTG08",
            theory: "Pressure arises from molecular collisions with walls.",
            formula: "P = \\frac{1}{3}\\rho v_{rms}^2 = \\frac{1}{3}\\frac{Nm\\langle v^2 \\rangle}{V}",
            details: "Derived from momentum transfer at walls. m = molecular mass.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Derive pressure formula", "Calculate from rms speed", "Effect of speed change"],
            commonMistakes: ["Forgetting 1/3 factor", "Confusing m with M", "Wrong average (need ⟨v²⟩)"],
            tips: "P = (1/3)ρv²_rms. The 1/3 comes from 3D averaging. Also P = (1/3)(N/V)m⟨v²⟩. This links microscopic (v) to macroscopic (P)!"
        },
        {
            concept: "Root Mean Square Speed",
            uid: "KTG09",
            theory: "Square root of mean of squared molecular speeds.",
            formula: "v_{rms} = \\sqrt{\\langle v^2 \\rangle} = \\sqrt{\\frac{3RT}{M}} = \\sqrt{\\frac{3kT}{m}}",
            details: "M = molar mass (kg/mol), m = molecular mass (kg). Most commonly used average speed.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate rms speed", "Compare speeds at different T", "Effect of gas type"],
            commonMistakes: ["Using M in g/mol (must be kg/mol)", "Confusing with average speed", "Temperature not in Kelvin"],
            tips: "v_rms = √(3RT/M) = √(3kT/m). At room T: H₂ ~ 1900 m/s, N₂ ~ 500 m/s, O₂ ~ 480 m/s. v_rms ∝ √T, v_rms ∝ 1/√M."
        },
        {
            concept: "Mean Speed (Average Speed)",
            uid: "KTG10",
            theory: "Arithmetic mean of molecular speeds.",
            formula: "v_{mean} = \\sqrt{\\frac{8RT}{\\pi M}} = \\sqrt{\\frac{8kT}{\\pi m}}",
            details: "v_mean < v_rms. Used for collision frequency calculations.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate average speed", "Compare with rms", "Ratio of speeds"],
            commonMistakes: ["Confusing with v_rms", "Wrong numerical coefficient", "Using 8/π incorrectly"],
            tips: "v_avg = √(8RT/πM) = √(8/π) × √(RT/M). Ratio: v_rms : v_avg : v_mp = √3 : √(8/π) : √2 ≈ 1.73 : 1.60 : 1.41."
        },
        {
            concept: "Most Probable Speed",
            uid: "KTG11",
            theory: "Speed possessed by maximum number of molecules.",
            formula: "v_{mp} = \\sqrt{\\frac{2RT}{M}} = \\sqrt{\\frac{2kT}{m}}",
            details: "Peak of Maxwell-Boltzmann distribution. Smallest of the three averages.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate most probable speed", "Interpret distribution peak", "Compare speeds"],
            commonMistakes: ["Confusing coefficient (2 not 3)", "Thinking it's most common velocity (speed vs velocity)", "Wrong in distribution"],
            tips: "v_mp = √(2RT/M) = √(2kT/m). This is the peak of f(v) vs v graph. v_mp < v_avg < v_rms always. Memory: 2, 8/π, 3 under square root."
        },
        {
            concept: "Relation Between Different Speeds",
            uid: "KTG12",
            theory: "Fixed numerical ratio between rms, mean, and most probable speeds.",
            formula: "v_{rms} : v_{mean} : v_{mp} = \\sqrt{3} : \\sqrt{\\frac{8}{\\pi}} : \\sqrt{2}",
            details: "Approximately 1.73 : 1.60 : 1.41. Same ratio for all ideal gases at any T.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find one speed from another", "Ratio problems", "Gas comparison"],
            commonMistakes: ["Getting ratio backwards", "Wrong numerical values", "Thinking ratio changes with T"],
            tips: "v_rms : v_avg : v_mp ≈ 1.22 : 1.13 : 1 (normalized to v_mp). Or ≈ 1.73 : 1.60 : 1.41. These ratios are universal for ideal gases!"
        },

        // ============ ENERGY ============
        {
            concept: "Mean Kinetic Energy per Molecule",
            uid: "KTG13",
            theory: "Average translational kinetic energy of a gas molecule.",
            formula: "\\langle KE \\rangle = \\frac{1}{2}m\\langle v^2 \\rangle = \\frac{3}{2}kT",
            details: "Depends only on temperature! Same for all ideal gases at same T.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate molecular KE", "Compare KE of different gases", "KE at temperature"],
            commonMistakes: ["Thinking heavier molecules have more KE", "Using R instead of k", "Forgetting 3/2 factor"],
            tips: "⟨KE⟩ = (3/2)kT per molecule. Same for H₂ and O₂ at same T! Heavier molecules move slower but have same energy. Per mole: (3/2)RT."
        },
        {
            concept: "Kinetic Energy per Mole",
            uid: "KTG14",
            theory: "Total kinetic energy of one mole of gas molecules.",
            formula: "KE_{mole} = \\frac{3}{2}RT = \\frac{3}{2}N_A kT",
            details: "For monatomic gas, this is total internal energy. R = NAk.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate molar KE", "Total energy of gas sample", "Compare at different T"],
            commonMistakes: ["Using per molecule formula", "Confusing R and k", "Forgetting n for n moles"],
            tips: "KE per mole = (3/2)RT ≈ 3.7 kJ/mol at 300K. For n moles: (3/2)nRT. This equals internal energy for monatomic ideal gas."
        },
        {
            concept: "Law of Equipartition of Energy",
            uid: "KTG15",
            theory: "Each degree of freedom has average energy of ½kT per molecule.",
            formula: "U = \\frac{f}{2}nRT, \\quad \\langle \\epsilon \\rangle = \\frac{f}{2}kT",
            details: "f = degrees of freedom. Translational: 3. Rotational: 2 (linear), 3 (nonlinear). Vibrational: 2 per mode.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate internal energy", "Energy per DOF", "Contribution from modes"],
            commonMistakes: ["Wrong f count", "Forgetting vibration has KE + PE (2 dof)", "Using at wrong T"],
            tips: "Each dof: ½kT per molecule or ½RT per mole. Monoatomic: f=3, U=(3/2)nRT. Diatomic (room T): f=5, U=(5/2)nRT. Vibration freezes out below ~1000K."
        },
        {
            concept: "Internal Energy of Ideal Gas",
            uid: "KTG16",
            theory: "Sum of kinetic energies of all molecules (no potential for ideal gas).",
            formula: "U = nC_vT = \\frac{f}{2}nRT",
            details: "Depends only on T for ideal gas. No PE because no intermolecular forces.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate U from T", "Change in U", "Compare monoatomic and diatomic"],
            commonMistakes: ["Thinking U depends on P or V", "Using wrong Cv", "Forgetting state function property"],
            tips: "U = (f/2)nRT = nCvT. State function! ΔU depends only on initial and final T. For isothermal process: ΔU = 0. Monoatomic: U = (3/2)nRT."
        },

        // ============ MEAN FREE PATH AND COLLISIONS ============
        {
            concept: "Mean Free Path",
            uid: "KTG17",
            theory: "Average distance traveled between successive collisions.",
            formula: "\\lambda = \\frac{kT}{\\sqrt{2}\\pi d^2 P} = \\frac{1}{\\sqrt{2}\\pi d^2 n}",
            details: "d = molecular diameter. n = number density. λ decreases with P, increases with T.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate mean free path", "Effect of P and T", "Collision probability"],
            commonMistakes: ["Forgetting √2 factor", "Wrong d² dependence", "Confusing n with N"],
            tips: "λ = kT/(√2πd²P) = 1/(√2πd²n). At STP for air: λ ≈ 70 nm. λ ∝ T (higher T = more spread), λ ∝ 1/P (higher P = more crowded)."
        },
        {
            concept: "Collision Frequency",
            uid: "KTG18",
            theory: "Number of collisions per molecule per unit time.",
            formula: "f = \\frac{v_{mean}}{\\lambda} = \\sqrt{2}\\pi d^2 n v_{mean}",
            details: "Frequency of collisions for one molecule. Increases with P and T.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate collision frequency", "Time between collisions", "Effect of conditions"],
            commonMistakes: ["Using v_rms instead of v_mean", "Wrong relationship with λ", "Inverting formula"],
            tips: "f = v_avg/λ. Time between collisions = 1/f = λ/v_avg. At STP: f ~ 10⁹ collisions/second for typical gas molecule!"
        },
        {
            concept: "Number Density",
            uid: "KTG19",
            theory: "Number of molecules per unit volume.",
            formula: "n = \\frac{N}{V} = \\frac{P}{kT} = \\frac{N_A P}{RT}",
            details: "At STP: n ≈ 2.7×10²⁵ molecules/m³ (Loschmidt number).",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate molecular density", "Compare at different conditions", "Molecules in volume"],
            commonMistakes: ["Confusing with molar density", "Wrong units", "Using R instead of k"],
            tips: "n = N/V = P/(kT). At STP: n ≈ 2.69×10²⁵/m³. This is same for all ideal gases at same P and T (Avogadro's law)!"
        },

        // ============ REAL GASES ============
        {
            concept: "Van der Waals Equation",
            uid: "KTG20",
            theory: "Modified gas equation accounting for molecular size and attraction.",
            formula: "\\left(P + \\frac{a}{V^2}\\right)(V - b) = RT \\quad \\text{(for 1 mole)}",
            details: "a = molecular attraction correction. b = molecular volume correction.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Apply van der Waals equation", "Interpret a and b", "Compare with ideal"],
            commonMistakes: ["Wrong placement of a and b", "Using for multiple moles incorrectly", "Confusing corrections"],
            tips: "(P + a/V²)(V - b) = RT. a corrects P upward (attractive forces reduce P). b corrects V downward (molecules have volume). Large a = strong attraction."
        },
        {
            concept: "Compression Factor",
            uid: "KTG21",
            theory: "Ratio of actual molar volume to ideal molar volume.",
            formula: "Z = \\frac{PV}{nRT} = \\frac{V_{actual}}{V_{ideal}}",
            details: "Ideal gas: Z = 1. Z > 1: repulsion dominates. Z < 1: attraction dominates.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate Z", "Interpret deviation", "Compare gases"],
            commonMistakes: ["Thinking Z = 1 is exact for all gases", "Wrong interpretation of Z", "Not recognizing Z changes with P"],
            tips: "Z = PV/(nRT). At low P: Z < 1 (attractive). At high P: Z > 1 (repulsive). Z = 1 at Boyle temperature. H₂, He: Z > 1 at all P (weak attraction)."
        },
        {
            concept: "Critical Constants",
            uid: "KTG22",
            theory: "Temperature, pressure, volume at critical point.",
            formula: "T_c = \\frac{8a}{27Rb}, \\quad P_c = \\frac{a}{27b^2}, \\quad V_c = 3b",
            details: "Above Tc: no liquid-gas transition. Critical point is end of liquid-gas curve.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate critical constants", "Relate to van der Waals", "Supercritical fluid"],
            commonMistakes: ["Wrong numerical factors", "Confusing critical with triple point", "Not understanding significance"],
            tips: "From van der Waals: Tc = 8a/(27Rb), Pc = a/(27b²), Vc = 3b. At T > Tc, gas cannot be liquefied by pressure alone. CO₂: Tc = 31°C, Pc = 73 atm."
        },
        {
            concept: "Boyle Temperature",
            uid: "KTG23",
            theory: "Temperature at which gas behaves ideally over wide pressure range.",
            formula: "T_B = \\frac{a}{Rb} = \\frac{27T_c}{8}",
            details: "At TB: Z = 1 at moderate pressures. Different from critical temperature.",
            jeeImportance: "Low",
            type: "formula",
            questionTypes: ["Calculate Boyle temperature", "Relation to critical T", "When gas behaves ideal"],
            commonMistakes: ["Confusing with critical temperature", "Thinking Z = 1 at all P", "Wrong relation to a, b"],
            tips: "T_B = a/(Rb). At T = T_B: Z ≈ 1 over range of pressures. For real gases to behave ideally: high T (>> T_B) and low P."
        },

        // ============ APPLICATIONS ============
        {
            concept: "Effusion - Graham's Law",
            uid: "KTG24",
            theory: "Rate of gas escape through small hole inversely proportional to √M.",
            formula: "\\frac{r_1}{r_2} = \\sqrt{\\frac{M_2}{M_1}} = \\sqrt{\\frac{\\rho_2}{\\rho_1}}",
            details: "Lighter gases effuse faster. Used for isotope separation.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Compare effusion rates", "Identify unknown gas", "Separation of isotopes"],
            commonMistakes: ["Inverting the ratio", "Using for diffusion (similar but different)", "Wrong mass ratio"],
            tips: "r ∝ 1/√M. Lighter gas escapes faster. H₂ effuses 4× faster than O₂ (√32/2 = 4). Used for separating U-235 and U-238 (as UF₆)."
        },
        {
            concept: "Diffusion of Gases",
            uid: "KTG25",
            theory: "Mixing of gases due to random molecular motion.",
            formula: "r_{diffusion} \\propto \\frac{1}{\\sqrt{M}}, \\quad D \\propto \\lambda \\times v_{mean}",
            details: "Slower than effusion. Depends on mean free path.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Compare diffusion rates", "Effect of molecular mass", "Time for complete mixing"],
            commonMistakes: ["Confusing with effusion", "Forgetting collision effects", "Wrong rate comparison"],
            tips: "Diffusion involves molecular collisions. Still r ∝ 1/√M (Graham's law). Diffusion coefficient D ∝ λ × v ∝ T^(3/2)/P."
        },
        {
            concept: "Gas Thermometers",
            uid: "KTG26",
            theory: "Using gas law properties for temperature measurement.",
            formula: "T = T_{ref} \\times \\frac{P}{P_{ref}} \\quad \\text{(constant volume)}",
            details: "Constant volume gas thermometer most accurate. Uses P ∝ T.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Temperature from pressure ratio", "Absolute zero determination", "Accuracy of gas thermometer"],
            commonMistakes: ["Not using Kelvin", "Wrong ratio", "Forgetting reference state"],
            tips: "At constant V: P/T = constant. Measure P at unknown T, compare to known T (like triple point of water = 273.16 K). Very accurate for defining temperature scale."
        },
        {
            concept: "Speed of Sound in Gas",
            uid: "KTG27",
            theory: "Sound propagates through adiabatic compressions.",
            formula: "v = \\sqrt{\\frac{\\gamma RT}{M}} = \\sqrt{\\frac{\\gamma P}{\\rho}}",
            details: "γ = Cp/Cv. Sound is adiabatic (fast), not isothermal.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate speed of sound", "Effect of temperature", "Compare different gases"],
            commonMistakes: ["Using isothermal bulk modulus", "Wrong γ value", "Forgetting T must be Kelvin"],
            tips: "v = √(γRT/M) = √(γP/ρ). In air at 20°C: ~343 m/s. v ∝ √T, so v increases with temperature. Speed is independent of pressure (ρ changes with P)."
        },
        {
            concept: "Maxwell-Boltzmann Distribution",
            uid: "KTG28",
            theory: "Distribution of molecular speeds in gas.",
            formula: "f(v) = 4\\pi n \\left(\\frac{m}{2\\pi kT}\\right)^{3/2} v^2 e^{-mv^2/2kT}",
            details: "Bell-shaped curve. Peak at v_mp, extends to infinity. Higher T = broader, shifted right.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Interpret distribution", "Effect of temperature", "Fraction of molecules in range"],
            commonMistakes: ["Confusing peak speed with rms or mean", "Wrong temperature effect", "Not understanding area under curve"],
            tips: "Peak is at v_mp. Area under curve = N (total molecules). Higher T: peak shifts right (higher v), curve flattens (broader). Tail extends to v = ∞."
        },
        {
            concept: "Thermal Velocity",
            uid: "KTG29",
            theory: "Characteristic molecular speed scale.",
            formula: "v_{th} = \\sqrt{\\frac{kT}{m}} = \\sqrt{\\frac{RT}{M}}",
            details: "All molecular speeds scale with this. v_rms = √3 × v_th.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate thermal velocity", "Relate to other speeds", "Temperature dependence"],
            commonMistakes: ["Confusing with specific speed types", "Wrong mass usage", "Not recognizing scaling"],
            tips: "v_th = √(kT/m) sets the scale. v_mp = √2 × v_th, v_avg = √(8/π) × v_th, v_rms = √3 × v_th. All proportional to √T."
        }
    ]
};

export default kineticTheory;
