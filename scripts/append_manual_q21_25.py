
import json

path = r"d:\formula ap\personal-dashboard\src\data\qft_06.json"

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_qs = [
    {
        "id": 21,
        "type": "Numerical",
        "text": "9.2 g of N₂O₄ is heated in a 1 L vessel till equilibrium state is reached.\nN₂O₄ (g) ⇌ 2NO₂ (g)\nIf in the equilibrium state, 50% of N₂O₄ is dissociated, then, the equilibrium constant will be K, find 20K.\n(Molecular weight of N₂O₄ = 92)",
        "options": [],
        "answer": 4, 
        "image": {"sourcePage": "qft6_images/page_22.png", "crop": None}
    },
    {
        "id": 22,
        "type": "Numerical",
        "text": "The work done (in Cal) in adiabatic compression of 2 moles of an ideal monatomic gas by the constant external pressure of 2 atm starting from an initial pressure of 1 atm and an initial temperature of 300 K is:\n[R = 2cal/mol-K]",
        "options": [],
        "answer": 720, 
        "image": {"sourcePage": "qft6_images/page_23.png", "crop": None}
    },
    {
        "id": 23,
        "type": "Numerical",
        "text": "For a dilute solution containing 2.5 g of a non-volatile non-electrolyte solute in 100 g of water, the elevation in boiling point at 1 atm pressure is 2°C. Assuming concentration of solute is much lower than the concentration of solvent, the vapour pressure (in mm of Hg) of the solution is (take Kb = 0.76 Kkg mol⁻¹)",
        "options": [],
        "answer": 724, 
        "image": {"sourcePage": "qft6_images/page_24.png", "crop": None}
    },
    {
        "id": 24,
        "type": "Numerical",
        "text": "If k is rate constant and A is collision frequency then find (Ea₂ - Ea₁) for reaction in kcal/mol at 227°C\nk₁ = 100k₂\n10 A₁ = A₂\nln 10 = 7/3\n(Nearest Integer)",
        "options": [],
        "answer": 7, 
        "image": {"sourcePage": "qft6_images/page_25.png", "crop": None}
    },
    {
        "id": 25,
        "type": "Numerical",
        "text": "An organic compound of molecular formula C₃H₇N was analysed for nitrogen by Dumas method. Find the volume (in mL) of nitrogen evolved at NTP from 2 g of the substance.",
        "options": [],
        "answer": 392, 
        "image": {"sourcePage": "qft6_images/page_26.png", "crop": None}
    }
]

# Append to Chemistry Numerical (index 1)
chem_num = data["subjects"][0]["sections"][1]["questions"]
chem_num.extend(new_qs)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Appended Q21-Q25 (Numerical)")
