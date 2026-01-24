/**
 * JEE Electromagnetic Waves - Formulas & Concepts
 * Class 12 Physics - Chapter: Electromagnetic Waves
 * 
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 * Formulas use KaTeX notation
 */

export const electromagneticWaves = {
    topic: "Electromagnetic Waves",
    concepts: [
        // ============ DISPLACEMENT CURRENT ============
        {
            concept: "Displacement Current",
            theory: "Maxwell's correction to Ampere's law.",
            formula: "I_d = \\varepsilon_0 \\frac{d\\Phi_E}{dt} = \\varepsilon_0 A \\frac{dE}{dt}",
            details: "Between capacitor plates: Id = Ic (conduction current).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate displacement current", "Continuity of current", "Capacitor charging"],
            commonMistakes: ["Thinking current is zero between plates", "Wrong formula", "Confusing with conduction current"],
            tips: "Id = ε₀(dΦE/dt). Bridges the gap in Ampere's law for capacitors. Between plates: Id = Ic (current is continuous). No actual charge flows - it's changing E-field."
        },
        {
            concept: "Ampere-Maxwell Law",
            theory: "Magnetic field from currents and changing E-field.",
            formula: "\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0(I_c + I_d) = \\mu_0 I_c + \\mu_0\\varepsilon_0\\frac{d\\Phi_E}{dt}",
            details: "Changing E-field creates B-field. Key to EM wave generation.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Complete Ampere's law", "Displacement current contribution", "Symmetry with Faraday"],
            commonMistakes: ["Forgetting displacement current term", "Using only Ic", "Wrong constant (μ₀ε₀)"],
            tips: "Complete law: ∮B·dl = μ₀(Ic + Id). Displacement current term: μ₀ε₀(dΦE/dt). This + Faraday's law → EM waves are possible!"
        },

        // ============ MAXWELL'S EQUATIONS ============
        {
            concept: "Maxwell's Equations Summary",
            theory: "Four equations describing all EM phenomena.",
            formula: "\\text{Gauss (E), Gauss (B), Faraday, Ampere-Maxwell}",
            details: "Together predict EM waves traveling at c = 1/√(μ₀ε₀).",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Identify equations", "Physical meaning", "Symmetry"],
            commonMistakes: ["Missing displacement current", "Wrong integral form", "Not connecting to EM waves"],
            tips: "4 equations: (1) ∮E·dA = q/ε₀, (2) ∮B·dA = 0, (3) ∮E·dl = -dΦB/dt, (4) ∮B·dl = μ₀I + μ₀ε₀dΦE/dt. Predict c = 1/√(μ₀ε₀)!"
        },
        {
            concept: "Gauss's Law (Magnetic)",
            theory: "Net magnetic flux through closed surface is zero.",
            formula: "\\oint \\vec{B} \\cdot d\\vec{A} = 0",
            details: "No magnetic monopoles. B-field lines are always closed.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Monopole non-existence", "Flux through surface", "Compare with electric"],
            commonMistakes: ["Non-zero flux expected", "Confusing with electric Gauss", "Monopole assumption"],
            tips: "Net Φ_B = 0 for ANY closed surface. Unlike electric charges, no magnetic 'charges' (monopoles). Every field line that enters a surface also exits it."
        },

        // ============ EM WAVE PROPERTIES ============
        {
            concept: "Speed of EM Waves",
            theory: "All EM waves travel at speed of light in vacuum.",
            formula: "c = \\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}} = 3 \\times 10^8 \\text{ m/s}",
            details: "In medium: v = c/n. This proved light is EM wave.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate c from constants", "Speed in medium", "Wavelength-frequency"],
            commonMistakes: ["Wrong constants", "Forgetting √", "Speed varies with frequency (no!)"],
            tips: "c = 1/√(μ₀ε₀) = 3×10⁸ m/s. All EM waves same speed in vacuum (no dispersion). In medium: v = c/n = c/√(μrεr). Frequency stays same, λ changes."
        },
        {
            concept: "Transverse Nature",
            theory: "E and B perpendicular to each other and to propagation.",
            formula: "\\vec{E} \\perp \\vec{B} \\perp \\vec{k}",
            details: "E × B gives direction of propagation. Both oscillate in phase.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Direction relationships", "Polarization", "Identify propagation direction"],
            commonMistakes: ["E and B parallel", "E × B wrong direction", "Phase difference (they're in phase!)"],
            tips: "E ⊥ B ⊥ k (propagation). E × B gives k direction (right-hand rule). E and B in phase (max/min together). Only transverse waves can be polarized."
        },
        {
            concept: "E-B Relation",
            theory: "Amplitude relationship between E and B.",
            formula: "\\frac{E_0}{B_0} = c, \\quad \\frac{E}{B} = c",
            details: "At any instant: E = cB. Both always in phase.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate B from E", "Ratio in medium", "Instantaneous values"],
            commonMistakes: ["E/B = 1", "Different phases", "Ratio depends on frequency"],
            tips: "E = cB always (instantaneous). E₀ = cB₀ (amplitudes). Since c is large, E >> B numerically. In medium: E/B = v = c/n."
        },
        {
            concept: "EM Wave Equation",
            theory: "Mathematical description of traveling EM wave.",
            formula: "E_y = E_0 \\sin(kx - \\omega t), \\quad B_z = B_0 \\sin(kx - \\omega t)",
            details: "Wave traveling +x: E in y, B in z. k = 2π/λ, ω = 2πf.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Write wave equation", "Find k and ω", "Direction of E, B, k"],
            commonMistakes: ["E and B same direction", "Wrong phase relationship", "k and ω confusion"],
            tips: "For wave in +x: if E is in y, then B must be in z (E × B = x direction). k = 2π/λ, ω = 2πf. v = ω/k = fλ = c. Same (kx - ωt) for both E and B."
        },

        // ============ ENERGY IN EM WAVES ============
        {
            concept: "Energy Density",
            theory: "Energy per unit volume in EM wave.",
            formula: "u = \\frac{1}{2}\\varepsilon_0 E^2 + \\frac{B^2}{2\\mu_0} = \\varepsilon_0 E^2 = \\frac{B^2}{\\mu_0}",
            details: "Electric and magnetic contributions equal. u_E = u_B.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate energy density", "Compare E and B contributions", "Average value"],
            commonMistakes: ["u_E ≠ u_B (they're equal!)", "Wrong formula", "Forgetting average factor"],
            tips: "u = u_E + u_B = ε₀E² (since u_E = u_B). Energy equally divided! Average: ū = ½ε₀E₀² = (1/2)(B₀²/μ₀). Uses rms² = E₀²/2."
        },
        {
            concept: "Intensity",
            theory: "Average power per unit area.",
            formula: "I = \\frac{1}{2}c\\varepsilon_0 E_0^2 = \\frac{cB_0^2}{2\\mu_0}",
            details: "Unit: W/m². I = ū × c = energy density × wave speed.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate intensity", "Intensity from E₀ or B₀", "Power calculation"],
            commonMistakes: ["Missing ½ factor", "Using E instead of E₀", "Wrong constant"],
            tips: "I = ½cε₀E₀² = cB₀²/(2μ₀) = E₀B₀/(2μ₀). I = ūc (energy density × speed). For sphere: I = P/(4πr²). I ∝ E₀²."
        },
        {
            concept: "Poynting Vector",
            theory: "Direction and rate of energy flow.",
            formula: "\\vec{S} = \\frac{1}{\\mu_0}(\\vec{E} \\times \\vec{B})",
            details: "S points in direction of wave propagation. |S| = intensity.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate Poynting vector", "Direction of energy flow", "Average value"],
            commonMistakes: ["S in wrong direction", "Forgetting μ₀", "Using dot instead of cross"],
            tips: "S = (E × B)/μ₀. Direction of S = direction of wave propagation. |S| = EB/μ₀. Average: <S> = E₀B₀/(2μ₀) = Intensity."
        },

        // ============ MOMENTUM AND PRESSURE ============
        {
            concept: "Momentum of EM Wave",
            theory: "EM waves carry momentum without mass.",
            formula: "p = \\frac{U}{c} = \\frac{E_{photon}}{c}",
            details: "Momentum density = S/c². Used in radiation pressure.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate photon momentum", "Momentum transfer", "Solar sail"],
            commonMistakes: ["p = mv for photon (wrong!)", "No momentum (there is!)", "Wrong relation with energy"],
            tips: "p = E/c = U/c for EM radiation. Per photon: p = hf/c = h/λ. Even though m = 0, photons have momentum! Basis for radiation pressure."
        },
        {
            concept: "Radiation Pressure",
            theory: "Pressure exerted by EM waves on surface.",
            formula: "P_{absorb} = \\frac{I}{c}, \\quad P_{reflect} = \\frac{2I}{c}",
            details: "Reflection gives double pressure (momentum reverses).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Pressure on surface", "Force on area", "Solar sail force"],
            commonMistakes: ["Same for absorption and reflection", "Wrong factor of 2", "Confusing P with I"],
            tips: "Absorbed: P = I/c (momentum transferred). Reflected: P = 2I/c (momentum reversed). Force F = PA. Solar sail uses reflection for 2× thrust."
        },

        // ============ EM SPECTRUM ============
        {
            concept: "EM Spectrum Order",
            theory: "Order by frequency and wavelength.",
            formula: "\\text{Radio} < \\text{Micro} < \\text{IR} < \\text{Visible} < \\text{UV} < \\text{X-ray} < \\gamma",
            details: "Increasing frequency = decreasing λ = increasing energy.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Order by wavelength", "Order by energy", "Identify region"],
            commonMistakes: ["Wrong order", "Visible boundaries", "Energy ordering"],
            tips: "RMIVUXG: Radio, Microwave, IR, Visible, UV, X-ray, Gamma. λ decreases, f increases, E increases. Visible: 400nm (violet) to 700nm (red)."
        },
        {
            concept: "Visible Light",
            theory: "EM waves detected by human eye.",
            formula: "\\lambda: 400 \\text{ nm (violet) to } 700 \\text{ nm (red)}",
            details: "VIBGYOR: Violet, Indigo, Blue, Green, Yellow, Orange, Red.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Color wavelength", "Frequency of color", "Eye sensitivity"],
            commonMistakes: ["Wavelength range", "Color order", "Maximum sensitivity (green-yellow)"],
            tips: "Violet ≈ 400nm (short λ, high f, high E). Red ≈ 700nm (long λ, low f, low E). Eye most sensitive to green-yellow (~550nm). Only part of EM spectrum we see!"
        },
        {
            concept: "Radio Waves",
            theory: "Longest wavelength EM waves.",
            formula: "\\lambda > 1 \\text{ mm}, \\quad f < 300 \\text{ GHz}",
            details: "AM, FM, TV broadcasting. Produced by oscillating charges.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Applications", "Production method", "Wavelength range"],
            commonMistakes: ["All same frequency", "No practical use", "Confused with sound waves"],
            tips: "Radio: produced by oscillating electrons in antenna. AM (kHz), FM (MHz), TV (VHF/UHF). Longest λ, lowest f, lowest energy. Can penetrate ionosphere (some)."
        },
        {
            concept: "Infrared Radiation",
            theory: "Heat radiation, below visible.",
            formula: "\\lambda: 700 \\text{ nm to } 1 \\text{ mm}",
            details: "All warm objects emit IR. Night vision, remote controls.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Sources of IR", "Applications", "Detection"],
            commonMistakes: ["Only hot objects emit", "Same as radio", "Visible to eye"],
            tips: "IR: emitted by all objects > 0K (more at higher T). Near IR: just below red. Thermal imaging, night vision, remote control. Absorbed by CO₂, H₂O → greenhouse effect."
        },
        {
            concept: "X-rays",
            theory: "High-energy, penetrating radiation.",
            formula: "\\lambda: 0.01 \\text{ nm to } 10 \\text{ nm}",
            details: "Medical imaging, crystallography. Produced by electron deceleration.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Production method", "Medical use", "Diffraction"],
            commonMistakes: ["Same as gamma (different source)", "Harmless", "Visible"],
            tips: "X-rays: produced when fast electrons hit metal target (bremsstrahlung) or inner shell transitions. Can ionize, harmful. λ ~ atomic spacing → crystal diffraction (Bragg)."
        },
        {
            concept: "Gamma Rays",
            theory: "Highest energy EM radiation.",
            formula: "\\lambda < 0.01 \\text{ nm}, \\quad E > 100 \\text{ keV}",
            details: "Nuclear origin. Most penetrating and dangerous.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Source of gamma rays", "Penetrating power", "Medical use"],
            commonMistakes: ["Same origin as X-rays", "Safe radiation", "Long wavelength"],
            tips: "Gamma: from nuclear transitions and radioactive decay. Shortest λ, highest f, highest E. Most penetrating (need lead/concrete shielding). Used in cancer treatment, sterilization."
        },

        // ============ SPEED IN MEDIUM ============
        {
            concept: "Speed in Medium",
            theory: "EM waves slow down in materials.",
            formula: "v = \\frac{c}{n} = \\frac{c}{\\sqrt{\\mu_r\\varepsilon_r}}",
            details: "n = refractive index. For non-magnetic: n ≈ √εr.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Speed in medium", "Refractive index", "Wavelength change"],
            commonMistakes: ["Speed same as vacuum", "Frequency changes (no!)", "Wrong n formula"],
            tips: "v = c/n = c/√(μrεr). For non-magnetic (μr = 1): n = √εr. Frequency constant! λ decreases: λ_medium = λ₀/n. Speed and λ change, f doesn't."
        },
        {
            concept: "Photon Properties",
            theory: "Quantum nature of EM radiation.",
            formula: "E = hf = \\frac{hc}{\\lambda}, \\quad p = \\frac{h}{\\lambda}",
            details: "h = 6.63×10⁻³⁴ J·s. Higher f = higher energy per photon.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate photon energy", "Number of photons", "Momentum calculation"],
            commonMistakes: ["E depends on intensity", "p = 0 for massless", "Wrong h value"],
            tips: "E = hf = hc/λ. Quick: E(eV) = 1240/λ(nm). p = h/λ = E/c. Intensity = n × hf (number × energy). More intense = more photons, not higher energy photons."
        }
    ]
};

export default electromagneticWaves;
