import json
import os

# Define the Physics questions data
physics_questions_mcq = [
    {
        "id": 26,
        "type": "mcq",
        "text": "A solid sphere rolls without slipping along the track shown in the figure. The sphere starts from rest from a height h above the bottom of a loop of radius R, which is much larger than the radius of the sphere r. The minimum value of h for the sphere to complete the loop is:",
        "options": ["2.1 R", "2.3 R", "2.7 R", "2.5 R"],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q26.png"
    },
    {
        "id": 27,
        "type": "mcq",
        "text": "List-I shows electric circuits and List-II shows equivalent resistance between A and B.",
        "options": ["P→3;Q→1;R→4;S→2", "P→2;Q→1;R→4;S→2", "P→3;Q→1;R→4;S→1", "P→2;Q→1;R→4;S→3"],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q27.png"
    },
    {
        "id": 28,
        "type": "mcq",
        "text": "A particle is projected vertically upwards from the surface of the Earth (radius Rₑ) with a speed equal to one-fourth of the escape velocity. The maximum height attained by it from the surface of the Earth is Rₑ/5N. Then, N is:",
        "options": ["2", "5", "4", "3"],
        "answer": None,
        "image": None
    },
    {
        "id": 29,
        "type": "mcq",
        "text": "In a nuclear reaction: p + ¹⁵N → ¹⁵O + n. If a proton were to collide with ¹⁵N at rest and initiate the above reaction, the minimum kinetic energy of the proton for which the reaction can take place is: Given: m(p) = 1.007825 amu, m(n) = 1.008665 amu, m(¹⁵O) = 15.0031 amu, m(¹⁵N) = 15.000 amu, 1 amu = 931.5 MeV/c²",
        "options": ["3.67 MeV", "3.91 MeV", "3.30 MeV", "3.00 MeV"],
        "answer": None,
        "image": None
    },
    {
        "id": 30,
        "type": "mcq",
        "text": "The figure shows the plot of the stopping potential Vs versus frequency f of the light used in an experiment on the photoelectric effect. The slope of the graph gives h/e, where h = m × 10⁻¹⁵ V-s. Then, m is:",
        "options": ["4.14 × 10⁻¹⁵", "4.14 × 10⁻¹⁵", "4.14 × 10⁻¹⁴", "4.14 × 10⁻¹⁴"],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q30.png"
    },
    {
        "id": 31,
        "type": "mcq",
        "text": "Two trains A and B, each of length 400 m, are moving on two parallel tracks with a uniform speed of 72 km/h in the same direction, with A ahead of B. The driver of B decides to overtake A and accelerates at 1 m/s². If after 50 s, the guard of B just brushes past the driver of A, what was the original distance between them?",
        "options": ["1000 m", "1150 m", "1300 m", "1250 m"],
        "answer": None,
        "image": None
    },
    {
        "id": 32,
        "type": "mcq",
        "text": "The displacement-time graph of a particle executing SHM is shown in the figure. Which of the following statements is false?",
        "options": ["The acceleration is maximum at t = T.", "The force is zero at t = 3T/4.", "The potential energy equals the total oscillation energy at t = T/2.", "None of the above."],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q32.png"
    },
    {
        "id": 33,
        "type": "mcq",
        "text": "At identical temperatures, the r.m.s. speed of hydrogen molecules is 4 times that of oxygen molecules. In a mixture of these gases in mass ratio H₂ : O₂ = 1 : 8, the r.m.s. speed of all molecules is n times the r.m.s. speed of O₂ molecules. Find n.",
        "options": ["3", "43", "(8/3)^(1/2)", "(11/12)^(1/2)"],
        "answer": None,
        "image": None
    },
    {
        "id": 34,
        "type": "mcq",
        "text": "Consider the arrangement shown in the figure. Mass of block A = 40 g. Pulley is light. Point P is pulled upward with velocity v⃗ = 5t ĵ m/s. The power in watts of the external force applied at P at t = 4 seconds is:",
        "options": ["4", "5", "6", "7"],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q34.png"
    },
    {
        "id": 35,
        "type": "mcq",
        "text": "A hemispherical bowl of radius 10 cm is filled with a liquid of refractive index μ = 4/3. A glass plate of refractive index 1.5 is placed on the top of the bowl. If, for an observer above the plate, the shift in position of a point P on the bottom is 3 cm, find the thickness of the glass plate.",
        "options": ["1.5 cm", "1 cm", "7 cm", "10 cm"],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q35.png"
    },
    {
        "id": 36,
        "type": "mcq",
        "text": "A physical quantity P = (a³b²)/(√c d¹/³) is to be found using a, b, c, d measured with percentage errors of 1%, 2%, 2%, and 3% respectively. Find the percentage error in P.",
        "options": ["11%", "12%", "4%", "9%"],
        "answer": None,
        "image": None
    },
    {
        "id": 37,
        "type": "mcq",
        "text": "A metallic spherical shell has mass m, radius R, and bulk modulus of elasticity B. Find the change in radius of the shell due to gravitational pressure.",
        "options": ["Gm² / (3BπR³)", "Gm² / (8BπR³)", "Gm² / (24BπR³)", "Gm² / (36BπR³)"],
        "answer": None,
        "image": None
    },
    {
        "id": 38,
        "type": "mcq",
        "text": "Water is filled in a uniform container of cross-sectional area A. A hole of cross-sectional area a(a ≪ A) is made in the container at a height of 20 m above the base. Water streams out and hits a small block placed at some distance from the container. Find the speed (in m/s) with which the block should be moved so that the water stream always hits the block. Given: a/A = 1/20, g = 10 m/s².",
        "options": ["2", "1", "4", "3"],
        "answer": None,
        "image": None
    },
    {
        "id": 39,
        "type": "mcq",
        "text": "In the A.C. circuit shown, keeping the switch 'K' pressed, if an iron rod is inserted into the coil, the bulb in the circuit:",
        "options": ["Glows less brightly", "Glows with same brightness", "Gets damaged", "Glows more brightly"],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q39.png"
    },
    {
        "id": 40,
        "type": "mcq",
        "text": "The V-I characteristic of a diode is shown in the figure. The ratio of forward to reverse bias resistance is:",
        "options": ["10", "10⁻⁶", "10⁶", "100"],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q40.png"
    },
    {
        "id": 41,
        "type": "mcq",
        "text": "The figure gives a system of logic gates. From the study of the truth table, it can be found that to produce a high output (1) at R, we must have:",
        "options": ["X=0, Y=1", "X=1, Y=1", "X=1, Y=0", "X=0, Y=0"],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q41.png"
    },
    {
        "id": 42,
        "type": "mcq",
        "text": "A circular wire loop of radius 1 cm carries a total charge Q = 1 × 10⁻⁶ C distributed uniformly over its length. If 0.01% of its length (circumference) is cut off, then the electric field at the centre of the loop due to the remaining wire is: (Options in × 10³ N/C)",
        "options": ["6", "5", "8", "9"],
        "answer": None,
        "image": None
    },
    {
        "id": 43,
        "type": "mcq",
        "text": "A bomb of 12 kg divides in two parts whose ratio of masses is 1:3. If kinetic energy of smaller part is 216 J then momentum of bigger part in kg m s⁻¹ will be:",
        "options": ["36", "72", "108", "Data is incomplete"],
        "answer": None,
        "image": None
    },
    {
        "id": 44,
        "type": "mcq",
        "text": "If a magnetic monopole exists, then which of Maxwell's equations needs to be modified?",
        "options": ["∮ E⃗ ⋅ dA⃗ = Q_enclosed / ε₀", "∮ B⃗ ⋅ dA⃗ = 0", "∮ B⃗ ⋅ dl⃗ = μ₀I_enclosed + μ₀ε₀ d/dt ∫ E⃗ ⋅ dA⃗", "∮ E⃗ ⋅ dl⃗ = - dΦ_B / dt"],
        "answer": None,
        "image": None
    },
    {
        "id": 45,
        "type": "mcq",
        "text": "A particle of mass 2 kg is initially at rest. A force starts acting on it in one direction, whose magnitude changes with time. The force-time graph is shown in the figure. Find the velocity of the particle at the end of 10 s.",
        "options": ["45 m/s", "50 m/s", "40 m/s", "60 m/s"],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q45.png"
    }
]

physics_questions_num = [
    {
        "id": 46,
        "type": "numerical",
        "text": "A square frame of side x and a long straight wire carrying current are in the plane of the paper. Starting from close to the wire, the frame moves towards the right with a constant speed of v (see figure). The e.m.f induced at the time the left arm of the frame is at x from the wire is",
        "options": [],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q46.png"
    },
    {
        "id": 47,
        "type": "numerical",
        "text": "A mass of m is put on a flat pan attached to a vertical spring fixed on the ground as shown in the figure. The mass of the spring and the pan is negligible. When pressed slightly and released the mass executes a simple harmonic motion. The spring constant is k. What should be the minimum amplitude of the motion, so that the mass gets detached from the pan?",
        "options": [],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q47.png"
    },
    {
        "id": 48,
        "type": "numerical",
        "text": "A network is arranged as in Mance's experiment. This is used to find the internal resistance of the battery R. The resistance of galvanometer, and of each of the other three arms, is 4 ohms. The current in the galvanometer with the key open, as well as when it is closed is 0.2 A. The internal resistance of battery is :",
        "options": [],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q48.png"
    },
    {
        "id": 49,
        "type": "numerical",
        "text": "Two fixed equal, positive charges, each of magnitude 5 × 10⁻⁵ coulomb are located at points A and B separated by a distance of 5 m. An equal and opposite charge moves towards them along the line COD, the perpendicular bisector of the line AB. The moving charge, when it reaches the point C at a distance of 4 m from O, has a kinetic energy of 4 joules. Calculate the distance of the farthest point D which the negative charge will reach before returning towards C.",
        "options": [],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q49.png"
    },
    {
        "id": 50,
        "type": "numerical",
        "text": "A disc is (with boys A and B of mass 50 kg and 25 kg) mounted on a smooth fixed vertical axis has a radius of 5 m and moment of inertia 500kgm². The system is initially at rest. The boys A and B begin to move along the circumference at the speed of 20 m/s and 10 m/s respectively relative to the ground, at the same time in opposite directions. If the angular Velocity of disc is K rad/sec, find value of 2K",
        "options": [],
        "answer": None,
        "image": "qft4_images/diagrams/physics_q50.png"
    }
]

# Read existing JSON and append
json_path = os.path.join("src/data", "qft_04.json")
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update Physics sections
physics_subject = next(s for s in data['subjects'] if s['name'] == 'Physics')
physics_subject['sections'] = [
    {
        "name": "MCQ",
        "questions": physics_questions_mcq
    },
    {
        "name": "Numerical",
        "questions": physics_questions_num
    }
]

# Save updated JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Appended Physics questions (26-50)")
