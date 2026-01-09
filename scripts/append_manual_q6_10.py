
import json

path = r"d:\formula ap\personal-dashboard\src\data\qft_06.json"

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_qs = [
    {
        "id": 6,
        "type": "MCQ",
        "text": "Evaluate the following statements about Group 13 elements:\n(A) Atomic radius decreases down the group from B to Tl in a regular manner.\n(B) Electronegativity decreases gradually down the group from B to Tl.\n(C) Aluminium can form compounds with a covalency of 6 due to the presence of vacant d-orbitals.\n(D) Compounds of boron, like boric acid (H₃BO₃), exhibit significant pπ — pπ character.\n(E) Boron and silicon exhibit similar chemical properties, such as covalent bonding and acidic oxide formation.\nChoose the correct combination of statements from the options below:",
        "options": [
            "(A), (B), and (D) only",
            "(B), (C), and (E) only",
            "(C), (D), and (E) only",
            "(B), (D), and (E) only"
        ],
        "answer": 3,
        "image": {"sourcePage": "qft6_images/page_6.png", "crop": None}
    },
    {
        "id": 7,
        "type": "MCQ",
        "text": "n, l and m values of orbitals A and B are given below.\n  A: n=3, l=2, m=0\n  B: n=3, l=1, m=0\nWhich statement about A and B orbitals are correct?\n(a) A has more energy than B.\n(b) A possess electron density along axial direction only.\n(c) B has one angular node and two radial nodes.\n(d) Probability of finding electron density in B is zero along x - z plane.\nAssume that for d sub-shell, m = 0 for d_z² orbital and for p sub-shell, m = 0 for p_z orbital.",
        "options": ["a and b", "b and c", "c and d", "a and d"],
        "answer": 4, 
        "image": {"sourcePage": "qft6_images/page_7.png", "crop": None}
    },
    {
        "id": 8,
        "type": "MCQ",
        "text": "Given E°(Au³⁺/Au) = 1.52 V and E°(Au³⁺/Au⁺) = 1.36 V\nPoint out the correct statement of the following",
        "options": [
            "Au³⁺ disproportionates into Au⁴⁺ and Au²⁺ in aqueous solution",
            "Au³⁺ disproportionates into Au⁴⁺ and Au⁺ in aqueous solution",
            "Au⁺ disproportionates into Au³⁺ and Au in aqueous solution",
            "Au⁺ disproportionates into Au²⁺ and Au in aqueous solution"
        ],
        "answer": 3,
        "image": {"sourcePage": "qft6_images/page_8.png", "crop": None}
    },
    {
        "id": 9,
        "type": "MCQ",
        "text": "Which of the following reactions are not feasible?",
        "options": ["I & IV only", "II & III only", "II & IV only", "I & III only"],
        "answer": 1,
        "image": {"sourcePage": "qft6_images/page_9.png", "crop": None}
    },
    {
        "id": 10,
        "type": "MCQ",
        "text": "Predict the correct order of the metallic character among the following:",
        "options": [
            "Cu > Ag > Au > Rg",
            "Rg > Au > Ag > Cu",
            "Au > Ag > Cu > Rg",
            "Rg > Cu > Au > Ag"
        ],
        "answer": 2,
        "image": {"sourcePage": "qft6_images/page_10.png", "crop": None}
    }
]

# Append to Chemistry MCQ
chem_questions = data["subjects"][0]["sections"][0]["questions"]
# Ensure we don't double add if run multiple times (safe since we reset often)
chem_questions.extend(new_qs)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Appended Q6-Q10")
