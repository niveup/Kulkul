/**
 * JEE Gravitation
 * Class 11 Physics - Chapter: Gravitation
 * 
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 */

export const gravitation = {
    topic: "Gravitation",
    concepts: [
        // ============ NEWTON'S LAW OF GRAVITATION ============
        {
            concept: "Newton's Law of Universal Gravitation",
            uid: "GRV01",
            theory: "Every mass attracts every other mass with force proportional to product of masses and inversely proportional to square of distance.",
            formula: "F = \\frac{Gm_1m_2}{r^2}",
            details: "G = 6.67 × 10⁻¹¹ N·m²/kg². Force is always attractive and along the line joining centers.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate gravitational force", "Force between celestial bodies", "Effect of changing mass or distance"],
            commonMistakes: ["Using r as surface distance instead of center-to-center", "Forgetting G is universal constant", "Confusing with Coulomb's law (similar form)"],
            tips: "F ∝ m₁m₂, F ∝ 1/r². Double r → force becomes ¼. G is very small, so gravity is weak force but dominant at cosmic scales. Always acts toward center of mass."
        },
        {
            concept: "Gravitational Constant G",
            uid: "GRV02",
            theory: "Universal constant in Newton's law of gravitation.",
            formula: "G = 6.67 \\times 10^{-11} \\, \\text{N}\\cdot\\text{m}^2/\\text{kg}^2",
            details: "Dimensions: [M⁻¹L³T⁻²]. Determined by Cavendish experiment.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Dimensions of G", "Cavendish experiment", "Calculate G from given data"],
            commonMistakes: ["Confusing G with g", "Wrong dimensions", "Not knowing approximate value"],
            tips: "[G] = [M⁻¹L³T⁻²]. From F = GMm/r²: [G] = [F][r²]/[Mm] = [MLT⁻²][L²]/[M²]. G is same everywhere in universe!"
        },
        {
            concept: "Vector Form of Gravitational Force",
            uid: "GRV03",
            theory: "Gravitational force as a vector quantity.",
            formula: "\\vec{F}_{12} = -\\frac{Gm_1m_2}{r^2}\\hat{r}_{12}",
            details: "Negative sign indicates attraction. r̂₁₂ points from m₁ to m₂.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Direction of gravitational force", "Vector addition of forces", "Force on third body"],
            commonMistakes: ["Wrong direction of unit vector", "Forgetting negative sign", "Confusing with electrostatic force direction"],
            tips: "Gravity always attracts, hence negative sign with outward r̂. F₁₂ = -F₂₁ (Newton's third law). For +ve charge analogy, replace -G with k."
        },
        {
            concept: "Superposition of Gravitational Forces",
            uid: "GRV04",
            theory: "Net gravitational force is vector sum of individual forces.",
            formula: "\\vec{F}_{net} = \\vec{F}_1 + \\vec{F}_2 + \\vec{F}_3 + ...",
            details: "Each force calculated independently, then added vectorially.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Force on central mass", "Equilibrium position", "Symmetric mass arrangements"],
            commonMistakes: ["Adding magnitudes directly", "Forgetting to resolve into components", "Wrong direction assignments"],
            tips: "Use symmetry! For symmetric arrangements, many components cancel. For 3 equal masses at triangle vertices: net force on center = 0."
        },

        // ============ ACCELERATION DUE TO GRAVITY ============
        {
            concept: "Acceleration Due to Gravity at Surface",
            uid: "GRV05",
            theory: "Acceleration of free-falling body near Earth's surface.",
            formula: "g = \\frac{GM}{R^2} = \\frac{4}{3}\\pi G \\rho R",
            details: "g ≈ 9.8 m/s² on Earth. Depends on mass and radius of planet.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate g for different planets", "g from density and radius", "Ratio of g values"],
            commonMistakes: ["Using wrong R (surface radius, not distance)", "Confusing G and g", "Wrong formula for density form"],
            tips: "g = GM/R². For uniform density: g = (4/3)πGρR ∝ ρR. If ρ same, g ∝ R. If same M, g ∝ 1/R². Compare planets using ratios!"
        },
        {
            concept: "Variation of g with Altitude",
            uid: "GRV06",
            theory: "Acceleration due to gravity decreases with height above surface.",
            formula: "g_h = \\frac{GM}{(R+h)^2} = g\\left(\\frac{R}{R+h}\\right)^2 \\approx g\\left(1 - \\frac{2h}{R}\\right)",
            details: "Approximation valid for h << R. g decreases as we go higher.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["g at given altitude", "Height for given % decrease in g", "Satellite orbital g"],
            commonMistakes: ["Using h instead of (R+h)", "Not using approximation correctly", "Confusing with depth variation"],
            tips: "Exact: g_h = g(R/(R+h))². For h << R: g_h ≈ g(1 - 2h/R). At h = R: g_h = g/4. At h = 2R: g_h = g/9. Decreases outside Earth."
        },
        {
            concept: "Variation of g with Depth",
            uid: "GRV07",
            theory: "Assuming uniform density, g decreases linearly with depth.",
            formula: "g_d = g\\left(1 - \\frac{d}{R}\\right) = g\\frac{(R-d)}{R}",
            details: "At center (d = R): g = 0. Only mass below contributes.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["g at given depth", "Depth for given % decrease", "g inside Earth"],
            commonMistakes: ["Using altitude formula for depth", "Forgetting g = 0 at center", "Not assuming uniform density"],
            tips: "Inside: g_d = g(1 - d/R) = g(R-d)/R. Linear decrease! At center: g = 0. Graph: straight line from g at surface to 0 at center."
        },
        {
            concept: "Variation of g with Latitude",
            uid: "GRV08",
            theory: "g varies due to Earth's rotation and shape.",
            formula: "g_\\phi = g - R\\omega^2\\cos^2\\phi",
            details: "Poles: maximum g (φ = 90°, cos90° = 0). Equator: minimum g (φ = 0°).",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Compare g at poles and equator", "Effect of Earth's rotation", "Apparent weight variation"],
            commonMistakes: ["Forgetting cos²φ factor", "Wrong direction of centrifugal effect", "Not considering Earth's shape"],
            tips: "g_pole - g_equator ≈ 0.034 m/s² (rotation effect) + 0.018 m/s² (shape effect) ≈ 0.052 m/s². At equator, centrifugal reduces apparent g."
        },
        {
            concept: "Comparison of g for Different Planets",
            uid: "GRV09",
            theory: "Scaling relations for gravitational acceleration.",
            formula: "\\frac{g_1}{g_2} = \\frac{M_1}{M_2} \\times \\frac{R_2^2}{R_1^2} = \\frac{\\rho_1}{\\rho_2} \\times \\frac{R_1}{R_2}",
            details: "Can compare using mass and radius, or density and radius.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Compare g on Moon and Earth", "Planet with given density and radius", "Weight on different planets"],
            commonMistakes: ["Wrong ratio arrangement", "Confusing M-R and ρ-R relations", "Forgetting to use ratios consistently"],
            tips: "g = GM/R² → g ∝ M/R². Also g = (4/3)πGρR → g ∝ ρR. Moon: g ≈ g_Earth/6. Jupiter: g ≈ 2.5g_Earth (more mass, larger R)."
        },

        // ============ GRAVITATIONAL FIELD AND POTENTIAL ============
        {
            concept: "Gravitational Field Intensity",
            uid: "GRV10",
            theory: "Gravitational force per unit mass at a point.",
            formula: "\\vec{E}_g = \\frac{\\vec{F}}{m} = -\\frac{GM}{r^2}\\hat{r}",
            details: "Unit: N/kg = m/s². Same as acceleration. Always toward mass.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at distance from mass", "Net field from multiple masses", "Null point between masses"],
            commonMistakes: ["Wrong direction (toward mass, not away)", "Using m instead of M", "Confusing with electric field convention"],
            tips: "E_g = g at that point! Points toward source mass. For null point between two masses: E₁ = E₂, solve for position."
        },
        {
            concept: "Gravitational Potential",
            uid: "GRV11",
            theory: "Work done per unit mass to bring mass from infinity to point.",
            formula: "V = -\\frac{GM}{r}",
            details: "Always negative (bound system). Zero at infinity. Unit: J/kg = m²/s².",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Potential at distance", "Work to move mass", "Escape considerations"],
            commonMistakes: ["Forgetting negative sign", "Using positive potential", "Confusing with potential energy"],
            tips: "V = -GM/r is always negative! Higher (less negative) potential = farther from mass. At surface: V = -GM/R = -gR. At infinity: V = 0."
        },
        {
            concept: "Gravitational Potential Energy",
            uid: "GRV12",
            theory: "Energy of a two-mass system due to gravitational interaction.",
            formula: "U = -\\frac{Gm_1m_2}{r}",
            details: "Negative indicates bound system. Zero at infinity. Used for escape velocity, orbit energy.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["PE of satellite", "Total energy of orbit", "Escape energy"],
            commonMistakes: ["Using positive PE", "Confusing U with V", "Wrong reference level"],
            tips: "U = -GMm/r. PE is always negative for bound system. Total mechanical energy E = KE + PE < 0 for bound orbit. E = 0 at escape."
        },
        {
            concept: "Relation Between Field and Potential",
            uid: "GRV13",
            theory: "Field is negative gradient of potential.",
            formula: "E_g = -\\frac{dV}{dr}, \\quad V = -\\int E_g \\, dr",
            details: "Field points from high to low potential (toward mass).",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Find E from V(r)", "Find V from E(r)", "Equipotential surfaces"],
            commonMistakes: ["Forgetting negative sign", "Wrong interpretation of gradient", "Confusing with electric case"],
            tips: "E = -dV/dr. Since V is more negative closer to mass, dV/dr > 0 moving away, so E points inward. Equipotentials are spheres around point mass."
        },
        {
            concept: "Gravitational Potential Inside Sphere",
            uid: "GRV14",
            theory: "Potential inside uniform solid sphere.",
            formula: "V = -\\frac{GM}{2R^3}(3R^2 - r^2) = -\\frac{GM}{2R}\\left(3 - \\frac{r^2}{R^2}\\right)",
            details: "At center: V = -3GM/2R = 1.5 × surface potential. Not zero!",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Potential at center of Earth", "Potential at depth", "Ratio of potentials"],
            commonMistakes: ["Thinking V = 0 at center (E = 0 but V ≠ 0)", "Using wrong formula", "Confusing with shell"],
            tips: "At center: V = -3GM/2R = 1.5V_surface. At surface: V = -GM/R. V is most negative at center! E = 0 at center but V is minimum (most negative)."
        },
        {
            concept: "Gravitational Potential Due to Shell",
            uid: "GRV15",
            theory: "Potential inside and outside spherical shell.",
            formula: "\\begin{aligned} &V_{outside} = -\\frac{GM}{r} \\quad (r > R) \\\\ &V_{inside} = -\\frac{GM}{R} = \\text{constant} \\quad (r < R) \\end{aligned}",
            details: "Inside: field is zero but potential is constant and equal to surface value.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Potential inside spherical shell", "Work to move mass inside", "Shell potential problems"],
            commonMistakes: ["Thinking V = 0 inside", "Using r inside formula", "Confusing shell with solid sphere"],
            tips: "Inside shell: E = 0 (no force) but V = -GM/R (constant). No work needed to move mass inside shell (V is constant). Outside: behaves as point mass."
        },

        // ============ KEPLER'S LAWS ============
        {
            concept: "Kepler's First Law (Elliptical Orbits)",
            uid: "GRV16",
            theory: "Planets move in elliptical orbits with Sun at one focus.",
            formula: "r = \\frac{a(1-e^2)}{1 + e\\cos\\theta}",
            details: "a = semi-major axis, e = eccentricity. Circle when e = 0.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Perihelion and aphelion distances", "Eccentricity problems", "Shape of orbit from e"],
            commonMistakes: ["Thinking orbits are circular", "Wrong perihelion/aphelion formulas", "Confusing a with r"],
            tips: "Perihelion (closest) = a(1-e), Aphelion (farthest) = a(1+e). Circle: e=0. Ellipse: 0<e<1. Parabola: e=1. Hyperbola: e>1."
        },
        {
            concept: "Kepler's Second Law (Equal Areas)",
            uid: "GRV17",
            theory: "Line from Sun to planet sweeps equal areas in equal time intervals.",
            formula: "\\frac{dA}{dt} = \\frac{L}{2m} = \\text{constant}",
            details: "Consequence of angular momentum conservation. Faster at perihelion, slower at aphelion.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Compare speeds at perihelion and aphelion", "Angular momentum conservation", "Area swept in given time"],
            commonMistakes: ["Thinking speed is constant in orbit", "Wrong area formula", "Not recognizing L conservation"],
            tips: "dA/dt = L/2m = constant. At perihelion: v_max, r_min. At aphelion: v_min, r_max. v₁r₁ = v₂r₂ (from L = mvr = constant for perpendicular motion)."
        },
        {
            concept: "Kepler's Third Law (Harmonic Law)",
            uid: "GRV18",
            theory: "Square of orbital period is proportional to cube of semi-major axis.",
            formula: "T^2 = \\frac{4\\pi^2}{GM}a^3 \\implies T^2 \\propto a^3",
            details: "T² ∝ a³ for all bodies orbiting same central mass. Period depends on a, not e.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Compare periods of different orbits", "Find semi-major axis from period", "Ratio problems"],
            commonMistakes: ["Using radius instead of semi-major axis for ellipse", "Wrong proportionality constant", "Applying to different central masses"],
            tips: "T² = (4π²/GM)a³. For circular orbit: a = R. T₁²/T₂² = a₁³/a₂³. All satellites of Earth follow same T²-a³ relation. Moon: T = 27.3 days, a = 3.8×10⁵ km."
        },

        // ============ SATELLITES AND ORBITS ============
        {
            concept: "Orbital Velocity",
            uid: "GRV19",
            theory: "Velocity required for circular orbit at given radius.",
            formula: "v_o = \\sqrt{\\frac{GM}{r}} = \\sqrt{\\frac{gR^2}{r}} = \\sqrt{gr} \\text{ (at surface: } r=R \\text{)}",
            details: "For Earth at surface: v_o ≈ 7.9 km/s. Independent of satellite mass.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate orbital velocity", "Compare v at different heights", "Relation to escape velocity"],
            commonMistakes: ["Using R instead of r", "Forgetting v decreases with height", "Confusing with escape velocity"],
            tips: "v_o = √(GM/r) ∝ 1/√r. Higher orbit = slower speed. At surface: v_o = √(gR) ≈ 7.9 km/s. v_escape = √2 × v_orbital. v_o at height h: √(gR²/(R+h))."
        },
        {
            concept: "Escape Velocity",
            uid: "GRV20",
            theory: "Minimum velocity to escape gravitational field completely.",
            formula: "v_e = \\sqrt{\\frac{2GM}{R}} = \\sqrt{2gR}",
            details: "For Earth: v_e ≈ 11.2 km/s. Independent of direction and mass of object.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate escape velocity", "Compare for different planets", "Escape from given height"],
            commonMistakes: ["Thinking v_e depends on direction", "Confusing with orbital velocity", "Wrong factor of √2"],
            tips: "v_e = √(2GM/R) = √(2gR) = √2 × v_orbital. Direction doesn't matter! From height h: v_e = √(2GM/(R+h)). If v < v_e: elliptical orbit. If v = v_e: parabolic path."
        },
        {
            concept: "Time Period of Satellite",
            uid: "GRV21",
            theory: "Time for one complete orbit.",
            formula: "T = 2\\pi\\sqrt{\\frac{r^3}{GM}} = 2\\pi\\sqrt{\\frac{(R+h)^3}{gR^2}}",
            details: "At surface: T ≈ 84 min. Geostationary: T = 24 hrs at h ≈ 36,000 km.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate orbital period", "Geostationary satellite height", "Period ratio for different orbits"],
            commonMistakes: ["Using R instead of (R+h)", "Wrong formula manipulation", "Forgetting T ∝ r³/²"],
            tips: "T = 2π√(r³/GM) ∝ r³/². Near surface: T ≈ 84 min = √(3πG/ρ). Geosynchronous: T = 24 hrs, solve for r. T increases with altitude."
        },
        {
            concept: "Energy of Satellite in Orbit",
            uid: "GRV22",
            theory: "Total mechanical energy of orbiting satellite.",
            formula: "E = KE + PE = \\frac{GMm}{2r} - \\frac{GMm}{r} = -\\frac{GMm}{2r}",
            details: "E < 0 for bound orbit. E = 0 at escape. KE = -E, PE = 2E.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Total energy of satellite", "Energy to change orbit", "Binding energy"],
            commonMistakes: ["Getting signs wrong", "Forgetting E < 0 for bound orbit", "Wrong KE or PE formula"],
            tips: "For circular orbit: KE = GMm/2r, PE = -GMm/r, E = -GMm/2r. Relations: E = -KE = PE/2. To escape: need to add |E| = GMm/2r of energy."
        },
        {
            concept: "Binding Energy",
            uid: "GRV23",
            theory: "Energy required to remove satellite from orbit to infinity.",
            formula: "BE = -E = \\frac{GMm}{2r}",
            details: "Positive energy that must be supplied. Equals magnitude of total energy.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate binding energy", "Energy to move to higher orbit", "Rocket fuel required"],
            commonMistakes: ["Using total energy with wrong sign", "Confusing with kinetic energy", "Not accounting for orbit change"],
            tips: "BE = |E| = GMm/2r = KE. To move from r₁ to r₂: ΔE = GMm/2(1/r₁ - 1/r₂). Moving to higher orbit requires energy input!"
        },
        {
            concept: "Geostationary Satellite",
            uid: "GRV24",
            theory: "Satellite that appears stationary relative to Earth.",
            formula: "T = 24 \\text{ hrs}, \\quad h \\approx 36,000 \\text{ km}, \\quad v \\approx 3.1 \\text{ km/s}",
            details: "Must be in equatorial plane, orbiting west to east. Used for communication.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Height of geostationary orbit", "Why equatorial plane?", "Applications"],
            commonMistakes: ["Thinking any 24-hr satellite is geostationary", "Wrong height calculation", "Forgetting equatorial requirement"],
            tips: "Geostationary = geosynchronous + equatorial + same direction as Earth rotation. h = (gR²T²/4π²)^(1/3) - R ≈ 36,000 km. Used for TV, weather satellites."
        },
        {
            concept: "Polar Satellite",
            uid: "GRV25",
            theory: "Satellite in orbit passing over poles.",
            formula: "\\text{Orbit perpendicular to equator, low altitude, short period}",
            details: "Earth rotates beneath, satellite covers entire surface. Used for mapping, spying.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Coverage of polar satellite", "Advantages", "Typical altitude and period"],
            commonMistakes: ["Confusing with geostationary", "Thinking it stays over poles", "Wrong orbital characteristics"],
            tips: "Polar orbits scan entire Earth as it rotates. Low altitude (~800 km) for resolution. Period ~100 min. Sun-synchronous variant maintains constant Sun angle."
        },

        // ============ SPECIAL TOPICS ============
        {
            concept: "Weightlessness",
            uid: "GRV26",
            theory: "Condition when normal force becomes zero.",
            formula: "N = mg - \\frac{mv^2}{r} = 0 \\quad (\\text{in orbit})",
            details: "Not absence of gravity! Both astronaut and spacecraft fall together. 'Free fall' state.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Why astronauts float?", "Weightlessness in elevator", "g in ISS"],
            commonMistakes: ["Thinking there's no gravity in space", "Confusing with zero mass", "Wrong explanation of floating"],
            tips: "In orbit, g ≈ 8.7 m/s² at ISS altitude! Astronauts and ISS both free-fall, so no normal force = weightlessness. Also occurs in free-falling elevator."
        },
        {
            concept: "Black Holes and Escape Velocity",
            uid: "GRV27",
            theory: "When escape velocity exceeds speed of light.",
            formula: "R_s = \\frac{2GM}{c^2} \\quad (\\text{Schwarzschild radius})",
            details: "If object compressed to R < R_s, becomes black hole. Even light cannot escape.",
            jeeImportance: "Low",
            type: "formula",
            questionTypes: ["Calculate Schwarzschild radius", "Condition for black hole", "Escape velocity equals c"],
            commonMistakes: ["Using Newtonian physics near black holes", "Wrong formula application", "Confusing with event horizon"],
            tips: "R_s = 2GM/c². For Sun: R_s ≈ 3 km. For Earth: R_s ≈ 9 mm. If all mass compressed within R_s, becomes black hole. From v_e = c, we get R = 2GM/c²."
        },
        {
            concept: "Gravitational Potential Energy with Zero at Surface",
            uid: "GRV28",
            theory: "Alternative reference with PE = 0 at surface.",
            formula: "U = mgh \\quad (\\text{valid for } h << R)",
            details: "Near surface approximation. PE = 0 at surface instead of infinity.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["When to use mgh vs -GMm/r", "Height limitation", "Error comparison"],
            commonMistakes: ["Using mgh for large heights", "Mixing reference conventions", "Not knowing when approximation breaks"],
            tips: "mgh valid when h << R (say h < R/10). For large h: use U = -GMm/r. The exact formula: U = -GMm/(R+h) - (-GMm/R) = GMm[1/R - 1/(R+h)]."
        },
        {
            concept: "Double Star System",
            uid: "GRV29",
            theory: "Two stars orbiting their common center of mass.",
            formula: "\\omega = \\sqrt{\\frac{G(M_1+M_2)}{d^3}}, \\quad \\frac{r_1}{r_2} = \\frac{M_2}{M_1}",
            details: "d = separation = r₁ + r₂. Both have same ω but different r from COM.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Period of binary star", "Orbital radii about COM", "Velocities of stars"],
            commonMistakes: ["Using single mass in formula", "Wrong COM calculation", "Forgetting both stars orbit"],
            tips: "Stars orbit COM with same T but different r. M₁r₁ = M₂r₂. ω = √(G(M₁+M₂)/d³). Heavier star closer to COM, moves slower."
        },
        {
            concept: "Maximum Height Attained by Projectile",
            uid: "GRV30",
            theory: "Using energy conservation for large heights.",
            formula: "h = \\frac{v^2 R}{2gR - v^2} = \\frac{R}{(v_e/v)^2 - 1}",
            details: "Valid for any initial velocity v < v_e. Not limited by mgh approximation.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Maximum height from initial velocity", "Velocity for given height", "Compare with mgh result"],
            commonMistakes: ["Using h = v²/2g for large heights", "Wrong energy conservation setup", "Forgetting g varies with height"],
            tips: "Energy conservation: ½mv² - GMm/R = -GMm/(R+h). Solve for h. If v = v_e/√2, h = R. If v = v_e, h → ∞."
        },
        {
            concept: "Gravitational Field Inside Solid Sphere",
            uid: "GRV31",
            theory: "Field varies linearly inside uniform sphere.",
            formula: "E_g = \\frac{GMr}{R^3} = g\\frac{r}{R} \\quad (r < R)",
            details: "Only mass inside radius r contributes. Field = 0 at center.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Field at depth inside Earth", "Graph of E vs r", "Compare with 1/r² outside"],
            commonMistakes: ["Using 1/r² inside", "Forgetting field is zero at center", "Wrong mass calculation"],
            tips: "Inside: E ∝ r (linear). Outside: E ∝ 1/r². Maximum E at surface (r = R). From center: E increases linearly to surface, then drops as 1/r²."
        },
        {
            concept: "Tunnel Through Earth",
            uid: "GRV32",
            theory: "Motion of object dropped through diametric tunnel.",
            formula: "T = 2\\pi\\sqrt{\\frac{R}{g}} \\approx 84 \\text{ min}",
            details: "Same as orbital period at surface! Simple harmonic motion.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Time for one complete oscillation", "SHM in tunnel", "Compare with surface orbital period"],
            commonMistakes: ["Using length of tunnel instead of R", "Not recognizing SHM", "Wrong time period formula"],
            tips: "Dropped object oscillates with T = 2π√(R/g) ≈ 84 min (same as close-orbit satellite!). This is SHM because F ∝ -x inside sphere. Works for any straight tunnel, not just diametric!"
        },
        {
            concept: "Transfer Orbit (Hohmann Transfer)",
            uid: "GRV33",
            theory: "Energy-efficient method to change orbital radius.",
            formula: "\\Delta v_1 = v_{ellipse,perihelion} - v_{orbit1}, \\quad \\Delta v_2 = v_{orbit2} - v_{ellipse,aphelion}",
            details: "Uses elliptical orbit touching both circular orbits. Two velocity impulses needed.",
            jeeImportance: "Low",
            type: "formula",
            questionTypes: ["Energy for orbit change", "Hohmann transfer to higher orbit", "Time for transfer"],
            commonMistakes: ["Thinking direct velocity change works", "Wrong semi-major axis for transfer orbit", "Forgetting energy considerations"],
            tips: "To go higher: speed up tangentially (ellipse), then speed up again at apogee (circular). Total Δv less than direct change. Used for interplanetary missions."
        }
    ]
};

export default gravitation;
