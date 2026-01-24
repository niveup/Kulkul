/**
 * JEE Rotational Motion
 * Class 11 Physics - Chapter: System of Particles and Rotational Motion
 * 
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 */

export const rotationalMotion = {
    topic: "Rotational Motion",
    concepts: [
        // ============ CENTER OF MASS ============
        {
            concept: "Center of Mass Definition",
            uid: "ROT01",
            theory: "Point where entire mass of system can be considered concentrated.",
            formula: "\\vec{r}_{cm} = \\frac{\\sum m_i \\vec{r}_i}{\\sum m_i} = \\frac{m_1\\vec{r}_1 + m_2\\vec{r}_2 + ...}{m_1 + m_2 + ...}",
            details: "For continuous body: r_cm = ∫r dm / ∫dm. COM may lie outside the body.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find COM of discrete masses", "COM of uniform shapes", "COM outside body (ring, shell)"],
            commonMistakes: ["Forgetting vector nature of position", "Wrong mass weighting", "Assuming COM is always inside body"],
            tips: "x_cm = Σmᵢxᵢ/Σmᵢ, similarly for y and z. COM of uniform symmetric body is at geometric center. Semi-circle: 4R/3π from center. Hemisphere: 3R/8 from base."
        },
        {
            concept: "Center of Mass of Two Particles",
            uid: "ROT02",
            theory: "Position of COM between two point masses.",
            formula: "x_{cm} = \\frac{m_1 x_1 + m_2 x_2}{m_1 + m_2}, \\quad d_1 : d_2 = m_2 : m_1",
            details: "COM divides the line joining masses in inverse ratio of masses.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Position of COM", "Distance from each mass", "Earth-Moon system COM"],
            commonMistakes: ["Ratio in direct proportion instead of inverse", "Wrong reference point", "Forgetting lighter mass is farther from COM"],
            tips: "COM closer to heavier mass. If m₁ = m₂, COM is midpoint. Distance from m₁ to COM = m₂d/(m₁+m₂). Distance from m₂ to COM = m₁d/(m₁+m₂)."
        },
        {
            concept: "Center of Mass of Common Shapes",
            uid: "ROT03",
            theory: "COM positions for standard uniform bodies.",
            formula: "\\begin{aligned} &\\text{Semicircular ring: } \\frac{2R}{\\pi} \\text{ from center} \\\\ &\\text{Semicircular disc: } \\frac{4R}{3\\pi} \\text{ from center} \\end{aligned}",
            details: "Hemisphere (solid): 3R/8 from base. Hemispherical shell: R/2 from base. Cone: h/4 from base.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Locate COM of given shape", "Combined shapes COM", "Cavity problems"],
            commonMistakes: ["Confusing ring with disc values", "Wrong formula for 3D vs 2D shapes", "Not using subtraction for cavities"],
            tips: "Memorize: Ring = 2R/π, Disc = 4R/3π, Hemi-shell = R/2, Hemisphere = 3R/8, Cone = h/4, Hollow cone = h/3. For cavity: treat as negative mass!"
        },
        {
            concept: "Center of Mass with Cavity",
            uid: "ROT04",
            theory: "Finding COM when part of uniform body is removed.",
            formula: "\\vec{r}_{cm} = \\frac{M_{full}\\vec{r}_{full} - m_{cavity}\\vec{r}_{cavity}}{M_{full} - m_{cavity}}",
            details: "Treat cavity as negative mass. Subtract its contribution.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Disc with circular hole", "Sphere with spherical cavity", "Rectangle with corner removed"],
            commonMistakes: ["Adding instead of subtracting cavity", "Wrong cavity mass calculation", "Using wrong COM for cavity"],
            tips: "Cavity method: x_cm = (M×X - m×x)/(M-m). M = mass of full body, X = COM of full body. m = mass that would fill cavity, x = COM of cavity."
        },
        {
            concept: "Motion of Center of Mass",
            uid: "ROT05",
            theory: "COM moves as if all mass and external forces were concentrated there.",
            formula: "M\\vec{a}_{cm} = \\vec{F}_{ext}, \\quad \\vec{v}_{cm} = \\frac{\\sum m_i \\vec{v}_i}{M}",
            details: "Internal forces don't affect COM motion. Only external forces matter.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Velocity of COM", "Acceleration of COM", "Projectile explosion"],
            commonMistakes: ["Including internal forces", "Wrong total mass", "Not using vector sum of momenta"],
            tips: "If F_ext = 0: v_cm = constant (even if parts are moving!). Bomb exploding in air: COM follows original parabolic path. Two people on boat: boat moves but COM stays fixed."
        },
        {
            concept: "Center of Mass Frame",
            uid: "ROT06",
            theory: "Reference frame moving with COM where total momentum is zero.",
            formula: "\\sum m_i \\vec{v}'_i = 0 \\quad (\\text{in COM frame})",
            details: "Velocities in COM frame: v'ᵢ = vᵢ - v_cm. Useful for collision analysis.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Convert to COM frame", "Collision in COM frame", "KE in COM frame"],
            commonMistakes: ["Not subtracting v_cm correctly", "Thinking COM frame is always at rest", "Wrong transformation of KE"],
            tips: "In COM frame: total momentum = 0, so particles approach and recede with equal and opposite momenta. Makes collision analysis symmetric!"
        },

        // ============ MOMENT OF INERTIA ============
        {
            concept: "Moment of Inertia Definition",
            uid: "ROT07",
            theory: "Rotational analog of mass - resistance to rotational acceleration.",
            formula: "I = \\sum m_i r_i^2 = \\int r^2 \\, dm",
            details: "Depends on mass distribution and axis of rotation. Unit: kg·m²",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate I for point masses", "Compare I for different axes", "I for continuous body"],
            commonMistakes: ["Using distance instead of perpendicular distance", "Forgetting I depends on axis", "Wrong limits in integration"],
            tips: "I = Σmᵢrᵢ² where rᵢ = perpendicular distance from axis. Same body has different I for different axes. I is always positive!"
        },
        {
            concept: "Moment of Inertia - Ring",
            uid: "ROT08",
            theory: "MOI of thin ring about different axes.",
            formula: "\\begin{aligned} &I_{center,\\perp} = MR^2 \\\\ &I_{diameter} = \\frac{MR^2}{2} \\\\ &I_{tangent,\\perp} = 2MR^2 \\end{aligned}",
            details: "All mass at distance R from center axis.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["I about central axis", "I about diameter", "I about tangent"],
            commonMistakes: ["Confusing ring with disc", "Wrong axis specification", "Forgetting parallel axis theorem application"],
            tips: "Ring: I_⊥center = MR². I_diameter = MR²/2 (half the perpendicular). I_tangent⊥ = MR² + MR² = 2MR² (parallel axis)."
        },
        {
            concept: "Moment of Inertia - Disc/Cylinder",
            uid: "ROT09",
            theory: "MOI of uniform disc or solid cylinder.",
            formula: "\\begin{aligned} &I_{center,\\perp} = \\frac{MR^2}{2} \\\\ &I_{diameter} = \\frac{MR^2}{4} \\\\ &I_{tangent,\\perp} = \\frac{3MR^2}{2} \\end{aligned}",
            details: "Mass distributed from center to edge. Cylinder along axis same as disc.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["I of disc about center", "Rotating wheel", "I about edge"],
            commonMistakes: ["Confusing disc with ring", "Using R² instead of R²/2", "Wrong factor for diameter"],
            tips: "Disc: I_⊥center = MR²/2 (half of ring). I_diameter = MR²/4. I_edge⊥ = MR²/2 + MR² = 3MR²/2. Solid cylinder has same I as disc about its axis."
        },
        {
            concept: "Moment of Inertia - Sphere",
            uid: "ROT10",
            theory: "MOI of solid and hollow spheres.",
            formula: "\\begin{aligned} &I_{solid} = \\frac{2MR^2}{5} \\\\ &I_{shell} = \\frac{2MR^2}{3} \\end{aligned}",
            details: "Solid sphere: mass distributed throughout. Shell: mass on surface only.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["I of Earth", "Rolling sphere", "Hollow vs solid comparison"],
            commonMistakes: ["Confusing 2/5 with 2/3", "Forgetting shell has more I than solid", "Wrong formula for hemisphere"],
            tips: "Solid sphere: 2MR²/5. Hollow shell: 2MR²/3 (larger because mass farther from axis). Remember: shell > solid for same M and R."
        },
        {
            concept: "Moment of Inertia - Rod",
            uid: "ROT11",
            theory: "MOI of thin uniform rod.",
            formula: "\\begin{aligned} &I_{center,\\perp} = \\frac{ML^2}{12} \\\\ &I_{end,\\perp} = \\frac{ML^2}{3} \\end{aligned}",
            details: "L = length of rod. About center is minimum.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["I about center", "I about one end", "Physical pendulum with rod"],
            commonMistakes: ["Confusing L²/12 with L²/3", "Wrong axis (must be perpendicular to rod)", "Not applying parallel axis theorem"],
            tips: "Rod: I_center = ML²/12, I_end = ML²/3 = ML²/12 + M(L/2)² (parallel axis). Ratio = 1:4. End has 4× the center value!"
        },
        {
            concept: "Parallel Axis Theorem",
            uid: "ROT12",
            theory: "MOI about any axis parallel to axis through COM.",
            formula: "I = I_{cm} + Md^2",
            details: "d = distance between parallel axes. I is minimum about COM axis.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["I about shifted axis", "I about tangent", "Compare I at different points"],
            commonMistakes: ["Using for non-parallel axes", "Wrong d measurement", "Forgetting I_cm term"],
            tips: "Always: I_any = I_cm + Md². First find I_cm, then add Md². Works for any body, any parallel axis. I is minimum about COM!"
        },
        {
            concept: "Perpendicular Axis Theorem",
            uid: "ROT13",
            theory: "For planar (2D) bodies: sum of MOI about perpendicular in-plane axes.",
            formula: "I_z = I_x + I_y",
            details: "Only for LAMINAR (flat) bodies. z-axis perpendicular to plane.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["I of disc about diameter", "I of rectangular plate", "Ring about diameter"],
            commonMistakes: ["Applying to 3D bodies (invalid!)", "Wrong axis labeling", "Using for non-planar shapes"],
            tips: "ONLY for flat bodies (ring, disc, plate)! I_⊥ = I_x + I_y. Example: For disc, I_diameter + I_diameter = I_⊥, so I_diameter = I_⊥/2 = MR²/4."
        },
        {
            concept: "Radius of Gyration",
            uid: "ROT14",
            theory: "Distance from axis at which all mass could be concentrated for same I.",
            formula: "I = Mk^2 \\implies k = \\sqrt{\\frac{I}{M}}",
            details: "k has units of length. Depends on shape and axis.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Find k for given body", "Compare k for different shapes", "Uniform rod vs ring k"],
            commonMistakes: ["Confusing k with distance to COM", "Wrong I in formula", "Not recognizing k² = I/M"],
            tips: "k = √(I/M). For ring (axis through center): k = R. For disc: k = R/√2. For rod about center: k = L/√12. Smaller k means easier to rotate."
        },

        // ============ TORQUE AND ANGULAR MOMENTUM ============
        {
            concept: "Torque (Moment of Force)",
            uid: "ROT15",
            theory: "Rotational analog of force - causes angular acceleration.",
            formula: "\\vec{\\tau} = \\vec{r} \\times \\vec{F}, \\quad \\tau = rF\\sin\\theta = r_\\perp F = rF_\\perp",
            details: "τ = r × F. Direction by right-hand rule. Unit: N·m",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate torque", "Net torque in equilibrium", "Direction of torque"],
            commonMistakes: ["Using r instead of r_⊥", "Wrong sign/direction of torque", "Confusing with work (same unit but different)"],
            tips: "τ = rF sinθ = (lever arm) × F. Lever arm = perpendicular distance from axis to force line. For equilibrium: Στ = 0. Clockwise usually negative."
        },
        {
            concept: "Relation Between Torque and Angular Acceleration",
            uid: "ROT16",
            theory: "Newton's second law for rotation.",
            formula: "\\tau = I\\alpha",
            details: "Analog of F = ma. τ about axis, I about same axis, α about same axis.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find α from torque", "Torque to produce given α", "Pulley problems"],
            commonMistakes: ["Using wrong I (must be about rotation axis)", "Sign mismatch between τ and α", "Forgetting to sum all torques"],
            tips: "τ = Iα is rotational F = ma. Net τ = Iα. For pulley: τ = TR = Iα_pulley. Be consistent with axis and signs!"
        },
        {
            concept: "Angular Momentum",
            uid: "ROT17",
            theory: "Rotational analog of linear momentum.",
            formula: "\\vec{L} = \\vec{r} \\times \\vec{p} = I\\vec{\\omega}",
            details: "For particle: L = mvr sinθ = mvr_⊥. For rigid body: L = Iω.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Angular momentum of particle", "L of rotating body", "L about different points"],
            commonMistakes: ["Confusing L = Iω (rigid body) with L = mvr (particle)", "Wrong r in L = mvr", "Forgetting L is a vector"],
            tips: "Particle: L = mvr sinθ (r from axis to particle, θ between r and v). Rigid body: L = Iω. Both are vectors along axis of rotation (right-hand rule)."
        },
        {
            concept: "Conservation of Angular Momentum",
            uid: "ROT18",
            theory: "When no external torque acts, angular momentum is conserved.",
            formula: "\\text{If } \\tau_{ext} = 0: \\quad L = I\\omega = \\text{constant}",
            details: "I₁ω₁ = I₂ω₂. Changing I changes ω. Examples: ice skater, diver.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Ice skater spinning", "Star collapse", "Disc with dropped mass"],
            commonMistakes: ["Applying when τ_ext ≠ 0", "Confusing with linear momentum conservation", "Wrong axis for I calculation"],
            tips: "τ_ext = 0 → L = Iω = constant. If I increases, ω decreases (and vice versa). Skater pulls arms in: I↓, ω↑ (spins faster). L conservation is about a fixed axis!"
        },
        {
            concept: "Relation: Torque and Angular Momentum",
            uid: "ROT19",
            theory: "Torque is rate of change of angular momentum.",
            formula: "\\vec{\\tau} = \\frac{d\\vec{L}}{dt}",
            details: "Rotational analog of F = dp/dt. If τ = 0, L is constant.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Rate of change of L", "Impulse-momentum theorem (angular)", "Variable torque problems"],
            commonMistakes: ["Confusing with L = Iω", "Not recognizing this as Newton's second law form", "Wrong differentiation"],
            tips: "τ = dL/dt is rotational analog of F = dp/dt. For constant I: τ = I(dω/dt) = Iα. Angular impulse = ∫τ dt = ΔL."
        },
        {
            concept: "Angular Impulse",
            uid: "ROT20",
            theory: "Change in angular momentum equals angular impulse.",
            formula: "J = \\int \\tau \\, dt = \\Delta L = L_f - L_i",
            details: "Angular analog of linear impulse. Area under τ-t graph.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Impulsive torque", "Change in ω from impulse", "Collision with rotating body"],
            commonMistakes: ["Confusing with linear impulse", "Wrong time interval", "Not using angular impulse for sudden forces"],
            tips: "Angular impulse J = ∫τ dt = ΔL. For sudden torque: J = τ_avg × Δt. Just like J = Δp for linear motion."
        },

        // ============ ROTATIONAL DYNAMICS ============
        {
            concept: "Rotational Kinetic Energy",
            uid: "ROT21",
            theory: "Kinetic energy due to rotation.",
            formula: "KE_{rot} = \\frac{1}{2}I\\omega^2",
            details: "Rotational analog of ½mv². For rolling: total KE = translational + rotational.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["KE of spinning wheel", "Energy in flywheel", "Compare KE for same ω, different I"],
            commonMistakes: ["Using linear v instead of ω", "Forgetting rotational KE in rolling", "Wrong I for given axis"],
            tips: "KE_rot = ½Iω². For rolling body: KE_total = ½mv² + ½Iω². Total = ½mv²(1 + k²/R²) where I = Mk²."
        },
        {
            concept: "Work-Energy Theorem (Rotational)",
            uid: "ROT22",
            theory: "Work by torque equals change in rotational kinetic energy.",
            formula: "W = \\int \\tau \\, d\\theta = \\Delta KE_{rot} = \\frac{1}{2}I\\omega_f^2 - \\frac{1}{2}I\\omega_i^2",
            details: "Rotational work = τ × θ (for constant torque).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Work to spin up wheel", "Energy delivered by motor", "Braking work"],
            commonMistakes: ["Using distance instead of angle", "Forgetting angle must be in radians", "Wrong sign for braking"],
            tips: "W = τθ (constant torque, θ in radians). Power = τω. For variable τ: integrate. Work = change in rotational KE."
        },
        {
            concept: "Power in Rotational Motion",
            uid: "ROT23",
            theory: "Rate of rotational work.",
            formula: "P = \\tau\\omega = \\frac{dW}{dt}",
            details: "Rotational analog of P = Fv. Unit: Watt.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Motor power", "Power at given ω", "Engine torque from power and rpm"],
            commonMistakes: ["Using linear velocity", "Confusing ω (rad/s) with rpm", "Wrong torque about axis"],
            tips: "P = τω. Convert rpm to rad/s: ω = 2πn/60 where n = rpm. For motor: P = τ × (2πn/60). Torque in N·m, ω in rad/s → P in Watts."
        },
        {
            concept: "Equations of Rotational Motion",
            uid: "ROT24",
            theory: "Kinematic equations for rotation (constant α).",
            formula: "\\omega = \\omega_0 + \\alpha t, \\quad \\theta = \\omega_0 t + \\frac{1}{2}\\alpha t^2, \\quad \\omega^2 = \\omega_0^2 + 2\\alpha\\theta",
            details: "Analogs of linear kinematic equations. θ in radians.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Angle rotated", "Final angular velocity", "Time to stop rotating wheel"],
            commonMistakes: ["Forgetting θ must be in radians", "Using revolutions instead of radians", "Wrong sign for deceleration"],
            tips: "Same form as v = u + at, etc. Replace v→ω, u→ω₀, s→θ, a→α. Revolutions = θ/2π. For stopping: ω² = ω₀² + 2α(θ), with α negative."
        },

        // ============ ROLLING MOTION ============
        {
            concept: "Pure Rolling Condition",
            uid: "ROT25",
            theory: "Condition for rolling without slipping.",
            formula: "v_{cm} = R\\omega, \\quad a_{cm} = R\\alpha",
            details: "Point of contact is instantaneously at rest. No relative motion = no kinetic friction.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Verify pure rolling", "Velocity of different points on wheel", "Friction direction in rolling"],
            commonMistakes: ["Slipping when v ≠ Rω", "Wrong direction of friction", "Confusing rolling friction with kinetic friction"],
            tips: "Pure rolling: v = Rω (center speed = radius × angular speed). Top of wheel: 2v. Bottom (contact): 0. Friction is static (no slipping)!"
        },
        {
            concept: "Kinetic Energy in Rolling",
            uid: "ROT26",
            theory: "Total KE = translational + rotational.",
            formula: "KE = \\frac{1}{2}mv^2 + \\frac{1}{2}I\\omega^2 = \\frac{1}{2}mv^2\\left(1 + \\frac{k^2}{R^2}\\right)",
            details: "For rolling: ω = v/R. Use I = Mk² for different shapes.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Total KE of rolling object", "Ratio of rotational to translational KE", "Compare different rolling shapes"],
            commonMistakes: ["Forgetting rotational component", "Wrong I or k", "Not using v = Rω"],
            tips: "KE_rot/KE_trans = k²/R² = I/(MR²). For solid sphere: 2/5, disc: 1/2, ring: 1. Ring has most rotational KE for same v."
        },
        {
            concept: "Rolling Down Incline",
            uid: "ROT27",
            theory: "Acceleration and velocity of rolling body on incline.",
            formula: "a = \\frac{g\\sin\\theta}{1 + I/(MR^2)} = \\frac{g\\sin\\theta}{1 + k^2/R^2}",
            details: "v at bottom = √(2gh/(1 + k²/R²)). Less than sliding (some energy in rotation).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Acceleration of rolling cylinder", "Velocity at bottom", "Compare sphere vs disc rolling"],
            commonMistakes: ["Using a = g sinθ (that's for sliding)", "Wrong I for shape", "Forgetting I/(MR²) term"],
            tips: "a = g sinθ/(1 + k²/R²). Solid sphere: k²/R² = 2/5 → a = (5/7)g sinθ. Disc: k²/R² = 1/2 → a = (2/3)g sinθ. Ring: a = (1/2)g sinθ. Sphere is fastest!"
        },
        {
            concept: "Friction in Pure Rolling",
            uid: "ROT28",
            theory: "Role of friction in maintaining pure rolling.",
            formula: "f = \\frac{Mg\\sin\\theta \\cdot I/R^2}{M + I/R^2} = \\frac{Ma \\cdot k^2/R^2}{1 + k^2/R^2}",
            details: "Friction provides torque for angular acceleration. Direction: up the incline (opposes tendency to slip).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find friction for rolling body", "Maximum angle for pure rolling", "Direction of friction"],
            commonMistakes: ["Thinking friction opposes motion (it enables rolling!)", "Wrong direction", "Using kinetic instead of static friction"],
            tips: "Friction prevents slipping, acts up the incline. f = Mg sinθ/(1 + MR²/I). For pure rolling: f ≤ μN. Max angle: tanθ_max = μ(1 + MR²/I)."
        },
        {
            concept: "Angular Momentum in Rolling",
            uid: "ROT29",
            theory: "Total angular momentum about a point on ground.",
            formula: "L = I_{cm}\\omega + Mv_{cm}R = MvR\\left(1 + \\frac{k^2}{R^2}\\right)",
            details: "About point on ground: includes both rotation about COM and COM motion.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["L about contact point", "L about center", "Conservation in rolling"],
            commonMistakes: ["Forgetting Mvr term", "Using wrong point for L calculation", "Not including both contributions"],
            tips: "About COM: L = Iω. About ground contact point: L = Iω + MvR (parallel axis effectively). For pure rolling: use v = Rω to simplify."
        },
        {
            concept: "Instantaneous Axis of Rotation",
            uid: "ROT30",
            theory: "In pure rolling, the instantaneous axis is at the contact point.",
            formula: "I_{contact} = I_{cm} + MR^2",
            details: "Can treat rolling as pure rotation about contact point instantaneously.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Velocity of wheel points", "KE using contact axis", "Angular momentum about contact"],
            commonMistakes: ["Thinking axis is at center", "Wrong I calculation", "Not using parallel axis theorem"],
            tips: "Using contact point as axis: every point rotates about it! Top has speed = 2v, sides have speed = √2 v at 45°. KE = ½I_contact ω²."
        },
        {
            concept: "Rolling with Slipping",
            uid: "ROT31",
            theory: "When sliding and rolling occur together.",
            formula: "f_k = \\mu_k N, \\quad v \\neq R\\omega",
            details: "Kinetic friction acts until v = Rω is achieved (pure rolling begins).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Time to achieve pure rolling", "Velocity when pure rolling starts", "Energy lost to friction"],
            commonMistakes: ["Using static friction during slipping", "Wrong direction of friction", "Not solving simultaneous equations"],
            tips: "If v > Rω: friction backward (slows translation, speeds rotation). If v < Rω: friction forward. Solve v = u - μgt and ω = ω₀ + (μmgR/I)t until v = Rω."
        },

        // ============ EQUILIBRIUM ============
        {
            concept: "Equilibrium of Rigid Body",
            uid: "ROT32",
            theory: "Conditions for static equilibrium of extended body.",
            formula: "\\sum \\vec{F} = 0 \\quad \\text{and} \\quad \\sum \\vec{\\tau} = 0",
            details: "No net force (no translation) and no net torque (no rotation).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Ladder problems", "Beam with weights", "Suspended body equilibrium"],
            commonMistakes: ["Forgetting torque condition", "Choosing unhelpful pivot point", "Missing forces in FBD"],
            tips: "ΣF = 0 gives equations for force balance. Στ = 0 about ANY point (choose wisely to eliminate unknowns). Good pivot: where unknown force acts!"
        },
        {
            concept: "Couple",
            uid: "ROT33",
            theory: "Two equal and opposite forces acting at different points.",
            formula: "\\tau_{couple} = F \\times d",
            details: "d = perpendicular distance between force lines. Produces pure rotation.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Torque of couple", "Resultant of couple", "Equilibrium with couple"],
            commonMistakes: ["Thinking couple produces translation", "Wrong distance between forces", "Confusing with moment of a force"],
            tips: "Couple = pure torque (no net force). Same torque about ANY point! τ = F × (arm length). Used in steering wheels, bottle caps."
        },
        {
            concept: "Toppling vs Sliding",
            uid: "ROT34",
            theory: "Determining whether object will slide or topple first.",
            formula: "\\text{Topple: } \\mu_s > \\frac{a}{2h}, \\quad \\text{Slide: } \\mu_s < \\frac{a}{2h}",
            details: "a = base width, h = height of COM. Compare μs with geometric ratio.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Will block topple or slide?", "Critical coefficient for toppling", "Incline angle for toppling"],
            commonMistakes: ["Wrong comparison condition", "Using wrong dimensions", "Not considering torque about edge"],
            tips: "If μ is high enough to prevent sliding, check for toppling! Block topples when COM goes past edge. On incline: topple if tanθ > a/(2h)."
        },

        // ============ SPECIAL APPLICATIONS ============
        {
            concept: "Physical Pendulum",
            uid: "ROT35",
            theory: "Rigid body oscillating about fixed axis.",
            formula: "T = 2\\pi\\sqrt{\\frac{I}{Mgd}}",
            details: "d = distance from pivot to COM. I about pivot axis.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Time period of rod pendulum", "Compare with simple pendulum", "Minimum T for given body"],
            commonMistakes: ["Using I about COM instead of pivot", "Wrong d value", "Confusing with simple pendulum formula"],
            tips: "T = 2π√(I_pivot/Mgd). For rod about end: I = ML²/3, d = L/2 → T = 2π√(2L/3g). Equivalent simple pendulum length = I/(Md)."
        },
        {
            concept: "Angular Momentum of Particle About Axis",
            uid: "ROT36",
            theory: "L of particle moving in straight line about fixed point.",
            formula: "L = mvr\\sin\\theta = mv \\times r_\\perp",
            details: "r_⊥ = perpendicular distance from axis to velocity line.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["L of moving particle about point", "Conservation in central forces", "L for projectile about origin"],
            commonMistakes: ["Using r instead of r_⊥", "Wrong angle θ", "Forgetting L is constant for straight line motion"],
            tips: "For particle moving in straight line, L about any point on line = 0. L about point not on line is constant (if no external torque). L = mvr⊥."
        },
        {
            concept: "Moment of Inertia - Composite Bodies",
            uid: "ROT37",
            theory: "I of combined shapes equals sum of individual I's.",
            formula: "I_{total} = I_1 + I_2 + I_3 + ...",
            details: "Each I calculated about the SAME axis. Use parallel axis theorem if needed.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["I of rod with masses attached", "I of system of discs", "I with cavity"],
            commonMistakes: ["Adding I's about different axes", "Forgetting to use parallel axis theorem", "Wrong mass distribution"],
            tips: "Add I's about the SAME axis. If shapes have different axes, use parallel axis theorem first to shift all to common axis, then add."
        }
    ]
};

export default rotationalMotion;
