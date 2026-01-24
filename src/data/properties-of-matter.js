/**
 * JEE Properties of Matter
 * Class 11 Physics - Chapter: Mechanical Properties of Solids and Fluids
 * 
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 */

export const propertiesOfMatter = {
    topic: "Properties of Matter",
    concepts: [
        // ============ ELASTICITY ============
        {
            concept: "Stress",
            uid: "POM01",
            theory: "Internal restoring force per unit area developed in a deformed body.",
            formula: "\\text{Stress} = \\frac{F}{A}",
            details: "Unit: N/m² = Pascal (Pa). Types: tensile, compressive, shear.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate stress in wire", "Compare stress in different materials", "Breaking stress problems"],
            commonMistakes: ["Confusing with pressure", "Using wrong area (cross-section, not surface)", "Forgetting units"],
            tips: "Stress = Force/Area. Tensile = stretching, Compressive = pressing, Shear = parallel layers sliding. Always use cross-sectional area!"
        },
        {
            concept: "Strain",
            uid: "POM02",
            theory: "Ratio of change in dimension to original dimension.",
            formula: "\\text{Strain} = \\frac{\\Delta L}{L} \\quad \\text{(longitudinal)}",
            details: "Dimensionless. Types: longitudinal, volumetric, shear.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate strain from extension", "Compare strains", "Percentage strain"],
            commonMistakes: ["Using final length instead of original", "Adding units (strain is dimensionless)", "Confusing types of strain"],
            tips: "Longitudinal: ΔL/L. Volumetric: ΔV/V. Shear: tanφ ≈ φ (for small angles). Strain has no units - it's a ratio!"
        },
        {
            concept: "Hooke's Law",
            uid: "POM03",
            theory: "Stress is proportional to strain within elastic limit.",
            formula: "\\text{Stress} \\propto \\text{Strain} \\implies \\text{Stress} = E \\times \\text{Strain}",
            details: "E = modulus of elasticity. Valid only within elastic limit.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find elastic modulus", "Extension problems", "Elastic limit identification"],
            commonMistakes: ["Applying beyond elastic limit", "Confusing different moduli", "Wrong proportionality constant"],
            tips: "Hooke's law: F ∝ x (or Stress ∝ Strain). Beyond elastic limit, material deforms permanently. E = Stress/Strain = slope of stress-strain curve."
        },
        {
            concept: "Young's Modulus",
            uid: "POM04",
            theory: "Ratio of longitudinal stress to longitudinal strain.",
            formula: "Y = \\frac{FL}{A\\Delta L} = \\frac{\\text{Stress}}{\\text{Strain}}",
            details: "Unit: Pa or N/m². Steel ≈ 2×10¹¹ Pa. Large Y means stiff material.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate extension of wire", "Compare extensions for different Y", "Load-extension graph"],
            commonMistakes: ["Wrong formula arrangement", "Confusing Y with k (spring constant)", "Not using consistent units"],
            tips: "Y = FL/(AΔL). So ΔL = FL/(YA). For same F and A: extension ∝ L/Y. Stronger material = higher Y = less extension. Y_steel > Y_copper > Y_rubber."
        },
        {
            concept: "Bulk Modulus",
            uid: "POM05",
            theory: "Ratio of volumetric stress to volumetric strain.",
            formula: "B = \\frac{-\\Delta P}{\\Delta V/V} = -V\\frac{\\Delta P}{\\Delta V}",
            details: "Negative sign because volume decreases with pressure increase. Compressibility = 1/B.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Volume change under pressure", "Compressibility of liquids", "Compare B of materials"],
            commonMistakes: ["Forgetting negative sign", "Wrong volume ratio", "Confusing with Young's modulus"],
            tips: "B = -ΔP/(ΔV/V). Higher B = harder to compress. Water B ≈ 2×10⁹ Pa. Gases have low B. Compressibility κ = 1/B."
        },
        {
            concept: "Modulus of Rigidity (Shear Modulus)",
            uid: "POM06",
            theory: "Ratio of shear stress to shear strain.",
            formula: "G = \\frac{F/A}{\\tan\\phi} \\approx \\frac{F/A}{\\phi}",
            details: "φ = angle of shear (small). Also called η. Unit: Pa.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Shear deformation", "Torsion problems", "Rigidity comparison"],
            commonMistakes: ["Using tanφ instead of φ for small angles", "Confusing with torsion modulus", "Wrong area definition"],
            tips: "Shear strain = φ (angle). G = τ_shear/φ. For cube: top face moves by x, height h, then φ = x/h. G is relevant for twisting/torsion."
        },
        {
            concept: "Poisson's Ratio",
            uid: "POM07",
            theory: "Ratio of lateral strain to longitudinal strain.",
            formula: "\\sigma = \\frac{\\text{Lateral strain}}{\\text{Longitudinal strain}} = -\\frac{\\Delta d/d}{\\Delta L/L}",
            details: "Dimensionless. Range: 0 to 0.5. For most materials: 0.2 to 0.4.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate lateral contraction", "Volume change under tension", "Material identification"],
            commonMistakes: ["Wrong sign (lateral contracts when longitudinal extends)", "Out of range values", "Confusing strains"],
            tips: "σ = -(Δd/d)/(ΔL/L). Negative because material thins when stretched. Max σ = 0.5 (volume constant). Cork: σ ≈ 0 (doesn't contract sideways)."
        },
        {
            concept: "Elastic Potential Energy in Wire",
            uid: "POM08",
            theory: "Energy stored in stretched elastic material.",
            formula: "U = \\frac{1}{2} \\times \\text{Stress} \\times \\text{Strain} \\times V = \\frac{1}{2}\\frac{F^2L}{YA}",
            details: "Energy density u = (1/2) × stress × strain. Total U = u × volume.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Energy stored in stretched wire", "Work done in stretching", "Energy density calculation"],
            commonMistakes: ["Using wrong volume", "Forgetting factor of 1/2", "Confusing work done with stored energy"],
            tips: "U = ½ × F × ΔL = ½ × (stress)(strain) × V. Also U = (stress)²V/(2Y) = Y(strain)²V/2. Area under F-ΔL curve = energy stored."
        },
        {
            concept: "Stress-Strain Curve",
            uid: "POM09",
            theory: "Graph showing material behavior under load.",
            formula: "\\text{Slope in elastic region} = \\text{Young's modulus}",
            details: "Shows proportional limit, elastic limit, yield point, ultimate stress, breaking point.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Interpret stress-strain curve", "Identify elastic limit", "Compare ductile and brittle"],
            commonMistakes: ["Confusing elastic and proportional limits", "Wrong identification of regions", "Misinterpreting plastic region"],
            tips: "Proportional limit: Hooke's law ends. Elastic limit: permanent deformation starts. Yield point: significant plastic flow. Ductile: large plastic region. Brittle: breaks suddenly."
        },
        {
            concept: "Breaking Stress",
            uid: "POM10",
            theory: "Maximum stress a material can withstand before fracture.",
            formula: "\\sigma_{breaking} = \\frac{F_{max}}{A}",
            details: "Also called ultimate tensile strength. Independent of dimensions.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Maximum load on wire", "Factor of safety", "Wire diameter for given load"],
            commonMistakes: ["Confusing with breaking force", "Not using safety factor", "Wrong area calculation"],
            tips: "Breaking stress is material property (Pa). Breaking force = σ × A depends on area. For safety: working stress = breaking stress / safety factor."
        },

        // ============ FLUID STATICS ============
        {
            concept: "Fluid Pressure",
            uid: "POM11",
            theory: "Force per unit area exerted by fluid on surfaces.",
            formula: "P = \\frac{F}{A}, \\quad P = P_0 + \\rho gh",
            details: "Pressure increases with depth. P₀ = atmospheric pressure ≈ 10⁵ Pa.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Pressure at depth", "Gauge vs absolute pressure", "Pressure difference"],
            commonMistakes: ["Forgetting atmospheric pressure", "Using wrong h (vertical depth)", "Confusing gauge and absolute"],
            tips: "P = P₀ + ρgh (absolute). Gauge pressure = ρgh (relative to atmosphere). 10 m water column ≈ 1 atm. Pressure same at same depth in connected liquid."
        },
        {
            concept: "Pascal's Law",
            uid: "POM12",
            theory: "Pressure applied to enclosed fluid is transmitted equally in all directions.",
            formula: "\\frac{F_1}{A_1} = \\frac{F_2}{A_2}",
            details: "Basis of hydraulic machines. Force multiplication possible.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Hydraulic lift", "Hydraulic brakes", "Force multiplication"],
            commonMistakes: ["Thinking distance moved is same", "Wrong area ratio", "Forgetting work conservation"],
            tips: "F₂/F₁ = A₂/A₁ (force multiplication). But d₁/d₂ = A₂/A₁ (distance inverse). Work: F₁d₁ = F₂d₂. Larger piston moves less but more force."
        },
        {
            concept: "Atmospheric Pressure",
            uid: "POM13",
            theory: "Pressure exerted by Earth's atmosphere.",
            formula: "P_{atm} = 1.013 \\times 10^5 \\text{ Pa} = 760 \\text{ mm Hg} = 10.3 \\text{ m water}",
            details: "Decreases with altitude. Measured by barometer.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Barometer reading", "Pressure at altitude", "Unit conversions"],
            commonMistakes: ["Wrong unit conversion", "Forgetting variation with altitude", "Confusing with gauge pressure"],
            tips: "1 atm = 101.3 kPa = 760 mmHg = 10.3 m H₂O. Mercury barometer height = P_atm/(ρ_Hg × g). Changes by ~100 Pa per 8.5 m altitude."
        },
        {
            concept: "Buoyancy and Archimedes' Principle",
            uid: "POM14",
            theory: "Upward force equals weight of fluid displaced.",
            formula: "F_b = \\rho_{fluid} V_{submerged} g",
            details: "Acts at center of buoyancy (centroid of displaced fluid).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Floating objects", "Apparent weight", "Density determination"],
            commonMistakes: ["Using object density instead of fluid", "Wrong volume (submerged, not total)", "Confusing center of mass with center of buoyancy"],
            tips: "Buoyant force = ρ_fluid × V_displaced × g. For floating: weight = buoyancy, so V_sub/V_total = ρ_object/ρ_fluid. Apparent weight = W - F_b."
        },
        {
            concept: "Floating Condition",
            uid: "POM15",
            theory: "Object floats when its density is less than fluid density.",
            formula: "\\frac{V_{submerged}}{V_{total}} = \\frac{\\rho_{object}}{\\rho_{fluid}}",
            details: "Stable floating: center of buoyancy above center of mass (for ships: metacenter above COM).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Fraction submerged", "Will it float?", "Load capacity of boat"],
            commonMistakes: ["Inverting the density ratio", "Not considering liquid on both sides", "Wrong volume calculation"],
            tips: "If ρ_object < ρ_fluid: floats. Fraction submerged = ρ_object/ρ_fluid. Ice in water: 90% submerged (ρ_ice/ρ_water = 0.9). In other liquids, fraction changes!"
        },
        {
            concept: "Apparent Weight in Fluid",
            uid: "POM16",
            theory: "Weight minus buoyancy gives apparent weight.",
            formula: "W_{apparent} = W - F_b = V\\rho_{object}g - V\\rho_{fluid}g = Vg(\\rho_{object} - \\rho_{fluid})",
            details: "Used for determining density using loss of weight in water.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Apparent weight in water", "Density measurement", "Completely submerged objects"],
            commonMistakes: ["Wrong sign (apparent can be negative!)", "Using wrong density", "Confusing with normal weight"],
            tips: "W_app = W(1 - ρ_fluid/ρ_object). Relative density = W/(W - W_water) = W/loss in water. If W_app < 0, object floats up!"
        },
        {
            concept: "Pressure at Interface of Immiscible Liquids",
            uid: "POM17",
            theory: "Pressure at boundary between non-mixing liquids.",
            formula: "P = P_0 + \\rho_1 g h_1 + \\rho_2 g h_2",
            details: "Add contributions from each liquid layer. Denser liquid stays below.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Pressure in layered liquids", "U-tube with different liquids", "Oil floating on water"],
            commonMistakes: ["Forgetting a layer", "Wrong order of densities", "Using single density"],
            tips: "Add pressure from each layer: P = P₀ + Σρᵢghᵢ. In U-tube: pressure at same level in connected liquid must be equal. Use this for measuring density!"
        },

        // ============ FLUID DYNAMICS ============
        {
            concept: "Continuity Equation",
            uid: "POM18",
            theory: "Mass flow rate is constant in steady flow.",
            formula: "A_1 v_1 = A_2 v_2 = Q = \\text{constant}",
            details: "Q = volume flow rate (m³/s). For incompressible fluid: Av = constant.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Velocity change with pipe area", "Flow rate problems", "Constricted pipe"],
            commonMistakes: ["Applying to compressible flow without modification", "Wrong area calculation", "Confusing mass and volume flow rate"],
            tips: "A₁v₁ = A₂v₂. Smaller area → faster flow. For circular pipe: πr₁²v₁ = πr₂²v₂. If radius halves, velocity quadruples! Volume flow rate Q = Av."
        },
        {
            concept: "Bernoulli's Equation",
            uid: "POM19",
            theory: "Energy conservation for ideal fluid flow.",
            formula: "P + \\frac{1}{2}\\rho v^2 + \\rho gh = \\text{constant}",
            details: "Valid for steady, incompressible, non-viscous flow along streamline.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Velocity from pressure difference", "Torricelli's theorem", "Venturi meter"],
            commonMistakes: ["Applying to viscous fluids", "Forgetting conditions for validity", "Wrong height reference"],
            tips: "P + ½ρv² + ρgh = constant along streamline. Higher v → lower P (airplane wing!). Each term has units of pressure (energy/volume)."
        },
        {
            concept: "Torricelli's Theorem",
            uid: "POM20",
            theory: "Velocity of fluid emerging from hole in tank.",
            formula: "v = \\sqrt{2gh}",
            details: "h = height of fluid above the hole. Same as free-fall from height h!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Efflux velocity", "Range of fluid jet", "Time to empty tank"],
            commonMistakes: ["Using wrong h", "Forgetting this is exit velocity only", "Not applying to horizontal range"],
            tips: "v = √(2gh), same as v of object falling from height h. For jet from side of tank: range R = 2√(h(H-h)), maximum at h = H/2."
        },
        {
            concept: "Venturi Meter",
            uid: "POM21",
            theory: "Flow speed measurement using pressure difference.",
            formula: "v_1 = A_2\\sqrt{\\frac{2(P_1-P_2)}{\\rho(A_1^2-A_2^2)}}",
            details: "Constriction increases velocity, decreases pressure. Measures flow rate.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Velocity from pressure difference", "Design of venturi meter", "Flow rate measurement"],
            commonMistakes: ["Wrong area ratio usage", "Forgetting to use continuity", "Sign error in pressure difference"],
            tips: "At constriction: v increases, P decreases. Pressure difference measured by manometer. Combine Bernoulli + continuity to derive formula."
        },
        {
            concept: "Dynamic Lift (Magnus Effect)",
            uid: "POM22",
            theory: "Lift force on spinning objects in fluid flow.",
            formula: "\\text{Lift} \\propto \\rho v \\omega r^2",
            details: "Spinning ball in air: velocity adds on one side, subtracts on other. Pressure difference creates lift.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Curved path of spinning ball", "Airplane wing lift", "Direction of lateral force"],
            commonMistakes: ["Wrong direction of force", "Confusing with drag", "Not recognizing spinning effect"],
            tips: "Spinning creates velocity difference on sides → pressure difference → lateral force. Topspin: ball dips. Backspin: ball floats. Used in cricket, tennis, football."
        },

        // ============ VISCOSITY ============
        {
            concept: "Viscosity and Viscous Force",
            uid: "POM23",
            theory: "Internal friction in fluids resisting relative motion between layers.",
            formula: "F = \\eta A \\frac{dv}{dx}",
            details: "η = coefficient of viscosity. Unit: Pa·s or Poise (1 Poise = 0.1 Pa·s).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Viscous force between layers", "Velocity gradient problems", "Compare viscosities"],
            commonMistakes: ["Wrong velocity gradient direction", "Confusing η with surface tension", "Unit conversion errors"],
            tips: "F = ηA(dv/dx). η is viscosity coefficient. Water: η ≈ 10⁻³ Pa·s. Honey: much higher. dv/dx = velocity gradient = how fast velocity changes with distance."
        },
        {
            concept: "Stokes' Law",
            uid: "POM24",
            theory: "Viscous drag force on small sphere moving through fluid.",
            formula: "F = 6\\pi\\eta rv",
            details: "Valid for small Reynolds number (laminar flow). Used for terminal velocity.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Drag force on sphere", "Terminal velocity", "Measuring viscosity"],
            commonMistakes: ["Using for turbulent flow", "Forgetting factor 6π", "Wrong radius usage"],
            tips: "F = 6πηrv for sphere in viscous medium. Proportional to r (not r²!). Used in Millikan oil drop experiment, viscosity measurement."
        },
        {
            concept: "Terminal Velocity",
            uid: "POM25",
            theory: "Constant velocity when drag equals net downward force.",
            formula: "v_t = \\frac{2r^2(\\rho - \\sigma)g}{9\\eta}",
            details: "ρ = density of sphere, σ = density of fluid. Reached when F_drag = W - F_buoyancy.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate terminal velocity", "Effect of radius", "Falling droplets"],
            commonMistakes: ["Forgetting buoyancy", "Wrong density difference", "Using σ instead of (ρ-σ)"],
            tips: "v_t = 2r²(ρ-σ)g/(9η). v_t ∝ r² (bigger falls faster). If ρ < σ (bubble in liquid), body rises with terminal velocity. Rain drops reach ~5-10 m/s."
        },
        {
            concept: "Reynolds Number",
            uid: "POM26",
            theory: "Dimensionless number predicting flow type.",
            formula: "Re = \\frac{\\rho v D}{\\eta} = \\frac{\\text{Inertial forces}}{\\text{Viscous forces}}",
            details: "Re < 1000: laminar. Re > 2000: turbulent. 1000-2000: transition.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate Reynolds number", "Predict flow type", "Critical velocity"],
            commonMistakes: ["Wrong characteristic length", "Forgetting it's dimensionless", "Using wrong formula"],
            tips: "Re = ρvD/η. High Re: turbulent (inertia dominates). Low Re: laminar (viscosity dominates). Critical velocity v_c = Re_cη/(ρD) for transition."
        },
        {
            concept: "Poiseuille's Law",
            uid: "POM27",
            theory: "Volume flow rate through pipe under pressure gradient.",
            formula: "Q = \\frac{\\pi P r^4}{8\\eta l}",
            details: "Q ∝ r⁴ (very sensitive to radius!). Pressure gradient P/l drives flow.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Flow rate through pipe", "Effect of changing radius", "Resistance to flow"],
            commonMistakes: ["Wrong power of r (it's r⁴!)", "Confusing pressure and pressure gradient", "Forgetting 8 in denominator"],
            tips: "Q = πPr⁴/(8ηl). Q ∝ r⁴: double radius → 16× flow! Blood flow resistance ∝ 1/r⁴, so small artery narrowing has huge effect (atherosclerosis)."
        },

        // ============ SURFACE TENSION ============
        {
            concept: "Surface Tension Definition",
            uid: "POM28",
            theory: "Force per unit length along liquid surface, or surface energy per unit area.",
            formula: "T = \\frac{F}{L} = \\frac{E}{A}",
            details: "Unit: N/m or J/m². Water: T ≈ 0.07 N/m. Acts parallel to surface.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Force due to surface tension", "Energy in soap bubble", "Surface tension measurement"],
            commonMistakes: ["Confusing with viscosity", "Wrong direction of force", "Forgetting both surfaces of film"],
            tips: "T = F/L. For soap film with two surfaces: F = 2TL. T = Energy/Area. Surface minimizes area (sphere for drops). T decreases with temperature."
        },
        {
            concept: "Surface Energy",
            uid: "POM29",
            theory: "Energy required to increase surface area.",
            formula: "W = T \\times \\Delta A",
            details: "Molecules at surface have higher energy than bulk. Work done = T × increase in area.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Work to create surface", "Energy of droplets", "Splitting drops"],
            commonMistakes: ["Forgetting factor of 2 for soap film", "Wrong area calculation for spheres", "Using total area instead of increase"],
            tips: "W = TΔA. Soap bubble: two surfaces, so W = 2TΔA. For sphere: A = 4πr². Breaking into n drops: new total area increases, needs energy input."
        },
        {
            concept: "Excess Pressure in Drops and Bubbles",
            uid: "POM30",
            theory: "Pressure difference across curved liquid surface.",
            formula: "\\Delta P_{drop} = \\frac{2T}{r}, \\quad \\Delta P_{bubble} = \\frac{4T}{r}",
            details: "Drop: one surface. Soap bubble: two surfaces (inner and outer).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Pressure inside drop/bubble", "Radius from pressure", "Bubble contact problems"],
            commonMistakes: ["Using wrong formula (drop vs bubble)", "Forgetting factor of 2 for bubbles", "Wrong radius"],
            tips: "Liquid drop: ΔP = 2T/r (one surface). Soap bubble: ΔP = 4T/r (two surfaces). Smaller radius → higher pressure. Air bubble IN liquid: ΔP = 2T/r."
        },
        {
            concept: "Contact Angle and Meniscus",
            uid: "POM31",
            theory: "Angle between liquid surface and solid surface at contact.",
            formula: "\\cos\\theta = \\frac{T_{SA} - T_{SL}}{T_{LA}}",
            details: "θ < 90°: wetting (concave meniscus). θ > 90°: non-wetting (convex meniscus).",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Shape of meniscus", "Wetting behavior", "Contact angle problems"],
            commonMistakes: ["Confusing wetting with non-wetting", "Wrong meniscus shape", "Using wrong surface energies"],
            tips: "Water on glass: θ ≈ 0° (wetting, concave). Mercury on glass: θ ≈ 140° (non-wetting, convex). θ determines capillary rise or depression."
        },
        {
            concept: "Capillary Rise",
            uid: "POM32",
            theory: "Rise or fall of liquid in narrow tube due to surface tension.",
            formula: "h = \\frac{2T\\cos\\theta}{\\rho g r}",
            details: "θ < 90°: rise. θ > 90°: depression. Inversely proportional to radius.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Height of capillary rise", "Tube diameter for given rise", "Mercury vs water"],
            commonMistakes: ["Forgetting cosθ factor", "Wrong sign for depression", "Using diameter instead of radius"],
            tips: "h = 2Tcosθ/(ρgr). Water: θ ≈ 0°, rises. Mercury: θ ≈ 140°, cosθ < 0, depresses. h ∝ 1/r. Narrower tube → higher rise. At equilibrium: surface tension force = weight of raised liquid."
        },
        {
            concept: "Pressure Difference Due to Capillarity",
            uid: "POM33",
            theory: "Pressure at curved meniscus differs from flat surface.",
            formula: "\\Delta P = \\frac{2T\\cos\\theta}{r}",
            details: "For concave meniscus (wetting): P_inside < P_outside. Causes rise.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Pressure below meniscus", "Force balance in capillary", "Combining with hydrostatic pressure"],
            commonMistakes: ["Wrong pressure comparison", "Confusing with excess pressure in bubble", "Not considering atmospheric pressure"],
            tips: "Pressure just below concave meniscus is less than atmosphere by 2Tcosθ/r. This pressure difference drives the capillary rise until hydrostatic pressure balances it."
        },
        {
            concept: "Detergent Action and Surface Tension",
            uid: "POM34",
            theory: "How soaps and detergents reduce surface tension.",
            formula: "\\text{Surfactant reduces } T \\implies \\text{better wetting}",
            details: "Soap molecules have hydrophilic and hydrophobic parts. Reduce T of water from 0.07 to ~0.03 N/m.",
            jeeImportance: "Low",
            type: "concept",
            questionTypes: ["Why soap cleans", "Effect on capillary rise", "Surface tension change"],
            commonMistakes: ["Thinking soap increases tension", "Not understanding surfactant mechanism", "Confusing effects"],
            tips: "Detergents lower T by disrupting surface molecular forces. Lower T → better wetting → penetrates fabric. Hot water also lowers T, helps cleaning."
        },
        {
            concept: "Cohesive and Adhesive Forces",
            uid: "POM35",
            theory: "Forces between similar molecules (cohesive) and different molecules (adhesive).",
            formula: "\\text{Adhesion > Cohesion} \\implies \\text{wetting}, \\quad \\text{Cohesion > Adhesion} \\implies \\text{non-wetting}",
            details: "Determines contact angle and capillary behavior.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Explain water on glass vs mercury", "Wetting criteria", "Meniscus shape from forces"],
            commonMistakes: ["Confusing cohesion and adhesion", "Not relating to contact angle", "Wrong force attribution"],
            tips: "Water-glass: adhesion > cohesion → wets, θ < 90°, concave meniscus. Mercury-glass: cohesion > adhesion → doesn't wet, θ > 90°, convex meniscus."
        },
        {
            concept: "Energy in Breaking a Liquid Drop",
            uid: "POM36",
            theory: "Energy change when drop breaks into smaller drops.",
            formula: "\\Delta E = 4\\pi T (nr_2^2 - r_1^2) = 4\\pi T r_1^2 (n^{1/3} - 1)",
            details: "n small drops from 1 large drop. Energy required increases total surface area.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Energy to split drop", "Number of drops from energy", "Combining drops energy"],
            commonMistakes: ["Wrong count of surfaces", "Forgetting volume conservation", "Wrong n relationship"],
            tips: "For n drops of radius r from radius R: nR³ = (volume constant), so r = R/n^(1/3). New area = n×4πr² = 4πR²n^(1/3). Energy needed = T × (increase in area)."
        }
    ]
};

export default propertiesOfMatter;
