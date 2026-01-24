/**
 * JEE Semiconductor Electronics - Formulas & Concepts
 * Class 12 Physics - Chapter: Semiconductor Electronics
 * 
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 * Formulas use KaTeX notation
 */

export const semiconductors = {
    topic: "Semiconductor Electronics",
    concepts: [
        // ============ ENERGY BANDS ============
        {
            concept: "Energy Band Classification",
            theory: "Materials classified by energy gap size.",
            formula: "\\text{Conductor: } E_g = 0, \\quad \\text{Semiconductor: } E_g \\sim 1\\text{eV}, \\quad \\text{Insulator: } E_g > 3\\text{eV}",
            details: "Si: 1.1 eV, Ge: 0.67 eV, Diamond: 5.5 eV.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Classify materials by band gap", "Compare Si and Ge", "Temperature effects"],
            commonMistakes: ["Confusing valence and conduction bands", "Thinking all semiconductors have same Eg", "Temperature effect wrong"],
            tips: "Eg(Ge) = 0.67 eV < Eg(Si) = 1.1 eV < Eg(Diamond) = 5.5 eV. Lower Eg = more carriers at room temp. Ge more sensitive to temperature than Si."
        },
        {
            concept: "Intrinsic Semiconductor",
            theory: "Pure semiconductor with equal electrons and holes.",
            formula: "n_e = n_h = n_i",
            details: "ni = intrinsic carrier concentration. Increases with temperature.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Carrier concentration", "Conductivity calculation", "Temperature dependence"],
            commonMistakes: ["ne ≠ nh in intrinsic (wrong!)", "Forgetting temperature effect", "Confusing with extrinsic"],
            tips: "INTRINSIC: ne = nh = ni always. At 300K: ni(Si) ≈ 1.5×10¹⁰/cm³, ni(Ge) ≈ 2.4×10¹³/cm³. Ge has more carriers → more conductive."
        },
        {
            concept: "N-Type Semiconductor",
            theory: "Doped with pentavalent impurity (donors).",
            formula: "n_e >> n_h, \\quad n_e \\approx N_D",
            details: "Donors: P, As, Sb. Electrons = majority, holes = minority.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Majority/minority carriers", "Donor concentration", "Conductivity"],
            commonMistakes: ["Thinking n-type is negative (neutral!)", "Wrong donor atoms", "Confusing majority/minority"],
            tips: "N-type: add pentavalent (P, As, Sb). ne ≈ ND >> nh. Majority = electrons. Material is still NEUTRAL (not negatively charged). Fermi level near EC."
        },
        {
            concept: "P-Type Semiconductor",
            theory: "Doped with trivalent impurity (acceptors).",
            formula: "n_h >> n_e, \\quad n_h \\approx N_A",
            details: "Acceptors: B, Al, Ga, In. Holes = majority, electrons = minority.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Majority/minority carriers", "Acceptor concentration", "Conductivity"],
            commonMistakes: ["Thinking p-type is positive (neutral!)", "Wrong acceptor atoms", "Confusing with n-type"],
            tips: "P-type: add trivalent (B, Al, Ga, In). nh ≈ NA >> ne. Majority = holes. Material is NEUTRAL. Fermi level near EV."
        },
        {
            concept: "Mass Action Law",
            theory: "Product of carrier concentrations is constant.",
            formula: "n_e \\cdot n_h = n_i^2",
            details: "Valid for n-type and p-type. Adding donors reduces holes.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find minority carrier concentration", "Doping effects", "Equilibrium calculations"],
            commonMistakes: ["Using ne + nh = ni²", "Forgetting it applies to doped semiconductors", "Wrong ni value"],
            tips: "ne × nh = ni². If ne increases (n-type doping), nh decreases proportionally. For n-type: nh = ni²/ND. For p-type: ne = ni²/NA."
        },

        // ============ P-N JUNCTION ============
        {
            concept: "P-N Junction Formation",
            theory: "Diffusion creates depletion region at junction.",
            formula: "W \\propto \\sqrt{V_{bi}} \\propto \\sqrt{\\frac{1}{N}}",
            details: "Depletion region has no mobile carriers. Built-in potential opposes diffusion.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Depletion width factors", "Electric field direction", "Barrier formation"],
            commonMistakes: ["Current flows in equilibrium (wrong!)", "Field direction", "Confusing drift and diffusion"],
            tips: "Depletion region: no free carriers, only immobile ions. E-field points from n to p (opposes diffusion). Higher doping → narrower depletion width."
        },
        {
            concept: "Built-in Potential",
            theory: "Potential barrier at junction in equilibrium.",
            formula: "V_{bi} = \\frac{kT}{e}\\ln\\left(\\frac{N_A N_D}{n_i^2}\\right)",
            details: "~0.3V for Ge, ~0.7V for Si at room temperature.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate barrier potential", "Compare Si and Ge", "Temperature effect"],
            commonMistakes: ["Wrong Vbi values", "Confusing with applied voltage", "Direction of barrier"],
            tips: "Vbi (Si) ≈ 0.7V, Vbi (Ge) ≈ 0.3V. Higher doping → higher Vbi. This is contact potential, not from external source. In forward bias, applied V reduces barrier."
        },
        {
            concept: "Forward Bias",
            theory: "Positive to P, negative to N reduces barrier.",
            formula: "V_{applied} \\text{ opposes } V_{bi} \\Rightarrow \\text{current flows}",
            details: "Depletion width decreases. Majority carriers cross easily.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Current flow mechanism", "I-V characteristics", "Depletion width change"],
            commonMistakes: ["Current starts at V=0", "Depletion increases (wrong!)", "Wrong polarity"],
            tips: "Forward: +ve to P, -ve to N. Barrier reduces. Current starts after overcoming Vbi (0.7V Si, 0.3V Ge). Depletion narrows. Majority carriers flow."
        },
        {
            concept: "Reverse Bias",
            theory: "Positive to N, negative to P increases barrier.",
            formula: "V_{applied} \\text{ adds to } V_{bi} \\Rightarrow \\text{very small current}",
            details: "Depletion width increases. Only minority carriers (leakage) cross.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Reverse current", "Breakdown", "Depletion width"],
            commonMistakes: ["No current at all (there's small I₀)", "Depletion narrows (wrong!)", "Breakdown = damage (not always)"],
            tips: "Reverse: +ve to N, -ve to P. Barrier increases. Very small reverse saturation current I₀ (minority carriers). Depletion widens. Breakdown at high reverse V."
        },
        {
            concept: "Diode Equation",
            theory: "Current-voltage relationship.",
            formula: "I = I_0\\left(e^{eV/(\\eta kT)} - 1\\right)",
            details: "I₀ = reverse saturation current. At room temp: kT/e ≈ 26mV.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate diode current", "Forward vs reverse", "Temperature effect"],
            commonMistakes: ["Forgetting -1 term", "Wrong thermal voltage", "Applying in breakdown"],
            tips: "I = I₀(e^(V/VT) - 1) where VT = kT/e ≈ 26mV at 300K. Forward (V >> VT): I ≈ I₀e^(V/VT). Reverse (V << 0): I ≈ -I₀."
        },

        // ============ SPECIAL DIODES ============
        {
            concept: "Zener Diode",
            theory: "Operates in breakdown for voltage regulation.",
            formula: "V_Z = \\text{constant in breakdown}",
            details: "Heavily doped. Connected in reverse bias for regulation.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Voltage regulator circuit", "Zener current", "Load regulation"],
            commonMistakes: ["Connected in forward bias", "Breakdown = damage", "Wrong polarity"],
            tips: "Zener: reverse biased, operates in breakdown. VZ stays constant → voltage regulator. Series resistor limits current. IZ = (Vin - VZ)/RS."
        },
        {
            concept: "Photodiode",
            theory: "Light-sensitive diode, reverse biased.",
            formula: "I \\propto \\text{Light intensity}",
            details: "Photon creates electron-hole pair in depletion region.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Current vs intensity", "Operating mode", "Spectral response"],
            commonMistakes: ["Forward bias for detection", "Confusing with LED", "Dark current ignored"],
            tips: "Photodiode: REVERSE biased for detection. Light → e-h pairs → photocurrent. Fast response. Dark current = current without light. Used in optical communication."
        },
        {
            concept: "LED",
            theory: "Emits light when forward biased.",
            formula: "E_{photon} = hf \\approx E_g",
            details: "Color depends on band gap. GaAs: IR, GaP: red/green.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Color vs material", "Forward voltage", "Efficiency"],
            commonMistakes: ["Light emission in reverse", "Applying high voltage directly", "Color independent of Eg"],
            tips: "LED: FORWARD biased. Eg determines color: lower Eg = longer λ (IR), higher Eg = shorter λ (blue/UV). More efficient than incandescent. Need series resistor."
        },
        {
            concept: "Solar Cell",
            theory: "Converts light to electrical energy.",
            formula: "V_{oc} \\approx 0.5-0.6 \\text{ V for Si}",
            details: "No external bias needed. Generates current from photons.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Operating principle", "Efficiency factors", "I-V curve"],
            commonMistakes: ["Needs external bias", "Confusing with photodiode mode", "High efficiency assumption"],
            tips: "Solar cell: NO external bias. Light creates e-h pairs → current. Voc ≈ 0.5-0.6V. Efficiency ~15-25%. Connect in series for higher voltage, parallel for higher current."
        },

        // ============ RECTIFIERS ============
        {
            concept: "Half-Wave Rectifier",
            theory: "One diode, conducts for half cycle.",
            formula: "V_{dc} = \\frac{V_m}{\\pi} = 0.318 V_m",
            details: "Only positive half passed. Ripple factor = 1.21.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["DC output voltage", "Ripple factor", "PIV of diode"],
            commonMistakes: ["Using Vm/2 instead of Vm/π", "Wrong ripple factor", "Forgetting diode drop"],
            tips: "Half-wave: Vdc = Vm/π ≈ 0.318Vm. PIV = Vm. Ripple = 1.21 (high). Frequency of ripple = f. Inefficient - only half cycle used."
        },
        {
            concept: "Full-Wave Rectifier",
            theory: "Both halves used, double efficiency.",
            formula: "V_{dc} = \\frac{2V_m}{\\pi} = 0.636 V_m",
            details: "Center-tap: PIV = 2Vm. Bridge: PIV = Vm.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["DC output voltage", "Center-tap vs bridge", "Ripple frequency"],
            commonMistakes: ["Same Vdc as half-wave", "Wrong PIV values", "Ripple frequency = f (it's 2f!)"],
            tips: "Full-wave: Vdc = 2Vm/π ≈ 0.636Vm. Ripple = 0.48. Ripple frequency = 2f. Bridge: 4 diodes, PIV = Vm. Center-tap: 2 diodes, PIV = 2Vm."
        },

        // ============ TRANSISTORS ============
        {
            concept: "Transistor Current Relations",
            theory: "Three-terminal device: E, B, C.",
            formula: "I_E = I_B + I_C",
            details: "E heavily doped, B thin & lightly doped, C moderately doped.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Current relations", "Biasing conditions", "Active region"],
            commonMistakes: ["IE = IC (forgetting IB)", "Wrong biasing for amplification", "Confusing NPN and PNP"],
            tips: "IE = IB + IC (Kirchhoff). For amplifier: EB junction forward, CB junction reverse. IC ≈ αIE ≈ βIB. Small IB controls large IC."
        },
        {
            concept: "Current Gain",
            theory: "Ratio of collector to base current.",
            formula: "\\beta = \\frac{I_C}{I_B}, \\quad \\alpha = \\frac{I_C}{I_E}",
            details: "β typically 50-200. α = β/(β+1), always < 1.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate α and β", "Relation between them", "Amplification factor"],
            commonMistakes: ["α > 1 (impossible!)", "β = IC/IE (wrong!)", "Confusing α and β"],
            tips: "β = IC/IB (common emitter gain, 50-200). α = IC/IE (common base gain, 0.95-0.99). α = β/(1+β). β = α/(1-α). If β = 100, α = 0.99."
        },
        {
            concept: "α-β Relation",
            theory: "Converting between current gains.",
            formula: "\\beta = \\frac{\\alpha}{1-\\alpha}, \\quad \\alpha = \\frac{\\beta}{1+\\beta}",
            details: "If β = 100, then α = 0.99.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Convert α to β", "Find one from other", "Effect of small change"],
            commonMistakes: ["Wrong formula", "Algebraic errors", "Thinking α can equal 1"],
            tips: "β = α/(1-α). As α → 1, β → ∞. Small change in α causes large change in β. If α = 0.99, β = 99. If α = 0.98, β = 49. Very sensitive!"
        },
        {
            concept: "CE Amplifier Gain",
            theory: "Common emitter voltage amplification.",
            formula: "A_v = \\beta \\frac{R_C}{R_{in}}",
            details: "Phase inversion (180°). Most common configuration.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Voltage gain calculation", "Phase relationship", "Input/output impedance"],
            commonMistakes: ["Forgetting phase inversion", "Using wrong resistor ratio", "Ignoring input resistance"],
            tips: "CE: highest voltage gain, 180° phase shift. Av = βRC/Rin. High gain but moderate input impedance. Used as voltage amplifier."
        },
        {
            concept: "Transistor as Switch",
            theory: "Operating in cutoff and saturation.",
            formula: "\\text{Cutoff: } V_{BE} < 0.7\\text{V}, \\quad \\text{Saturation: } V_{CE} \\approx 0.2\\text{V}",
            details: "OFF: cutoff (IC = 0). ON: saturation (IC max).",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Switching operation", "Digital applications", "Cutoff/saturation conditions"],
            commonMistakes: ["Active region for switching", "VCE = 0 exactly in saturation", "Confusing with amplifier mode"],
            tips: "Switch: cutoff (OFF, IC ≈ 0) or saturation (ON, VCE ≈ 0.2V). NOT active region! Digital circuits use transistor as switch. Base current determines state."
        },

        // ============ LOGIC GATES ============
        {
            concept: "AND Gate",
            theory: "Output HIGH only when ALL inputs HIGH.",
            formula: "Y = A \\cdot B",
            details: "Truth: 0·0=0, 0·1=0, 1·0=0, 1·1=1.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Truth table", "Boolean expression", "Implementation"],
            commonMistakes: ["Confusing with OR", "Wrong truth table", "Symbol confusion"],
            tips: "AND: Y = A·B. Output 1 ONLY when ALL inputs are 1. Like series switches - all must be closed for current. Symbol: flat back, curved front."
        },
        {
            concept: "OR Gate",
            theory: "Output HIGH when ANY input is HIGH.",
            formula: "Y = A + B",
            details: "Truth: 0+0=0, 0+1=1, 1+0=1, 1+1=1.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Truth table", "Boolean expression", "Implementation"],
            commonMistakes: ["Confusing with AND", "1+1=2 (it's 1!)", "Symbol confusion"],
            tips: "OR: Y = A+B. Output 1 when ANY input is 1. Like parallel switches - any one closed gives current. Symbol: curved back, pointed front."
        },
        {
            concept: "NOT Gate (Inverter)",
            theory: "Output is complement of input.",
            formula: "Y = \\bar{A}",
            details: "Truth: 0→1, 1→0. Single input gate.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Inversion", "Bubble notation", "Implementation"],
            commonMistakes: ["Multiple inputs (only one!)", "Double inversion", "Bubble meaning"],
            tips: "NOT: Y = Ā. Flips the bit. 0→1, 1→0. Triangle with bubble at output. Bubble always means inversion."
        },
        {
            concept: "NAND Gate (Universal)",
            theory: "NOT + AND, can make any gate.",
            formula: "Y = \\overline{A \\cdot B}",
            details: "Output LOW only when all inputs HIGH. Universal gate.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Make other gates from NAND", "Truth table", "Universal gate property"],
            commonMistakes: ["Confusing with NOR", "Not recognizing universal property", "Wrong truth table"],
            tips: "NAND: Y = (A·B)'. Output 0 ONLY when all inputs 1. UNIVERSAL: can make AND, OR, NOT from NAND alone. NOT = NAND with inputs tied."
        },
        {
            concept: "NOR Gate (Universal)",
            theory: "NOT + OR, can make any gate.",
            formula: "Y = \\overline{A + B}",
            details: "Output HIGH only when all inputs LOW. Universal gate.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Make other gates from NOR", "Truth table", "Boolean simplification"],
            commonMistakes: ["Confusing with NAND", "Wrong output for all-0 input", "Forgetting universal"],
            tips: "NOR: Y = (A+B)'. Output 1 ONLY when all inputs 0. UNIVERSAL: can make AND, OR, NOT from NOR alone. NOT = NOR with inputs tied."
        },
        {
            concept: "De Morgan's Theorems",
            theory: "Fundamental Boolean algebra laws.",
            formula: "\\overline{A \\cdot B} = \\bar{A} + \\bar{B}, \\quad \\overline{A + B} = \\bar{A} \\cdot \\bar{B}",
            details: "NAND = OR with inverted inputs. NOR = AND with inverted inputs.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Simplify expressions", "Convert between gates", "Prove equivalence"],
            commonMistakes: ["Breaking bar incorrectly", "Not changing operation", "Applying partially"],
            tips: "(A·B)' = A' + B' and (A+B)' = A'·B'. Break the bar, change the sign! NAND with inverted inputs = OR. NOR with inverted inputs = AND."
        }
    ]
};

export default semiconductors;
