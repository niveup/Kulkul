/**
 * JEE Dual Nature of Radiation and Matter - Formulas & Concepts
 * Class 12 Physics - Chapter: Dual Nature of Radiation and Matter
 * 
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 * Formulas use KaTeX notation
 */

export const dualNature = {
    topic: "Dual Nature of Radiation & Matter",
    concepts: [
        // ============ PHOTON PROPERTIES ============
        {
            concept: "Photon Energy",
            theory: "Energy of photon proportional to frequency.",
            formula: "E = hf = \\frac{hc}{\\lambda}",
            details: "h = 6.63×10⁻³⁴ J·s. E in eV: E = 12400/λ(Å).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate photon energy", "Wavelength to energy conversion", "Number of photons"],
            commonMistakes: ["Using λ in wrong units", "Confusing eV and J", "Wrong value of hc"],
            tips: "E = hc/λ. Quick formula: E(eV) = 12400/λ(Å) = 1240/λ(nm). hc = 1240 eV·nm. Higher frequency = higher energy."
        },
        {
            concept: "Photon Momentum",
            theory: "Momentum of massless photon.",
            formula: "p = \\frac{E}{c} = \\frac{h}{\\lambda} = \\frac{hf}{c}",
            details: "Despite zero rest mass, photon has momentum. Used in radiation pressure.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate photon momentum", "Radiation pressure", "Photon-electron collision"],
            commonMistakes: ["Using p = mv (wrong for photon!)", "Confusing with de Broglie momentum", "Wrong units"],
            tips: "p = h/λ = E/c. Shorter wavelength = higher momentum. Radiation pressure P = I/c (absorbed) or 2I/c (reflected)."
        },
        {
            concept: "Number of Photons",
            theory: "Number of photons for given power and wavelength.",
            formula: "n = \\frac{P}{E_{photon}} = \\frac{P\\lambda}{hc}",
            details: "P = power (J/s). More photons at higher λ for same power.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Photons per second", "Compare intensity sources", "Threshold problems"],
            commonMistakes: ["Using energy instead of power", "Wrong units for λ", "Forgetting photons/second"],
            tips: "n = P/E = Pλ/(hc). Same power, different λ: longer λ → more photons (each with less energy). Red light has more photons than blue for same power."
        },

        // ============ PHOTOELECTRIC EFFECT ============
        {
            concept: "Einstein's Photoelectric Equation",
            theory: "Energy balance in photoelectric effect.",
            formula: "hf = \\phi + K_{max}",
            details: "φ = work function. One photon ejects one electron. Kmax = maximum KE.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate Kmax", "Find work function", "Threshold frequency"],
            commonMistakes: ["Using average KE instead of Kmax", "Forgetting work function", "Wrong energy units"],
            tips: "hf = φ + Kmax. Photon energy = work function + kinetic energy. One photon → one electron (at most). Extra energy goes to KE."
        },
        {
            concept: "Work Function",
            theory: "Minimum energy to eject electron from metal.",
            formula: "\\phi = hf_0 = \\frac{hc}{\\lambda_0}",
            details: "f₀ = threshold frequency. λ₀ = threshold wavelength. Property of metal.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate threshold values", "Compare metals", "Energy conversion"],
            commonMistakes: ["Confusing with ionization energy", "Wrong units (eV vs J)", "Using wrong threshold value"],
            tips: "φ = hf₀ = hc/λ₀. Alkali metals have low φ (easy to eject). Cs has lowest φ ≈ 2 eV. φ values in eV: Na ≈ 2.3, Cu ≈ 4.5, Pt ≈ 5.6."
        },
        {
            concept: "Stopping Potential",
            theory: "Potential to stop fastest photoelectron.",
            formula: "eV_0 = K_{max} = hf - \\phi",
            details: "At V₀, current becomes zero. V₀ independent of intensity.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find stopping potential", "V₀ vs frequency graph", "Compare for different metals"],
            commonMistakes: ["Thinking V₀ depends on intensity", "Wrong relationship with Kmax", "Sign confusion"],
            tips: "eV₀ = Kmax = hf - φ. V₀ depends on frequency, NOT intensity! V₀-f graph: slope = h/e (universal), intercept = -φ/e (metal specific).",
            graph: {
                fn: 'linear-positive',
                xLabel: 'f',
                yLabel: 'V₀',
                domain: [0, 5],
                step: 0.1,
                question: "What does the slope of V₀ vs f graph give?"
            }
        },
        {
            concept: "Photoelectric Current",
            theory: "Current depends on intensity, not frequency.",
            formula: "I_{photo} \\propto \\text{Intensity}",
            details: "Above threshold: more photons = more electrons = more current.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Effect of intensity on current", "Saturation current", "I-V characteristics"],
            commonMistakes: ["Thinking current depends on frequency", "Confusing I and Kmax dependencies", "Below threshold behavior"],
            tips: "I ∝ intensity (above threshold). Kmax ∝ frequency (independent of intensity). Double intensity → double current. Below f₀: no current regardless of intensity!"
        },
        {
            concept: "Important Observations",
            theory: "Key experimental facts about photoelectric effect.",
            formula: "\\text{Instantaneous emission, no time lag}",
            details: "Emission within 10⁻⁹ s. Classical wave theory cannot explain this.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Explain classical failure", "Time lag", "Quantum explanation"],
            commonMistakes: ["Classical explanation attempts", "Energy accumulation idea", "Wave theory application"],
            tips: "No time lag: photon gives all energy at once. Classical wave: would need time to accumulate energy (fails). Threshold explains why red light (f < f₀) doesn't work regardless of intensity."
        },

        // ============ DE BROGLIE WAVELENGTH ============
        {
            concept: "de Broglie Hypothesis",
            theory: "Matter particles exhibit wave nature.",
            formula: "\\lambda = \\frac{h}{p} = \\frac{h}{mv}",
            details: "Wave-particle duality applies to all matter. λ = de Broglie wavelength.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate wavelength", "Compare particles", "Wavelength of macroscopic objects"],
            commonMistakes: ["Using photon formula for matter", "Wrong momentum formula", "Relativistic cases"],
            tips: "λ = h/mv. Heavier or faster → shorter wavelength. For macroscopic objects: λ is incredibly small (undetectable). Only significant for electrons, protons, etc."
        },
        {
            concept: "de Broglie Wavelength (KE form)",
            theory: "Wavelength in terms of kinetic energy.",
            formula: "\\lambda = \\frac{h}{\\sqrt{2mK}} = \\frac{h}{\\sqrt{2meV}}",
            details: "K = kinetic energy. When accelerated through V volts.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Electron accelerated through V", "Compare different particles", "Energy-wavelength relation"],
            commonMistakes: ["Forgetting √2m factor", "Wrong charge for proton", "Using eV directly without conversion"],
            tips: "λ = h/√(2mK) = h/√(2meV). For electron: λ = 12.27/√V Å. Same KE: heavier particle has shorter λ (λ ∝ 1/√m)."
        },
        {
            concept: "Electron Wavelength (Quick Formula)",
            theory: "Practical formula for electron.",
            formula: "\\lambda = \\frac{12.27}{\\sqrt{V}} \\text{ Å}",
            details: "V in volts. Very useful for quick JEE calculations.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Quick calculations", "Electron microscope problems", "100V, 150V common cases"],
            commonMistakes: ["Using for proton (different constant)", "V in different units", "Forgetting it's in Angstroms"],
            tips: "λ = 12.27/√V Å for electron. At 100V: λ = 1.227 Å. At 150V: λ = 1 Å. For proton use 0.286/√V Å (√(m_p/m_e) times smaller)."
        },
        {
            concept: "Thermal de Broglie Wavelength",
            theory: "Wavelength at thermal equilibrium.",
            formula: "\\lambda = \\frac{h}{\\sqrt{3mkT}}",
            details: "Uses average KE = (3/2)kT. k = Boltzmann constant.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Wavelength at temperature T", "Room temperature calculations", "Quantum effects"],
            commonMistakes: ["Wrong KE formula (3/2kT)", "Missing √3", "Confusing k with 1/4πε₀"],
            tips: "Average KE = 3kT/2, so λ = h/√(3mkT). At room temperature, electron has λ ≈ few nm. When λ > interparticle distance: quantum effects dominate."
        },

        // ============ HEISENBERG UNCERTAINTY ============
        {
            concept: "Heisenberg Uncertainty Principle",
            theory: "Fundamental limit on simultaneous measurement.",
            formula: "\\Delta x \\cdot \\Delta p \\geq \\frac{h}{4\\pi} = \\frac{\\hbar}{2}",
            details: "ℏ = h/(2π). More precise position = less precise momentum.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find minimum uncertainty", "Electron in atom", "Microscope resolution"],
            commonMistakes: ["Using h instead of h/4π", "Wrong inequality direction", "Confusing Δ with actual values"],
            tips: "ΔxΔp ≥ h/(4π) ≈ 5.3×10⁻³⁵ J·s. For minimum uncertainty, use equality. Small Δx (known position) → large Δp (unknown momentum). Explains why electrons can't exist in nucleus!"
        },
        {
            concept: "Energy-Time Uncertainty",
            theory: "Uncertainty in energy and time.",
            formula: "\\Delta E \\cdot \\Delta t \\geq \\frac{h}{4\\pi}",
            details: "Short-lived states have energy uncertainty. Related to line width.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Excited state lifetime", "Energy level width", "Virtual particles"],
            commonMistakes: ["Confusing with position-momentum form", "Wrong constant", "Interpretation errors"],
            tips: "ΔEΔt ≥ h/(4π). Short lifetime → uncertain energy → broad spectral line. Ground state (Δt = ∞) has ΔE = 0 (sharp energy)."
        },

        // ============ BOHR MODEL CONNECTION ============
        {
            concept: "de Broglie and Bohr Orbits",
            theory: "Standing wave condition in orbits.",
            formula: "2\\pi r = n\\lambda \\Rightarrow mvr = \\frac{nh}{2\\pi}",
            details: "Electron wave forms standing wave. Explains Bohr's angular momentum quantization.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Derive Bohr quantization", "Number of wavelengths in orbit", "Radius from wavelength"],
            commonMistakes: ["Wrong number of wavelengths", "Not connecting to Bohr's postulate", "Using wrong n"],
            tips: "Orbit circumference = nλ. This gives mvr = nh/(2π), which is exactly Bohr's quantization condition! Wave nature explains why only certain orbits are allowed."
        },

        // ============ EXPERIMENTS ============
        {
            concept: "Davisson-Germer Experiment",
            theory: "First proof of electron wave nature.",
            formula: "d\\sin\\phi = n\\lambda",
            details: "Electron diffraction from nickel crystal. Confirmed de Broglie hypothesis.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Experimental setup", "Diffraction condition", "Historical significance"],
            commonMistakes: ["Confusing with photoelectric effect", "Wrong diffraction formula", "Not knowing the outcome"],
            tips: "Electrons showed diffraction pattern like X-rays! Peak at 50° for 54V electrons. λ_measured matched λ_de Broglie = 12.27/√54 ≈ 1.67 Å. Proof of wave nature of matter."
        },
        {
            concept: "Electron Microscope",
            theory: "Uses wave nature for high resolution.",
            formula: "\\text{Resolution} \\propto \\lambda \\propto \\frac{1}{\\sqrt{V}}",
            details: "Higher V = shorter λ = better resolution than optical microscope.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Resolution comparison", "Advantage over optical", "Voltage requirement"],
            commonMistakes: ["Confusing with optical microscope", "Not relating to wavelength", "Wrong V effect"],
            tips: "Resolution limited by λ. Optical: λ ≈ 500 nm. Electron at 100V: λ ≈ 1.2 Å. Electron microscope can 'see' atoms! Higher V → better resolution."
        }
    ]
};

export default dualNature;
