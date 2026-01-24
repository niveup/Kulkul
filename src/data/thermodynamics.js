/**
 * JEE Thermodynamics
 * Class 11 Physics - Chapter: Thermodynamics
 * 
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 */

export const thermodynamics = {
    topic: "Thermodynamics",
    concepts: [
        // ============ THERMAL EXPANSION ============
        {
            concept: "Linear Expansion",
            uid: "THM01",
            theory: "Change in length due to temperature change.",
            formula: "\\Delta L = L_0 \\alpha \\Delta T, \\quad L = L_0(1 + \\alpha \\Delta T)",
            details: "α = coefficient of linear expansion. Unit: /°C or /K. Typical metals: α ~ 10⁻⁵ /K.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Expansion of rod", "Gap in rails", "Bimetallic strip"],
            commonMistakes: ["Using area or volume coefficient", "Wrong temperature difference", "Forgetting L₀ in formula"],
            tips: "ΔL = L₀αΔT. For steel: α ≈ 11×10⁻⁶/K. For bimetallic strip: material with larger α is on convex side when heated. Gap = L₀αΔT."
        },
        {
            concept: "Areal (Superficial) Expansion",
            uid: "THM02",
            theory: "Change in area due to temperature change.",
            formula: "\\Delta A = A_0 \\beta \\Delta T, \\quad \\beta = 2\\alpha",
            details: "β = coefficient of areal expansion. Approximately twice the linear coefficient.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Expansion of plate", "Hole in plate expansion", "Area change calculation"],
            commonMistakes: ["Using α instead of β", "Thinking hole shrinks (it expands!)", "Wrong relationship β = 2α"],
            tips: "β = 2α (approximately). Hole in metal plate expands same as if it were filled! Imagine thermal expansion uniformly scaling everything up."
        },
        {
            concept: "Volume Expansion",
            uid: "THM03",
            theory: "Change in volume due to temperature change.",
            formula: "\\Delta V = V_0 \\gamma \\Delta T, \\quad \\gamma = 3\\alpha",
            details: "γ = coefficient of volume expansion. For liquids, only γ is meaningful.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Expansion of fluid", "Overflow problems", "Density change with temperature"],
            commonMistakes: ["Using α for liquids", "Wrong factor (3α, not 2α)", "Forgetting liquids have only γ"],
            tips: "γ = 3α for solids. Liquids: only γ defined. Water anomaly: max density at 4°C. For overflow: V_overflow = V₀(γ_liquid - γ_container)ΔT."
        },
        {
            concept: "Thermal Stress",
            uid: "THM04",
            theory: "Stress developed when expansion is prevented.",
            formula: "\\sigma = Y \\alpha \\Delta T, \\quad F = YA\\alpha\\Delta T",
            details: "Stress develops when expansion is constrained. Can be very large!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Force on clamped rod", "Stress in rails", "Breaking due to thermal stress"],
            commonMistakes: ["Forgetting Young's modulus", "Wrong area usage", "Not recognizing compressive vs tensile"],
            tips: "σ = YαΔT. Large Y and large ΔT → large stress. Railway tracks have expansion gaps. Steel rod heated by 100°C develops stress ≈ 220 MPa!"
        },
        {
            concept: "Anomalous Expansion of Water",
            uid: "THM05",
            theory: "Water has maximum density at 4°C.",
            formula: "\\rho_{max} \\text{ at } 4°C; \\quad \\text{expands both above and below } 4°C",
            details: "Crucial for aquatic life in winter. Ice floats on water.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Why ice floats", "Lake temperature distribution", "Density of water at various T"],
            commonMistakes: ["Thinking water density always decreases with T", "Not knowing 4°C is special", "Wrong ice density"],
            tips: "Water: max density at 4°C. Below 4°C: water becomes less dense (contracts!). Ice at 0°C is less dense than water at 0°C. Lakes freeze from top."
        },

        // ============ CALORIMETRY ============
        {
            concept: "Heat Capacity and Specific Heat",
            uid: "THM06",
            theory: "Amount of heat required to change temperature.",
            formula: "Q = mc\\Delta T = C\\Delta T",
            details: "c = specific heat (J/kg·K). C = mc = heat capacity. Water: c = 4186 J/kg·K.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Heat required for temperature change", "Mixture problems", "Compare heating rates"],
            commonMistakes: ["Confusing c and C", "Wrong units", "Forgetting mass in calculations"],
            tips: "Q = mcΔT. Water has very high c (absorbs lots of heat). Metals have low c. Use Q_lost = Q_gained for mixtures. C = mc is total heat capacity."
        },
        {
            concept: "Latent Heat",
            uid: "THM07",
            theory: "Heat for phase change at constant temperature.",
            formula: "Q = mL",
            details: "L_f = latent heat of fusion. L_v = latent heat of vaporization. No temperature change during phase transition.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Heat for melting ice", "Steam condensation", "Phase diagram problems"],
            commonMistakes: ["Adding ΔT term during phase change", "Confusing L_f and L_v", "Forgetting phase change absorbs heat"],
            tips: "Q = mL (no ΔT!). Ice→water: L_f = 334 kJ/kg. Water→steam: L_v = 2260 kJ/kg. Vaporization takes ~7× more heat than melting!"
        },
        {
            concept: "Principle of Calorimetry",
            uid: "THM08",
            theory: "Heat lost by hot body equals heat gained by cold body.",
            formula: "Q_{lost} = Q_{gained}, \\quad m_1c_1(T_1-T_f) = m_2c_2(T_f-T_2)",
            details: "Assumes no heat loss to surroundings. Equilibrium temperature calculation.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Final temperature of mixture", "Specific heat determination", "Multiple substance mixing"],
            commonMistakes: ["Wrong sign in temperature difference", "Forgetting phase changes", "Not checking if phase change occurs"],
            tips: "ΣQ = 0. Use (initial - final) for hot body, (final - initial) for cold. Check if final T makes all substances in same phase - if not, account for latent heat!"
        },
        {
            concept: "Water Equivalent",
            uid: "THM09",
            theory: "Mass of water having same heat capacity as given body.",
            formula: "W = \\frac{mc}{c_{water}} = \\frac{C}{c_{water}}",
            details: "Simplifies calorimetry calculations. Unit: kg.",
            jeeImportance: "Low",
            type: "formula",
            questionTypes: ["Calculate water equivalent", "Calorimeter correction", "Heat capacity comparison"],
            commonMistakes: ["Using wrong specific heat", "Confusing with actual mass", "Unit errors"],
            tips: "Water equivalent W = mc/c_water. It's the mass of water that would have same heat capacity. Used to simplify mixing problems."
        },

        // ============ HEAT TRANSFER ============
        {
            concept: "Conduction - Fourier's Law",
            uid: "THM10",
            theory: "Heat transfer through material due to temperature difference.",
            formula: "\\frac{dQ}{dt} = -kA\\frac{dT}{dx}, \\quad H = \\frac{kA\\Delta T}{L}",
            details: "k = thermal conductivity. H = heat current. Metals: high k. Insulators: low k.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Heat flow through wall", "Composite slabs", "Temperature distribution"],
            commonMistakes: ["Wrong area (perpendicular to flow)", "Forgetting negative sign", "Using wrong k for composite"],
            tips: "H = kAΔT/L. For series: H same, add L/kA (thermal resistances). For parallel: ΔT same, add kA/L (conductances). Steady state: H = constant throughout."
        },
        {
            concept: "Thermal Resistance",
            uid: "THM11",
            theory: "Resistance to heat flow, analogous to electrical resistance.",
            formula: "R = \\frac{L}{kA}, \\quad H = \\frac{\\Delta T}{R}",
            details: "Add R in series, add 1/R in parallel. Ohm's law analog: H = ΔT/R.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Composite wall heat flow", "Series and parallel slabs", "Temperature at junction"],
            commonMistakes: ["Wrong combination rule", "Confusing with electrical R", "Wrong equivalent conductivity"],
            tips: "R = L/(kA). Series: R_eq = R₁ + R₂. Parallel: 1/R_eq = 1/R₁ + 1/R₂. Temperature at junction: T = T₁ - H×R₁. Very similar to circuits!"
        },
        {
            concept: "Temperature Gradient in Steady State",
            uid: "THM12",
            theory: "Linear temperature variation in uniform rod during steady conduction.",
            formula: "\\frac{dT}{dx} = -\\frac{H}{kA} = \\text{constant}",
            details: "Temperature drops linearly along rod. Steeper gradient in lower k material.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Temperature at point in rod", "Gradient comparison", "Composite rod temperature profile"],
            commonMistakes: ["Non-linear assumption", "Wrong sign of gradient", "Forgetting steady state requirement"],
            tips: "In steady state, T vs x is linear in each section. At junction of materials: temperature is continuous but gradient may jump. Larger k → gentler gradient."
        },
        {
            concept: "Convection",
            uid: "THM13",
            theory: "Heat transfer by bulk motion of fluid.",
            formula: "H = hA\\Delta T",
            details: "h = convection coefficient. Depends on fluid motion. Natural vs forced convection.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Cooling rate of object", "Natural vs forced convection", "Heat exchangers"],
            commonMistakes: ["Confusing h with k", "Not distinguishing from conduction", "Wrong area usage"],
            tips: "Convection: fluid actually moves carrying heat. Natural: density-driven (hot air rises). Forced: fan/pump driven. Much faster than conduction in fluids."
        },
        {
            concept: "Radiation - Stefan-Boltzmann Law",
            uid: "THM14",
            theory: "Energy radiated by hot body.",
            formula: "P = \\sigma A T^4, \\quad P = \\epsilon \\sigma A T^4 \\text{ (real body)}",
            details: "σ = 5.67×10⁻⁸ W/m²K⁴. ε = emissivity (0 to 1). T in Kelvin!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Power radiated at temperature", "Effect of temperature on radiation", "Emissivity problems"],
            commonMistakes: ["Using Celsius instead of Kelvin", "Forgetting T⁴ dependence", "Confusing with Newton's cooling"],
            tips: "P = εσAT⁴. P ∝ T⁴ (very strong!). Double T → 16× radiation. Black body: ε = 1. Polished surface: ε → 0. Most objects: ε ≈ 0.5-0.9."
        },
        {
            concept: "Net Radiation Exchange",
            uid: "THM15",
            theory: "Net heat radiated when body is in surroundings.",
            formula: "P_{net} = \\epsilon \\sigma A (T^4 - T_0^4)",
            details: "Body radiates and absorbs. Net exchange depends on temperature difference.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Net heat loss", "Equilibrium temperature", "Radiation in enclosure"],
            commonMistakes: ["Forgetting T₀ term", "Not using T⁴ - T₀⁴", "Wrong temperature units"],
            tips: "P_net = εσA(T⁴ - T₀⁴). If T > T₀: net emission. If T < T₀: net absorption. At equilibrium: T = T₀. For small ΔT: can linearize to get Newton's cooling."
        },
        {
            concept: "Wien's Displacement Law",
            uid: "THM16",
            theory: "Wavelength of maximum radiation inversely proportional to temperature.",
            formula: "\\lambda_{max} T = b = 2.9 \\times 10^{-3} \\text{ m·K}",
            details: "Hotter body → shorter wavelength peak. Sun (~5800 K): peak in visible.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Peak wavelength at temperature", "Temperature from color", "Compare stellar temperatures"],
            commonMistakes: ["Wrong value of b", "Using Celsius", "Confusing with total radiation"],
            tips: "λ_max × T = 2.9×10⁻³ m·K. Hotter = shorter λ = bluer. Sun: λ ≈ 500 nm (green-yellow). Red star: ~3000 K. Blue star: ~10000 K."
        },
        {
            concept: "Newton's Law of Cooling",
            uid: "THM17",
            theory: "Rate of cooling proportional to temperature difference (for small ΔT).",
            formula: "\\frac{dT}{dt} = -k(T - T_0)",
            details: "Approximation when (T - T₀) << T₀. Leads to exponential decay.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Cooling time calculation", "Temperature-time graph", "Average rate of cooling"],
            commonMistakes: ["Applying for large temperature differences", "Wrong exponential formula", "Confusing k with thermal conductivity"],
            tips: "dT/dt = -k(T - T₀). Solution: T - T₀ = (T_i - T₀)e^(-kt). For cooling from T₁ to T₂: average T ≈ (T₁+T₂)/2, use rate ∝ (avg T - T₀)."
        },
        {
            concept: "Kirchhoff's Law of Radiation",
            uid: "THM18",
            theory: "Good absorbers are good emitters.",
            formula: "\\frac{\\epsilon}{a} = \\text{constant for all bodies} = 1 \\text{ (for black body)}",
            details: "a = absorptivity, ε = emissivity. For black body: a = ε = 1.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Compare absorptivity and emissivity", "Radiation equilibrium", "Black body concepts"],
            commonMistakes: ["Thinking good reflectors are good emitters", "Confusing a and ε", "Not understanding black body"],
            tips: "At any wavelength: ε_λ/a_λ = E_blackbody. Good absorber = good emitter. Black surface absorbs all and emits maximum. White/shiny: reflects, doesn't emit well."
        },

        // ============ FIRST LAW OF THERMODYNAMICS ============
        {
            concept: "Zeroth Law of Thermodynamics",
            uid: "THM19",
            theory: "If A is in thermal equilibrium with B, and B with C, then A is in equilibrium with C.",
            formula: "T_A = T_B \\text{ and } T_B = T_C \\implies T_A = T_C",
            details: "Defines temperature and thermal equilibrium. Basis for temperature measurement.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Concept of temperature", "Thermal equilibrium", "Foundation of thermometry"],
            commonMistakes: ["Confusing with first law", "Not understanding its fundamental nature", "Thinking it's trivial"],
            tips: "Zeroth law defines temperature as a property. Allows use of thermometers. Without it, we couldn't say 'temperature' meaningfully!"
        },
        {
            concept: "First Law of Thermodynamics",
            uid: "THM20",
            theory: "Energy conservation: heat added equals internal energy change plus work done.",
            formula: "Q = \\Delta U + W",
            details: "Q: heat added to system (+), W: work done BY system (+). ΔU = nCvΔT for ideal gas.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate Q, W, or ΔU", "Process analysis", "Cyclic process"],
            commonMistakes: ["Wrong sign convention", "Confusing Q and W signs", "Using wrong formula for W"],
            tips: "Q = ΔU + W. Sign convention: Q > 0: heat IN. W > 0: work BY gas. For cycle: ΔU = 0, so Q = W. Learn the convention used in your problem!"
        },
        {
            concept: "Internal Energy",
            uid: "THM21",
            theory: "Total kinetic energy of molecules (for ideal gas).",
            formula: "U = nC_vT = \\frac{f}{2}nRT",
            details: "U depends only on T for ideal gas (state function). f = degrees of freedom.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate ΔU for process", "Compare U at different states", "U in isothermal process"],
            commonMistakes: ["Thinking U depends on P or V", "Wrong Cv value", "Not using state function property"],
            tips: "ΔU = nCvΔT for ALL processes (ideal gas). ΔU depends only on initial and final T. In isothermal: ΔT = 0 so ΔU = 0. U is a state function!"
        },
        {
            concept: "Work Done by Gas",
            uid: "THM22",
            theory: "Work in expansion or compression of gas.",
            formula: "W = \\int P \\, dV = \\text{Area under P-V curve}",
            details: "W > 0 for expansion, W < 0 for compression. Depends on path (not state function).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Work from P-V diagram", "Work in isothermal process", "Compare work in different processes"],
            commonMistakes: ["Using area above curve instead of under", "Wrong sign for compression", "Confusing with ΔU"],
            tips: "W = ∫P dV = area under P-V curve. Expansion (V↑): W > 0. Compression (V↓): W < 0. For cycle: W = enclosed area (clockwise = + work)."
        },

        // ============ THERMODYNAMIC PROCESSES ============
        {
            concept: "Isothermal Process",
            uid: "THM23",
            theory: "Process at constant temperature.",
            formula: "PV = \\text{constant}, \\quad W = nRT\\ln\\frac{V_2}{V_1} = nRT\\ln\\frac{P_1}{P_2}",
            details: "ΔT = 0, so ΔU = 0 and Q = W. Very slow process (quasi-static).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Work in isothermal expansion", "P-V diagram analysis", "Heat absorbed calculation"],
            commonMistakes: ["Forgetting ΔU = 0", "Wrong logarithm formula", "Confusing with adiabatic"],
            tips: "Isothermal: T constant, PV = constant. Q = W (all heat goes to work). W = nRT ln(V₂/V₁). Slow process, heat can flow in/out to maintain T."
        },
        {
            concept: "Isobaric Process",
            uid: "THM24",
            theory: "Process at constant pressure.",
            formula: "W = P\\Delta V = nR\\Delta T, \\quad Q = nC_p\\Delta T",
            details: "V/T = constant. Heat goes to both ΔU and W.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Work and heat in heating at constant P", "Cp calculation", "Piston problems"],
            commonMistakes: ["Using Cv instead of Cp", "Forgetting W = PΔV", "Wrong Q formula"],
            tips: "Isobaric: P constant. W = PΔV = nRΔT. Q = nCpΔT. ΔU = nCvΔT. Verify: Q = ΔU + W → Cp = Cv + R. Heating in open container is isobaric."
        },
        {
            concept: "Isochoric Process",
            uid: "THM25",
            theory: "Process at constant volume.",
            formula: "W = 0, \\quad Q = \\Delta U = nC_v\\Delta T",
            details: "P/T = constant. No work done, all heat changes internal energy.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Heat absorption at constant V", "Cv calculation", "Heating in rigid container"],
            commonMistakes: ["Thinking W ≠ 0", "Using Cp instead of Cv", "Wrong P-T relation"],
            tips: "Isochoric: V constant, so W = 0. All heat goes to ΔU. Q = nCvΔT = ΔU. Heating gas in closed rigid container. Vertical line on P-V diagram."
        },
        {
            concept: "Adiabatic Process",
            uid: "THM26",
            theory: "Process with no heat exchange.",
            formula: "PV^\\gamma = \\text{const}, \\quad TV^{\\gamma-1} = \\text{const}, \\quad W = \\frac{P_1V_1 - P_2V_2}{\\gamma - 1}",
            details: "Q = 0, so W = -ΔU. Fast process or insulated container.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Work in adiabatic process", "P-V-T relations", "Compare with isothermal"],
            commonMistakes: ["Confusing γ relations", "Wrong work formula", "Thinking ΔT = 0"],
            tips: "Adiabatic: Q = 0. W = -ΔU = -nCvΔT = (P₁V₁-P₂V₂)/(γ-1). Steeper than isothermal on P-V diagram. Compression heats gas, expansion cools it."
        },
        {
            concept: "Polytropic Process",
            uid: "THM27",
            theory: "General process: PVⁿ = constant.",
            formula: "PV^n = \\text{constant}, \\quad C = C_v\\frac{\\gamma - n}{1 - n}",
            details: "n = 0: isobaric. n = 1: isothermal. n = γ: adiabatic. n = ∞: isochoric.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Identify process from n value", "Specific heat of polytropic", "Work calculation"],
            commonMistakes: ["Wrong n for special processes", "Confusion with C formula", "Not recognizing polytropic form"],
            tips: "PVⁿ = const covers all processes! n=0: P=const. n=1: PV=const (isothermal). n=γ: adiabatic. n=∞: V=const. Specific heat C depends on n."
        },

        // ============ SECOND LAW AND HEAT ENGINES ============
        {
            concept: "Second Law of Thermodynamics",
            uid: "THM28",
            theory: "Entropy of isolated system never decreases. Heat flows spontaneously from hot to cold.",
            formula: "\\text{Kelvin: No engine with 100\\% efficiency. Clausius: No perfect refrigerator.}",
            details: "Puts limits on heat engine efficiency. Defines arrow of time.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Direction of heat flow", "Why perpetual motion impossible", "Entropy increase"],
            commonMistakes: ["Thinking 100% efficiency possible", "Confusing statements", "Violating second law in problem solving"],
            tips: "Kelvin: Can't convert all heat to work. Clausius: Can't move heat from cold to hot without work. Both are equivalent statements!"
        },
        {
            concept: "Heat Engine Efficiency",
            uid: "THM29",
            theory: "Ratio of work output to heat input.",
            formula: "\\eta = \\frac{W}{Q_H} = \\frac{Q_H - Q_C}{Q_H} = 1 - \\frac{Q_C}{Q_H}",
            details: "QH = heat from hot reservoir. QC = heat to cold reservoir. η < 1 always.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate efficiency", "Heat rejected calculation", "Compare engines"],
            commonMistakes: ["Using wrong heat ratio", "Forgetting efficiency < 100%", "Sign errors"],
            tips: "η = W/Q_H = 1 - Q_C/Q_H. Work = heat absorbed - heat rejected. η is always less than 1 (second law). Heat engine runs clockwise on P-V diagram."
        },
        {
            concept: "Carnot Engine and Efficiency",
            uid: "THM30",
            theory: "Most efficient engine operating between two temperatures.",
            formula: "\\eta_{Carnot} = 1 - \\frac{T_C}{T_H}",
            details: "Maximum possible efficiency. Uses two isothermal and two adiabatic processes. T in Kelvin!",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Maximum efficiency calculation", "Compare with real engine", "Temperature requirements"],
            commonMistakes: ["Using Celsius instead of Kelvin", "Thinking real engines achieve Carnot efficiency", "Wrong T ratio"],
            tips: "η_Carnot = 1 - T_C/T_H (temperatures in Kelvin!). No engine can beat this. Carnot cycle: isothermal expansion, adiabatic expansion, isothermal compression, adiabatic compression."
        },
        {
            concept: "Refrigerator and COP",
            uid: "THM31",
            theory: "Heat engine running in reverse - moves heat from cold to hot.",
            formula: "COP = \\frac{Q_C}{W} = \\frac{Q_C}{Q_H - Q_C} = \\frac{T_C}{T_H - T_C} \\text{ (Carnot)}",
            details: "Work input required to move heat from cold to hot. COP can be > 1.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate COP", "Work for cooling", "Compare with heat engine"],
            commonMistakes: ["Confusing COP with efficiency", "Wrong formula", "Not understanding COP > 1 is normal"],
            tips: "COP = Q_C/W (what you get / what you pay). COP can be high (unlike efficiency). Carnot COP = T_C/(T_H-T_C). AC and refrigerators are heat pumps."
        },
        {
            concept: "Heat Pump",
            uid: "THM32",
            theory: "Device to heat a space by extracting heat from outside.",
            formula: "COP_{HP} = \\frac{Q_H}{W} = \\frac{Q_H}{Q_H - Q_C} = \\frac{T_H}{T_H - T_C} \\text{ (Carnot)}",
            details: "Uses work to move heat to hot reservoir. COP_HP = COP_ref + 1.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate heat pump COP", "Compare with direct heating", "Work requirement"],
            commonMistakes: ["Confusing with refrigerator COP", "Not understanding benefit over direct heating", "Wrong heat ratio"],
            tips: "COP_HP = Q_H/W = 1 + Q_C/W = 1 + COP_ref. Heat pump delivers more heat than direct heating (W) because it moves additional Q_C from outside!"
        },
        {
            concept: "Entropy",
            uid: "THM33",
            theory: "Measure of disorder or unavailable energy.",
            formula: "\\Delta S = \\frac{Q_{rev}}{T} = nR\\ln\\frac{V_2}{V_1} + nC_v\\ln\\frac{T_2}{T_1}",
            details: "State function. ΔS ≥ 0 for isolated system. ΔS_universe ≥ 0 for any process.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate entropy change", "Reversible process", "Universe entropy change"],
            commonMistakes: ["Using Q for irreversible process directly", "Forgetting ln not log", "Wrong sign"],
            tips: "ΔS = Q_rev/T (use reversible path!). For ideal gas: ΔS = nRln(V₂/V₁) + nCvln(T₂/T₁). Adiabatic reversible: ΔS = 0. ΔS_universe = ΔS_system + ΔS_surroundings ≥ 0."
        },

        // ============ MOLAR HEAT CAPACITIES ============
        {
            concept: "Molar Heat Capacity at Constant Volume",
            uid: "THM34",
            theory: "Heat per mole per degree at constant volume.",
            formula: "C_v = \\frac{f}{2}R",
            details: "Monoatomic: 3R/2. Diatomic: 5R/2. f = degrees of freedom.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate Cv for gas", "ΔU calculation", "Compare different gases"],
            commonMistakes: ["Using wrong f value", "Confusing with Cp", "Forgetting vibration modes at high T"],
            tips: "Cv = (f/2)R. Monoatomic (He, Ar): f=3, Cv=3R/2. Diatomic (N₂, O₂): f=5, Cv=5R/2 (at room T, rotation only). At high T, vibration adds more."
        },
        {
            concept: "Molar Heat Capacity at Constant Pressure",
            uid: "THM35",
            theory: "Heat per mole per degree at constant pressure.",
            formula: "C_p = C_v + R = \\frac{f+2}{2}R",
            details: "Cp > Cv because some heat goes to work in expansion.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate Cp", "Cp - Cv relation", "Q in isobaric process"],
            commonMistakes: ["Forgetting Cp = Cv + R", "Wrong f for polyatomic", "Using Cp for isochoric"],
            tips: "Cp - Cv = R (Mayer's relation). Cp > Cv because some heat does work. γ = Cp/Cv = (f+2)/f. Monoatomic: γ=5/3. Diatomic: γ=7/5."
        },
        {
            concept: "Ratio of Specific Heats (γ)",
            uid: "THM36",
            theory: "Gamma determines adiabatic behavior.",
            formula: "\\gamma = \\frac{C_p}{C_v} = \\frac{f+2}{f} = 1 + \\frac{2}{f}",
            details: "Monoatomic: γ = 5/3 = 1.67. Diatomic: γ = 7/5 = 1.4.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate γ from gas type", "Use in adiabatic formulas", "Speed of sound relation"],
            commonMistakes: ["Wrong γ for gas type", "Confusing with other ratios", "Using room T values at high T"],
            tips: "γ = Cp/Cv. Monoatomic: 5/3. Diatomic: 7/5. Triatomic linear: 7/5. Triatomic nonlinear: 4/3. Higher γ = steeper adiabat. Sound speed: v ∝ √γ."
        },
        {
            concept: "Degrees of Freedom",
            uid: "THM37",
            theory: "Independent modes of energy storage per molecule.",
            formula: "f = 3 \\text{ (trans)} + 2 \\text{ (rot, linear)} + 2n \\text{ (vib at high T)}",
            details: "Translational: 3 for all. Rotational: 2 for linear, 3 for nonlinear. Vibrational: freezes out at low T.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Count DOF for molecule", "Energy per molecule", "Temperature dependence"],
            commonMistakes: ["Forgetting rotation has 2 not 3 for linear", "Including vibration at room T", "Wrong count for polyatomic"],
            tips: "Per DOF: energy = ½kT. Monoatomic: 3 trans. Diatomic at room T: 3 trans + 2 rot = 5. Vibration frozen out below ~1000K for most diatomics."
        }
    ]
};

export default thermodynamics;
