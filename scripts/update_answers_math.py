
import json

path = r"d:\formula ap\personal-dashboard\src\data\qft_06.json"

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# RESET ALL EXISTING ANSWERS TO 0
for subject in data["subjects"]:
    for section in subject["sections"]:
        for q in section["questions"]:
            q["answer"] = 0

# PREPARE MATH QUESTIONS Q26-Q30 (Pages 27-31)
# Note: These are Math MCQs. ID should likely be 1-5 relative to Math section or 26-30 globally? 
# The user's system seems to handle IDs. I will use 1-5 for Math MCQs to be safe or 26-30 if global. 
# Previous Qs were 1-25. Let's use 1-5 for Math to restart ID per subject if that's the pattern, 
# BUT looking at `qft_04.json` (viewed earlier), IDs are usually unique? 
# Let's check the global ID pattern. Q1-25 were Chem. 
# I will use 1-5 for Math for now, or 26-30? 
# Actually, unique IDs are better. I will use 26-30.

math_qs = [
    {
        "id": 26,
        "type": "MCQ",
        "text": "Number of complex numbers satisfying the relation |z + z̄| + |z - z̄| = 2 and |z + i| + |z - i| = 2 is:",
        "options": ["1", "2", "3", "4"],
        "answer": 0,
        "image": {"sourcePage": "qft6_images/page_27.png", "crop": None}
    },
    {
        "id": 27,
        "type": "MCQ",
        "text": "Let A = [a_ij] be a square matrix of order 3 and B = [b_ij] be a matrix such that b_ij = 2^(i-j) a_ij for 1 ≤ i, j ≤ 3. If the determinant of A is same as its order, then the value of |(B^T)^-1| is",
        "options": ["1/3", "3", "9", "1/27"],
        "answer": 0,
        "image": {"sourcePage": "qft6_images/page_28.png", "crop": None}
    },
    {
        "id": 28,
        "type": "MCQ",
        "text": "If |√2z - 3 + 2i| = |z||sin(π/4 + arg z₁) + cos(3π/4 - arg z₁)|, where z₁ = 1 + i/√3, then locus of z is -",
        "options": ["a pair of straight lines", "circle", "parabola", "ellipse"],
        "answer": 0,
        "image": {"sourcePage": "qft6_images/page_29.png", "crop": None}
    },
    {
        "id": 29,
        "type": "MCQ",
        "text": "Let A be a 3 × 3 matrix such that a_11 = a_33 = 2 and all the other a_ij = 1. Let A^-1 = xA^2 + yA + zI then find the value of (x + y + z) where I is a unit matrix of order 3.",
        "options": ["2", "5", "1", "3"],
        "answer": 0,
        "image": {"sourcePage": "qft6_images/page_30.png", "crop": None}
    },
    {
        "id": 30,
        "type": "MCQ",
        "text": "Let a, b and c be non-negative real numbers satisfying a + b + c = 9. If the maximum value of the expression a²b³c⁴ can be expressed as 2^x 3^y, where x and y are natural numbers, then the value of log₁₀(x^y), is:",
        "options": ["2", "3", "4", "6"],
        "answer": 0,
        "image": {"sourcePage": "qft6_images/page_31.png", "crop": None}
    }
]

# Append to Mathematics MCQ (index 1 -> sections[0])
# data["subjects"] order: 0=Chem, 1=Math, 2=Physics
math_mcq = data["subjects"][1]["sections"][0]["questions"]
math_mcq.extend(math_qs)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Reset answers to 0 and Appended Math Q26-Q30")
