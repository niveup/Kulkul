/**
 * JEE Units, Measurements & Dimensions
 * Class 11 Physics - Chapter: Physics and Measurement
 * 
 * Formulas use KaTeX notation (without $$ delimiters - renderer handles display mode)
 * Enhanced with questionTypes, commonMistakes, and tips for JEE preparation
 */

export const unitsDimensions = {
    topic: "Units & Dimensions",
    concepts: [
        // ============ FUNDAMENTAL UNITS ============
        {
            concept: "SI Base Units",
            uid: "UD01",
            theory: "The International System of Units (SI) has seven fundamental or base units from which all other units are derived.",
            formula: "\\text{7 Base Units: m, kg, s, A, K, mol, cd}",
            details: "Length (m), Mass (kg), Time (s), Electric Current (A), Temperature (K), Amount of Substance (mol), Luminous Intensity (cd)",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Identify base units", "Distinguish base from derived units", "Unit conversion problems"],
            commonMistakes: ["Confusing Kelvin with degree Celsius", "Thinking gram is the SI unit of mass (it's kilogram)", "Forgetting candela and mole as base units"],
            tips: "Mnemonic: 'MKS-AKMOL-Cd' = Meter, Kilogram, Second, Ampere, Kelvin, MOLe, Candela. Remember: gram is NOT a base unit, kilogram is!"
        },
        {
            concept: "Supplementary Units",
            uid: "UD02",
            theory: "Plane angle and solid angle are dimensionless quantities with special unit names.",
            formula: "\\text{Radian (rad)}, \\quad \\text{Steradian (sr)}",
            details: "1 rad = angle subtended when arc = radius. 1 sr = solid angle subtended when surface area = r².",
            jeeImportance: "Low",
            type: "concept",
            questionTypes: ["Convert degrees to radians", "Solid angle calculations", "Identify supplementary units"],
            commonMistakes: ["Thinking radians have dimensions", "Confusing plane angle with solid angle", "Not knowing steradian definition"],
            tips: "Both are dimensionless! π rad = 180°. Full sphere subtends 4π steradians. These are 'supplementary' to base units."
        },
        {
            concept: "Derived Units",
            uid: "UD03",
            theory: "Units obtained by combining base units through multiplication or division.",
            formula: "\\text{Force: N} = \\text{kg}\\cdot\\text{m/s}^2, \\quad \\text{Energy: J} = \\text{kg}\\cdot\\text{m}^2\\text{/s}^2",
            details: "All physical quantities except base quantities have derived units.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Express derived unit in base units", "Identify correct unit for quantity", "Unit consistency check"],
            commonMistakes: ["Mixing up N·m (torque) and J (energy) - same dimensions but different quantities", "Forgetting factor conversions"],
            tips: "1 N = 1 kg·m/s². 1 J = 1 N·m = 1 kg·m²/s². 1 W = 1 J/s. Pressure: 1 Pa = 1 N/m². Always break down to base units to check."
        },

        // ============ DIMENSIONAL ANALYSIS ============
        {
            concept: "Dimensions of Physical Quantities",
            uid: "UD04",
            theory: "Dimensions express a physical quantity in terms of fundamental quantities using symbols [M], [L], [T], [A], [K], [mol], [cd].",
            formula: "[\\text{Quantity}] = [M^a L^b T^c A^d K^e \\text{mol}^f \\text{cd}^g]",
            details: "The powers a, b, c, etc. are called dimensional exponents.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Find dimensions of given quantity", "Identify quantity from dimensions", "Check dimensional homogeneity"],
            commonMistakes: ["Confusing dimensions with units", "Wrong signs on exponents", "Forgetting angle is dimensionless"],
            tips: "[Force] = [MLT⁻²], [Energy] = [ML²T⁻²], [Power] = [ML²T⁻³]. Strain, angle, refractive index are all dimensionless!"
        },
        {
            concept: "Dimensional Formula of Mechanical Quantities",
            uid: "UD05",
            theory: "Common mechanical quantities and their dimensional formulas.",
            formula: "\\begin{aligned} &[\\text{Velocity}] = [LT^{-1}], \\quad [\\text{Acceleration}] = [LT^{-2}] \\\\ &[\\text{Force}] = [MLT^{-2}], \\quad [\\text{Work}] = [ML^2T^{-2}] \\end{aligned}",
            details: "Momentum = [MLT⁻¹], Impulse = [MLT⁻¹], Pressure = [ML⁻¹T⁻²]",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find dimensions of unknown quantity", "Match quantities with same dimensions", "Derive dimension from formula"],
            commonMistakes: ["Mixing up momentum [MLT⁻¹] and force [MLT⁻²]", "Pressure vs Force confusion", "Energy vs Power dimensions"],
            tips: "Momentum & Impulse have SAME dimensions. Work, Energy, Torque have SAME dimensions [ML²T⁻²]. Memorize these pairs!"
        },
        {
            concept: "Dimensional Formula of Electrical Quantities",
            uid: "UD06",
            theory: "Dimensional formulas for common electrical quantities.",
            formula: "\\begin{aligned} &[\\text{Charge}] = [AT], \\quad [\\text{Current}] = [A] \\\\ &[\\text{Voltage}] = [ML^2T^{-3}A^{-1}], \\quad [\\text{Resistance}] = [ML^2T^{-3}A^{-2}] \\end{aligned}",
            details: "Capacitance = [M⁻¹L⁻²T⁴A²], Inductance = [ML²T⁻²A⁻²]",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find dimensions of electric potential", "Verify Ohm's law dimensionally", "Units of ε₀ and μ₀"],
            commonMistakes: ["Forgetting Ampere is base unit, not Coulomb", "Wrong dimensions for permittivity/permeability"],
            tips: "[ε₀] = [M⁻¹L⁻³T⁴A²], [μ₀] = [MLT⁻²A⁻²]. Remember: √(1/ε₀μ₀) = c has dimensions [LT⁻¹]!"
        },
        {
            concept: "Principle of Homogeneity",
            uid: "UD07",
            theory: "In a physically correct equation, dimensions of all terms on both sides must be the same.",
            formula: "\\text{If } A = B + C, \\text{ then } [A] = [B] = [C]",
            details: "Only quantities with same dimensions can be added, subtracted, or equated.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Check dimensional correctness of equation", "Find dimensions of constant", "Identify incorrect equations"],
            commonMistakes: ["Not checking each term separately", "Assuming dimensionally correct means physically correct", "Forgetting numerical factors are dimensionless"],
            tips: "v = u + at: [LT⁻¹] = [LT⁻¹] + [LT⁻²][T] = [LT⁻¹] ✓. Dimensionally correct ≠ physically correct (can miss factors of 2, π)!"
        },
        {
            concept: "Deriving Relations Using Dimensional Analysis",
            uid: "UD08",
            theory: "Unknown relations can be derived by assuming dependence on relevant quantities.",
            formula: "T = k \\cdot l^a \\cdot m^b \\cdot g^c",
            details: "Match dimensions on both sides to find exponents a, b, c. k is dimensionless constant.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Derive formula for time period", "Find dependence of quantity", "Determine unknown exponents"],
            commonMistakes: ["Forgetting dimensionless constants like 2π", "Using too many variables (only 3-4 base dimensions available)", "Wrong assumption of dependencies"],
            tips: "For pendulum: T ∝ l^a·g^b. [T] = [L]^a[LT⁻²]^b → T = L^(a+b)·T^(-2b). So -2b=1, a+b=0 → b=-½, a=½. T ∝ √(l/g)!"
        },
        {
            concept: "Checking Correctness of Formulae",
            uid: "UD09",
            theory: "Dimensional analysis can verify if a given formula is possibly correct.",
            formula: "\\text{Check: } [LHS] = [RHS]",
            details: "Limitations: Cannot find numerical constants, cannot verify if formula involves only products/ratios.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Verify given formula", "Find error in formula", "Identify correct form among options"],
            commonMistakes: ["Concluding formula is correct just because dimensions match", "Missing arguments of transcendental functions"],
            tips: "sin(θ), cos(θ), e^x, log(x) - the argument must be dimensionless! If you see sin(vt), check if [vt] = dimensionless."
        },
        {
            concept: "Conversion of Units",
            uid: "UD10",
            theory: "Using dimensional formula to convert between unit systems.",
            formula: "n_2 = n_1 \\left(\\frac{M_1}{M_2}\\right)^a \\left(\\frac{L_1}{L_2}\\right)^b \\left(\\frac{T_1}{T_2}\\right)^c",
            details: "n₁u₁ = n₂u₂, where n is numerical value and u is unit.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Convert CGS to SI", "Find numerical value in new system", "Express physical constant in different units"],
            commonMistakes: ["Inverting the conversion factor", "Forgetting to change all base units", "Sign errors in exponents"],
            tips: "1 N = 10⁵ dyne, 1 J = 10⁷ erg. For force [MLT⁻²]: n₂ = n₁ × (1000/1) × (100/1) × (1/1)⁻² = n₁ × 10⁵"
        },

        // ============ SIGNIFICANT FIGURES ============
        {
            concept: "Significant Figures - Definition",
            uid: "UD11",
            theory: "The number of digits that are reliably known in a measured value.",
            formula: "\\text{All non-zero digits are significant}",
            details: "Significant figures indicate precision of measurement.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Count significant figures", "Express in scientific notation", "Identify precision level"],
            commonMistakes: ["Treating trailing zeros incorrectly", "Confusing leading zeros as significant", "Decimal point placement errors"],
            tips: "Rules: (1) Non-zero digits: significant, (2) Zeros between non-zero: significant, (3) Leading zeros: not significant, (4) Trailing zeros after decimal: significant"
        },
        {
            concept: "Significant Figures Rules",
            uid: "UD12",
            theory: "Comprehensive rules for counting significant figures.",
            formula: "\\begin{aligned} &0.00230 \\rightarrow 3 \\text{ sig figs} \\\\ &1.200 \\rightarrow 4 \\text{ sig figs} \\\\ &5000 \\rightarrow 1,2,3, \\text{or } 4 \\text{ (ambiguous)} \\end{aligned}",
            details: "Use scientific notation to remove ambiguity: 5.00 × 10³ = 3 sig figs",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Count significant figures in given numbers", "Round to specified sig figs", "Scientific notation conversion"],
            commonMistakes: ["Trailing zeros without decimal point", "Leading zeros in decimal numbers", "Not using scientific notation for clarity"],
            tips: "0.00456 → 3 SF (leading zeros don't count). 45.600 → 5 SF (trailing zeros after decimal count). Use 4.56×10⁻³ format!"
        },
        {
            concept: "Arithmetic with Significant Figures",
            uid: "UD13",
            theory: "Rules for maintaining precision in calculations.",
            formula: "\\begin{aligned} &\\text{Add/Sub: Round to least decimal places} \\\\ &\\text{Mul/Div: Round to least sig figs} \\end{aligned}",
            details: "The result cannot be more precise than the least precise input.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Add numbers and report correct sig figs", "Multiply and round appropriately", "Multi-step calculations"],
            commonMistakes: ["Using addition rule for multiplication", "Rounding too early in calculations", "Confusing decimal places with sig figs"],
            tips: "2.5 × 3.42 = 8.55 → 8.6 (2 SF). 2.34 + 1.1 = 3.44 → 3.4 (1 decimal place). Do intermediate calculations with full precision, round final answer!"
        },
        {
            concept: "Rounding Rules",
            uid: "UD14",
            theory: "Standard rules for rounding numbers.",
            formula: "\\text{If digit } < 5: \\text{ round down}, \\quad \\text{If } \\geq 5: \\text{ round up}",
            details: "Special case: if exactly 5, round to nearest even (banker's rounding).",
            jeeImportance: "Low",
            type: "concept",
            questionTypes: ["Round to specified decimal places", "Apply banker's rounding", "Chain rounding"],
            commonMistakes: ["Rounding multiple times in sequence", "Not following the 'round to even' rule for 5", "Confusing ceiling/floor with rounding"],
            tips: "3.45 → 3.4 (round to even), 3.55 → 3.6 (round to even). In JEE, usually standard rounding (≥5 up) is expected."
        },

        // ============ ERRORS IN MEASUREMENT ============
        {
            concept: "Types of Errors",
            uid: "UD15",
            theory: "Classification of errors: systematic, random, and gross errors.",
            formula: "\\text{Error} = \\text{Measured value} - \\text{True value}",
            details: "Systematic: consistent bias. Random: unpredictable variations. Gross: human mistakes.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Identify type of error", "Methods to reduce errors", "Effect on measurement accuracy"],
            commonMistakes: ["Confusing precision (random) with accuracy (systematic)", "Thinking systematic errors are random", "Not recognizing instrumental errors"],
            tips: "Systematic errors affect ACCURACY (same direction every time). Random errors affect PRECISION (scatter around true value). Systematic can be calibrated out!"
        },
        {
            concept: "Absolute Error",
            uid: "UD16",
            theory: "The magnitude of difference between measured value and true/mean value.",
            formula: "\\Delta a_i = |a_i - a_{mean}|",
            details: "Always positive. Mean absolute error = average of all absolute errors.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Calculate absolute error", "Find mean absolute error", "Express result with error"],
            commonMistakes: ["Forgetting absolute value", "Confusing with relative error", "Using wrong mean value"],
            tips: "Take multiple readings, find mean, then |reading - mean| for each. Mean absolute error = Σ|Δaᵢ|/n. Report as: a_mean ± Δa_mean"
        },
        {
            concept: "Relative Error",
            uid: "UD17",
            theory: "Ratio of absolute error to the measured/mean value.",
            formula: "\\text{Relative Error} = \\frac{\\Delta a}{a_{mean}}",
            details: "Dimensionless quantity. Often expressed as percentage (% error).",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate relative error", "Convert to percentage error", "Compare precision of measurements"],
            commonMistakes: ["Not dividing by mean value", "Confusing with absolute error", "Forgetting to multiply by 100 for percentage"],
            tips: "% Error = (Δa/a) × 100. This tells you the precision relative to the measurement. Smaller % error = more precise measurement!"
        },
        {
            concept: "Percentage Error",
            uid: "UD18",
            theory: "Relative error expressed as a percentage.",
            formula: "\\% \\text{ Error} = \\frac{\\Delta a}{a_{mean}} \\times 100\\%",
            details: "Most commonly used way to express precision of a measurement.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Express error as percentage", "Compare measurements by % error", "Acceptable error range problems"],
            commonMistakes: ["Forgetting × 100", "Using absolute instead of relative", "Wrong value in denominator"],
            tips: "If length is 5.0 ± 0.1 cm, % error = (0.1/5.0) × 100 = 2%. In JEE, 1-2% is typically good precision for experiments."
        },
        {
            concept: "Combination of Errors - Addition/Subtraction",
            uid: "UD19",
            theory: "When quantities are added or subtracted, absolute errors add.",
            formula: "Z = A \\pm B \\implies \\Delta Z = \\Delta A + \\Delta B",
            details: "Errors always ADD regardless of + or - in the formula.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Error in sum of measurements", "Error in difference", "Maximum possible error"],
            commonMistakes: ["Subtracting errors when quantities are subtracted", "Using relative errors for addition", "Not taking maximum error"],
            tips: "Z = A + B or Z = A - B: ALWAYS ΔZ = ΔA + ΔB. Errors ADD because worst case both errors work against you!"
        },
        {
            concept: "Combination of Errors - Multiplication/Division",
            uid: "UD20",
            theory: "When quantities are multiplied or divided, relative errors add.",
            formula: "Z = \\frac{AB}{C} \\implies \\frac{\\Delta Z}{Z} = \\frac{\\Delta A}{A} + \\frac{\\Delta B}{B} + \\frac{\\Delta C}{C}",
            details: "For Z = AⁿBᵐ: ΔZ/Z = |n|(ΔA/A) + |m|(ΔB/B)",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Error in product/quotient", "Error in power of quantity", "% error in derived quantity"],
            commonMistakes: ["Adding absolute errors instead of relative", "Forgetting to multiply by power", "Sign of power confusion"],
            tips: "Z = A²B/C³ → ΔZ/Z = 2(ΔA/A) + (ΔB/B) + 3(ΔC/C). Powers multiply the relative error! Larger powers = larger % error contribution."
        },
        {
            concept: "Error in Power of a Quantity",
            uid: "UD21",
            theory: "Error propagation when a quantity is raised to a power.",
            formula: "Z = A^n \\implies \\frac{\\Delta Z}{Z} = |n| \\frac{\\Delta A}{A}",
            details: "The power n can be positive, negative, or fractional.",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Error in A²", "Error in √A", "Error in 1/A"],
            commonMistakes: ["Forgetting absolute value of n", "Not applying to negative powers", "Confusing with direct proportionality"],
            tips: "Z = A² → ΔZ/Z = 2(ΔA/A). Z = √A → ΔZ/Z = ½(ΔA/A). Z = 1/A → ΔZ/Z = ΔA/A. Squaring DOUBLES the % error!"
        },

        // ============ LEAST COUNT ============
        {
            concept: "Least Count Definition",
            uid: "UD22",
            theory: "The smallest value that can be measured by an instrument.",
            formula: "\\text{LC} = \\frac{\\text{Value of 1 MSD}}{\\text{No. of VSD}}",
            details: "For vernier: LC = 1 MSD - 1 VSD. For screw gauge: LC = Pitch/No. of divisions",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Calculate LC of vernier caliper", "LC of screw gauge", "Reading with LC"],
            commonMistakes: ["Confusing MSD and VSD", "Wrong formula for screw gauge", "Not knowing standard LC values"],
            tips: "Vernier: LC = 1 MSD - 1 VSD (or 0.1 mm/0.01 cm typically). Screw gauge: LC = Pitch/100 = 0.5mm/100 = 0.01 mm typically."
        },
        {
            concept: "Vernier Caliper",
            uid: "UD23",
            theory: "Instrument for precise length measurement using main and vernier scales.",
            formula: "\\text{Reading} = \\text{MSR} + (\\text{VSR} \\times \\text{LC})",
            details: "MSR = Main Scale Reading, VSR = Vernier coinciding division, LC typically 0.01 cm",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Read vernier caliper", "Calculate least count", "Zero error correction"],
            commonMistakes: ["Forgetting zero error correction", "Reading wrong coinciding division", "Not converting units properly"],
            tips: "Reading = MSR + VSR × LC. Zero error: if 0 doesn't align, note the coinciding VSD, that many × LC is zero error. +ve if scale moved right."
        },
        {
            concept: "Screw Gauge (Micrometer)",
            uid: "UD24",
            theory: "Instrument for very precise measurement using screw mechanism.",
            formula: "\\text{Reading} = \\text{PSR} + (\\text{HSR} \\times \\text{LC})",
            details: "PSR = Pitch Scale Reading, HSR = Head Scale Reading, Pitch = distance moved per rotation",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Read screw gauge", "Calculate pitch and LC", "Measure wire diameter"],
            commonMistakes: ["Confusing pitch with LC", "Forgetting circular scale divisions", "Backlash error not considered"],
            tips: "Pitch = 0.5 mm or 1 mm typically. LC = Pitch/100 = 0.005 mm or 0.01 mm. For wire diameter, take readings at multiple points!"
        },
        {
            concept: "Zero Error",
            uid: "UD25",
            theory: "Error when instrument shows non-zero reading for zero measurement.",
            formula: "\\text{True Reading} = \\text{Observed Reading} - \\text{Zero Error}",
            details: "Positive zero error: subtract. Negative zero error: add.",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Correct for zero error", "Identify positive/negative zero error", "True measurement problems"],
            commonMistakes: ["Adding instead of subtracting positive error", "Wrong sign convention", "Confusing with least count"],
            tips: "Positive zero error = instrument reads MORE than actual. Subtract it. Negative = reads LESS. Add it. 'True = Observed - ZeroError' always!"
        },
        {
            concept: "Least Count Error",
            uid: "UD26",
            theory: "The error associated with the resolution limit of the measuring instrument.",
            formula: "\\Delta x = \\pm \\frac{\\text{LC}}{2} \\text{ (in precision measurements)}",
            details: "Usually taken as ±LC for maximum error, ±LC/2 for probable error.",
            jeeImportance: "Medium",
            type: "formula",
            questionTypes: ["Estimate measurement error", "Calculate precision of result", "Instrument selection problems"],
            commonMistakes: ["Ignoring instrument resolution", "Using wrong LC value", "Not matching precision requirements"],
            tips: "A measuring instrument cannot detect changes smaller than its LC. Choose instrument such that LC << quantity measured for good precision."
        },

        // ============ ACCURACY AND PRECISION ============
        {
            concept: "Accuracy vs Precision",
            uid: "UD27",
            theory: "Accuracy is closeness to true value; precision is consistency of repeated measurements.",
            formula: "\\text{Accuracy} \\propto \\frac{1}{|\\text{Systematic Error}|}, \\quad \\text{Precision} \\propto \\frac{1}{\\text{Random Error}}",
            details: "A measurement can be precise but not accurate, or accurate but not precise.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Distinguish accuracy and precision", "Identify from data sets", "Improvement methods"],
            commonMistakes: ["Using accuracy and precision interchangeably", "Thinking high precision means high accuracy", "Not recognizing systematic vs random"],
            tips: "Think of archery: Precision = tight cluster (low scatter). Accuracy = cluster near bullseye. Calibration improves accuracy, averaging improves precision."
        },
        {
            concept: "Order of Magnitude",
            uid: "UD28",
            theory: "The power of 10 closest to a quantity's value.",
            formula: "\\text{Order of magnitude of } N = 10^x \\text{ where } N \\approx 10^x",
            details: "Used for quick estimation and comparison of vastly different quantities.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Find order of magnitude", "Compare quantities by order", "Estimation problems"],
            commonMistakes: ["Not rounding correctly to power of 10", "Confusing significant figure with order", "Off by factor of 10"],
            tips: "For 6.4×10⁸: is it closer to 10⁸ or 10⁹? Since 6.4 > √10 ≈ 3.16, order is 10⁹. For N×10ⁿ: if N ≥ √10, order is 10ⁿ⁺¹."
        },

        // ============ DIMENSIONAL CONSTANTS ============
        {
            concept: "Dimensionless Quantities",
            uid: "UD29",
            theory: "Physical quantities with no dimensions, often ratios of same-dimension quantities.",
            formula: "[\\text{strain}] = [\\text{angle}] = [\\text{refractive index}] = [M^0L^0T^0]",
            details: "Examples: strain, angle, refractive index, relative density, coefficient of friction, efficiency",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Identify dimensionless quantities", "Verify arguments in transcendental functions", "Ratio problems"],
            commonMistakes: ["Thinking all constants are dimensionless", "Angles having dimensions", "Forgetting relative quantities are dimensionless"],
            tips: "If quantity = ratio of two same-dimension quantities, it's dimensionless. Also: e^x, log(x), sin(x) require x to be dimensionless!"
        },
        {
            concept: "Dimensional Constants",
            uid: "UD30",
            theory: "Physical constants that have dimensions.",
            formula: "\\begin{aligned} &[G] = [M^{-1}L^3T^{-2}] \\\\ &[h] = [ML^2T^{-1}] \\\\ &[c] = [LT^{-1}] \\end{aligned}",
            details: "G = gravitational constant, h = Planck's constant, c = speed of light",
            jeeImportance: "High",
            type: "formula",
            questionTypes: ["Find dimensions of constants", "Derive units from dimensions", "Express in different unit systems"],
            commonMistakes: ["Wrong dimensions for G", "Confusing h with ħ (ħ = h/2π)", "Not knowing dimensions of universal constants"],
            tips: "[G] from F = GMm/r²: [G] = [F][r²]/[M²] = [MLT⁻²][L²]/[M²] = [M⁻¹L³T⁻²]. Same for [h] from E = hf: [h] = [ML²T⁻¹]"
        },
        {
            concept: "Dimensionless Constants",
            uid: "UD31",
            theory: "Pure numbers without dimensions that appear in physical relations.",
            formula: "\\pi = 3.14159..., \\quad e = 2.71828...",
            details: "Examples: π, e, 2, ½, fine structure constant α ≈ 1/137",
            jeeImportance: "Low",
            type: "concept",
            questionTypes: ["Identify dimensionless constants", "Their role in dimensional analysis", "Limitations due to these constants"],
            commonMistakes: ["Trying to find dimensional constants using dimensional analysis", "Including them in dimensional formula"],
            tips: "Dimensional analysis CANNOT find pure numbers like 2, π, ½. That's why T = 2π√(l/g) but dimensional analysis only gives T ∝ √(l/g)."
        },

        // ============ APPLICATIONS ============
        {
            concept: "Planck's Natural Units",
            uid: "UD32",
            theory: "System of units based on fundamental constants: c, G, h.",
            formula: "\\begin{aligned} &l_P = \\sqrt{\\frac{hG}{c^3}} \\approx 10^{-35} \\text{ m} \\\\ &t_P = \\sqrt{\\frac{hG}{c^5}} \\approx 10^{-43} \\text{ s} \\end{aligned}",
            details: "Planck length, time, mass are the smallest meaningful physical quantities.",
            jeeImportance: "Low",
            type: "formula",
            questionTypes: ["Derive Planck units dimensionally", "Order of magnitude calculations", "Significance of Planck scale"],
            commonMistakes: ["Wrong combination of G, h, c", "Not recognizing these as limits of physics", "Confusing with atomic scales"],
            tips: "Use dimensional analysis: for length [L], find combination of G, h, c. [G]=[M⁻¹L³T⁻²], [h]=[ML²T⁻¹], [c]=[LT⁻¹]. Solve for length dimension!"
        },
        {
            concept: "Physical Quantities with Same Dimensions",
            uid: "UD33",
            theory: "Different physical quantities can have identical dimensional formulas.",
            formula: "\\begin{aligned} &[\\text{Work}] = [\\text{Energy}] = [\\text{Torque}] = [ML^2T^{-2}] \\\\ &[\\text{Impulse}] = [\\text{Momentum}] = [MLT^{-1}] \\end{aligned}",
            details: "Frequency and angular velocity both have [T⁻¹]. Stress and pressure both have [ML⁻¹T⁻²].",
            jeeImportance: "High",
            type: "concept",
            questionTypes: ["Match quantities by dimensions", "Identify same-dimension pairs", "Distinguish by units"],
            commonMistakes: ["Thinking same dimensions means same quantity", "Confusing torque and energy", "Missing angular quantities having different units"],
            tips: "Work and Torque: SAME [ML²T⁻²] but different! Work = F·d (scalar), Torque = r×F (vector). Frequency [T⁻¹] in Hz, Angular frequency [T⁻¹] in rad/s!"
        },
        {
            concept: "Limitations of Dimensional Analysis",
            uid: "UD34",
            theory: "Cases where dimensional analysis fails or is insufficient.",
            formula: "\\text{Cannot find: dimensionless constants, relations with exp/trig, multi-term relations}",
            details: "Cannot distinguish vector from scalar, cannot find complete form of relations.",
            jeeImportance: "Medium",
            type: "concept",
            questionTypes: ["Identify limitations", "Why DA fails for given case", "Complementary methods needed"],
            commonMistakes: ["Over-relying on dimensional analysis", "Expecting exact formulas", "Not recognizing when DA is inapplicable"],
            tips: "DA fails when: (1) >3 relevant quantities (underdetermined), (2) sum/difference relations, (3) transcendental functions, (4) dimensionless constants like 2π."
        }
    ]
};

export default unitsDimensions;
