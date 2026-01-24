/**
 * JEE Laws of Motion
 * Class 11 Physics - Chapter: Laws of Motion
 * 
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 */

export const lawsOfMotion = {
    topic: "Laws of Motion",
    concepts: [
        // ============ NEWTON'S LAWS ============
        {
            concept: "Newton's First Law (Inertia)",
            uid: "LOM01",
            theory: "A body continues in its state of rest or uniform motion unless acted upon by an external force.",
            formula: "\\text{If } \\vec{F}_{net} = 0 \\implies \\vec{v} = \\text{constant}",
            details: "Defines inertia - resistance to change in motion. Valid only in inertial frames.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Identify inertial frames", "Explain everyday phenomena using inertia", "Pseudo force problems"],
            commonMistakes: ["Applying in non-inertial frames without pseudo force", "Thinking 'rest' and 'motion' are fundamentally different", "Confusing inertia with momentum"],
            tips: "Inertia ∝ mass. Heavier objects have more inertia. An accelerating car is NOT inertial frame - you feel pushed back (pseudo force). Earth is approximately inertial for most problems."
        },
        {
            concept: "Newton's Second Law",
            uid: "LOM02",
            theory: "Rate of change of momentum equals the net external force.",
            formula: "\\vec{F} = \\frac{d\\vec{p}}{dt} = m\\vec{a} \\quad (\\text{if } m = \\text{const})",
            details: "F = ma is special case when mass is constant. Force and acceleration are vectors in same direction.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find acceleration from forces", "Multi-body problems", "Variable mass systems"],
            commonMistakes: ["Using F = ma when mass changes (rockets)", "Forgetting force is a vector", "Not considering all forces"],
            tips: "F = dp/dt is the general form. For constant mass: F = ma. For rockets: F = v(dm/dt). Always draw FBD, resolve into components!"
        },
        {
            concept: "Newton's Third Law",
            uid: "LOM03",
            theory: "Every action has an equal and opposite reaction.",
            formula: "\\vec{F}_{12} = -\\vec{F}_{21}",
            details: "Action and reaction act on DIFFERENT bodies, are equal in magnitude, opposite in direction, and simultaneous.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Identify action-reaction pairs", "Explain walking/swimming", "Contact force problems"],
            commonMistakes: ["Confusing with equilibrium forces (which act on same body)", "Thinking action causes reaction (they're simultaneous)", "Wrong body identification"],
            tips: "Action-reaction pairs: (1) Same type of force, (2) Different bodies, (3) Same magnitude, (4) Opposite direction. Example: Earth pulls you (weight), you pull Earth (equal force!)."
        },
        {
            concept: "Momentum",
            uid: "LOM04",
            theory: "Product of mass and velocity, measure of motion.",
            formula: "\\vec{p} = m\\vec{v}",
            details: "Unit: kg·m/s. Momentum is a vector in the direction of velocity.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate momentum", "Change in momentum", "Momentum in collisions"],
            commonMistakes: ["Treating momentum as scalar", "Confusing with kinetic energy", "Forgetting direction matters"],
            tips: "Momentum is vector, KE is scalar. Same momentum doesn't mean same KE! If p is same: KE = p²/2m, so lighter object has more KE."
        },
        {
            concept: "Impulse",
            uid: "LOM05",
            theory: "Change in momentum equals impulse (force × time).",
            formula: "\\vec{J} = \\vec{F}\\Delta t = \\Delta\\vec{p} = \\vec{p}_f - \\vec{p}_i",
            details: "For variable force: J = ∫F dt. Area under F-t graph gives impulse.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate impulse from F-t graph", "Impulse in collisions", "Average force from impulse"],
            commonMistakes: ["Confusing impulse with force", "Not using area under F-t curve", "Forgetting impulse is a vector"],
            tips: "Impulse = change in momentum. Large force for short time = small force for long time (same impulse). Airbags increase Δt to reduce F for same Δp."
        },
        {
            concept: "Conservation of Momentum",
            uid: "LOM06",
            theory: "Total momentum of an isolated system remains constant.",
            formula: "\\vec{p}_{before} = \\vec{p}_{after} \\implies \\sum m_i\\vec{v}_i = \\sum m_i\\vec{v}'_i",
            details: "Valid when net external force is zero. Applies to explosions, collisions, recoil.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Recoil of gun", "Collision problems", "Explosion problems"],
            commonMistakes: ["Applying when external forces exist", "Forgetting momentum is a vector", "Not defining system properly"],
            tips: "If F_ext = 0, momentum is conserved even if internal forces exist. For gun recoil: m_gun × v_gun = m_bullet × v_bullet. Conservation is along each axis separately!"
        },

        // ============ FREE BODY DIAGRAMS ============
        {
            concept: "Free Body Diagram (FBD)",
            uid: "LOM07",
            theory: "Diagram showing all forces acting on a single body.",
            formula: "\\sum \\vec{F} = m\\vec{a}",
            details: "Include: weight, normal, friction, tension, applied forces. Exclude: forces ON other bodies.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Draw FBD for given situation", "Identify missing forces", "Analyze equilibrium from FBD"],
            commonMistakes: ["Including forces the body exerts on others", "Missing weight (always present)", "Drawing incorrect normal force direction"],
            tips: "Steps: (1) Isolate the body, (2) Draw weight (mg downward), (3) Add contact forces (N, f) at contact points, (4) Add tension, applied forces. N is always ⊥ to surface!"
        },
        {
            concept: "Equilibrium of Forces",
            uid: "LOM08",
            theory: "Body in equilibrium when net force and net torque are zero.",
            formula: "\\sum \\vec{F} = 0 \\quad \\text{and} \\quad \\sum \\vec{\\tau} = 0",
            details: "Static equilibrium: at rest. Dynamic equilibrium: constant velocity.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find unknown force for equilibrium", "Ladder problems", "Concurrent forces"],
            commonMistakes: ["Forgetting torque condition for extended bodies", "Confusing equilibrium with no forces", "Not resolving forces properly"],
            tips: "For point object: ΣF = 0 is enough. For extended body: also need Στ = 0. In equilibrium: a = 0 (may be moving with constant v)."
        },
        {
            concept: "Lami's Theorem",
            uid: "LOM09",
            theory: "For three concurrent coplanar forces in equilibrium.",
            formula: "\\frac{F_1}{\\sin\\alpha} = \\frac{F_2}{\\sin\\beta} = \\frac{F_3}{\\sin\\gamma}",
            details: "α, β, γ are angles opposite to forces F₁, F₂, F₃ respectively.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Three force equilibrium", "Find unknown force using Lami's", "Suspended object problems"],
            commonMistakes: ["Using angles between forces instead of opposite angles", "Applying to more than 3 forces", "Forgetting all forces must be concurrent"],
            tips: "Angle opposite to force, not between forces! If angles between forces are θ₁, θ₂, θ₃, then use (180° - θ) for Lami's. Only works for exactly 3 forces!"
        },

        // ============ FRICTION ============
        {
            concept: "Static Friction",
            uid: "LOM10",
            theory: "Friction that prevents relative motion between surfaces.",
            formula: "f_s \\leq \\mu_s N, \\quad f_{s,max} = \\mu_s N",
            details: "Self-adjusting: fs matches applied force up to maximum. μs = coefficient of static friction.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["When does block start sliding?", "Maximum friction", "Inclined plane problems"],
            commonMistakes: ["Using fs = μsN always (it's ≤, not =)", "Forgetting friction is self-adjusting", "Wrong direction of friction"],
            tips: "Static friction is smart - it provides exactly what's needed up to μsN. Only use fs = μsN at the verge of slipping (maximum static friction). Otherwise fs < μsN."
        },
        {
            concept: "Kinetic Friction",
            uid: "LOM11",
            theory: "Friction between surfaces in relative motion.",
            formula: "f_k = \\mu_k N",
            details: "μk < μs typically. Kinetic friction opposes relative motion.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Deceleration due to friction", "Block sliding on surface", "Compare with static friction"],
            commonMistakes: ["Using μs when object is already moving", "Thinking fk depends on area or velocity", "Wrong direction assignment"],
            tips: "Once moving, use μk (usually given as μk < μs). fk is constant (doesn't depend on speed for typical problems). Direction: opposes relative velocity!"
        },
        {
            concept: "Friction on Inclined Plane",
            uid: "LOM12",
            theory: "Forces on object on inclined plane with friction.",
            formula: "\\begin{aligned} &N = mg\\cos\\theta \\\\ &f = \\mu N = \\mu mg\\cos\\theta \\\\ &\\text{Net force down plane} = mg\\sin\\theta - f \\end{aligned}",
            details: "Critical angle: tanθc = μs (angle at which block just starts sliding).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find acceleration on incline", "Minimum angle to slide", "Block just about to move"],
            commonMistakes: ["Using mg instead of mgcosθ for normal force", "Wrong component for friction", "Forgetting friction can be up or down the plane"],
            tips: "N = mgcosθ (perpendicular to plane). At critical angle: μs = tanθc. Above critical: slides down. Below: no sliding. Friction direction depends on tendency of motion!"
        },
        {
            concept: "Angle of Repose",
            uid: "LOM13",
            theory: "Maximum angle at which object remains stationary on inclined plane.",
            formula: "\\tan\\theta_c = \\mu_s",
            details: "Also called angle of friction. Independent of mass.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find angle of repose", "Will block slide at given angle?", "Compare angles for different μ"],
            commonMistakes: ["Confusing with angle of incline", "Thinking it depends on mass", "Using μk instead of μs"],
            tips: "θc = tan⁻¹(μs). This is when fs = fs,max = μsmgcosθ = mgsinθ. At this angle, the slightest disturbance starts motion. Mass cancels out!"
        },
        {
            concept: "Friction in Horizontal Motion",
            uid: "LOM14",
            theory: "Effect of friction on horizontal motion of blocks.",
            formula: "a = \\frac{F - f_k}{m} = \\frac{F - \\mu_k mg}{m}",
            details: "Pulling: F applied horizontally. N = mg.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find acceleration with friction", "Minimum force to move", "Energy dissipated by friction"],
            commonMistakes: ["Forgetting friction in N = mg assumption", "Not checking if block actually moves", "Work by friction sign error"],
            tips: "First check if F > μsmg (can it overcome static friction?). If yes, use μk for motion. Work by friction = -μkmg × distance (negative = energy dissipated)."
        },
        {
            concept: "Rolling Friction",
            uid: "LOM15",
            theory: "Resistance to rolling motion, much smaller than sliding friction.",
            formula: "f_r = \\mu_r N",
            details: "μr << μk < μs. Rolling friction is very small compared to sliding.",
            jeeImportance: "Low",
            type: "formula",
            questionTypes: ["Compare rolling and sliding friction", "Why wheels are efficient", "Rolling resistance problems"],
            commonMistakes: ["Treating same as kinetic friction", "Using in problems without explicit mention", "Not knowing μr << μk"],
            tips: "Rolling friction is why wheels are so efficient! μr is typically 0.001-0.01, vs μk ~ 0.1-0.5. Ball bearings reduce friction by converting sliding to rolling."
        },
        {
            concept: "Friction in Pulleys - Two Blocks",
            uid: "LOM16",
            theory: "System of two blocks connected by rope over frictionless pulley.",
            formula: "a = \\frac{(m_2 - m_1)g - \\mu m_1 g}{m_1 + m_2}",
            details: "m₁ on rough surface, m₂ hanging. Tension same throughout rope if pulley is massless.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find acceleration of system", "Tension in string", "Minimum m₂ to start motion"],
            commonMistakes: ["Wrong direction of friction", "Not including friction in equations", "Forgetting constraint: same acceleration"],
            tips: "Draw FBD for each block separately. Friction on m₁ opposes motion. For m₂ to pull m₁: m₂g > μm₁g, so m₂ > μm₁."
        },

        // ============ CONSTRAINT MOTION ============
        {
            concept: "String Constraint",
            uid: "LOM17",
            theory: "Inextensible string has constant length.",
            formula: "\\sum l_i = L = \\text{constant} \\implies \\sum v_i = 0",
            details: "Differentiate length constraint to get velocity/acceleration constraints.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Find relation between accelerations", "Pulley systems", "Multiple string problems"],
            commonMistakes: ["Wrong signs in constraint equation", "Not accounting for pulley direction change", "Forgetting to differentiate twice for acceleration"],
            tips: "Write: sum of all string lengths = constant. Differentiate once for velocity relation, twice for acceleration. Be careful with signs (positive = length increasing)."
        },
        {
            concept: "Wedge Constraint",
            uid: "LOM18",
            theory: "Block on moving wedge has constrained motion.",
            formula: "a_{block,horizontal} = a_{wedge} \\text{ (relative to ground, for no sliding perpendicular to wedge)}",
            details: "Block can only move along wedge surface relative to wedge.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Block on moving wedge", "Acceleration of wedge", "Normal force on block"],
            commonMistakes: ["Ignoring wedge motion", "Wrong constraint direction", "Not using relative motion"],
            tips: "Work in wedge frame (add pseudo force) or ground frame carefully. Constraint: component of accelerations perpendicular to wedge surface must be equal."
        },
        {
            concept: "Pulley Systems",
            uid: "LOM19",
            theory: "Analyzing motion of connected masses over pulleys.",
            formula: "\\text{For Atwood machine: } a = \\frac{(m_1 - m_2)g}{m_1 + m_2}, \\quad T = \\frac{2m_1m_2g}{m_1 + m_2}",
            details: "Massless, frictionless pulley: tension same on both sides.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Atwood machine acceleration", "Tension in rope", "Multiple pulley systems"],
            commonMistakes: ["Different tensions on pulley sides (only if pulley has mass)", "Wrong direction of acceleration", "Not using constraint for movable pulleys"],
            tips: "For massless pulley: T same on both sides. For movable pulley: if pulley moves distance d, rope moves 2d. Use energy method for complex systems!"
        },
        {
            concept: "Contact Force Between Blocks",
            uid: "LOM20",
            theory: "Normal force between blocks in contact during acceleration.",
            formula: "N = \\frac{m_1 m_2 a}{m_1 + m_2} \\quad \\text{or use FBD method}",
            details: "Depends on which block force is applied to.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find contact force", "Effect of reversing push direction", "Three block problems"],
            commonMistakes: ["Wrong mass in formula", "Not considering which block is pushed", "Confusing with external applied force"],
            tips: "Draw FBD for each block. If F pushes m₁ which pushes m₂: N = m₂×a = m₂F/(m₁+m₂). If F pushes m₂ first: N = m₁×a = m₁F/(m₁+m₂). Pushing smaller block → larger contact force!"
        },

        // ============ CIRCULAR MOTION DYNAMICS ============
        {
            concept: "Centripetal Force",
            uid: "LOM21",
            theory: "Net force toward center required for circular motion.",
            formula: "F_c = \\frac{mv^2}{r} = m\\omega^2 r = 4\\pi^2 m f^2 r",
            details: "Not a new force - it's provided by tension, gravity, friction, normal force, etc.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find tension in circular motion", "Banking angle", "Conical pendulum"],
            commonMistakes: ["Treating centripetal as separate force", "Adding it to FBD", "Using 'centrifugal' in inertial frame"],
            tips: "Centripetal force is the net radial force, not a new force! Identify what provides it: tension, friction, component of weight, normal force, etc."
        },
        {
            concept: "Centrifugal Force (Pseudo Force)",
            uid: "LOM22",
            theory: "Apparent outward force in rotating (non-inertial) reference frame.",
            formula: "F_{centrifugal} = \\frac{mv^2}{r} = m\\omega^2 r \\quad (\\text{outward})",
            details: "Only appears in rotating frame. Equals centripetal force in magnitude, opposite in direction.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Analysis from rotating frame", "Apparent weight in rotation", "Equilibrium in rotating frame"],
            commonMistakes: ["Using in inertial (lab) frame", "Thinking it's a real force", "Confusing with centripetal force"],
            tips: "Use EITHER: (1) Inertial frame + centripetal force = ma, OR (2) Rotating frame + centrifugal force + static equilibrium. Never mix both!"
        },
        {
            concept: "Motion in Vertical Circle",
            uid: "LOM23",
            theory: "Object moving in vertical circle under gravity.",
            formula: "\\begin{aligned} &\\text{At bottom: } T_{bottom} = \\frac{mv^2}{r} + mg \\\\ &\\text{At top: } T_{top} = \\frac{mv^2}{r} - mg \\end{aligned}",
            details: "Speed varies: maximum at bottom, minimum at top. Use energy conservation.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Minimum speed at top", "Tension at various points", "Critical velocity problems"],
            commonMistakes: ["Using same speed throughout", "Wrong sign at top vs bottom", "Forgetting energy conservation for speed"],
            tips: "At bottom: T = mv²/r + mg (weight adds to tension). At top: T = mv²/r - mg (weight provides part of centripetal). Critical: v_top = √(gr), v_bottom = √(5gr)."
        },
        {
            concept: "Critical Velocity in Vertical Circle",
            uid: "LOM24",
            theory: "Minimum velocity to complete vertical circular motion.",
            formula: "v_{top,min} = \\sqrt{gr}, \\quad v_{bottom,min} = \\sqrt{5gr}",
            details: "At minimum, tension = 0 at top, gravity provides all centripetal force.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Minimum speed to complete loop", "What if v < critical?", "Roller coaster problems"],
            commonMistakes: ["Confusing top and bottom formulas", "Using same formula for different radius loops", "Not using energy conservation"],
            tips: "At critical: T_top = 0. mg = mv²/r → v_top = √(gr). By energy: v_bottom = √(v_top² + 4gr) = √(5gr). If v_bottom < √(5gr): won't complete loop!"
        },
        {
            concept: "Banking of Roads",
            uid: "LOM25",
            theory: "Tilting road surface to help vehicles turn without friction.",
            formula: "\\tan\\theta = \\frac{v^2}{rg} \\quad (\\text{for } f = 0)",
            details: "θ = banking angle. Designed for specific speed. Friction helps at other speeds.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find optimal banking angle", "Speed range on banked road", "With and without friction"],
            commonMistakes: ["Forgetting this is for zero friction", "Wrong component equations", "Not knowing formula with friction"],
            tips: "Without friction: tanθ = v²/rg. With friction: v_max when friction acts down, v_min when friction acts up. Speed range = √(rg(tanθ-μ)/(1+μtanθ)) to √(rg(tanθ+μ)/(1-μtanθ))."
        },
        {
            concept: "Conical Pendulum",
            uid: "LOM26",
            theory: "Pendulum rotating in horizontal circle.",
            formula: "T\\cos\\theta = mg, \\quad T\\sin\\theta = \\frac{mv^2}{r}",
            details: "θ = angle with vertical. r = Lsinθ. Time period T = 2π√(Lcosθ/g).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find tension in string", "Time period of rotation", "Angle for given speed"],
            commonMistakes: ["Using wrong angle (from vertical, not horizontal)", "Wrong component for centripetal", "Forgetting r = Lsinθ"],
            tips: "Divide equations: tanθ = v²/rg = v²/(Lsinθ·g). Time period = 2π√(h/g) where h = Lcosθ = vertical height. Independent of mass!"
        },
        {
            concept: "Car on Curved Road (Level)",
            uid: "LOM27",
            theory: "Friction provides centripetal force on level curve.",
            formula: "f = \\frac{mv^2}{r} \\implies v_{max} = \\sqrt{\\mu_s rg}",
            details: "Static friction prevents skidding. At maximum speed, f = μsN = μsmg.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Maximum safe speed on curve", "Minimum coefficient for given speed", "Skidding conditions"],
            commonMistakes: ["Using μk instead of μs", "Forgetting it's static friction (no sliding)", "Wrong radius"],
            tips: "v_max = √(μsgr). This is independent of mass! Heavier car has more weight but also more friction, so cancels. Rainy roads: μ decreases, v_max decreases!"
        },

        // ============ APPLICATIONS ============
        {
            concept: "Lift (Elevator) Problems",
            uid: "LOM28",
            theory: "Apparent weight changes based on lift acceleration.",
            formula: "\\begin{aligned} &\\text{Going up, accelerating: } N = m(g+a) \\\\ &\\text{Going down, accelerating: } N = m(g-a) \\end{aligned}",
            details: "N = reading on weighing scale. Free fall: N = 0 (weightlessness).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Apparent weight in elevator", "Reading on spring balance", "When is apparent weight maximum?"],
            commonMistakes: ["Confusing velocity direction with acceleration direction", "Using wrong sign for a", "Thinking 'going up' always means '+a'"],
            tips: "Focus on acceleration direction, not velocity! Accelerating upward (a↑): feel heavier (N = m(g+a)). Accelerating downward (a↓): feel lighter (N = m(g-a)). Free fall: N = 0!"
        },
        {
            concept: "Pseudo Force in Non-Inertial Frame",
            uid: "LOM29",
            theory: "Fictitious force added to make Newton's laws work in accelerating frame.",
            formula: "F_{pseudo} = -m\\vec{a}_{frame}",
            details: "Direction opposite to frame's acceleration. Allows use of equilibrium equations.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Pendulum in accelerating car", "Block on accelerating wedge", "Equilibrium in rotating frame"],
            commonMistakes: ["Adding pseudo force in inertial frame", "Wrong direction of pseudo force", "Using both approaches simultaneously"],
            tips: "In accelerating frame, add pseudo force = -ma (opposite to frame acceleration). Then apply equilibrium or F = ma_rel. Example: in car accelerating right, add pseudo force left."
        },
        {
            concept: "Connected Bodies",
            uid: "LOM30",
            theory: "Multiple bodies connected and moving together.",
            formula: "a = \\frac{F_{net}}{m_{total}}, \\quad T = m \\times a \\text{ (for segment)}",
            details: "Find system acceleration first, then analyze each body for internal forces.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find acceleration of system", "Tension in connecting string", "Contact forces"],
            commonMistakes: ["Wrong net force calculation", "Using total mass for single body tension", "Forgetting constraint relations"],
            tips: "Step 1: Find system acceleration (a = F_net/M_total). Step 2: Draw FBD of individual body to find internal forces. For middle block: consider only masses behind it!"
        },
        {
            concept: "Block on Block (Stacking)",
            uid: "LOM31",
            theory: "Friction between stacked blocks determines their motion.",
            formula: "\\text{Max acceleration without slipping: } a_{max} = \\mu_s g",
            details: "Upper block accelerated by friction from lower block.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Will upper block slip?", "Maximum force before slipping", "Friction between blocks"],
            commonMistakes: ["Ignoring friction between blocks", "Wrong direction of friction on each block", "Not checking slipping condition"],
            tips: "If they move together: a_common = F/(m₁+m₂). Check if f_required ≤ μsN between them. If f_required > μsN, they slip relative to each other!"
        },
        {
            concept: "Rocket Propulsion",
            uid: "LOM32",
            theory: "Variable mass system: thrust from expelled gas.",
            formula: "F_{thrust} = v_{rel} \\left|\\frac{dm}{dt}\\right|, \\quad a = \\frac{v_{rel}|dm/dt| - mg}{m}",
            details: "vrel = velocity of exhaust relative to rocket. Mass decreases as fuel burns.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate thrust", "Acceleration of rocket", "Mass ratio for given velocity change"],
            commonMistakes: ["Using F = ma with changing m", "Wrong sign for dm/dt", "Ignoring gravity in some phases"],
            tips: "F = dp/dt = d(mv)/dt = mdv/dt + vdm/dt. For rocket: thrust = vrel × (rate of mass ejection). Tsiolkovsky equation: Δv = vrel × ln(m₀/m_f)."
        },
        {
            concept: "Spring Force",
            uid: "LOM33",
            theory: "Force exerted by compressed or stretched spring.",
            formula: "F = -kx",
            details: "k = spring constant. x = displacement from natural length. Negative sign: restoring force.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Extension of spring", "Block on spring", "Series and parallel springs"],
            commonMistakes: ["Forgetting negative sign (restoring)", "Wrong x (from natural length, not equilibrium)", "Confusing k values in combinations"],
            tips: "F = kx toward natural length. Series: 1/k_eq = 1/k₁ + 1/k₂. Parallel: k_eq = k₁ + k₂. Springs follow same rules as capacitors, not resistors!"
        },
        {
            concept: "Tension in String/Rope",
            uid: "LOM34",
            theory: "Pulling force transmitted through string.",
            formula: "T = \\text{varies along massive rope}, \\quad T = \\text{constant for massless string}",
            details: "For massive rope with acceleration: T varies. At free end: T = 0.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Tension at different points", "Massless vs massive rope", "Maximum tension in whirling rope"],
            commonMistakes: ["Assuming constant tension in massive rope", "Forgetting tension at free end is zero", "Wrong direction of tension"],
            tips: "Massless rope: T same everywhere. Massive rope: T maximum at top (supports weight below). For accelerating massive rope: T(x) = (M-m_below)a where m_below is mass below point x."
        },
        {
            concept: "Normal Force",
            uid: "LOM35",
            theory: "Perpendicular contact force between surfaces.",
            formula: "N \\perp \\text{surface, magnitude depends on other forces}",
            details: "N ≠ mg in general. N adjusts to maintain contact.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Find normal force on incline", "Normal force in circular motion", "When does object leave surface?"],
            commonMistakes: ["Assuming N = mg always", "Forgetting N is perpendicular to surface", "Not finding N from equilibrium equation"],
            tips: "N = mg only on horizontal surface with only gravity. On incline: N = mgcosθ. In vertical circle: N varies with position. Object leaves surface when N → 0!"
        }
    ]
};

export default lawsOfMotion;
