
import json

path = r"d:\formula ap\personal-dashboard\src\data\qft_06.json"

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_qs = [
    {
        "id": 31,
        "type": "MCQ",
        "text": "The number of common terms between the sequences given by 1, 4, 7, 10 ... 298 and 2, 4, 6, 8 ... 300 is ...",
        "options": ["49", "50", "48", "100"],
        "answer": 0,
        "image": {"sourcePage": "qft6_images/page_32.png", "crop": None}
    },
    {
        "id": 32,
        "type": "MCQ",
        "text": "Find the sum of all possible integral value(s) of 'a' for which F(x) = x³/3 + (a-3)x² + x - 13 has negative point of local minimum in the interval [1, 100].",
        "options": ["5040", "5050", "4990", "4950"],
        "answer": 0,
        "image": {"sourcePage": "qft6_images/page_33.png", "crop": None}
    },
    {
        "id": 33,
        "type": "MCQ",
        "text": "Let F(x) = ∫(x²/3 to x²) 2cos²t dt, x ∈ R and f: [0, 1/2] → [0, ∞) be a continuous function. For a ∈ [0, 1/2]. If F'(a) + 2 is the area of the region bounded by y = f(x), x = 0, x-axis and x = a, then find f(0).",
        "options": ["2", "0", "3", "1"],
        "answer": 0,
        "image": {"sourcePage": "qft6_images/page_34.png", "crop": None}
    },
    {
        "id": 34,
        "type": "MCQ",
        "text": "If [.] represents greatest integer function, then ∫(π/4 to 3π/4) [sin x + [4x/π]] dx =",
        "options": ["π/4", "π/2", "3π/4", "π"],
        "answer": 0,
        "image": {"sourcePage": "qft6_images/page_35.png", "crop": None}
    },
    {
        "id": 35,
        "type": "MCQ",
        "text": "The shortest distance between the following pair of lines:\nvector r = i + 2j - 4k + λ(2i + 3j + 6k) and\nvector r = 3i + 3j - 5k + μ(2i + 3j + 6k) is √293 / K. Find the value of K.",
        "options": ["5", "4", "6", "7"],
        "answer": 0,
        "image": {"sourcePage": "qft6_images/page_36.png", "crop": None}
    }
]

# Append to Mathematics MCQ (index 1 -> sections[0])
math_mcq = data["subjects"][1]["sections"][0]["questions"]
math_mcq.extend(new_qs)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Appended Math Q31-Q35")
