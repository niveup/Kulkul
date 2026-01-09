import json
import os

# Define Chemistry questions data
chem_questions_mcq = [
    {
        "id": 51,
        "type": "mcq",
        "text": "The decreasing order of percentage (%) enol content of the following compounds is:",
        "options": ["1 > 2 > 3 > 4", "2 > 3 > 1 > 4", "3 > 4 > 2 > 1", "2 > 1 > 3 > 4"],
        "answer": None,
        "image": "qft4_images/diagrams/chemistry_q51.png"
    },
    {
        "id": 52,
        "type": "mcq",
        "text": "It is said that coordination compounds have great importance in biological systems. In this context, which of the following statements is incorrect?",
        "options": [
            "Chlorophylls are green pigments in plants and contain calcium.",
            "Cyanocobalamin is Vitamin B₁₂ and contains cobalt.",
            "Carboxypeptidase-A is an enzyme and contains zinc.",
            "Haemoglobin is the red pigment of blood and contains iron."
        ],
        "answer": None,
        "image": None
    },
    {
        "id": 53,
        "type": "mcq",
        "text": "In the following molecules/ions: O₂⁺, O₂⁻, C₂²⁻, N₂²⁻, N₂⁴⁻. Which one is paramagnetic and has the highest bond length?",
        "options": ["O₂⁺", "C₂²⁻", "O₂⁻", "N₂⁴⁻"],
        "answer": None,
        "image": None
    },
    {
        "id": 54,
        "type": "mcq",
        "text": "For the following orders of the mentioned properties, mark (T) for correct order and (F) for incorrect order:\n(a) Acidity order: SiF₄ < SiCl₄ < SiBr₄ < SiI₄\n(b) Melting point: NH₃ > SbH₃ > AsH₃ > PH₃\n(c) Boiling point: NH₃ > SbH₃ > AsH₃ > PH₃\n(d) Dipole moment order: NH₃ > SbH₃ > AsH₃ > PH₃",
        "options": ["FTFT", "TFTF", "FFTT", "FFTF"],
        "answer": None,
        "image": None
    },
    {
        "id": 55,
        "type": "mcq",
        "text": "Identify A in the given chemical reaction.",
        "options": ["(A)", "(B)", "(C)", "(D)"],
        "answer": None,
        "image": "qft4_images/diagrams/chemistry_q55.png"
    },
    {
        "id": 56,
        "type": "mcq",
        "text": "Major product (Q) in following sequence is :",
        "options": ["(A)", "(B)", "(C)", "(D)"],
        "answer": None,
        "image": "qft4_images/diagrams/chemistry_q56.png"
    },
    {
        "id": 57,
        "type": "mcq",
        "text": "Amino acid (Q) obtain in following sequence is :",
        "options": ["Alanine", "Valine", "Glycine", "Leucine"],
        "answer": None,
        "image": "qft4_images/diagrams/chemistry_q57.png"
    },
    {
        "id": 58,
        "type": "mcq",
        "text": "K₂MnO₄ (A) + Cl₂ → X + KCl. X --(200°C)--> A + B + O₂↑. Where 'B' is:",
        "options": ["KMnO₄", "MnO₂", "HMnO₄", "H₂MnO₄"],
        "answer": None,
        "image": None
    },
    {
        "id": 59,
        "type": "mcq",
        "text": "Which of following statements is (are) true\n(i) RNA has β-D-Ribose hexose sugar\n(ii) Thymine, cytosine and uracil are pyrimidine bases.\n(iii) Adenine, Guanine are purine bases\n(iv) DNA contains adenine, Guanine, thymine, cytosine bases.\n(v) RNA contains adinine, Guanine, uracil and cytosine bases.",
        "options": ["i,iii,iv,v", "ii, iii, iv, v", "i, iv, v only", "i, iii,iv only"],
        "answer": None,
        "image": None
    },
    {
        "id": 60,
        "type": "mcq",
        "text": "Consider the following sequence of reactions. The major product (P) in the given reaction is",
        "options": ["(A)", "(B)", "(C)", "(D)"],
        "answer": None,
        "image": "qft4_images/diagrams/chemistry_q60.png"
    },
    {
        "id": 61,
        "type": "mcq",
        "text": "What will be the standard cell potential of a galvanic cell with the following reaction? 2Cr(s) + 3Cd²⁺(aq) → 2Cr³⁺(aq) + 3Cd(s). Given: E°(Cr³⁺/Cr) = -0.74 V, E°(Cd²⁺/Cd) = -0.40 V",
        "options": ["0.74 V", "1.14 V", "0.34 V", "-0.34 V"],
        "answer": None,
        "image": None
    },
    {
        "id": 62,
        "type": "mcq",
        "text": "The difference between the radii of the 2nd and 3rd orbits of He⁺ is ΔR₁. The difference between the radii of the 3rd and 4th orbits of Li²⁺ is ΔR₂. Find the value of ΔR₁/ΔR₂.",
        "options": ["21/10", "10/21", "15/14", "15/15"],
        "answer": None,
        "image": None
    },
    {
        "id": 63,
        "type": "mcq",
        "text": "Which of the following sulphate of lanthanides has strongly reducing nature?",
        "options": ["Eu(II)SO₄", "Eu₂(SO₄)₃", "Ce(SO₄)₂", "None of these"],
        "answer": None,
        "image": None
    },
    {
        "id": 64,
        "type": "mcq",
        "text": "Arrange the given alkylhalides in the increasing reactivity towards Nucleophilic substitution reactions.",
        "options": ["A > B > D > C", "A > C > B > D", "B > C > A > D", "D > A > C > B"],
        "answer": None,
        "image": "qft4_images/diagrams/chemistry_q64.png"
    },
    {
        "id": 65,
        "type": "mcq",
        "text": "Which of the following set of reagent(s) give cis-but-2-ene as a final major product starting with (+)-2-chlorobutane.",
        "options": [
            "Alcoholic KOH",
            "(i) CH3COOAg, (ii) Δ",
            "(i) Alc. KOH , (ii) Br2/CCl4, (iii) Alc. KOH;NaNH2, (iv) H2/Pd—BaSO4",
            "(i) Alc. KOH , (ii) Br2/CCl4, (iii) Alc. KOH;NaNH2, (iv) Na/ Liq. NH3"
        ],
        "answer": None,
        "image": None
    },
    {
        "id": 66,
        "type": "mcq",
        "text": "Among the following statements, which statements are correct?\n(i) Electron gain enthalpy values of elements may be exothermic (negative) or endothermic (positive).\n(ii) Generally the radius trend and the ionization energy trend across a period are exact opposites.\n(iii) The first ionization energy of sulphur is higher than that of phosphorus?\n(iv) Te²⁻ > I⁻ > Cs⁺ > Ba²⁺ represents the correct decreasing order of ionic radii.",
        "options": ["(i), (iii) and (iv)", "(ii), (iii) and (iv)", "(i), (ii) and (iv)", "(i), (ii) and (iii)"],
        "answer": None,
        "image": None
    },
    {
        "id": 67,
        "type": "mcq",
        "text": "Major product 'Y' in following reaction sequence is :",
        "options": ["(A)", "(B)", "(C)", "(D)"],
        "answer": None,
        "image": "qft4_images/diagrams/chemistry_q67.png"
    },
    {
        "id": 68,
        "type": "mcq",
        "text": "Determine the correct option for the following structures.",
        "options": [
            "Dipole moment varies as II > III > I.",
            "II is more stable than I.",
            "I is the most reactive among three.",
            "All the above."
        ],
        "answer": None,
        "image": "qft4_images/diagrams/chemistry_q68.png"
    },
    {
        "id": 69,
        "type": "mcq",
        "text": "The product 'C' is",
        "options": ["(A)", "(B)", "(C)", "(D)"],
        "answer": None,
        "image": "qft4_images/diagrams/chemistry_q69.png"
    },
    {
        "id": 70,
        "type": "mcq",
        "text": "The number of possible isomers for disubstituted borazine, B₃N₃H₄X₂, is:",
        "options": ["3", "4", "6", "2"],
        "answer": None,
        "image": None
    }
]

chem_questions_num = [
    {
        "id": 71,
        "type": "numerical",
        "text": "Two salts A₂X and MX have the same value of solubility product of 4.0 × 10⁻¹². The ratio of their molar solubilities, i.e., S(A₂X)/S(MX) = ? (Round off to the nearest integer)",
        "options": [],
        "answer": None,
        "image": None
    },
    {
        "id": 72,
        "type": "numerical",
        "text": "Two isotopes 'X' and 'Y' of atomic mass 10 and 20 respectively are mixed in equal amounts by mass. After 30 days, their mass ratio is found to be 4:1. If isotope 'X' has half-life of 10 days. What is the half-life of 'Y' (in days)?",
        "options": [],
        "answer": None,
        "image": None
    },
    {
        "id": 73,
        "type": "numerical",
        "text": "Resistance of a conductivity cell (cell constant 129 m⁻¹) filled with 74.5 ppm solution of KCl is 100 Ω (labelled as solution 1). When the same cell is filled with KCl solution of 149 ppm, the resistance is 50 Ω (labelled as solution 2). The ratio of molar conductivity of solution 1 and solution 2 is, i.e., Λ₁/Λ₂ = x × 10⁻³. The value of x is __. (Nearest integer) Given: molar mass of KCl = 74.5 g mol⁻¹.",
        "options": [],
        "answer": None,
        "image": None
    },
    {
        "id": 74,
        "type": "numerical",
        "text": "The number of moles of gas [B] per mole of given compound.",
        "options": [],
        "answer": None,
        "image": "qft4_images/diagrams/chemistry_q74.png"
    },
    {
        "id": 75,
        "type": "numerical",
        "text": "250 mL of a solution containing 0.6625 g of sodium carbonate and 2.8000 g of potassium hydroxide is titrated against N/10 HCl. Find out the value of x - y, where x and y are titre values (in mL) with methyl orange and phenolphthalein, respectively, taking 20 mL of the above solution each time.",
        "options": [],
        "answer": None,
        "image": None
    }
]

# Read existing JSON and append
json_path = os.path.join("src/data", "qft_04.json")
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update Chemistry sections
chem_subject = next(s for s in data['subjects'] if s['name'] == 'Chemistry')
chem_subject['sections'] = [
    {
        "name": "MCQ",
        "questions": chem_questions_mcq
    },
    {
        "name": "Numerical",
        "questions": chem_questions_num
    }
]

# Save updated JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Appended Chemistry questions (51-75)")
