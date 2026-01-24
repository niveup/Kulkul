/**
 * JEE Work, Energy and Power
 * Class 11 Physics - Chapter: Work, Energy and Power
 * 
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 */

export const workEnergyPower = {
    topic: "Work, Energy & Power",
    concepts: [
        // ============ WORK ============
        {
            concept: "Work Done by Constant Force",
            uid: "WEP01",
            theory: "Work is the scalar product of force and displacement.",
            formula: "W = \\vec{F} \\cdot \\vec{d} = Fd\\cos\\theta",
            details: "θ = angle between force and displacement. Unit: Joule (J) = N·m",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate work by given force", "Work at angle", "Sign of work done"],
            commonMistakes: ["Forgetting cosine factor", "Using angle with wrong reference", "Work is scalar but can be negative"],
            tips: "W > 0: force helps motion (θ < 90°). W < 0: force opposes motion (θ > 90°). W = 0: force perpendicular to motion (θ = 90°). Normal force usually does zero work!"
        },
        {
            concept: "Work Done by Variable Force",
            uid: "WEP02",
            theory: "Integral of force over displacement path.",
            formula: "W = \\int_{x_1}^{x_2} F(x)\\,dx = \\text{Area under F-x graph}",
            details: "Force may vary with position. Area under F-x curve gives work.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Work from F-x graph", "Spring work", "Variable force integration"],
            commonMistakes: ["Using F × d for variable force", "Wrong limits of integration", "Forgetting sign from graph below axis"],
            tips: "For spring: W = ∫kx dx = ½kx². Area under F-x: positive above axis, negative below. Break complex graphs into triangles and rectangles!"
        },
        {
            concept: "Work Done by Spring Force",
            uid: "WEP03",
            theory: "Work by spring when stretched or compressed.",
            formula: "W_{spring} = -\\frac{1}{2}k(x_f^2 - x_i^2)",
            details: "From natural length to x: W = -½kx². Negative because spring opposes displacement.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Work in stretching spring", "Work by spring on attached mass", "Energy stored in spring"],
            commonMistakes: ["Forgetting negative sign", "Using x instead of x² in formula", "Confusing work BY spring vs work ON spring"],
            tips: "Work BY spring = -½k(xf² - xi²). Work ON spring (by external agent) = +½k(xf² - xi²). From natural length (x=0) to x: Work ON spring = ½kx²."
        },
        {
            concept: "Work Done by Gravity",
            uid: "WEP04",
            theory: "Work by gravitational force depends only on height change.",
            formula: "W_g = mgh = mg(h_i - h_f)",
            details: "Positive when object moves down, negative when up. Path independent.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Work by gravity on falling object", "Work along inclined path", "Round trip work"],
            commonMistakes: ["Using path length instead of height difference", "Wrong sign for upward motion", "Thinking work depends on path"],
            tips: "Gravity is conservative: work depends ONLY on initial and final heights, not path. W = mg × (drop in height). For round trip: W = 0!"
        },
        {
            concept: "Work Done by Friction",
            uid: "WEP05",
            theory: "Work by kinetic friction is always negative.",
            formula: "W_f = -\\mu_k N \\times d = -f_k \\times d",
            details: "Friction opposes motion, so always does negative work. Dissipates energy as heat.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Energy dissipated by friction", "Work in sliding block", "Heat generated"],
            commonMistakes: ["Forgetting friction work is negative", "Using static friction coefficient", "Not accounting for all friction surfaces"],
            tips: "Friction ALWAYS opposes relative motion, so W_friction < 0 always. Energy dissipated = |W_f| = μkNd. This energy becomes heat!"
        },
        {
            concept: "Work-Energy Theorem",
            uid: "WEP06",
            theory: "Net work done equals change in kinetic energy.",
            formula: "W_{net} = \\Delta KE = \\frac{1}{2}mv_f^2 - \\frac{1}{2}mv_i^2",
            details: "Work by ALL forces on body changes its kinetic energy.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find final velocity from work", "Calculate work from velocity change", "Multiple force work problems"],
            commonMistakes: ["Using only one force instead of net work", "Sign errors in ΔKE", "Confusing with potential energy"],
            tips: "W_net = W_1 + W_2 + W_3 + ... = ΔKE. Include ALL forces: gravity, friction, applied, normal, tension. This is energy approach alternative to F = ma!"
        },

        // ============ KINETIC ENERGY ============
        {
            concept: "Kinetic Energy",
            uid: "WEP07",
            theory: "Energy due to motion of a body.",
            formula: "KE = \\frac{1}{2}mv^2 = \\frac{p^2}{2m}",
            details: "Always positive. Depends on frame of reference.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate KE from mass and velocity", "KE from momentum", "Relative KE in different frames"],
            commonMistakes: ["Negative KE (impossible!)", "Forgetting ½ factor", "Same momentum doesn't mean same KE"],
            tips: "KE = ½mv² = p²/2m. For same momentum: KE ∝ 1/m (lighter object has more KE). For same KE: p ∝ √m (heavier object has more momentum)."
        },
        {
            concept: "Relation Between KE and Momentum",
            uid: "WEP08",
            theory: "Mathematical relation between kinetic energy and momentum.",
            formula: "KE = \\frac{p^2}{2m}, \\quad p = \\sqrt{2m \\cdot KE}",
            details: "Useful for collision and explosion problems.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Compare KE of objects with same momentum", "Find p from KE", "Explosion problems"],
            commonMistakes: ["Wrong mass in denominator", "Confusing direct and inverse relations", "Not using for momentum comparison"],
            tips: "If two objects have same p: KE₁/KE₂ = m₂/m₁. If same KE: p₁/p₂ = √(m₁/m₂). Lighter = more KE for same momentum. Heavier = more momentum for same KE."
        },

        // ============ POTENTIAL ENERGY ============
        {
            concept: "Gravitational Potential Energy",
            uid: "WEP09",
            theory: "Energy due to position in gravitational field.",
            formula: "PE = mgh",
            details: "h = height above reference point. Reference can be chosen arbitrarily.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate PE at height", "Change in PE", "Reference point problems"],
            commonMistakes: ["Not defining reference level", "Using height from wrong reference", "Forgetting PE can be negative if below reference"],
            tips: "PE = mgh (h from reference). Only ΔPE matters physically. Choose convenient reference (usually ground or lowest point). PE above reference: positive. Below: negative."
        },
        {
            concept: "Elastic Potential Energy (Spring)",
            uid: "WEP10",
            theory: "Energy stored in deformed spring.",
            formula: "PE = \\frac{1}{2}kx^2",
            details: "x = extension or compression from natural length. Always positive.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Energy stored in stretched spring", "Spring-mass oscillation energy", "Maximum compression"],
            commonMistakes: ["Using x from equilibrium instead of natural length", "Forgetting ½k factor", "Confusing x² with x"],
            tips: "PE = ½kx² is always positive (both stretching and compression store energy). x is from NATURAL LENGTH, not equilibrium position with hanging mass!"
        },
        {
            concept: "Conservative Forces",
            uid: "WEP11",
            theory: "Forces for which work depends only on initial and final positions, not path.",
            formula: "W = -\\Delta PE, \\quad \\oint \\vec{F} \\cdot d\\vec{r} = 0",
            details: "Examples: gravity, spring force, electrostatic force. Work in closed loop = 0.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Identify conservative forces", "Calculate PE from work", "Path independence"],
            commonMistakes: ["Thinking friction is conservative", "Confusing definition with energy conservation", "Wrong sign in W = -ΔPE"],
            tips: "Conservative forces: gravity, spring, electrostatic. Non-conservative: friction, air drag, viscosity. For conservative: W_AB = -ΔPE = PE_A - PE_B."
        },
        {
            concept: "Non-Conservative Forces",
            uid: "WEP12",
            theory: "Forces for which work depends on the path taken.",
            formula: "W = \\text{depends on path}, \\quad \\oint \\vec{F} \\cdot d\\vec{r} \\neq 0",
            details: "Examples: friction, air resistance. Work in closed loop ≠ 0.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Identify non-conservative forces", "Energy dissipated", "Work calculation for friction"],
            commonMistakes: ["Treating friction as conservative", "Ignoring in energy conservation", "Not calculating work by friction separately"],
            tips: "Friction removes mechanical energy (converted to heat). In energy equation: KE₁ + PE₁ = KE₂ + PE₂ + |W_friction|. Work by friction = -μmg × distance traveled."
        },
        {
            concept: "Potential Energy Function",
            uid: "WEP13",
            theory: "Potential energy as function of position.",
            formula: "F = -\\frac{dU}{dx}, \\quad U = -\\int F\\,dx",
            details: "Force is negative gradient of potential. Equilibrium where F = 0 (dU/dx = 0).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find force from U(x)", "Equilibrium positions", "Stability analysis"],
            commonMistakes: ["Forgetting negative sign", "Wrong integration limits", "Confusing stable with unstable equilibrium"],
            tips: "F = -dU/dx tells you force from potential curve. At minimum U: stable equilibrium. At maximum U: unstable equilibrium. Force points toward lower potential!"
        },

        // ============ CONSERVATION OF ENERGY ============
        {
            concept: "Conservation of Mechanical Energy",
            uid: "WEP14",
            theory: "Total mechanical energy is constant if only conservative forces do work.",
            formula: "KE_1 + PE_1 = KE_2 + PE_2",
            details: "ME = KE + PE = constant (when no non-conservative work).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find velocity at different heights", "Pendulum problems", "Roller coaster problems"],
            commonMistakes: ["Applying when friction exists", "Forgetting to include all PE terms", "Using at wrong points"],
            tips: "Only use when no friction/air resistance! Otherwise: KE₁ + PE₁ = KE₂ + PE₂ + W_nc. Choose two convenient points (like release point and lowest point)."
        },
        {
            concept: "Energy Conservation with Friction",
            uid: "WEP15",
            theory: "Mechanical energy decreases by work done against friction.",
            formula: "KE_1 + PE_1 = KE_2 + PE_2 + W_{friction}",
            details: "W_friction = μmgd is energy lost to heat.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Sliding with friction", "Block on rough incline", "Distance traveled before stopping"],
            commonMistakes: ["Forgetting to add friction work as loss", "Using wrong distance for friction", "Sign errors"],
            tips: "Energy lost to friction = μmg × (total distance traveled). Use |W_f| = μNd. Final ME = Initial ME - Energy lost to friction."
        },
        {
            concept: "Energy in Spring-Mass System",
            uid: "WEP16",
            theory: "Interconversion between kinetic and spring potential energy.",
            formula: "\\frac{1}{2}mv^2 + \\frac{1}{2}kx^2 = E_{total} = \\frac{1}{2}kA^2",
            details: "A = amplitude. At extreme: all PE. At mean position: all KE.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Speed at given position", "Maximum compression", "Amplitude from velocity"],
            commonMistakes: ["Wrong expression for total energy", "Confusing x with amplitude", "Not including both KE and PE"],
            tips: "At x = A: KE = 0, PE = ½kA². At x = 0: KE = ½kA², PE = 0. At any x: v = ω√(A² - x²). E_total = ½kA² = ½mv_max²."
        },
        {
            concept: "Vertical Spring with Mass",
            uid: "WEP17",
            theory: "Spring with hanging mass has equilibrium extension.",
            formula: "mg = kx_0 \\implies x_0 = \\frac{mg}{k}",
            details: "x₀ = equilibrium extension. Oscillation about this new equilibrium.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Equilibrium extension", "Oscillation amplitude", "Maximum extension when dropped"],
            commonMistakes: ["Using natural length as reference", "Forgetting x₀ in dropped mass problems", "Wrong energy equation setup"],
            tips: "If mass dropped from natural length: max extension = 2x₀ = 2mg/k (use energy conservation with gravity and spring PE). Amplitude of oscillation = x₀."
        },

        // ============ POWER ============
        {
            concept: "Power Definition",
            uid: "WEP18",
            theory: "Rate of doing work or energy transfer.",
            formula: "P = \\frac{dW}{dt} = \\frac{W}{t} = \\vec{F} \\cdot \\vec{v} = Fv\\cos\\theta",
            details: "Unit: Watt (W) = J/s. 1 HP = 746 W.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate power of engine", "Power from force and velocity", "Average vs instantaneous power"],
            commonMistakes: ["Confusing average and instantaneous power", "Forgetting cosine factor", "Wrong unit conversion"],
            tips: "P = Fv for F and v in same direction. 1 HP = 746 W ≈ 750 W. For car at constant v: Power = Friction × v = μmgv."
        },
        {
            concept: "Average Power",
            uid: "WEP19",
            theory: "Total work divided by total time.",
            formula: "P_{avg} = \\frac{W_{total}}{t_{total}} = \\frac{\\Delta E}{\\Delta t}",
            details: "Rate of energy transfer averaged over time interval.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Average power to lift object", "Motor efficiency", "Total energy from power and time"],
            commonMistakes: ["Using instantaneous values", "Confusing with peak power", "Wrong time in denominator"],
            tips: "P_avg = ΔE/Δt = Total Work/Total Time. For lifting m by height h in time t: P_avg = mgh/t. For motor: P_out = efficiency × P_in."
        },
        {
            concept: "Instantaneous Power",
            uid: "WEP20",
            theory: "Power at a specific instant.",
            formula: "P = \\frac{dW}{dt} = \\vec{F} \\cdot \\vec{v}",
            details: "Can vary with time. Equals F·v at that instant.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Power at given velocity", "When is power maximum?", "Power of gravity on falling body"],
            commonMistakes: ["Using average velocity", "Forgetting P can be negative", "Wrong angle between F and v"],
            tips: "P = Fv cosθ at any instant. For falling body under gravity: P = mgv = mg²t (increasing). Negative P means energy leaving the object."
        },
        {
            concept: "Power of Vehicle on Horizontal Road",
            uid: "WEP21",
            theory: "Power required to maintain constant velocity against friction.",
            formula: "P = fv = \\mu mgv \\quad (\\text{at constant } v)",
            details: "At constant velocity, driving force = friction.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Power to maintain speed", "Maximum speed for given power", "Acceleration with given power"],
            commonMistakes: ["Forgetting friction at constant v", "Wrong relation for acceleration phase", "Not using v_max = P/f"],
            tips: "At constant v: Driving force = Friction. P = (μmg)v. Maximum speed v_max = P/(μmg). During acceleration: ma = F - μmg = P/v - μmg."
        },
        {
            concept: "Power of Vehicle on Incline",
            uid: "WEP22",
            theory: "Power required to climb incline at constant velocity.",
            formula: "P = (mg\\sin\\theta + \\mu mg\\cos\\theta)v",
            details: "Must overcome both gravity component and friction.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Power to climb slope", "Maximum speed on incline", "Compare with horizontal"],
            commonMistakes: ["Forgetting friction term", "Wrong angle in sin and cos", "Not adding both resistive forces"],
            tips: "Resistive force = mg sinθ + μmg cosθ (gravity component + friction). P = Resistive × v. v_max = P / (mg sinθ + μmg cosθ)."
        },

        // ============ COLLISIONS ============
        {
            concept: "Types of Collisions",
            uid: "WEP23",
            theory: "Classification based on kinetic energy conservation.",
            formula: "\\begin{aligned} &\\text{Elastic: } KE_i = KE_f \\\\ &\\text{Inelastic: } KE_i > KE_f \\\\ &\\text{Perfectly inelastic: bodies stick} \\end{aligned}",
            details: "Momentum conserved in all collisions (if no external force). KE conserved only in elastic.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Identify type of collision", "KE loss in collision", "Verify collision type from data"],
            commonMistakes: ["Thinking momentum not conserved in inelastic", "Confusing perfectly inelastic with elastic", "Not checking KE conservation"],
            tips: "ALL collisions conserve momentum (if F_ext = 0). Only elastic conserves KE. Perfectly inelastic: max KE loss (bodies stick together). Real collisions are inelastic."
        },
        {
            concept: "Coefficient of Restitution",
            uid: "WEP24",
            theory: "Ratio of relative velocities after and before collision.",
            formula: "e = \\frac{v_2 - v_1}{u_1 - u_2} = \\frac{\\text{velocity of separation}}{\\text{velocity of approach}}",
            details: "e = 1 (elastic), 0 < e < 1 (inelastic), e = 0 (perfectly inelastic).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find e from velocities", "Velocities from e", "Ball bouncing problems"],
            commonMistakes: ["Wrong order in numerator/denominator", "Sign errors with velocities", "Confusing approach and separation"],
            tips: "e = (v₂ - v₁)/(u₁ - u₂). Approach: objects coming together. Separation: objects moving apart. For ball dropping: e = √(h_f/h_i) = v_f/v_i."
        },
        {
            concept: "Elastic Collision in 1D",
            uid: "WEP25",
            theory: "Both momentum and kinetic energy are conserved.",
            formula: "\\begin{aligned} &v_1 = \\frac{(m_1-m_2)u_1 + 2m_2u_2}{m_1+m_2} \\\\ &v_2 = \\frac{(m_2-m_1)u_2 + 2m_1u_1}{m_1+m_2} \\end{aligned}",
            details: "Special cases: equal masses exchange velocities. Heavy hits light: light moves at 2u₁.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Final velocities in elastic collision", "Equal mass collision", "Heavy-light collision"],
            commonMistakes: ["Wrong formula or wrong mass placement", "Not recognizing special cases", "Confusing u's and v's"],
            tips: "Equal masses: v₁ = u₂, v₂ = u₁ (exchange velocities). m₁ >> m₂ with u₂=0: v₂ ≈ 2u₁, v₁ ≈ u₁. m₁ << m₂ with u₂=0: v₁ ≈ -u₁, v₂ ≈ 0."
        },
        {
            concept: "Perfectly Inelastic Collision",
            uid: "WEP26",
            theory: "Objects stick together after collision.",
            formula: "m_1u_1 + m_2u_2 = (m_1 + m_2)v_{common}",
            details: "Maximum KE loss. v_common = (m₁u₁ + m₂u₂)/(m₁ + m₂)",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Common velocity after sticking", "KE loss calculation", "Ballistic pendulum"],
            commonMistakes: ["Trying to conserve KE", "Wrong common velocity formula", "Forgetting to calculate KE loss"],
            tips: "Bodies stick → same final velocity. KE_loss = ½μ(u₁-u₂)² where μ = m₁m₂/(m₁+m₂) is reduced mass. Ballistic pendulum: bullet sticks, then use energy for swing height."
        },
        {
            concept: "Loss of Kinetic Energy in Inelastic Collision",
            uid: "WEP27",
            theory: "KE lost in inelastic collision.",
            formula: "\\Delta KE = \\frac{1}{2}\\frac{m_1m_2}{m_1+m_2}(u_1-u_2)^2(1-e^2)",
            details: "For perfectly inelastic (e=0): maximum loss. For elastic (e=1): zero loss.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate KE loss", "Fraction of KE lost", "When is loss maximum?"],
            commonMistakes: ["Wrong reduced mass formula", "Using e incorrectly", "Forgetting (1-e²) factor"],
            tips: "KE_loss = ½μ(Δu)²(1-e²). For e=0: ΔKE = ½μ(Δu)² (maximum). For e=1: ΔKE = 0. Fraction lost = ΔKE/KE_initial."
        },
        {
            concept: "Collision in 2D",
            uid: "WEP28",
            theory: "Momentum conserved in each direction separately.",
            formula: "\\begin{aligned} &m_1u_{1x} + m_2u_{2x} = m_1v_{1x} + m_2v_{2x} \\\\ &m_1u_{1y} + m_2u_{2y} = m_1v_{1y} + m_2v_{2y} \\end{aligned}",
            details: "Resolve velocities into components. Apply conservation to each direction.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Oblique collision", "Scattering angles", "2D elastic collision"],
            commonMistakes: ["Not resolving into components", "Mixing x and y components", "Forgetting one conservation equation"],
            tips: "Use momentum conservation for x and y separately. For elastic: also KE conserved. For glancing collision with stationary target: angle between final velocities = 90° (elastic, equal masses)."
        },
        {
            concept: "Oblique Elastic Collision with Stationary Target",
            uid: "WEP29",
            theory: "Moving object hits stationary object at an angle.",
            formula: "\\theta_1 + \\theta_2 = 90° \\quad (\\text{equal masses})",
            details: "For equal masses, objects move perpendicular after elastic collision.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Scattering angles for equal masses", "Direction of recoil", "Pool ball collisions"],
            commonMistakes: ["Applying 90° rule for unequal masses", "Wrong angle measurement", "Forgetting this is only for elastic collision"],
            tips: "For m₁ = m₂, target initially at rest, elastic collision: final velocities are perpendicular! This is seen in pool/billiards. Doesn't apply if m₁ ≠ m₂."
        },
        {
            concept: "Explosion",
            uid: "WEP30",
            theory: "Single body breaks into parts - reverse of perfectly inelastic collision.",
            formula: "\\vec{p}_{initial} = \\sum \\vec{p}_{final}, \\quad \\sum m_i\\vec{v}_i = \\vec{P}_{original}",
            details: "Momentum conserved. KE increases (internal energy converted).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Bomb exploding at rest", "Rocket ejecting mass", "Two-piece explosion"],
            commonMistakes: ["Thinking KE is conserved", "Wrong momentum direction", "Not using vector addition"],
            tips: "Explosion: KE increases (chemical → KE). If originally at rest: Σmᵢvᵢ = 0, so COM doesn't move. For 2-piece: m₁v₁ = m₂v₂ (equal and opposite p)."
        },

        // ============ SPECIAL TOPICS ============
        {
            concept: "Ball Bouncing (Multiple Bounces)",
            uid: "WEP31",
            theory: "Height reached decreases with each bounce.",
            formula: "h_n = e^{2n} h_0, \\quad v_n = e^n v_0",
            details: "After n bounces: height = e^(2n) × initial height. e = coefficient of restitution.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Height after n bounces", "Total distance traveled", "Time for all bounces"],
            commonMistakes: ["Wrong power of e", "Forgetting e² for height", "Wrong summation for total distance"],
            tips: "h_n/h₀ = e^(2n). Total distance = h₀(1 + 2e² + 2e⁴ + ...) = h₀(1 + 2e²)/(1 - e²). Total time = √(2h₀/g) × (1 + 2e)/(1 - e)."
        },
        {
            concept: "Equilibrium from Potential Energy Curve",
            uid: "WEP32",
            theory: "Equilibrium where slope of U(x) is zero.",
            formula: "\\frac{dU}{dx} = 0 \\implies \\text{equilibrium}",
            details: "Minimum U: stable. Maximum U: unstable. Inflection: neutral.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Find equilibrium positions from U(x)", "Determine stability", "Force from potential curve"],
            commonMistakes: ["Confusing stable with unstable", "Not checking second derivative", "Wrong force direction from curve"],
            tips: "Stable: d²U/dx² > 0 (minimum, bowl shape). Unstable: d²U/dx² < 0 (maximum, hill shape). Force pushes system toward stable equilibrium."
        },
        {
            concept: "Escape from Potential Well",
            uid: "WEP33",
            theory: "Minimum energy needed to escape a potential energy configuration.",
            formula: "E_{escape} = U(\\infty) - U_{minimum}",
            details: "Total energy must be ≥ U(∞) for escape.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Energy to escape gravitational field", "Particle in potential well", "Threshold KE for escape"],
            commonMistakes: ["Using wrong reference for U", "Forgetting KE at infinity can be 0", "Not considering turning points"],
            tips: "At infinity: usually U = 0. Escape when E_total ≥ 0. If E_total < 0: bound state (particle oscillates in well). E_total = 0: just escapes with v = 0 at infinity."
        },
        {
            concept: "Maximum Height in Vertical Throw",
            uid: "WEP34",
            theory: "Using energy conservation for vertical motion.",
            formula: "\\frac{1}{2}mv^2 = mgh \\implies h = \\frac{v^2}{2g}",
            details: "All KE converts to PE at maximum height.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Maximum height from initial velocity", "Initial velocity for given height", "Compare heights for different v"],
            commonMistakes: ["Forgetting all KE → PE at top", "Wrong factor of 2", "Not using energy when easier than kinematics"],
            tips: "At max height: v = 0, so ½mv² = mgh → h = v²/2g. This is from h = u²/2g (kinematics). Energy method often simpler than kinematics!"
        },
        {
            concept: "Velocity at Bottom of Incline",
            uid: "WEP35",
            theory: "Using energy conservation for motion on incline.",
            formula: "mgh = \\frac{1}{2}mv^2 \\implies v = \\sqrt{2gh}",
            details: "Without friction, speed at bottom independent of incline angle.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Speed at bottom from height", "Compare speeds for different angles", "With friction modification"],
            commonMistakes: ["Thinking angle affects final speed", "Not including friction work when present", "Confusing height with incline length"],
            tips: "Without friction: v = √(2gh) depends only on height, not path or angle! With friction: mgh = ½mv² + μmg cosθ × L, where L = h/sinθ."
        },
        {
            concept: "Energy in Pendulum",
            uid: "WEP36",
            theory: "Interconversion of KE and PE in pendulum oscillation.",
            formula: "E_{total} = mgh_{max} = \\frac{1}{2}mv_{max}^2",
            details: "At extreme: all PE. At lowest point: all KE. h_max = L(1 - cosθ).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Speed at lowest point", "Maximum angle from speed", "Tension at lowest point"],
            commonMistakes: ["Wrong height formula", "Forgetting L(1-cosθ) for height", "Not using energy for velocity calculation"],
            tips: "h = L(1 - cosθ) from lowest point. v_bottom = √(2gL(1-cosθ)). For small θ: cosθ ≈ 1 - θ²/2, so h ≈ Lθ²/2. Tension at bottom = mg + mv²/L."
        }
    ]
};

export default workEnergyPower;
