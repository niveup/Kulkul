/**
 * JEE Kinematics - Motion in 1D & 2D
 * Class 11 Physics - Chapter: Kinematics
 * 
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 */

export const kinematics = {
    topic: "Kinematics",
    concepts: [
        // ============ BASIC CONCEPTS ============
        {
            concept: "Distance and Displacement",
            uid: "KIN01",
            theory: "Distance is total path length (scalar), displacement is shortest path from initial to final position (vector).",
            formula: "\\text{Distance} \\geq |\\text{Displacement}|",
            details: "Distance = total path traveled. Displacement = final position - initial position.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Calculate distance and displacement for given path", "Ratio of distance to displacement", "Circular path problems"],
            commonMistakes: ["Confusing distance (scalar) with displacement (vector)", "Displacement can be negative, distance cannot", "Taking magnitude when direction is needed"],
            tips: "For straight line motion without reversal: Distance = |Displacement|. For any other case: Distance > |Displacement|. Circle traversal: distance = 2πr, displacement = 0!"
        },
        {
            concept: "Speed and Velocity",
            uid: "KIN02",
            theory: "Speed is rate of distance covered (scalar), velocity is rate of displacement (vector).",
            formula: "\\text{Speed} = \\frac{\\text{Distance}}{\\text{Time}}, \\quad \\vec{v} = \\frac{d\\vec{r}}{dt}",
            details: "Average speed = total distance/total time. Average velocity = displacement/time.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Average speed vs average velocity", "Instantaneous velocity from position", "Speed-time graph analysis"],
            commonMistakes: ["Average speed ≠ average of speeds", "Velocity can be zero even when speed isn't (circular motion)", "Using wrong formula for average speed"],
            tips: "Average speed = (d₁+d₂)/(t₁+t₂), NOT (v₁+v₂)/2! For equal distances: v_avg = 2v₁v₂/(v₁+v₂). For equal times: v_avg = (v₁+v₂)/2."
        },
        {
            concept: "Average Speed - Equal Distances",
            uid: "KIN03",
            theory: "When equal distances are covered at different speeds.",
            formula: "v_{avg} = \\frac{2v_1v_2}{v_1 + v_2}",
            details: "This is the harmonic mean of the two speeds.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Two-part journey at different speeds", "Average speed for round trip", "Compare with arithmetic mean"],
            commonMistakes: ["Using arithmetic mean instead of harmonic mean", "Forgetting factor 2 in numerator", "Applying when times are equal instead of distances"],
            tips: "Equal DISTANCES → Harmonic mean: 2v₁v₂/(v₁+v₂). This is always LESS than arithmetic mean! For round trip at v₁ and v₂: v_avg < (v₁+v₂)/2."
        },
        {
            concept: "Average Speed - Equal Times",
            uid: "KIN04",
            theory: "When equal time intervals are spent at different speeds.",
            formula: "v_{avg} = \\frac{v_1 + v_2}{2}",
            details: "This is the arithmetic mean of the two speeds.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Journey with equal time intervals", "Compare with harmonic mean", "Multi-speed problems"],
            commonMistakes: ["Confusing with equal distance case", "Using this formula for distance problems", "Not reading question carefully"],
            tips: "Equal TIMES → Arithmetic mean: (v₁+v₂)/2. Think: more time at higher speed means higher average!"
        },
        {
            concept: "Acceleration",
            uid: "KIN05",
            theory: "Rate of change of velocity with respect to time.",
            formula: "\\vec{a} = \\frac{d\\vec{v}}{dt} = \\frac{d^2\\vec{r}}{dt^2}",
            details: "Can be due to change in speed, direction, or both. Units: m/s².",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find acceleration from v-t graph", "Deceleration problems", "Variable acceleration"],
            commonMistakes: ["Thinking acceleration always means speeding up", "Confusing deceleration with negative acceleration", "Ignoring direction of acceleration"],
            tips: "Acceleration opposite to velocity = slowing down. Same direction = speeding up. Perpendicular = only direction changes (uniform circular motion)."
        },
        {
            concept: "Uniform and Non-uniform Motion",
            uid: "KIN06",
            theory: "Uniform: constant velocity. Non-uniform: velocity changes with time.",
            formula: "\\text{Uniform: } v = \\text{const}, a = 0; \\quad \\text{Non-uniform: } a \\neq 0",
            details: "Uniform motion → straight line path at constant speed. Non-uniform → acceleration present.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Identify type of motion from graphs", "Conditions for uniform motion", "Nature of acceleration"],
            commonMistakes: ["Uniform speed ≠ uniform velocity (direction may change)", "Thinking uniform motion means constant speed only", "Confusing with uniformly accelerated motion"],
            tips: "Uniform velocity = straight line, constant speed, zero acceleration. Examples: satellite in orbit has uniform speed but non-uniform velocity!"
        },

        // ============ EQUATIONS OF MOTION (1D) ============
        {
            concept: "First Equation of Motion",
            uid: "KIN07",
            theory: "Velocity-time relation for uniformly accelerated motion.",
            formula: "v = u + at",
            details: "v = final velocity, u = initial velocity, a = acceleration, t = time",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find final velocity", "Time to reach certain speed", "Retardation problems"],
            commonMistakes: ["Using wrong sign for a when decelerating", "Confusing u and v", "Forgetting units conversion"],
            tips: "This is a straight line equation: v = at + u (y = mx + c form). Slope of v-t graph = acceleration. y-intercept = initial velocity.",
            graph: {
                fn: 'linear',
                xLabel: 't',
                yLabel: 'v',
                domain: [0, 5],
                step: 0.1,
                question: "What does the slope of v-t graph represent?"
            }
        },
        {
            concept: "Second Equation of Motion",
            uid: "KIN08",
            theory: "Position-time relation for uniformly accelerated motion.",
            formula: "s = ut + \\frac{1}{2}at^2",
            details: "s = displacement, parabolic relation with time.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find displacement in given time", "Time to travel given distance", "Comparing distances in intervals"],
            commonMistakes: ["Forgetting the ½ factor", "Sign of a for retardation", "This gives displacement, not distance"],
            tips: "This is quadratic in t: s = ½at² + ut (parabola). For u=0: s = ½at², so s ∝ t². In nth second, use s_n formula!",
            graph: {
                fn: 'quadratic',
                xLabel: 't',
                yLabel: 's',
                domain: [0, 5],
                step: 0.1,
                question: "What shape is the s-t graph for uniformly accelerated motion?"
            }
        },
        {
            concept: "Third Equation of Motion",
            uid: "KIN09",
            theory: "Velocity-displacement relation (time-independent).",
            formula: "v^2 = u^2 + 2as",
            details: "Useful when time is not given or required.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Final velocity after given displacement", "Stopping distance problems", "Comparing velocities at different positions"],
            commonMistakes: ["Forgetting to take square root for v", "Sign errors with a", "Using distance instead of displacement"],
            tips: "No 't' in this equation - use when time is not involved. For stopping: v=0, so s = u²/2a. Braking distance ∝ u². Double speed = 4× stopping distance!"
        },
        {
            concept: "Displacement in nth Second",
            uid: "KIN10",
            theory: "Distance covered in a particular second of motion.",
            formula: "s_n = u + \\frac{a}{2}(2n - 1)",
            details: "Gives displacement specifically in the nth second, not up to nth second.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Distance in 5th second", "Ratio of distances in consecutive seconds", "When does body travel equal distances?"],
            commonMistakes: ["Confusing s_n (in nth second) with s (in n seconds)", "Wrong n value (seconds are 1-indexed)", "Sign handling for deceleration"],
            tips: "From rest: s_n ∝ (2n-1). Ratio of distances in 1st, 2nd, 3rd... seconds = 1:3:5:7:... (odd number series). Total distance ∝ n²."
        },
        {
            concept: "Motion Under Gravity - Falling",
            uid: "KIN11",
            theory: "Free fall under gravitational acceleration (downward positive convention).",
            formula: "v = u + gt, \\quad h = ut + \\frac{1}{2}gt^2, \\quad v^2 = u^2 + 2gh",
            details: "g ≈ 9.8 m/s² (often taken as 10 m/s² in problems). Dropped: u = 0.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Time of fall from height", "Velocity on hitting ground", "Ball dropped problems"],
            commonMistakes: ["Wrong sign convention", "Air resistance ignored without stating", "Confusing dropped (u=0) with thrown down (u>0)"],
            tips: "Dropped from height h: t = √(2h/g), v = √(2gh). From rest, v ∝ t and h ∝ t². After 1s: v = 10 m/s, h = 5 m."
        },
        {
            concept: "Motion Under Gravity - Thrown Up",
            uid: "KIN12",
            theory: "Vertical projectile motion (upward positive convention).",
            formula: "v = u - gt, \\quad h = ut - \\frac{1}{2}gt^2, \\quad v^2 = u^2 - 2gh",
            details: "At maximum height: v = 0. Time of ascent = u/g. Max height = u²/2g.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Maximum height reached", "Time of flight", "Velocity at given height"],
            commonMistakes: ["Using positive g when upward is positive", "Forgetting velocity is zero at max height", "Time up = time down only for same landing level"],
            tips: "H_max = u²/2g. Time up = Time down = u/g. Total flight time = 2u/g. At any height h during ascent and descent, speeds are equal!"
        },
        {
            concept: "Graphs in 1D Motion",
            uid: "KIN13",
            theory: "Interpretation and relationships between x-t, v-t, and a-t graphs.",
            formula: "\\text{Slope of } x\\text{-}t = v, \\quad \\text{Slope of } v\\text{-}t = a, \\quad \\text{Area under } v\\text{-}t = s",
            details: "Area under a-t graph = change in velocity. Slope gives derivative, area gives integral.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Find displacement from v-t graph", "Find velocity from x-t graph", "Identify motion from graph shape"],
            commonMistakes: ["Confusing slope with area interpretation", "Not recognizing negative area as negative displacement", "Misreading graph axes"],
            tips: "x-t linear → uniform velocity. x-t parabola → constant acceleration. v-t horizontal → zero acceleration. v-t sloping → constant acceleration."
        },

        // ============ RELATIVE MOTION ============
        {
            concept: "Relative Velocity in 1D",
            uid: "KIN14",
            theory: "Velocity of object A as observed from object B.",
            formula: "\\vec{v}_{AB} = \\vec{v}_A - \\vec{v}_B",
            details: "v_AB = velocity of A relative to B. Same direction: subtract magnitudes. Opposite: add.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Relative velocity of trains", "Overtaking problems", "Time to cross each other"],
            commonMistakes: ["Wrong sign when velocities are opposite", "Confusing v_AB with v_BA", "Not defining reference frame clearly"],
            tips: "Same direction: v_rel = |v_A - v_B| (slower seems to go backward). Opposite: v_rel = v_A + v_B (approach faster). Time to cross = (L_A + L_B)/v_rel."
        },
        {
            concept: "Relative Velocity in 2D",
            uid: "KIN15",
            theory: "Vector subtraction for relative velocity in a plane.",
            formula: "\\vec{v}_{AB} = \\vec{v}_A - \\vec{v}_B, \\quad |\\vec{v}_{AB}| = \\sqrt{v_A^2 + v_B^2 - 2v_Av_B\\cos\\theta}",
            details: "θ is angle between v_A and v_B. Use vector triangle or component method.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Rain-man problems", "River crossing", "Direction of relative velocity"],
            commonMistakes: ["Using addition instead of subtraction", "Wrong angle in cosine formula", "Forgetting to find direction separately"],
            tips: "For rain problems: v_rain,man = v_rain - v_man. Draw vector triangle! For minimum distance, relative velocity should be perpendicular to line joining them."
        },
        {
            concept: "River Crossing - Shortest Time",
            uid: "KIN16",
            theory: "To cross in minimum time, swim perpendicular to river flow.",
            formula: "t_{min} = \\frac{d}{v_{man}}, \\quad \\text{Drift} = v_{river} \\times t_{min}",
            details: "Swimmer reaches other bank fastest but gets carried downstream.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Time for shortest path crossing", "Calculate drift", "Compare crossing strategies"],
            commonMistakes: ["Thinking shortest time means no drift", "Confusing with shortest path", "Not calculating drift separately"],
            tips: "For MINIMUM TIME: swim perpendicular (maximizes component across river). For SHORTEST PATH (no drift): angle upstream such that resultant is perpendicular to bank."
        },
        {
            concept: "River Crossing - Shortest Path",
            uid: "KIN17",
            theory: "To cross without drift, aim upstream at specific angle.",
            formula: "\\sin\\theta = \\frac{v_{river}}{v_{man}}, \\quad t = \\frac{d}{\\sqrt{v_{man}^2 - v_{river}^2}}",
            details: "Only possible if v_man > v_river. θ is angle with perpendicular to bank.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Angle to cross without drift", "Time for shortest path", "Condition for reaching directly opposite point"],
            commonMistakes: ["Trying when v_river > v_man (impossible!)", "Wrong angle reference", "Using v_man in denominator"],
            tips: "If v_river ≥ v_man: cannot reach directly opposite point! Must drift. Resultant velocity = √(v_man² - v_river²) for no-drift crossing."
        },

        // ============ VECTORS ============
        {
            concept: "Vector Addition - Triangle Law",
            uid: "KIN18",
            theory: "Resultant is third side of triangle formed by placing vectors head to tail.",
            formula: "\\vec{R} = \\vec{A} + \\vec{B}, \\quad R = \\sqrt{A^2 + B^2 + 2AB\\cos\\theta}",
            details: "θ is angle between A and B when placed tail to tail.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find magnitude of resultant", "Condition for maximum/minimum resultant", "When resultant equals one vector"],
            commonMistakes: ["Using angle between vectors placed head to tail", "Sign error in cosine term", "Confusing 2ABcosθ with 2ABsinθ"],
            tips: "R_max = A + B (θ=0°). R_min = |A - B| (θ=180°). When θ=90°: R = √(A²+B²). If R = A, then B = 2Acosθ."
        },
        {
            concept: "Vector Addition - Parallelogram Law",
            uid: "KIN19",
            theory: "Diagonal of parallelogram formed by vectors gives resultant.",
            formula: "R = \\sqrt{A^2 + B^2 + 2AB\\cos\\theta}, \\quad \\tan\\alpha = \\frac{B\\sin\\theta}{A + B\\cos\\theta}",
            details: "α is angle of resultant with vector A.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Direction of resultant", "Angle between resultant and component", "Special angle cases"],
            commonMistakes: ["Wrong angle in tan formula", "Using A-Bcosθ in denominator", "Not finding direction only magnitude"],
            tips: "α measured from A toward B. If A = B: resultant bisects angle (α = θ/2). If θ = 90°: α = tan⁻¹(B/A)."
        },
        {
            concept: "Vector Components",
            uid: "KIN20",
            theory: "Resolving a vector into perpendicular components.",
            formula: "A_x = A\\cos\\theta, \\quad A_y = A\\sin\\theta",
            details: "θ is angle with x-axis. A = √(Ax² + Ay²), tanθ = Ay/Ax",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Resolve force into components", "Find resultant from components", "3D vector components"],
            commonMistakes: ["Swapping sin and cos", "Wrong quadrant for angle", "Using wrong reference axis"],
            tips: "Component along angle direction uses cos, perpendicular uses sin. In 3D: also need A_z. Magnitude = √(Ax² + Ay² + Az²)."
        },
        {
            concept: "Dot Product (Scalar Product)",
            uid: "KIN21",
            theory: "Product of two vectors giving a scalar result.",
            formula: "\\vec{A} \\cdot \\vec{B} = AB\\cos\\theta = A_xB_x + A_yB_y + A_zB_z",
            details: "Used for work (F·s), power (F·v), and finding angles between vectors.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate work done", "Find angle between vectors", "Condition for perpendicular vectors"],
            commonMistakes: ["Confusing with cross product", "Forgetting it gives scalar not vector", "Wrong sign when angle > 90°"],
            tips: "A·B = 0 means vectors are perpendicular! cosθ = (A·B)/(|A||B|). For unit vectors: î·î = 1, î·ĵ = 0. Work = F·d (scalar)."
        },
        {
            concept: "Cross Product (Vector Product)",
            uid: "KIN22",
            theory: "Product of two vectors giving a vector perpendicular to both.",
            formula: "\\vec{A} \\times \\vec{B} = AB\\sin\\theta\\,\\hat{n}",
            details: "Direction by right-hand rule. Magnitude = area of parallelogram formed.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate torque", "Find area using cross product", "Direction of angular momentum"],
            commonMistakes: ["Getting direction wrong (A×B ≠ B×A)", "Forgetting it gives vector not scalar", "Using wrong hand rule"],
            tips: "A×B = -B×A (anticommutative). î×ĵ = k̂, ĵ×k̂ = î, k̂×î = ĵ (cyclic). Used for: torque τ = r×F, angular momentum L = r×p."
        },
        {
            concept: "Unit Vector",
            uid: "KIN23",
            theory: "Vector with magnitude 1, indicating direction only.",
            formula: "\\hat{A} = \\frac{\\vec{A}}{|\\vec{A}|} = \\frac{\\vec{A}}{A}",
            details: "î, ĵ, k̂ are unit vectors along x, y, z axes.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Find unit vector in given direction", "Express vector in terms of unit vectors", "Direction cosines"],
            commonMistakes: ["Forgetting to divide by magnitude", "Unit vector not being dimensionless", "Confusing with position vector"],
            tips: "Any vector A = Axî + Ayĵ + Azk̂. Unit vector = A/|A|. Direction cosines: cosα = Ax/A, cosβ = Ay/A, cosγ = Az/A. cos²α + cos²β + cos²γ = 1."
        },

        // ============ PROJECTILE MOTION ============
        {
            concept: "Projectile Motion - Horizontal Projection",
            uid: "KIN24",
            theory: "Object projected horizontally from a height.",
            formula: "x = ut, \\quad y = \\frac{1}{2}gt^2, \\quad y = \\frac{gx^2}{2u^2}",
            details: "Horizontal velocity constant. Vertical motion is free fall. Path is parabola.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Range of horizontal projectile", "Time to hit ground", "Velocity at landing"],
            commonMistakes: ["Thinking horizontal velocity changes", "Forgetting to add velocities as vectors for final velocity", "Using vertical equation for horizontal motion"],
            tips: "Time of flight = √(2h/g). Range R = u√(2h/g). Final velocity v = √(u² + (gt)²). Angle with horizontal: tanθ = gt/u = vy/vx."
        },
        {
            concept: "Projectile Motion - Oblique Projection",
            uid: "KIN25",
            theory: "Object projected at an angle to horizontal from ground level.",
            formula: "\\begin{aligned} &R = \\frac{u^2\\sin 2\\theta}{g}, \\quad H = \\frac{u^2\\sin^2\\theta}{2g} \\\\ &T = \\frac{2u\\sin\\theta}{g} \\end{aligned}",
            details: "R = Range, H = Max height, T = Time of flight. θ = angle of projection.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Maximum range condition", "Relation between R and H", "Compare projectiles at complementary angles"],
            commonMistakes: ["Using sin instead of sin2θ for range", "Forgetting factor of 2 in time of flight", "θ_max = 45° only for R_max, not H_max"],
            tips: "R_max at θ=45°. Same range for θ and (90°-θ). H_max at θ=90°. Time ∝ sinθ, Height ∝ sin²θ, Range ∝ sin2θ. R = 4H when θ=45°!",
            graph: {
                fn: 'projectile',
                xLabel: 'x',
                yLabel: 'y',
                domain: [0, 5],
                step: 0.1,
                question: "What is the shape of projectile trajectory?"
            }
        },
        {
            concept: "Projectile Components",
            uid: "KIN26",
            theory: "Independent horizontal and vertical motion components.",
            formula: "u_x = u\\cos\\theta, \\quad u_y = u\\sin\\theta",
            details: "ax = 0, ay = -g. Horizontal motion: uniform. Vertical motion: accelerated.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Velocity at any time/height", "Position at any time", "Velocity components at max height"],
            commonMistakes: ["Thinking vx changes with time", "Forgetting vy = 0 at max height, not vx", "Wrong component formulas"],
            tips: "At any time t: vx = ucosθ (constant), vy = usinθ - gt. At max height: vy = 0, so v = vx = ucosθ. Speed minimum at top!"
        },
        {
            concept: "Equation of Trajectory",
            uid: "KIN27",
            theory: "y as a function of x for projectile motion.",
            formula: "y = x\\tan\\theta - \\frac{gx^2}{2u^2\\cos^2\\theta}",
            details: "Parabolic path. Can also write as y = xtanθ(1 - x/R).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find y for given x", "Maximum height location", "Shape of trajectory"],
            commonMistakes: ["Wrong form of equation", "Not recognizing parabola", "Confusing with horizontal projection equation"],
            tips: "y = xtanθ(1 - x/R) is elegant form. y=0 at x=0 and x=R. y_max at x=R/2. This is a downward parabola (coefficient of x² is negative)."
        },
        {
            concept: "Range on Inclined Plane",
            uid: "KIN28",
            theory: "Projectile motion on a plane inclined at angle α.",
            formula: "R = \\frac{2u^2\\sin(\\theta-\\alpha)\\cos\\theta}{g\\cos^2\\alpha}",
            details: "R is along the incline. θ is angle with horizontal.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Maximum range on incline", "Time of flight on incline", "Angle for maximum range"],
            commonMistakes: ["Using ground-level formulas", "Confusing α (incline) with θ (projection)", "Wrong direction of g component"],
            tips: "For max range on incline (angle α up): θ = 45° + α/2. Range along incline = u²sin(2θ-α)/(g cos²α). Use component method for clarity."
        },
        {
            concept: "Projectile from Moving Platform",
            uid: "KIN29",
            theory: "Projectile motion when launcher is moving.",
            formula: "\\vec{u}_{proj,ground} = \\vec{u}_{proj,platform} + \\vec{v}_{platform}",
            details: "Add platform velocity to projectile velocity for ground-frame motion.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Bomb dropped from moving plane", "Ball thrown from moving train", "Relative trajectory"],
            commonMistakes: ["Ignoring platform velocity", "Not adding velocity vectors properly", "Mixing reference frames"],
            tips: "Ball dropped from moving plane: has horizontal velocity of plane, so lands ahead of drop point (ground frame). From plane's view: lands directly below."
        },

        // ============ CIRCULAR MOTION ============
        {
            concept: "Angular Displacement",
            uid: "KIN30",
            theory: "Angle swept by radius vector in circular motion.",
            formula: "\\theta = \\frac{s}{r}",
            details: "Unit: radian. 2π rad = 360°. θ is dimensionless.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Convert degrees to radians", "Arc length from angle", "Relation between angular and linear displacement"],
            commonMistakes: ["Using degrees in formulas requiring radians", "Forgetting s = rθ requires radians", "Not treating θ as dimensionless"],
            tips: "Always use radians in physics formulas! π rad = 180°. One revolution = 2π rad. Arc length s = rθ only works in radians."
        },
        {
            concept: "Angular Velocity",
            uid: "KIN31",
            theory: "Rate of change of angular displacement.",
            formula: "\\omega = \\frac{d\\theta}{dt} = \\frac{v}{r} = 2\\pi f = \\frac{2\\pi}{T}",
            details: "Unit: rad/s. Relates to frequency f (Hz) and time period T (s).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find ω from frequency", "Relation between v and ω", "Angular velocity of Earth"],
            commonMistakes: ["Confusing ω with f (ω = 2πf)", "Using degrees/s instead of rad/s", "Forgetting r in v = rω"],
            tips: "v = rω (linear velocity = radius × angular velocity). All points on rotating body have same ω but different v. ω of Earth = 2π/24hr ≈ 7.27×10⁻⁵ rad/s."
        },
        {
            concept: "Angular Acceleration",
            uid: "KIN32",
            theory: "Rate of change of angular velocity.",
            formula: "\\alpha = \\frac{d\\omega}{dt} = \\frac{a_t}{r}",
            details: "Unit: rad/s². Related to tangential acceleration at = rα.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find angular acceleration", "Tangential acceleration", "Non-uniform circular motion"],
            commonMistakes: ["Confusing with centripetal acceleration", "Forgetting relation at = rα", "Using wrong acceleration type"],
            tips: "α causes change in ω (speed changes). This gives tangential acceleration at = rα. Centripetal ac = v²/r = ω²r causes direction change only."
        },
        {
            concept: "Centripetal Acceleration",
            uid: "KIN33",
            theory: "Acceleration directed toward center in circular motion.",
            formula: "a_c = \\frac{v^2}{r} = \\omega^2 r = v\\omega",
            details: "Always toward center. Magnitude constant for uniform circular motion.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find centripetal acceleration", "Direction of acceleration in UCM", "Acceleration in terms of ω"],
            commonMistakes: ["Thinking ac is outward (it's always inward)", "Confusing with tangential acceleration", "Using wrong radius"],
            tips: "ac = v²/r = ω²r. In UCM: only ac exists (constant magnitude, changing direction). Velocity ⊥ acceleration. No work done by centripetal force!"
        },
        {
            concept: "Total Acceleration in Circular Motion",
            uid: "KIN34",
            theory: "Vector sum of centripetal and tangential accelerations.",
            formula: "\\vec{a} = \\vec{a}_c + \\vec{a}_t, \\quad |\\vec{a}| = \\sqrt{a_c^2 + a_t^2}",
            details: "ac ⊥ at always. ac points to center, at along tangent.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find net acceleration in non-UCM", "Angle of acceleration with radius", "When is at = 0?"],
            commonMistakes: ["Adding magnitudes directly", "Forgetting at in non-uniform motion", "Wrong direction specification"],
            tips: "UCM: at = 0, a = ac. Non-UCM: both exist. tanφ = at/ac where φ is angle with radius. When speed is max/min, at = 0 momentarily."
        },
        {
            concept: "Uniform Circular Motion (UCM)",
            uid: "KIN35",
            theory: "Circular motion with constant speed but changing velocity direction.",
            formula: "a_c = \\frac{v^2}{r} = \\omega^2 r, \\quad a_t = 0",
            details: "Speed constant, velocity magnitude constant but direction changes. Acceleration toward center.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Acceleration in UCM", "Time period of revolution", "Work done in UCM"],
            commonMistakes: ["Thinking UCM has zero acceleration", "Confusing velocity (vector) with speed (scalar)", "Thinking centripetal force does work"],
            tips: "In UCM: |v| = constant, but v⃗ changes (direction). Hence a ≠ 0. Work by centripetal force = 0 (always ⊥ to motion). KE constant in UCM."
        },
        {
            concept: "Non-Uniform Circular Motion",
            uid: "KIN36",
            theory: "Circular motion with changing speed.",
            formula: "a_t = \\frac{dv}{dt} = r\\alpha, \\quad a = \\sqrt{a_c^2 + a_t^2}",
            details: "Both speed and direction change. Tangential acceleration present.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Vertical circular motion", "Bead on wire", "Roller coaster problems"],
            commonMistakes: ["Ignoring tangential component", "Using UCM formulas for non-UCM", "Not considering energy change"],
            tips: "Vertical circle: speed varies (max at bottom, min at top). Use energy conservation to find v at different points. Then use v²/r for required centripetal force."
        },
        {
            concept: "Centripetal Force",
            uid: "KIN37",
            theory: "Net force toward center required for circular motion.",
            formula: "F_c = \\frac{mv^2}{r} = m\\omega^2 r",
            details: "Not a new force - it's the resultant of existing forces toward center.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Tension in circular motion", "Banking of roads", "Conical pendulum"],
            commonMistakes: ["Treating centripetal force as separate force", "Using 'centrifugal' in inertial frame", "Wrong direction of friction"],
            tips: "Centripetal force is NOT a new force - it's provided by tension, gravity, friction, normal force, etc. Always identify what provides the centripetal force in the problem!"
        },
        {
            concept: "Equations of Rotational Kinematics",
            uid: "KIN38",
            theory: "Analogous to linear equations for angular motion.",
            formula: "\\omega = \\omega_0 + \\alpha t, \\quad \\theta = \\omega_0 t + \\frac{1}{2}\\alpha t^2, \\quad \\omega^2 = \\omega_0^2 + 2\\alpha\\theta",
            details: "Similar to v = u + at, s = ut + ½at², v² = u² + 2as.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Angular velocity after given rotations", "Time for given revolutions", "Deceleration of wheel"],
            commonMistakes: ["Using linear equations for rotation directly", "Forgetting θ in radians", "Mixing ω₀ and ω"],
            tips: "Direct analogy: u→ω₀, v→ω, s→θ, a→α. For wheel problems: number of rotations = θ/2π. Use these for uniformly accelerated rotation."
        },

        // ============ SPECIAL CASES ============
        {
            concept: "Stopping Distance",
            uid: "KIN39",
            theory: "Distance required to stop a moving object with constant deceleration.",
            formula: "s = \\frac{u^2}{2a} = \\frac{u^2}{2\\mu g}",
            details: "For braking: a = μg where μ is friction coefficient.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Braking distance", "Effect of doubling speed", "Coefficient from stopping distance"],
            commonMistakes: ["Forgetting s ∝ u²", "Using wrong friction coefficient", "Not considering reaction time"],
            tips: "s ∝ u². Double speed = 4× stopping distance! With reaction time: total distance = (reaction distance) + (braking distance) = u×t_react + u²/2a."
        },
        {
            concept: "Meeting/Catching Problems",
            uid: "KIN40",
            theory: "Finding when/where two objects meet.",
            formula: "x_A(t) = x_B(t) \\implies \\text{solve for } t",
            details: "Equate position equations of both objects.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Police chase car", "Train overtaking", "Ball thrown up meets falling ball"],
            commonMistakes: ["Wrong initial positions", "Not accounting for head start", "Sign errors in relative motion"],
            tips: "Set up: position of A = position of B (with correct initial positions). Or use relative motion: time = initial separation / relative velocity."
        },
        {
            concept: "Maximum Range Condition",
            uid: "KIN41",
            theory: "Angle for maximum horizontal range on level ground.",
            formula: "\\theta_{opt} = 45°, \\quad R_{max} = \\frac{u^2}{g}",
            details: "For projectile on level ground without air resistance.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Maximum range of ball", "Compare ranges at different angles", "Optimal angle for different heights"],
            commonMistakes: ["Using 45° for inclined planes", "Forgetting 45° is only for level ground", "Confusing R_max with H_max angle (90°)"],
            tips: "At 45°: R = u²/g, H = u²/4g, T = √2·u/g. R_max = 4H at 45°. For projection from height h: optimal angle < 45°."
        },
        {
            concept: "Velocity at Any Point in Projectile",
            uid: "KIN42",
            theory: "Finding velocity vector at any instant or position.",
            formula: "v = \\sqrt{v_x^2 + v_y^2} = \\sqrt{u^2 - 2gy}",
            details: "vx = ucosθ (constant), vy = usinθ - gt. Angle: tanφ = vy/vx",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Speed at given height", "Angle of velocity with horizontal", "Minimum speed in trajectory"],
            commonMistakes: ["Thinking v is constant", "Forgetting vx is constant", "Using wrong angle formula"],
            tips: "v = √(u² - 2gh) at height h. Minimum v at top = ucosθ. tanφ = vy/vx gives angle with horizontal at any point. φ = 0 at launch, φ = -θ at landing."
        },
        {
            concept: "Time of Flight for Oblique Projectile",
            uid: "KIN43",
            theory: "Total time from launch to landing on same level.",
            formula: "T = \\frac{2u\\sin\\theta}{g}",
            details: "Time of ascent = Time of descent = T/2 = usinθ/g.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Time of flight from angle and speed", "Compare times at different angles", "Time for max height"],
            commonMistakes: ["Forgetting factor 2", "Using T for time to max height", "Not using vertical component"],
            tips: "T = 2 × (time to max height). T ∝ sinθ. Maximum T at θ = 90° (vertical throw). Time to reach max height = T/2 = usinθ/g."
        }
    ]
};

export default kinematics;
