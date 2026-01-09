import json
import os

# Data structure for QFT 4
qft_data = {
    "examTitle": "QFT 4",
    "subjects": [
        {
            "name": "Mathematics",
            "sections": [
                {
                    "name": "MCQ",
                    "questions": [
                        {
                            "id": 1,
                            "type": "mcq",
                            "text": "If A = [[a, x, y], [x, b, z], [y, z, c]] where a, b, c, x, y, z ∈ {1,2,3,4,5,6} and a, b, c, x, y, z are all distinct, then the number of matrices A such that Trace(A) = 10 is:",
                            "options": ["3(3!)²", "2(3!)²", "(3!)²", "(3!)³"],
                            "answer": None
                        },
                        {
                            "id": 2,
                            "type": "mcq",
                            "text": "The value of the limit lim(x→π/2) (4√2(sin 3x + sin x)) / ((2 sin 2x sin(3x/2) + cos(5x/2)) - (√2 + √2 cos 2x + cos(3x/2))) is...",
                            "options": ["16", "8", "4", "6"],
                            "answer": None
                        },
                        {
                            "id": 3,
                            "type": "mcq",
                            "text": "The remainder obtained when (2109)³⁶⁰ - (1396)³³³ is divided by 7, is:",
                            "options": ["2", "3", "4", "5"],
                            "answer": None
                        },
                        {
                            "id": 4,
                            "type": "mcq",
                            "text": "Let f: ℝ → ℝ be a function defined by f(x) = 2x³ - 21x² + 78x + 24. The number of integers in the solution set of x satisfying the inequality f(f(f(x) - 2x³)) ≥ f(f(2x³ - f(x))) is:",
                            "options": ["3", "4", "5", "6"],
                            "answer": None
                        },
                        {
                            "id": 5,
                            "type": "mcq",
                            "text": "Given that Σ(n=1 to ∞) 1/n² = π²/6 and ∫₀¹ (log_e x)/(1-x²) dx = -π²λ, then the value of λ is:",
                            "options": ["16", "8", "4", "6"],
                            "answer": None
                        },
                        {
                            "id": 6,
                            "type": "mcq",
                            "text": "Let f(x) be an odd function defined on ℝ such that f(1) = 2, f(3) = 5, f(-5) = -1. The value of (f(f(f(-3))) + f(f(0))) / (3f(1) - 2f(3) - f(5)) is:",
                            "options": ["-2/5", "-2/3", "2/5", "2/3"],
                            "answer": None
                        },
                        {
                            "id": 7,
                            "type": "mcq",
                            "text": "A geometric sequence consists of positive terms. The product of the first and fifth terms is 22500. If the sum of the second and third terms is 180, then the difference between the fourth term and the first term is:",
                            "options": ["624", "744", "864", "984"],
                            "answer": None
                        },
                        {
                            "id": 8,
                            "type": "mcq",
                            "text": "Let B be a skew-symmetric matrix of order 3 × 3 with real entries. If A = (I + B)(I - B)⁻¹, where I + B and I - B are non-singular matrices, then the sum of values of n satisfying the equation | ³√n² · A | - n | ³√5 · adj(adj A) | + 6 | adj A |³ = 0 is equal to: (where |A| denotes the determinant value of A).",
                            "options": ["8", "5", "4", "6"],
                            "answer": None
                        },
                        {
                            "id": 9,
                            "type": "mcq",
                            "text": "Let S be the set of all (λ, μ) for which the vectors λî + ĵ + k̂, î + 2ĵ - μk̂, 3î - 4ĵ + 5k̂, where λ - μ = 2, are coplanar. Then Σ₍λ,μ₎∈S 80(λ² + μ²)",
                            "options": ["970", "2370", "2290", "995"],
                            "answer": None
                        },
                        {
                            "id": 10,
                            "type": "mcq",
                            "text": "If a variable straight line passes through the point P(2,0), and intersects the curve y² = 8x at the points Q and R (let PQ = ℓ₁ and PR = ℓ₂). Also, G and A represent the geometric mean and arithmetic mean of ℓ₁ and ℓ₂ respectively, then the correct option is:",
                            "options": ["ℓ₁, ℓ₂ ≥ 4", "ℓ₁, ℓ₂ < 2", "G ∝ A", "G ∝ √A"],
                            "answer": None
                        },
                        {
                            "id": 11,
                            "type": "mcq",
                            "text": "Consider a non-zero vector X⃗ whose projection onto the vectors A⃗ = 2î + ĵ - 2k̂, B⃗ = î - 2ĵ - 2k̂, C⃗ = k̂ are all identical. Find the unit vector in the direction of X⃗.",
                            "options": ["1/√11 (3î - ĵ + k̂)", "1/√11 (3î + ĵ - k̂)", "1/√11 (-3î - ĵ + k̂)", "1/√11 (3î - ĵ - k̂)"],
                            "answer": None
                        },
                        {
                            "id": 12,
                            "type": "mcq",
                            "text": "Let Sᵣ = {(x,y,z) | x + y + z = 11, x ≥ r, y ≥ r, z ≥ r, x,y,z,r ∈ ℤ}. Let n(Sᵣ) represent the number of elements in Sᵣ. Then the value of n(S₂) + n(S₃) + n(S₄) is equal to:",
                            "options": ["27", "21", "23", "24"],
                            "answer": None
                        },
                        {
                            "id": 13,
                            "type": "mcq",
                            "text": "The area bounded by the curves y = 3/|x| and y + |2 - x| = 2 is k - (ln 27)/2. Then the value of k, where k ∈ ℕ, is:",
                            "options": ["6", "3", "5", "4"],
                            "answer": None
                        },
                        {
                            "id": 14,
                            "type": "mcq",
                            "text": "Let f(x) be an even function and g(x) be an odd function such that x² f(x) - 2f(1/x) = g(x). Then the value of f(1) + f(2) + f(3) + f(4) is:",
                            "options": ["10", "0", "24", "4"],
                            "answer": None
                        },
                        {
                            "id": 15,
                            "type": "mcq",
                            "text": "The centre of a circle C lies on the line 2x - 2y + 9 = 0, and the circle cuts the circle x² + y² = 4 orthogonally. If this circle passes through two fixed points (a, b) and (c, d), then the value of a + b + c + d is:",
                            "options": ["-2", "-1", "2", "0"],
                            "answer": None
                        },
                        {
                            "id": 16,
                            "type": "mcq",
                            "text": "The system of equations 2x + y - 5 = 0, x - 2y + 1 = 0, 2x - 14y - a = 0 is consistent. Then, the value of |a| is:",
                            "options": ["1", "2", "5", "None of these"],
                            "answer": None
                        },
                        {
                            "id": 17,
                            "type": "mcq",
                            "text": "Line L₁ is parallel to the vector a⃗ = 3î + 2ĵ + 4k̂ and passes through the point A(7,6,2). The line L₂ is parallel to the vector b⃗ = 2î + ĵ + 3k̂ and passes through the point B(5,3,4). A line L₃, parallel to the vector r⃗ = 2î + 2ĵ + k̂, intersects lines L₁ and L₂ at points C and D respectively. Then the value of |CD| is:",
                            "options": ["7", "9", "12", "6"],
                            "answer": None
                        },
                        {
                            "id": 18,
                            "type": "mcq",
                            "text": "If ∫ (x⁴eˣ dx) / (x⁴ + 4x³ + 12x² + 24x + 72eˣ + 24)² = f(x)g(x) + C and g(0) = 96, then the value of f(0) is:",
                            "options": ["1/2", "-1/2", "-1", "1"],
                            "answer": None
                        },
                        {
                            "id": 19,
                            "type": "mcq",
                            "text": "If the local maximum value of the function f(x) = (3e^(√2 sin x)) sin 2x, x ∈ (0, π/2), is ke, then the value of (ke)⁸ + k⁸e⁵ + k⁸ is equal to:",
                            "options": ["e⁵ + e⁶ + e¹¹", "e³ + e⁵ + e¹¹", "e³ + e⁶ + e¹¹", "e³ + e⁶ + e¹⁰"],
                            "answer": None
                        },
                        {
                            "id": 20,
                            "type": "mcq",
                            "text": "A function y = f(x) satisfies the differential equation f(x)sin 2x - cos x + (1 + sin 2x)f'(x) = 0, with the initial condition y(0) = 0. The value of f(π/6) is:",
                            "options": ["1/5", "3/5", "4/5", "2/5"],
                            "answer": None
                        }
                    ]
                },
                {
                    "name": "Numerical",
                    "questions": [
                        {
                            "id": 21,
                            "type": "numerical",
                            "text": "Three urns A, B, and C contain balls as follows: Urn A: 4 red and 6 black balls. Urn B: 5 red and 5 black balls. Urn C: λ red and 4 black balls. One of the urns is selected at random, and a ball is drawn. If the ball drawn is red and the probability that it is drawn from urn C is 0.4, then the square of the length of the side of the largest equilateral triangle, inscribed in the parabola y² = λx with one vertex at the vertex of the parabola, is equal to:",
                            "options": [],
                            "answer": None
                        },
                        {
                            "id": 22,
                            "type": "numerical",
                            "text": "Let p⃗ = î + ĵ + 2k̂, q⃗ = 2î + ĵ + 3k̂, r⃗ = î - ĵ + 2k̂. If a vector x⃗ satisfies the conditions q⃗ × x⃗ = r⃗ × x⃗ and p⃗ · x⃗ = 6, then the value of 25 | p⃗ × x⃗ |² is:",
                            "options": [],
                            "answer": None
                        },
                        {
                            "id": 23,
                            "type": "numerical",
                            "text": "A circular region in the complex plane is defined by |z - i| ≤ 1. A straight line is given by z(1 + i) + z̄(1 - i) = -4. This line divides the circle into two parts. Let the areas be P and Q. Find ||P - Q||.",
                            "options": [],
                            "answer": None
                        },
                        {
                            "id": 24,
                            "type": "numerical",
                            "text": "Let n be the coefficient of x⁶ in the expansion of (1 - x³)⁵ (1 + x²)⁴ (1 + x⁴)⁸ in powers of x. Find [n/19], where [ . ] denotes the greatest integer function.",
                            "options": [],
                            "answer": None
                        },
                        {
                            "id": 25,
                            "type": "numerical",
                            "text": "Consider a ray originating from the origin and passing through the first quadrant such that it forms an angle of 45° with the positive x-axis. This ray intersects two distinct lines: L_A: x + y + 12 = 0 and L_B: 3x + y - c = 0 (c > 0) at points X and Y, respectively. If the length of the segment XY is 162√2 units, and Z is the foot of the perpendicular from point X to line L_B, find the ratio XZ : YZ.",
                            "options": [],
                            "answer": None
                        }
                    ]
                }
            ]
        },
        {
            "name": "Physics",
            "sections": [] 
        },
        {
            "name": "Chemistry",
            "sections": []
        }
    ]
}

# Ensure the output directory exists
output_dir = "src/data"
os.makedirs(output_dir, exist_ok=True)

# Save to JSON
with open(os.path.join(output_dir, "qft_04.json"), "w", encoding="utf-8") as f:
    json.dump(qft_data, f, indent=2, ensure_ascii=False)

print("qft_04.json created with Mathematics (Q1-25)")
