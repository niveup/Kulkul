
import json

path = r"d:\formula ap\personal-dashboard\src\data\qft_06.json"

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_qs = [
    {
        "id": 16,
        "type": "MCQ",
        "text": "Reaction of p-toluic acid with methanol labeled with O-18 (MeOH¹⁸) in presence of H⁺.\nProduct A is:",
        "options": ["A", "B", "C", "D"],
        "answer": 1, 
        "image": {"sourcePage": "qft6_images/page_17.png", "crop": None}
    },
    {
        "id": 17,
        "type": "MCQ",
        "text": "In the titration of I₂ (aq) by S₂O₃²⁻ (aq) using the starch indicator, the end point is indicated by:",
        "options": [
            "Colourless to blue",
            "Blue to colourless",
            "Pink to colourless",
            "Blue to pink"
        ],
        "answer": 2, 
        "image": {"sourcePage": "qft6_images/page_18.png", "crop": None}
    },
    {
        "id": 18,
        "type": "MCQ",
        "text": "Given below are two statements:\nStatement I: A unit formed by the attachment of a base to 1' position of sugar is known as nucleoside\nStatement II: When nucleoside is linked to phosphorous acid at 5'-position of sugar moiety, we get nucleotide.\nIn the light of the above statements, choose the correct answer from the options given below:",
        "options": [
            "Statement I is false but Statement II is true.",
            "Both Statement I and Statement II are true.",
            "Both Statement I and Statement II are false.",
            "Statement I is true but Statement II is false."
        ],
        "answer": 4, 
        "image": {"sourcePage": "qft6_images/page_19.png", "crop": None}
    },
    {
        "id": 19,
        "type": "MCQ",
        "text": "The rate of SN1 reaction is fastest in the hydrolysis of which of the following halides?",
        "options": [
            "C₆H₅CH₂Br",
            "CH₃Br",
            "(CH₃)₂CHBr",
            "(CH₃)₃CBr"
        ],
        "answer": 4, 
        "image": {"sourcePage": "qft6_images/page_20.png", "crop": None}
    },
    {
        "id": 20,
        "type": "MCQ",
        "text": "A solution when treated with dimethyl glyoxime gives a rosy red complex. The metal present is---",
        "options": ["Ni", "Al", "Co", "Mn"],
        "answer": 1, 
        "image": {"sourcePage": "qft6_images/page_21.png", "crop": None}
    }
]

chem_questions = data["subjects"][0]["sections"][0]["questions"]
chem_questions.extend(new_qs)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Appended Q16-Q20")
