/**
 * JEE Atoms and Nuclei - Formulas & Concepts
 * Class 12 Physics - Chapters: Atoms and Nuclei
 * 
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 * Formulas use KaTeX notation
 */

export const atomsNuclei = {
    topic: "Atoms & Nuclei",
    concepts: [
        // ============ ATOMIC MODELS ============
        {
            concept: "Rutherford's Scattering",
            theory: "Atom has small dense positive nucleus.",
            formula: "r_0 = \\frac{2kZe^2}{K} = \\frac{kZe \\cdot 2e}{\\frac{1}{2}mv^2}",
            details: "Distance of closest approach. Most α-particles pass through undeflected.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Distance of closest approach", "Scattering angle", "Alpha particle KE"],
            commonMistakes: ["Wrong charge (2e for alpha)", "KE formula errors", "Forgetting factor of 2"],
            tips: "At closest approach: all KE → PE. r₀ = 2kZe²/K = kZe(2e)/(½mv²). For gold (Z=79), r₀ ~ 10⁻¹⁴ m. Proves nucleus is tiny!"
        },
        {
            concept: "Impact Parameter",
            theory: "Perpendicular distance from nucleus to initial velocity line.",
            formula: "b = \\frac{kZe^2}{K}\\cot\\frac{\\theta}{2}",
            details: "θ = scattering angle. b = 0 → head-on → θ = 180°.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Scattering at angle θ", "Head-on collision", "Relation with scattering angle"],
            commonMistakes: ["cot vs tan confusion", "Using θ instead of θ/2", "Wrong K value"],
            tips: "b = 0: head-on collision, θ = 180° (back-scattering). Large b: small θ (barely deflected). b ∝ cot(θ/2)."
        },

        // ============ BOHR MODEL ============
        {
            concept: "Bohr's Quantization",
            theory: "Angular momentum is quantized.",
            formula: "mvr = n\\frac{h}{2\\pi} = n\\hbar",
            details: "n = 1, 2, 3... Only specific orbits allowed.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Angular momentum in orbit", "Quantum number problems", "Allowed orbits"],
            commonMistakes: ["Forgetting 2π", "Using n = 0", "Confusing L with other quantities"],
            tips: "L = nh/(2π) = nℏ. Ground state n=1, L = ℏ. Excited states: n = 2,3,4... L increases with n. This is Bohr's key postulate!"
        },
        {
            concept: "Bohr Radius",
            theory: "Radius of nth orbit in hydrogen-like atom.",
            formula: "r_n = \\frac{n^2 a_0}{Z} = \\frac{n^2 \\times 0.529}{Z} \\text{ Å}",
            details: "a₀ = 0.529 Å = first Bohr radius. r ∝ n², r ∝ 1/Z.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Radius of nth orbit", "Compare H vs He+", "Radius ratio"],
            commonMistakes: ["Forgetting Z dependence", "Using n instead of n²", "Wrong a₀ value"],
            tips: "r_n = n²a₀/Z. For H (Z=1): r₁ = 0.529 Å. For He⁺ (Z=2): r₁ = 0.529/2 = 0.265 Å. r₂/r₁ = 4 (for same atom)."
        },
        {
            concept: "Bohr Velocity",
            theory: "Velocity of electron in nth orbit.",
            formula: "v_n = \\frac{Z v_0}{n} = \\frac{Z \\times 2.19 \\times 10^6}{n} \\text{ m/s}",
            details: "v₀ ≈ c/137 ≈ 2.19×10⁶ m/s. v ∝ Z, v ∝ 1/n.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Velocity in orbit", "Compare orbits", "Maximum velocity"],
            commonMistakes: ["v ∝ n (wrong! it's 1/n)", "Forgetting Z factor", "Using non-relativistic for high Z"],
            tips: "v_n = Zv₀/n. Fastest in ground state (n=1). Higher Z → faster (more attraction). v₁ for H is about c/137."
        },
        {
            concept: "Bohr Energy",
            theory: "Total energy of electron in nth orbit.",
            formula: "E_n = -\\frac{13.6 Z^2}{n^2} \\text{ eV}",
            details: "Negative = bound. E ∝ Z², E ∝ 1/n². Ground state most negative.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Energy in nth level", "Ionization energy", "Transition energy"],
            commonMistakes: ["Forgetting negative sign", "Z² vs Z", "Using n instead of n²"],
            tips: "E_n = -13.6Z²/n² eV. Ground state (n=1): E = -13.6Z² eV. For H: E₁ = -13.6 eV, E₂ = -3.4 eV, E∞ = 0."
        },
        {
            concept: "Kinetic and Potential Energy",
            theory: "KE and PE of electron in Bohr orbit.",
            formula: "K = -E = \\frac{13.6Z^2}{n^2} \\text{ eV}, \\quad U = 2E",
            details: "K = -E (positive). U = 2E (negative). Total E = K + U = -K.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["KE in orbit", "PE in orbit", "Energy relationships"],
            commonMistakes: ["Signs of K and U", "Relation E = K + U", "Factor of 2 for PE"],
            tips: "K = -E = |E| (positive). U = 2E (negative). |U| = 2K. Total E = K + U = -K. If |E| given, K = |E|, U = -2|E|."
        },

        // ============ HYDROGEN SPECTRUM ============
        {
            concept: "Hydrogen Spectral Lines",
            theory: "Wavelengths of emitted photons.",
            formula: "\\frac{1}{\\lambda} = RZ^2\\left(\\frac{1}{n_f^2} - \\frac{1}{n_i^2}\\right)",
            details: "R = 1.097×10⁷ m⁻¹. nᵢ > n_f for emission.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Wavelength of transition", "Series identification", "Energy of photon"],
            commonMistakes: ["Wrong order of n values", "Forgetting Z² for ions", "Using 1/n instead of 1/n²"],
            tips: "1/λ = RZ²(1/n_f² - 1/n_i²). For emission: n_i > n_f. For absorption: n_f > n_i. R = 1.097×10⁷ m⁻¹ ≈ 1.1×10⁷ m⁻¹."
        },
        {
            concept: "Spectral Series",
            theory: "Different series based on final level.",
            formula: "\\text{Lyman: } n_f=1, \\quad \\text{Balmer: } n_f=2, \\quad \\text{Paschen: } n_f=3",
            details: "Lyman: UV. Balmer: visible. Paschen, Brackett, Pfund: IR.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Identify series", "Wavelength range", "First line of series"],
            commonMistakes: ["Confusing series names", "Wrong n_f values", "Visible range attribution"],
            tips: "Lyman (to n=1): UV. Balmer (to n=2): VISIBLE (Hα red 656nm). Paschen (n=3), Brackett (n=4), Pfund (n=5): all IR."
        },
        {
            concept: "Number of Spectral Lines",
            theory: "Lines from atom excited to level n.",
            formula: "N = \\frac{n(n-1)}{2}",
            details: "Total possible transitions. Each pair of levels gives one line.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Max lines from level n", "Lines in a series", "Transitions possible"],
            commonMistakes: ["Using n² instead of n(n-1)/2", "Counting wrong transitions", "Including same-level"],
            tips: "N = n(n-1)/2 from level n. From n=4: N = 4×3/2 = 6 lines. Can also count: C(n,2) = n!/(2!(n-2)!)."
        },
        {
            concept: "Ionization Energy",
            theory: "Energy to remove electron completely.",
            formula: "E_{ion} = 13.6Z^2 \\text{ eV}",
            details: "For H: 13.6 eV. For He⁺: 54.4 eV. From ground state.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Ionization energy", "Compare different atoms", "From excited state"],
            commonMistakes: ["Forgetting Z² factor", "From excited vs ground state", "Unit conversion"],
            tips: "I.E. = |E₁| = 13.6Z² eV (from ground state). From nth level: I.E. = 13.6Z²/n² eV. He⁺ has 4× H ionization energy."
        },
        {
            concept: "Excitation Energy",
            theory: "Energy to raise electron to higher state.",
            formula: "E_{exc} = E_n - E_1 = 13.6Z^2\\left(1 - \\frac{1}{n^2}\\right)",
            details: "First excitation (1→2): 10.2 eV for H.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["First excitation energy", "Excitation to level n", "Excitation potential"],
            commonMistakes: ["Confusing with ionization", "Wrong sign in formula", "Forgetting ground state reference"],
            tips: "First excitation (1→2): 13.6(1-1/4) = 10.2 eV. Second excitation (1→3): 13.6(1-1/9) = 12.1 eV. Excitation potential = excitation energy/e."
        },

        // ============ NUCLEAR PROPERTIES ============
        {
            concept: "Nuclear Radius",
            theory: "Size of nucleus varies with mass number.",
            formula: "R = R_0 A^{1/3}",
            details: "R₀ ≈ 1.2 fm = 1.2×10⁻¹⁵ m. Volume ∝ A.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Radius of nucleus", "Radius ratio", "Size comparison"],
            commonMistakes: ["Using Z instead of A", "Wrong exponent (1/3)", "Forgetting R₀ units"],
            tips: "R = R₀A^(1/3) where R₀ ≈ 1.2 fm. Volume = (4/3)πR³ ∝ A. So Volume ∝ mass number! Nuclear density is constant."
        },
        {
            concept: "Nuclear Density",
            theory: "Density is approximately same for all nuclei.",
            formula: "\\rho \\approx 2.3 \\times 10^{17} \\text{ kg/m}^3",
            details: "Constant density. About 10¹⁴ times water density!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate nuclear density", "Compare with normal matter", "Why constant?"],
            commonMistakes: ["Density varies with A (wrong!)", "Wrong order of magnitude", "Using atomic mass"],
            tips: "ρ = 3m_p/(4πR₀³) ≈ 2.3×10¹⁷ kg/m³. Same for ALL nuclei (A cancels)! 1 cm³ of nuclear matter ≈ 230 million tons!"
        },
        {
            concept: "Mass Defect",
            theory: "Difference between constituent and actual nuclear mass.",
            formula: "\\Delta m = [Zm_p + (A-Z)m_n] - M_{nucleus}",
            details: "Mass is 'missing' - converted to binding energy.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate mass defect", "Binding energy from Δm", "Stability analysis"],
            commonMistakes: ["Using atomic vs nuclear mass", "Wrong number of neutrons", "Forgetting electron masses"],
            tips: "Δm = (Zm_p + Nm_n) - M_nucleus > 0 always. This mass becomes binding energy via E = Δmc². 1 u = 931.5 MeV/c²."
        },
        {
            concept: "Binding Energy",
            theory: "Energy required to split nucleus into nucleons.",
            formula: "B.E. = \\Delta m \\cdot c^2",
            details: "1 u = 931.5 MeV. Higher BE = more stable.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate BE", "BE/A curve", "Energy in fission/fusion"],
            commonMistakes: ["Negative BE (wrong!)", "Wrong conversion factor", "Confusing with Q value"],
            tips: "BE = Δm × 931.5 MeV (if Δm in u). BE/A curve: max at Fe-56 (~8.8 MeV/nucleon). Both fusion and fission release energy (move toward Fe)."
        },
        {
            concept: "Binding Energy Per Nucleon",
            theory: "Average BE per particle - measure of stability.",
            formula: "\\frac{B.E.}{A} = \\text{stability measure}",
            details: "Maximum at Fe-56 (~8.8 MeV). Light nuclei: fusion. Heavy: fission.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Compare stability", "Energy release calculation", "Fusion vs fission"],
            commonMistakes: ["Max at wrong element", "Wrong interpretation of curve", "Confusing total BE with BE/A"],
            tips: "BE/A max at Fe-56 (most stable). Light nuclei (H, He): fusion increases BE/A. Heavy nuclei (U): fission increases BE/A. Both release energy!"
        },

        // ============ RADIOACTIVITY ============
        {
            concept: "Radioactive Decay Law",
            theory: "Exponential decay of radioactive nuclei.",
            formula: "N = N_0 e^{-\\lambda t}",
            details: "λ = decay constant (s⁻¹). Random, spontaneous process.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Nuclei remaining", "Activity calculation", "Time for given decay"],
            commonMistakes: ["Wrong sign in exponent", "Confusing λ and τ", "Using wrong time formula"],
            tips: "N = N₀e^(-λt). Activity A = λN = A₀e^(-λt). Same exponential decay for N and A. λ is probability of decay per unit time."
        },
        {
            concept: "Half-Life",
            theory: "Time for half the nuclei to decay.",
            formula: "T_{1/2} = \\frac{\\ln 2}{\\lambda} = \\frac{0.693}{\\lambda}",
            details: "After n half-lives: N = N₀/2ⁿ. Independent of N₀.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate half-life", "Nuclei after n half-lives", "Time for 75% decay"],
            commonMistakes: ["ln2 vs log₁₀2", "N after non-integer half-lives", "Confusing with mean life"],
            tips: "T₁/₂ = 0.693/λ. After nT₁/₂: N = N₀/2ⁿ. After 1T: 50% left. After 2T: 25%. After 3T: 12.5%. Quick mental calculation!"
        },
        {
            concept: "Mean Life",
            theory: "Average lifetime of radioactive nucleus.",
            formula: "\\tau = \\frac{1}{\\lambda} = 1.44 \\times T_{1/2}",
            details: "At t = τ: N = N₀/e ≈ 0.37N₀.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate mean life", "Relation with half-life", "Average lifetime"],
            commonMistakes: ["τ = T₁/₂ (wrong!)", "Factor 1.44 forgotten", "Confusing 1/e with 1/2"],
            tips: "τ = 1/λ = T₁/₂/0.693 ≈ 1.44 T₁/₂. At t = τ: N = N₀/e ≈ 0.37N₀. Mean life > half-life (by factor 1.44)."
        },
        {
            concept: "Activity",
            theory: "Number of decays per second.",
            formula: "A = \\lambda N = \\frac{dN}{dt}",
            details: "Unit: Becquerel (1 Bq = 1 decay/s). Curie = 3.7×10¹⁰ Bq.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Initial activity", "Activity after time t", "Half-life from activity"],
            commonMistakes: ["Unit confusion (Bq vs Ci)", "Forgetting A also decays", "Wrong λN formula"],
            tips: "A = λN. A₀ = λN₀. A = A₀e^(-λt). 1 Ci = 3.7×10¹⁰ Bq (activity of 1g Ra-226). Activity and N decay with same half-life."
        },
        {
            concept: "Alpha Decay",
            theory: "Emission of helium nucleus.",
            formula: "^A_Z X \\rightarrow ^{A-4}_{Z-2}Y + ^4_2He",
            details: "A decreases by 4, Z by 2. Heavy nuclei undergo α decay.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Write decay equation", "Daughter nucleus", "Energy released"],
            commonMistakes: ["Wrong ΔA or ΔZ", "Mass-energy conservation", "Recoil of daughter"],
            tips: "α decay: A → A-4, Z → Z-2. α particle = ⁴₂He. Common in heavy nuclei (Z > 82). Most energy goes to α (lighter), less to daughter nucleus."
        },
        {
            concept: "Beta Decay",
            theory: "Neutron converts to proton (β⁻) or vice versa (β⁺).",
            formula: "\\beta^-: ^A_Z X \\rightarrow ^A_{Z+1}Y + e^- + \\bar{\\nu}",
            details: "A unchanged. β⁻: Z+1. β⁺: Z-1. Neutrino carries variable energy.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Write β decay equation", "Continuous energy spectrum", "Neutrino role"],
            commonMistakes: ["A changes (wrong!)", "Forgetting neutrino/antineutrino", "Wrong Z change direction"],
            tips: "β⁻: n→p+e⁻+ν̄, Z increases. β⁺: p→n+e⁺+ν, Z decreases. A unchanged! Continuous electron energy spectrum due to neutrino sharing energy."
        },
        {
            concept: "Gamma Decay",
            theory: "Emission of high-energy photon.",
            formula: "^A_Z X^* \\rightarrow ^A_Z X + \\gamma",
            details: "No change in A or Z. Nuclear de-excitation.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Write γ decay", "Energy of γ ray", "Following α or β decay"],
            commonMistakes: ["A or Z changes (wrong!)", "Confusing with X-ray", "Not recognizing excited state"],
            tips: "γ decay: A and Z unchanged. Only energy change (excited → ground state). Often follows α or β decay. γ rays are most penetrating radiation."
        },

        // ============ NUCLEAR REACTIONS ============
        {
            concept: "Q-Value",
            theory: "Energy released or absorbed in nuclear reaction.",
            formula: "Q = (m_{reactants} - m_{products})c^2",
            details: "Q > 0: exothermic. Q < 0: endothermic.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate Q value", "Exothermic vs endothermic", "Threshold energy"],
            commonMistakes: ["Wrong mass difference direction", "Unit conversion", "Forgetting KE threshold for Q < 0"],
            tips: "Q = (Σm_reactants - Σm_products)c². Use masses in u, multiply by 931.5 for MeV. Q > 0: energy released. For Q < 0: need threshold KE."
        },
        {
            concept: "Nuclear Fission",
            theory: "Heavy nucleus splits into lighter nuclei.",
            formula: "^{235}U + n \\rightarrow ^{141}Ba + ^{92}Kr + 3n + 200 \\text{ MeV}",
            details: "Chain reaction possible. Nuclear reactors use controlled fission.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Energy per fission", "Chain reaction", "Critical mass"],
            commonMistakes: ["Products vary", "Forgetting neutron multiplication", "Energy calculation errors"],
            tips: "U-235 fission releases ~200 MeV. Products vary, but always 2-3 neutrons released. Chain reaction: if >1 neutron causes new fission. Critical mass for sustained reaction."
        },
        {
            concept: "Nuclear Fusion",
            theory: "Light nuclei combine to form heavier nucleus.",
            formula: "4^1H \\rightarrow ^4He + 2e^+ + 2\\nu + 26.7 \\text{ MeV}",
            details: "Powers the Sun. Requires very high temperature (~10⁷ K).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Energy in fusion", "Stellar energy source", "Conditions for fusion"],
            commonMistakes: ["Easy at room temperature (wrong!)", "Wrong products", "Energy per reaction vs per nucleon"],
            tips: "4H → He releases ~26.7 MeV (6.7 MeV per nucleon - more than fission!). Needs T ~ 10⁷ K to overcome Coulomb repulsion. Powers all stars."
        },
        {
            concept: "Mass-Energy Equivalence",
            theory: "Mass can be converted to energy.",
            formula: "E = mc^2, \\quad 1 \\text{ u} = 931.5 \\text{ MeV}",
            details: "u = 1.66×10⁻²⁷ kg. Foundation of nuclear energy.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Convert mass to energy", "Energy from mass defect", "Unit conversions"],
            commonMistakes: ["Wrong conversion factor", "c² forgotten", "Mixing u and kg"],
            tips: "1 u = 931.5 MeV/c². 1 kg = 9×10¹⁶ J. Even tiny mass gives huge energy (c² ≈ 9×10¹⁶). This is why nuclear energy is so powerful!"
        }
    ]
};

export default atomsNuclei;
