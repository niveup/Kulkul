/**
 * JEE Oscillations and Waves
 * Class 11 Physics - Chapter: Oscillations and Waves
 * 
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 */

export const oscillationsWaves = {
    topic: "Oscillations & Waves",
    concepts: [
        // ============ SIMPLE HARMONIC MOTION ============
        {
            concept: "Simple Harmonic Motion Definition",
            uid: "OSC01",
            theory: "Motion where restoring force is proportional to displacement from equilibrium.",
            formula: "F = -kx, \\quad a = -\\omega^2 x",
            details: "Negative sign indicates restoring force. ω = angular frequency. Results in sinusoidal motion.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Identify SHM from force equation", "Find ω from coefficient", "Particle in SHM"],
            commonMistakes: ["Forgetting negative sign", "Confusing with simple oscillation", "Wrong ω extraction"],
            tips: "SHM condition: a ∝ -x (acceleration toward equilibrium). From F = -kx, ω² = k/m. Any motion with a = -ω²x is SHM."
        },
        {
            concept: "Displacement in SHM",
            uid: "OSC02",
            theory: "Position varies sinusoidally with time.",
            formula: "x = A\\sin(\\omega t + \\phi) \\quad \\text{or} \\quad x = A\\cos(\\omega t + \\phi)",
            details: "A = amplitude. ω = angular frequency = 2π/T = 2πf. φ = initial phase.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find displacement at time t", "Initial conditions for phase", "Compare two SHMs"],
            commonMistakes: ["Confusing sin and cos (just phase difference)", "Wrong phase constant", "Forgetting amplitude"],
            tips: "x = A sin(ωt + φ). If x=0 at t=0: use sin. If x=A at t=0: use cos (or sin with φ=π/2). ω = 2π/T = 2πf."
        },
        {
            concept: "Velocity in SHM",
            uid: "OSC03",
            theory: "Velocity is derivative of displacement.",
            formula: "v = \\frac{dx}{dt} = A\\omega\\cos(\\omega t + \\phi) = \\omega\\sqrt{A^2 - x^2}",
            details: "Maximum velocity at equilibrium (x = 0): v_max = Aω.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find velocity at position x", "Maximum velocity", "Velocity-displacement relation"],
            commonMistakes: ["Confusing v_max = Aω with ω²A", "Wrong sign in differentiation", "Using x² instead of A² - x²"],
            tips: "v = ω√(A² - x²). At x=0: v = ±Aω (max). At x=±A: v = 0. v² = ω²(A² - x²) → ellipse in phase space!"
        },
        {
            concept: "Acceleration in SHM",
            uid: "OSC04",
            theory: "Acceleration is derivative of velocity, proportional to displacement.",
            formula: "a = \\frac{dv}{dt} = -A\\omega^2\\sin(\\omega t + \\phi) = -\\omega^2 x",
            details: "Maximum acceleration at extremes (x = ±A): a_max = Aω².",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find acceleration at position x", "Maximum acceleration", "a-x graph"],
            commonMistakes: ["Forgetting negative sign", "Confusing a_max with v_max formula", "Wrong at equilibrium (a=0, not max)"],
            tips: "a = -ω²x. At x=0: a = 0. At x=±A: a = ∓ω²A (max magnitude). a and x are out of phase by π (opposite directions)."
        },
        {
            concept: "Time Period and Frequency",
            uid: "OSC05",
            theory: "Time for one complete oscillation and oscillations per second.",
            formula: "T = \\frac{2\\pi}{\\omega}, \\quad f = \\frac{1}{T} = \\frac{\\omega}{2\\pi}",
            details: "f in Hz. ω in rad/s. T in seconds. Independent of amplitude for SHM.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find T from ω", "Frequency from spring constant", "Compare periods"],
            commonMistakes: ["Confusing ω with f (ω = 2πf)", "Thinking T depends on amplitude", "Wrong unit for ω"],
            tips: "T = 2π/ω = 2π√(m/k) for spring. T is INDEPENDENT of amplitude for ideal SHM! Larger A → higher v, but same T."
        },
        {
            concept: "Phase and Phase Difference",
            uid: "OSC06",
            theory: "Argument of sinusoidal function determining position in cycle.",
            formula: "\\phi = \\omega t + \\phi_0, \\quad \\Delta\\phi = \\phi_1 - \\phi_2",
            details: "Phase difference determines relative positions of two oscillators.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Phase difference between particles", "Same phase condition", "Opposite phase condition"],
            commonMistakes: ["Confusing phase with initial phase", "Not converting to same form (sin or cos)", "Wrong Δφ interpretation"],
            tips: "Same phase: Δφ = 0, 2π, 4π... Opposite phase: Δφ = π, 3π... Quadrature: Δφ = π/2. v leads x by π/2, a leads v by π/2."
        },

        // ============ SHM SYSTEMS ============
        {
            concept: "Spring-Mass System",
            uid: "OSC07",
            theory: "Horizontal spring with attached mass exhibits SHM.",
            formula: "T = 2\\pi\\sqrt{\\frac{m}{k}}, \\quad \\omega = \\sqrt{\\frac{k}{m}}",
            details: "Independent of gravity. Same on any planet. Depends only on m and k.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find T for given m and k", "Effect of adding mass", "Spring combinations"],
            commonMistakes: ["Using gravity in formula (not needed for horizontal)", "Wrong k for combined springs", "Confusing m with weight"],
            tips: "T = 2π√(m/k). Horizontal spring: same formula. Vertical spring: same T, but equilibrium shifts by mg/k. Series springs: k_eq = k₁k₂/(k₁+k₂)."
        },
        {
            concept: "Springs in Series and Parallel",
            uid: "OSC08",
            theory: "Combining springs changes effective spring constant.",
            formula: "\\text{Series: } \\frac{1}{k_{eq}} = \\frac{1}{k_1} + \\frac{1}{k_2}, \\quad \\text{Parallel: } k_{eq} = k_1 + k_2",
            details: "Series: softer (easier to stretch). Parallel: stiffer.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find equivalent k", "Period with combined springs", "Force distribution"],
            commonMistakes: ["Swapping series and parallel formulas", "Not recognizing configuration", "Wrong period calculation"],
            tips: "Series (end to end): 1/k_eq = 1/k₁ + 1/k₂ (like resistors in parallel!). Parallel (side by side): k_eq = k₁ + k₂. Stiffer spring dominates in parallel."
        },
        {
            concept: "Simple Pendulum",
            uid: "OSC09",
            theory: "Small-angle oscillations of mass on light string.",
            formula: "T = 2\\pi\\sqrt{\\frac{L}{g}}, \\quad \\omega = \\sqrt{\\frac{g}{L}}",
            details: "Valid for θ << 1 (typically θ < 15°). Independent of mass!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Period of pendulum", "Effect of length change", "g determination"],
            commonMistakes: ["Using for large angles", "Thinking heavier bob oscillates slower", "Wrong L in formula"],
            tips: "T = 2π√(L/g). Independent of mass and amplitude (for small angles)! To double T, quadruple L. On Moon: T increases (g smaller)."
        },
        {
            concept: "Seconds Pendulum",
            uid: "OSC10",
            theory: "Pendulum with period exactly 2 seconds.",
            formula: "L = \\frac{gT^2}{4\\pi^2} = \\frac{g \\times 4}{4\\pi^2} \\approx 1 \\text{ m}",
            details: "At g = 9.8 m/s², L ≈ 99.4 cm ≈ 1 m.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Find length for T = 2s", "Effect of g on seconds pendulum", "Pendulum clocks"],
            commonMistakes: ["Thinking T = 1s (it's T = 2s!)", "Wrong g value", "Forgetting to square T"],
            tips: "Seconds pendulum: T = 2s (so tick-tock = 2s). L ≈ 1 m at Earth surface. On Moon, need shorter pendulum for T = 2s."
        },
        {
            concept: "Physical Pendulum",
            uid: "OSC11",
            theory: "Rigid body oscillating about fixed axis.",
            formula: "T = 2\\pi\\sqrt{\\frac{I}{Mgd}}",
            details: "I = moment of inertia about pivot. d = distance from pivot to COM.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Period of rod/disc pendulum", "Compare with simple pendulum", "Pivot location for minimum T"],
            commonMistakes: ["Using I about COM instead of pivot", "Wrong d value", "Confusing with simple pendulum"],
            tips: "T = 2π√(I_pivot/Mgd). Equivalent length L_eq = I_pivot/(Md). For uniform rod about end: I = ML²/3, d = L/2, so T = 2π√(2L/3g)."
        },
        {
            concept: "Torsional Pendulum",
            uid: "OSC12",
            theory: "Oscillation due to twisting of wire/rod.",
            formula: "T = 2\\pi\\sqrt{\\frac{I}{C}}",
            details: "I = moment of inertia of disc. C = torsional constant of wire.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Period of torsional oscillation", "Compare with linear SHM", "Torsional constant"],
            commonMistakes: ["Confusing C with k", "Wrong I for rotating body", "Not recognizing angular SHM"],
            tips: "Angular SHM: τ = -Cθ analogous to F = -kx. T = 2π√(I/C). C depends on wire material and dimensions. Used in Cavendish experiment."
        },

        // ============ ENERGY IN SHM ============
        {
            concept: "Energy in SHM",
            uid: "OSC13",
            theory: "Total energy is constant, oscillates between KE and PE.",
            formula: "E = \\frac{1}{2}kA^2 = \\frac{1}{2}m\\omega^2 A^2",
            details: "E = KE + PE = constant. At x=0: all KE. At x=±A: all PE.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate total energy", "KE and PE at position x", "Energy from amplitude"],
            commonMistakes: ["Thinking energy changes during oscillation", "Wrong amplitude in formula", "Confusing A with x"],
            tips: "E = ½kA² = ½mω²A² (total, constant). KE = ½mω²(A²-x²). PE = ½mω²x² = ½kx². At any x: KE + PE = E."
        },
        {
            concept: "KE and PE at Position x",
            uid: "OSC14",
            theory: "Distribution of energy at any displacement.",
            formula: "KE = \\frac{1}{2}m\\omega^2(A^2 - x^2), \\quad PE = \\frac{1}{2}m\\omega^2 x^2",
            details: "At x = ±A/√2: KE = PE = E/2. Time average: ⟨KE⟩ = ⟨PE⟩ = E/2.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Where is KE = PE?", "KE:PE ratio at given x", "Average KE over cycle"],
            commonMistakes: ["Wrong position for KE = PE", "Not recognizing time averages", "Using wrong formula"],
            tips: "KE = PE when x = ±A/√2 ≈ 0.707A. Time average: ⟨KE⟩ = ⟨PE⟩ = E/2. At x = A/2: KE = 3E/4, PE = E/4."
        },
        {
            concept: "Energy-Displacement Graph",
            uid: "OSC15",
            theory: "Visual representation of energy curves in SHM.",
            formula: "\\text{Total E: horizontal line. KE: inverted parabola. PE: parabola.}",
            details: "KE max at x = 0. PE max at x = ±A. Sum is constant.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Sketch energy curves", "Identify energies from graph", "Interpret crossover points"],
            commonMistakes: ["Drawing total energy as curved", "Getting KE and PE shapes reversed", "Wrong intersection points"],
            tips: "E is horizontal line. PE = ½kx² is upward parabola. KE = E - PE is inverted parabola. They cross at x = ±A/√2."
        },

        // ============ DAMPED AND FORCED OSCILLATIONS ============
        {
            concept: "Damped Oscillations",
            uid: "OSC16",
            theory: "Oscillations with amplitude decreasing due to friction/resistance.",
            formula: "x = A_0 e^{-bt/2m}\\cos(\\omega' t + \\phi), \\quad \\omega' = \\sqrt{\\omega_0^2 - \\frac{b^2}{4m^2}}",
            details: "b = damping coefficient. Amplitude decays exponentially. ω' < ω₀.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Amplitude after n oscillations", "Effect of damping", "Energy decay"],
            commonMistakes: ["Forgetting frequency changes slightly", "Wrong decay constant", "Not recognizing overdamping"],
            tips: "A(t) = A₀e^(-bt/2m) for underdamped. Energy ∝ A² decays as E = E₀e^(-bt/m). Critical damping: no oscillation, fastest return."
        },
        {
            concept: "Forced Oscillations and Resonance",
            uid: "OSC17",
            theory: "External periodic force driving oscillator.",
            formula: "A = \\frac{F_0/m}{\\sqrt{(\\omega_0^2 - \\omega^2)^2 + (b\\omega/m)^2}}",
            details: "Maximum amplitude (resonance) when ω = ω₀ (for light damping).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Resonance condition", "Amplitude at resonance", "Sharpness of resonance"],
            commonMistakes: ["Thinking resonance at ω = ω' (it's ω₀)", "Ignoring damping effect on peak", "Wrong denominator"],
            tips: "Resonance: driving frequency = natural frequency. Light damping: sharp peak, large amplitude. Heavy damping: broad peak, smaller amplitude."
        },
        {
            concept: "Quality Factor (Q)",
            uid: "OSC18",
            theory: "Measure of damping - ratio of stored energy to energy lost per cycle.",
            formula: "Q = 2\\pi \\frac{E}{\\Delta E_{cycle}} = \\frac{\\omega_0}{\\Delta\\omega}",
            details: "High Q = low damping = sharp resonance. Δω = bandwidth.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate Q from energy loss", "Relate Q to bandwidth", "High Q systems"],
            commonMistakes: ["Confusing with amplitude", "Wrong formula", "Not understanding bandwidth"],
            tips: "Q = ω₀m/b (for mechanical oscillator). High Q: rings long, narrow resonance. Low Q: dies quickly, broad resonance. Q ~ number of oscillations before dying."
        },

        // ============ WAVE BASICS ============
        {
            concept: "Wave Parameters",
            uid: "OSC19",
            theory: "Fundamental quantities describing a wave.",
            formula: "v = f\\lambda = \\frac{\\omega}{k} = \\frac{\\lambda}{T}",
            details: "λ = wavelength. f = frequency. k = 2π/λ (wave number). v = wave speed.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate v, f, or λ", "Wave number problems", "Frequency-wavelength relation"],
            commonMistakes: ["Confusing v with particle velocity", "Wrong k definition", "Using wrong relation"],
            tips: "v = fλ is fundamental. k = 2π/λ, ω = 2πf. v = ω/k. Speed depends on medium, not source (for mechanical waves)."
        },
        {
            concept: "Wave Equation",
            uid: "OSC20",
            theory: "Mathematical description of traveling wave.",
            formula: "y = A\\sin(kx - \\omega t + \\phi) \\text{ or } y = A\\sin(\\omega t - kx + \\phi)",
            details: "(kx - ωt) for wave moving in +x direction. (kx + ωt) for -x direction.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Write wave equation", "Determine wave direction", "Find particle velocity"],
            commonMistakes: ["Wrong sign for direction", "Confusing forms", "Not extracting v from equation"],
            tips: "y = A sin(kx - ωt): +x direction. y = A sin(kx + ωt): -x direction. Speed v = ω/k = coefficient of t / coefficient of x."
        },
        {
            concept: "Transverse vs Longitudinal Waves",
            uid: "OSC21",
            theory: "Classification by direction of particle vibration relative to wave propagation.",
            formula: "\\text{Transverse: particle } \\perp \\text{ wave. Longitudinal: particle } \\parallel \\text{ wave.}",
            details: "Transverse: strings, EM waves. Longitudinal: sound in air, compression waves.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Identify wave type", "Particle motion direction", "Medium requirements"],
            commonMistakes: ["Sound as transverse (it's longitudinal)", "EM waves needing medium", "Wrong motion direction"],
            tips: "Transverse: needs shear support (solids, string surface). Longitudinal: can exist in all media. Sound in air is longitudinal. Light is transverse (EM)."
        },
        {
            concept: "Particle Velocity and Acceleration in Wave",
            uid: "OSC22",
            theory: "SHM of particles as wave passes.",
            formula: "v_p = \\frac{\\partial y}{\\partial t} = -A\\omega\\cos(kx - \\omega t), \\quad a_p = -\\omega^2 y",
            details: "Each particle undergoes SHM. Maximum particle velocity = Aω.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Particle velocity at point", "Maximum particle speed", "Particle acceleration"],
            commonMistakes: ["Confusing wave speed with particle speed", "Wrong differentiation", "Missing negative sign"],
            tips: "v_particle = ∂y/∂t (differentiate y w.r.t time). v_wave = ω/k. v_particle can be >> or << v_wave. They're different concepts!"
        },

        // ============ WAVE SPEED ============
        {
            concept: "Speed of Wave on String",
            uid: "OSC23",
            theory: "Wave speed depends on tension and linear mass density.",
            formula: "v = \\sqrt{\\frac{T}{\\mu}}",
            details: "T = tension. μ = mass per unit length (kg/m). Tighter string = faster wave.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate wave speed", "Effect of tension", "Compare different strings"],
            commonMistakes: ["Confusing T (tension) with T (period)", "Wrong μ calculation", "Using total mass instead of linear density"],
            tips: "v = √(T/μ). Double tension → √2 times speed. μ = m/L. For same material, thicker string has higher μ, slower speed."
        },
        {
            concept: "Speed of Sound in Gas",
            uid: "OSC24",
            theory: "Sound speed depends on bulk modulus and density.",
            formula: "v = \\sqrt{\\frac{\\gamma P}{\\rho}} = \\sqrt{\\frac{\\gamma RT}{M}}",
            details: "γ = Cp/Cv. Uses adiabatic bulk modulus (sound is fast process).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate sound speed", "Temperature effect", "Compare different gases"],
            commonMistakes: ["Using isothermal formula", "Wrong γ value", "Temperature not in Kelvin"],
            tips: "v = √(γRT/M). v ∝ √T. Sound faster in lighter gases (H₂ > air). Independent of pressure (both P and ρ change together)."
        },
        {
            concept: "Speed of Sound in Solids",
            uid: "OSC25",
            theory: "Sound speed in solid rods (longitudinal waves).",
            formula: "v = \\sqrt{\\frac{Y}{\\rho}}",
            details: "Y = Young's modulus. Solids have highest sound speed. Steel: ~5000 m/s.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Sound speed in metal rod", "Compare solid and gas", "Stiffness effect"],
            commonMistakes: ["Using bulk modulus for rod", "Confusing with gas formula", "Wrong for transverse waves"],
            tips: "v = √(Y/ρ) for longitudinal waves in rod. Solids: high Y, moderate ρ → fast. Typical: steel ~5000 m/s, water ~1500 m/s, air ~340 m/s."
        },

        // ============ SUPERPOSITION AND INTERFERENCE ============
        {
            concept: "Principle of Superposition",
            uid: "OSC26",
            theory: "Net displacement is sum of individual wave displacements.",
            formula: "y_{net} = y_1 + y_2 + y_3 + ...",
            details: "Waves pass through each other, add algebraically at each point.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Resultant of two waves", "Interference pattern", "Wave addition"],
            commonMistakes: ["Using for different types of waves incorrectly", "Not considering phase", "Thinking waves interact permanently"],
            tips: "Add displacements (with signs!). Constructive: same phase (add). Destructive: opposite phase (cancel). After crossing, waves continue unchanged."
        },
        {
            concept: "Interference of Waves",
            uid: "OSC27",
            theory: "Result of superposition of coherent waves.",
            formula: "\\text{Constructive: } \\Delta\\phi = 2n\\pi, \\quad \\text{Destructive: } \\Delta\\phi = (2n+1)\\pi",
            details: "Path difference = λ: constructive. Path difference = λ/2: destructive.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Condition for maxima/minima", "Path difference problems", "Intensity at point"],
            commonMistakes: ["Confusing path difference with phase difference", "Wrong conversion (Δφ = 2πΔx/λ)", "Using for incoherent sources"],
            tips: "Path diff Δx ↔ Phase diff Δφ = (2π/λ)Δx. Constructive: Δx = nλ. Destructive: Δx = (n + ½)λ. Need coherent sources!"
        },
        {
            concept: "Intensity in Interference",
            uid: "OSC28",
            theory: "Resultant intensity depends on amplitudes and phase difference.",
            formula: "I = I_1 + I_2 + 2\\sqrt{I_1 I_2}\\cos\\Delta\\phi",
            details: "For equal I₀: I = 4I₀cos²(Δφ/2). Max = 4I₀, Min = 0.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate resultant intensity", "I_max and I_min", "Intensity at given path difference"],
            commonMistakes: ["Using A instead of I (I ∝ A²)", "Wrong formula for unequal intensities", "Forgetting 2√(I₁I₂) term"],
            tips: "I = I₁ + I₂ + 2√(I₁I₂)cosΔφ. For equal sources: I_max = 4I₀, I_min = 0. For unequal: I_max = (√I₁ + √I₂)², I_min = (√I₁ - √I₂)²."
        },
        {
            concept: "Beats",
            uid: "OSC29",
            theory: "Periodic variation in loudness when two slightly different frequencies combine.",
            formula: "f_{beat} = |f_1 - f_2|",
            details: "Heard as waxing and waning of sound. Useful for tuning instruments.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate beat frequency", "Identify unknown frequency", "Tuning fork problems"],
            commonMistakes: ["Forgetting absolute value", "Confusing beat frequency with average frequency", "Wrong for large Δf"],
            tips: "Beat frequency = |f₁ - f₂|. If you load a tuning fork (makes it slower), beat frequency changes. Compare with and without loading to find unknown f."
        },

        // ============ STANDING WAVES ============
        {
            concept: "Standing Waves - Formation",
            uid: "OSC30",
            theory: "Superposition of two waves traveling in opposite directions.",
            formula: "y = 2A\\sin(kx)\\cos(\\omega t)",
            details: "Nodes at x = nλ/2. Antinodes at x = (2n+1)λ/4. No energy transport.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Node and antinode positions", "Standing wave equation", "Particle amplitude at position"],
            commonMistakes: ["Thinking standing wave travels", "Wrong node/antinode positions", "Confusing with traveling wave"],
            tips: "y = 2A sin(kx) cos(ωt). Amplitude varies with x: A(x) = 2A|sin(kx)|. Nodes: sin(kx) = 0 → kx = nπ → x = nλ/2. Antinodes: x = (n+½)λ/2."
        },
        {
            concept: "String Fixed at Both Ends",
            uid: "OSC31",
            theory: "Standing wave modes (harmonics) on string.",
            formula: "f_n = n\\frac{v}{2L} = \\frac{n}{2L}\\sqrt{\\frac{T}{\\mu}}, \\quad n = 1, 2, 3...",
            details: "Nodes at both ends. λ_n = 2L/n. f₁ = fundamental frequency.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find harmonic frequencies", "Wavelength of mode", "Number of loops"],
            commonMistakes: ["Antinodes at fixed ends", "Wrong formula for n", "Confusing λ with L"],
            tips: "f_n = nf₁ = nv/(2L). n = 1: fundamental (1 loop). n = 2: 1st overtone (2 loops). Length = n(λ/2). All harmonics present."
        },
        {
            concept: "Pipe Open at Both Ends",
            uid: "OSC32",
            theory: "Standing wave modes in open pipe.",
            formula: "f_n = n\\frac{v}{2L}, \\quad n = 1, 2, 3...",
            details: "Antinodes at both ends. All harmonics present. Same formula as closed string!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Frequencies of open pipe", "Compare with closed pipe", "Fundamental frequency"],
            commonMistakes: ["Confusing with closed pipe", "Wrong end condition (antinodes, not nodes)", "Using wrong formula"],
            tips: "Open pipe: antinodes at both ends. f_n = nv/(2L). Same as string! All harmonics. f₁ = v/(2L). Open pipe sounds richer (more overtones)."
        },
        {
            concept: "Pipe Closed at One End",
            uid: "OSC33",
            theory: "Standing wave modes in closed pipe.",
            formula: "f_n = n\\frac{v}{4L}, \\quad n = 1, 3, 5... \\text{ (odd only)}",
            details: "Node at closed end, antinode at open end. Only odd harmonics.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Frequencies of closed pipe", "Why only odd harmonics", "Compare open and closed"],
            commonMistakes: ["Using even n values", "Using 2L instead of 4L", "Antinodes at closed end"],
            tips: "Closed pipe: node at closed, antinode at open. f_n = nv/(4L), n = 1, 3, 5... Fundamental f₁ = v/(4L) is half of open pipe. Only odd harmonics!"
        },
        {
            concept: "End Correction",
            uid: "OSC34",
            theory: "Antinode forms slightly outside the physical end of pipe.",
            formula: "e = 0.3d \\text{ (approx)}, \\quad L_{effective} = L + e \\text{ (one end)}, L + 2e \\text{ (both ends)}",
            details: "d = diameter of pipe. Accounts for air just outside open end.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate end correction", "True length from frequency", "Resonance tube experiment"],
            commonMistakes: ["Forgetting end correction", "Applying to closed end (only open)", "Wrong for both ends open"],
            tips: "e ≈ 0.3d at each open end. Closed pipe: L_eff = L + e. Open pipe: L_eff = L + 2e. Important for precise frequency calculations."
        },
        {
            concept: "Resonance in Air Columns",
            uid: "OSC35",
            theory: "Air column vibrates at specific frequencies matching standing wave modes.",
            formula: "L_1 = \\frac{\\lambda}{4}, \\quad L_2 = \\frac{3\\lambda}{4}, \\quad L_2 - L_1 = \\frac{\\lambda}{2}",
            details: "First resonance at λ/4, second at 3λ/4, etc. (closed pipe)",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find λ from resonance lengths", "Resonance tube experiment", "Speed of sound determination"],
            commonMistakes: ["Wrong resonance positions", "Not using L₂ - L₁", "Confusing with open pipe"],
            tips: "Resonance tube: L₂ - L₁ = λ/2. v = f × λ = f × 2(L₂ - L₁). This eliminates end correction error! First minimum to second minimum."
        },

        // ============ DOPPLER EFFECT ============
        {
            concept: "Doppler Effect - General Formula",
            uid: "OSC36",
            theory: "Apparent frequency change due to relative motion of source and observer.",
            formula: "f' = f \\left(\\frac{v + v_o}{v - v_s}\\right)",
            details: "v = sound speed. v_o = observer speed (+ toward source). v_s = source speed (+ toward observer).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate apparent frequency", "Source and observer moving", "When f' = f"],
            commonMistakes: ["Wrong sign convention", "Confusing v_s and v_o positions", "Not using medium speed for v"],
            tips: "f' = f(v + v_o)/(v - v_s). Easy memory: numerator has v_o, denominator has v_s. Approaching: f' increases. Receding: f' decreases."
        },
        {
            concept: "Doppler Effect - Special Cases",
            uid: "OSC37",
            theory: "Simplified formulas for common scenarios.",
            formula: "\\begin{aligned} &\\text{Source approaching: } f' = f\\frac{v}{v-v_s} \\\\ &\\text{Observer approaching: } f' = f\\frac{v+v_o}{v} \\end{aligned}",
            details: "Source motion changes wavelength. Observer motion changes relative wave speed.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Stationary observer/source", "Moving source problems", "Moving observer problems"],
            commonMistakes: ["Using wrong case formula", "Sign errors for receding", "Confusing source and observer effects"],
            tips: "Source moving: wavelength changes. Observer moving: only apparent speed changes. Source approaching: λ' = λ(v-v_s)/v (compressed)."
        },
        {
            concept: "Doppler Effect for Light",
            uid: "OSC38",
            theory: "Frequency shift for electromagnetic waves.",
            formula: "\\frac{\\Delta f}{f} = \\frac{v}{c} \\quad \\text{(for } v << c \\text{)}",
            details: "Redshift: source receding. Blueshift: source approaching. No medium needed.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate redshift", "Velocity from wavelength shift", "Astronomical applications"],
            commonMistakes: ["Using sound Doppler formula for light", "Wrong sign for redshift", "Forgetting relativistic effects"],
            tips: "For v << c: Δf/f ≈ v/c. Redshift (longer λ) = recession. Used for: measuring star velocities, cosmological redshift, police radar."
        },
        {
            concept: "Apparent Wavelength Change",
            uid: "OSC39",
            theory: "Wavelength compression or stretching due to source motion.",
            formula: "\\lambda' = \\lambda \\frac{v - v_s}{v} = \\lambda\\left(1 - \\frac{v_s}{v}\\right)",
            details: "Only source motion changes actual wavelength. Observer motion doesn't affect λ.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find apparent wavelength", "Source approaching/receding", "Wave pattern behind source"],
            commonMistakes: ["Thinking observer motion changes λ", "Wrong direction for compression", "Confusing with frequency formula"],
            tips: "λ' = λ(v - v_s)/v for approaching source (λ' < λ). λ' = λ(v + v_s)/v for receding (λ' > λ). Observer motion doesn't change wavelength!"
        }
    ]
};

export default oscillationsWaves;
