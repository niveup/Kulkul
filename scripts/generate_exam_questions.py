# Complete rewrite of examQuestions.json with proper LaTeX formatting
# All LaTeX commands use \\ in Python strings which becomes \ in JSON

import json

exam_data = {
    "title": "QFT 5 Exam",
    "questions": [
        # MATH SECTION (Questions 1-25)
        {
            "id": 1,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "A circle of radius $1$ unit touches positive axes at $A$ and $B$ respectively. A variable line passes through $(0, 0)$ and intersects the circle at $C$ and $D$. If area of $\\Delta BCD$ is maximum then sum of ordinate of $C$ and $D$ is $\\frac{\\sqrt{\\lambda}+1}{2}$ unit where $\\lambda \\in \\mathbb{N}$. Then $\\lambda =$",
            "diagram": None,
            "options": ["$3$", "$4$", "$2$", "$5$"]
        },
        {
            "id": 2,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "A collection of five data points $x_1 = c$, $x_2 = d$, $x_3 = 6$, $x_4 = 8$, $x_5 = 10$ has a mean of $7$ and a variance of $8$. Assuming $c > d$, calculate the variance of the transformed observations $z_n = 2x_n - n$ for $n = 1, 2, 3, 4, 5$.",
            "diagram": None,
            "options": ["$27.6$", "$28.2$", "$26.8$", "$27.0$"]
        },
        {
            "id": 3,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "In a triangle $ABC$, if $A(2, -1)$ and $7x - 10y + 1 = 0$ and $3x - 2y + 5 = 0$ are equations of an altitude and an angle bisector respectively drawn from $B$, then equation of $BC$ is:",
            "diagram": None,
            "options": ["$x + y + 1 = 0$", "$5x + y + 17 = 0$", "$4x + 9y + 30 = 0$", "$x - 5y - 7 = 0$"]
        },
        {
            "id": 4,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "Let $S$ be the collection of all real-valued functions defined on the set of integers, i.e., $f : \\mathbb{Z} \\rightarrow \\mathbb{R}$. A binary relation $R$ is defined on $S$ as follows: for any two functions $f, g \\in S$, $(f, g) \\in R$ if and only if $f(2) = g(3)$ and $f(3) = g(2)$. Determine the properties of $R$.",
            "diagram": None,
            "options": ["Reflexive and symmetric, but not transitive", "Symmetric, but neither reflexive nor transitive", "Transitive and reflexive, but not symmetric", "None of these"]
        },
        {
            "id": 5,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "If $\\alpha, \\beta, \\gamma$ are roots of equation $x^3 - 2x^2 - 1 = 0$ and $T_n = \\alpha^n + \\beta^n + \\gamma^n$, then value of $\\frac{T_{11} - T_8}{T_{10}}$ is:",
            "diagram": None,
            "options": ["$1$", "$2$", "$-1$", "$3$"]
        },
        {
            "id": 6,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "A geometric figure consists of two intersecting lines, $L_A$ and $L_B$, meeting at a point $M$. On line $L_A$, there are $11$ points $P_1, P_2, ..., P_{11}$ distinct from $M$. On line $L_B$, there are $10$ points $Q_1, Q_2, ..., Q_{10}$ distinct from $M$. What is the total count of triangles that can be formed?",
            "diagram": None,
            "options": ["$1045$", "$1155$", "$1165$", "$1160$"]
        },
        {
            "id": 7,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "The value of $\\int_{-\\pi/4}^{\\pi/4} \\frac{(\\pi - 4\\theta) \\tan \\theta}{1 - \\tan \\theta} d\\theta$ is equal to:",
            "diagram": None,
            "options": ["$\\frac{\\pi}{2} \\ln 2 - \\frac{\\pi^2}{4}$", "$\\frac{\\pi}{2} \\ln 2 + \\frac{\\pi^2}{4}$", "$\\pi \\ln 2 - \\frac{\\pi^2}{4}$", "$-\\pi \\ln 2 - \\frac{\\pi^2}{4}$"]
        },
        {
            "id": 8,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "Consider a function $h$ defined for all non-zero real numbers $t$ such that it satisfies the equation $h(t) + 5h(\\frac{4}{t}) = 3t$. What is the value of the sum $h(4) + h(10)$?",
            "diagram": None,
            "options": ["$5$", "$6$", "$7$", "$8$"]
        },
        {
            "id": 9,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "The area of the region $\\{(x,y) : x^2 \\leq y \\leq 8 - x^2, y \\leq 7\\}$ is (in sq. units)",
            "diagram": None,
            "options": ["$24$", "$21$", "$20$", "$18$"]
        },
        {
            "id": 10,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "Let $\\{a_n\\}$ be a sequence such that $a_0=1$, $a_1=0$, $a_n = 3a_{n-1} - 2a_{n-2}$. The correct statement(s) is(are):",
            "diagram": None,
            "options": ["$a_{45} = 2^{45}$", "$a_{51} = 2^{25} - 2$", "$a_{48} = 2(1 - 2^{47})$", "$a_{49} = \\sqrt{2} - \\sqrt{2}^{49}$"]
        },
        {
            "id": 11,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "Number of integers in the domain of $f(x) = \\sin^{-1}\\left(\\log_2\\left(\\frac{x}{x+1}\\right)\\right) + \\tan^{-1}(\\sqrt{9 - x^2})$ is:",
            "diagram": None,
            "options": ["$3$", "$4$", "$5$", "$6$"]
        },
        {
            "id": 12,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "Consider a line passing through the point $Q(1,0,0)$ that intersects line $L_A : \\frac{x-1}{2} = \\frac{y-1}{-1} = \\frac{z-1}{3}$ at point $A(\\alpha,\\beta,\\gamma)$ and line $L_B : \\frac{x-2}{-1} = \\frac{y-2}{1} = \\frac{z-2}{-1}$ at point $B(a,b,c)$. Calculate the value of the determinant $\\begin{vmatrix} 2 & 1 & 0 \\\\ \\alpha & \\beta & \\gamma \\\\ a & b & c \\end{vmatrix}$.",
            "diagram": None,
            "options": ["$3$", "$4$", "$-4$", "$-3$"]
        },
        {
            "id": 13,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "Two cards are drawn successively with replacement from a well-shuffled deck of 52 cards. Let $X$ denote the random variable of number of aces obtained in the two drawn cards. Then $P(X=1) + P(X=2)$ equals:",
            "diagram": None,
            "options": ["$\\frac{24}{169}$", "$\\frac{52}{169}$", "$\\frac{49}{169}$", "$\\frac{25}{169}$"]
        },
        {
            "id": 14,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "A curve $y = f(x)$ satisfies the differential equation $2y(e^{y^2} \\sin x - e^x \\sin y^2)dy + (e^{y^2} \\cos x + e^x \\cos y^2)dx = 0$ and passes through $(0,0)$. Number of points on the curve whose ordinate is $\\sqrt{\\frac{\\pi}{2}}$ and $0 < \\text{abscissa} < 2\\pi$ is:",
            "diagram": None,
            "options": ["$3$", "$0$", "$2$", "$1$"]
        },
        {
            "id": 15,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "Given three complex numbers $a$, $b$, $c$ that form the vertices of an equilateral triangle in the Argand plane. Let $z_c$ be the complex number representing the centroid of this triangle. Find the value of the expression $a^2 + b^2 + c^2 - 3z_c^2$.",
            "diagram": None,
            "options": ["$0$", "$1$", "$2$", "$3$"]
        },
        {
            "id": 16,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "Find the count of distinct values of $x$ in the interval $[0, \\pi]$ that satisfy the equation $\\cos 7x + \\cos 5x = \\cos x$.",
            "diagram": None,
            "options": ["$6$", "$7$", "$8$", "$9$"]
        },
        {
            "id": 17,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "For the hyperbolas $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ and $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = -1$ their eccentricities are $e$ and $f(e)$ then $\\int_{2}^{4} f(f(...f(x)))dx$ (10 times) is:",
            "diagram": None,
            "options": ["$4$", "$2\\sqrt{2}$", "$6$", "$8$"]
        },
        {
            "id": 18,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "Let $f(x)$ be a cubic polynomial on $\\mathbb{R}$ which increases in the interval $(-\\infty, 0) \\cup (1, \\infty)$ and decreases in the interval $(0, 1)$. If $f'(2) = 6$ and $f(2) = 2$, then the value of $\\tan^{-1}(f(1)) + \\tan^{-1}(f(\\frac{3}{2})) + \\tan^{-1}(f(0))$ is equal to:",
            "diagram": None,
            "options": ["$\\tan^{-1} 2$", "$\\cot^{-1} 2$", "$-\\tan^{-1} 2$", "$-\\cot^{-1} 2$"]
        },
        {
            "id": 19,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "Let $B$ and $C$ be two points on the line $\\frac{x+1}{2} = \\frac{y+2}{3} = \\frac{z-1}{2}$ at a distance $\\sqrt{26}$ from the point $A(4, 2, 7)$. Then the square of the area of the triangle $ABC$ is:",
            "diagram": None,
            "options": ["$146$", "$158$", "$153$", "$149$"]
        },
        {
            "id": 20,
            "subject": "Math",
            "type": "MCQ",
            "questionText": "If $T_r$ be the $r^{th}$ term of a sequence, for $r = 1, 2, 3...$. If $3T_{r+1} = T_r$ and $T_7 = \\frac{1}{243}$, then the value of $\\sum_{r=1}^{\\infty} T_r \\cdot T_{r+1}$ is:",
            "diagram": None,
            "options": ["$\\frac{21}{4}$", "$\\frac{21}{8}$", "$\\frac{27}{4}$", "$\\frac{27}{8}$"]
        },
        {
            "id": 21,
            "subject": "Math",
            "type": "Numerical",
            "questionText": "Let $A = \\begin{bmatrix} a & b & c \\\\ b & c & a \\\\ c & a & b \\end{bmatrix}$. If $\\text{trace}(A)=9$ and $a,b,c$ are positive integers such that $ab+bc+ca=26$. Let $A_1$ denote the adjoint of $A$; $A_2$ denote adjoint of $A_1$ ... and so on. If value of $\\det(A_4)$ is $M$, find the last two digits of $M$.",
            "diagram": None,
            "options": None
        },
        {
            "id": 22,
            "subject": "Math",
            "type": "Numerical",
            "questionText": "The absolute value of $\\lim_{x \\to 0} (x^{16} + 4x^{12} - 3x^4) \\left[\\frac{1}{x^4}\\right]$, (where $[.]$ denotes greatest integer function), is:",
            "diagram": None,
            "options": None
        },
        {
            "id": 23,
            "subject": "Math",
            "type": "Numerical",
            "questionText": "Let $\\vec{a} = 2\\hat{i} + \\hat{j} - 2\\hat{k}$, $\\vec{b} = \\hat{i} + \\hat{j}$. If $\\vec{c}$ is a vector such that $\\vec{a} \\cdot \\vec{c} = |\\vec{c}|$, $|\\vec{c} - \\vec{a}| = 2\\sqrt{2}$ and angle between $(\\vec{a} \\times \\vec{b})$ and $\\vec{c}$ is $30°$, then $10|(\\vec{a} \\times \\vec{b}) \\times \\vec{c}|$ is:",
            "diagram": None,
            "options": None
        },
        {
            "id": 24,
            "subject": "Math",
            "type": "Numerical",
            "questionText": "Let the polynomial $P(x) = (1 - x + x^2)^8$ be expanded as $a_0 + a_1 x + a_2 x^2 + ... + a_{16} x^{16}$. Determine the value of the expression $(a_0 + a_2 + a_4 + ... + a_{16}) + 10a_1$.",
            "diagram": None,
            "options": None
        },
        {
            "id": 25,
            "subject": "Math",
            "type": "Numerical",
            "questionText": "Points $P$ and $D$ are taken on the ellipse $\\frac{x^2}{4} + \\frac{y^2}{2} = 1$. If $a, b, c$ and $d$ are the lengths of the sides of quadrilateral $PADB$, where $A$ and $B$ are foci of the ellipse, then maximum value of $(abcd)$ is:",
            "diagram": None,
            "options": None
        },
        
        # PHYSICS SECTION (Questions 26-50)
        {
            "id": 26,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "A 100 turns coil shown in the figure carries a current of $2$ A in clockwise direction in a magnetic field $B = 0.2$ Wb/m$^{-2}$. The torque acting on the coil is:",
            "diagram": "/questions/q26_diagram.png",
            "options": ["$0.32$ N m tending to rotate the side AD out of the page", "$0.32$ N m tending to rotate the side AD into the page", "$0.0032$ N m tending to rotate the side AD out of the page", "$0.0032$ N m tending to rotate the side AD into the page"]
        },
        {
            "id": 27,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "A closed organ pipe and an open organ pipe of same length produce 2 beats when they are set into vibration simultaneously in their fundamental mode. The length of the open organ pipe is now halved and of the closed organ pipe is doubled; the number of beats produced will be:",
            "diagram": None,
            "options": ["$7$", "$9$", "$5$", "$11$"]
        },
        {
            "id": 28,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "Two liquids of densities $\\rho_1$ and $\\rho_2$ ($\\rho_2 = 2\\rho_1$) are filled up behind a square wall of side 10m as shown in figure. Each liquid has a height of 5m. The ratio of the forces due to these liquids exerted on upper part MN to that at the lower part NO is:",
            "diagram": "/questions/q28_diagram.png",
            "options": ["$\\frac{1}{3}$", "$\\frac{2}{3}$", "$\\frac{1}{2}$", "$\\frac{1}{4}$"]
        },
        {
            "id": 29,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "Consider a Young's double-slit setup where the fringe width is initially $\\beta_0$. If the distance between the two slits is increased to 2.5 times its original value, what is the approximate percentage change in the fringe width?",
            "diagram": None,
            "options": ["$60\\%$ decrease", "$40\\%$ increase", "$25\\%$ decrease", "$75\\%$ increase"]
        },
        {
            "id": 30,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "Pressure versus temperature graph of an ideal gas is shown. The density of gas at point $A$ is $\\rho_0$ then the density of gas at point $B$ would be:",
            "diagram": "/questions/q30_diagram.png",
            "options": ["$\\frac{3}{4}\\rho_0$", "$\\frac{3}{2}\\rho_0$", "$\\frac{4}{3}\\rho_0$", "$2\\rho_0$"]
        },
        {
            "id": 31,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "In a Young's double-slit experiment, the light from the two slits has intensities in the proportion of $1 : 16$. Determine the ratio of the highest intensity to the lowest intensity in the interference fringes.",
            "diagram": None,
            "options": ["$25:9$", "$1:16$", "$5:3$", "$17:15$"]
        },
        {
            "id": 32,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "The following statements are given about Hydrogen atom. (A) The wavelengths of the spectral lines of Lyman series are greater than the wavelength of the second spectral line of Balmer series. (B) The orbits correspond to circular standing waves in which the circumference of the orbit equals a whole number of wavelengths.",
            "diagram": None,
            "options": ["A is false, B is true", "A is true, B is false", "A is false, B is false", "A is true, B is true"]
        },
        {
            "id": 33,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "Figure shows two identical parallel plate capacitors connected to a battery through a switch S. Initially, the switch is closed so that the capacitors are completely charged. The switch is now opened and the free space between the plates of the capacitors is filled with a dielectric of dielectric constant 3. The ratio of the initial total energy stored in the capacitors to the final total energy stored is:",
            "diagram": "/questions/q33_diagram.png",
            "options": ["$3:5$", "$1:1$", "$5:3$", "none of these"]
        },
        {
            "id": 34,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "A point source of sound is placed in a non-absorbing medium. Two points $A$ and $B$ are at the distance of 1 m and 2 m respectively from the source. The ratio of amplitudes of waves at $A$ to $B$ is:",
            "diagram": None,
            "options": ["$1:1$", "$1:4$", "$1:2$", "$2:1$"]
        },
        {
            "id": 35,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "Blocks of masses $m$, $2m$, $4m$ and $8m$ are arranged in a line on a frictionless floor. Another block of mass $m$, moving with speed $v$ along the same line collides with mass $m$ in perfectly inelastic manner. All the subsequent collisions are also perfectly inelastic. By the time the last block of mass $8m$ starts moving the total energy loss is $p\\%$ of the original energy. Value of '$p$' is close to:",
            "diagram": "/questions/q35_diagram.png",
            "options": ["$77$", "$94$", "$37$", "$87$"]
        },
        {
            "id": 36,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "A ball is projected at a cliff of height $H$ with an initial speed of $100$ m/s at an angle $30°$ above the horizontal. The ball hits the point $A$ on the cliff after $5$ s. The height of the cliff is (Assume $g = 10$ m/s$^2$):",
            "diagram": "/questions/q36_diagram.png",
            "options": ["$50$ m", "$100$ m", "$125$ m", "$150$ m"]
        },
        {
            "id": 37,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "The drag force on a spherical CO$_2$ bubble in water is given by $F_0 = 6\\pi\\eta rv$, where $\\eta$ is the viscosity of the surrounding fluid and $r$ is the radius of the sphere (Stoke's law). Calculate time taken by sphere to travel distance 20 cm. (Given: Radius $r = 3$ mm, density of water $\\rho = 10^3$ kg/m$^3$, Density of CO$_2$ = 1 kg/m$^3$, $g = 10$ m/s$^2$, $\\eta = 0.5$ SI unit)",
            "diagram": None,
            "options": ["$3$ s", "$4$ s", "$6$ s", "$5$ s"]
        },
        {
            "id": 38,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "The logic circuit shown has the input waveforms 'A' and 'B' as shown. Pick out the CORRECT output waveform:",
            "diagram": "/questions/q38_full.png",
            "options": ["A", "B", "C", "D"]
        },
        {
            "id": 39,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "The distance $x$ covered by a particle in one dimensional motion varies with time $t$ as $x^2 = at^2 + 2bt + c$. If the acceleration of the particle depends on $x$ as $x^{-n}$, where $n$ is an integer, the value of $n$ is:",
            "diagram": None,
            "options": ["$2$", "$3$", "$1$", "$4$"]
        },
        {
            "id": 40,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "An electrical device purely resistive consumes $150$ W of average power when connected to an alternating current (AC) supply with an RMS voltage of $240$ V. Determine the maximum instantaneous current that flows through the device.",
            "diagram": None,
            "options": ["$0.88$ A", "$0.62$ A", "$0.44$ A", "$1.25$ A"]
        },
        {
            "id": 41,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "Consider the following physical quantities and their corresponding dimensional formulas. Match the items: (A) Surface Tension (B) Planck's Constant (C) Thermal Conductivity (D) Energy Density. List-II: (I) $[MLT^{-2}]$, (II) $[ML^2T^{-1}]$, (III) $[MLT^{-3}K^{-1}]$, (IV) $[ML^{-1}T^{-2}]$",
            "diagram": None,
            "options": ["(A)-(I), (B)-(II), (C)-(III), (D)-(IV)", "(A)-(III), (B)-(IV), (C)-(I), (D)-(II)", "(A)-(IV), (B)-(III), (C)-(II), (D)-(I)", "(A)-(III), (B)-(I), (C)-(IV), (D)-(II)"]
        },
        {
            "id": 42,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "Figure shows a parabolic graph between $T$ and $\\frac{1}{V}$ for a mixture of a gas undergoing an adiabatic process. What is the ratio of $v_{rms}$ and speed of sound in the mixture at a particular temperature $T_0$?",
            "diagram": "/questions/q42_diagram.png",
            "options": ["$\\sqrt{\\frac{3}{2}}$", "$\\sqrt{2}$", "$\\sqrt{\\frac{2}{3}}$", "$\\sqrt{3}$"]
        },
        {
            "id": 43,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "Find the reading of the ideal ammeter connected in the given circuit. Assume that the cells have negligible internal resistance.",
            "diagram": "/questions/q43_diagram.png",
            "options": ["$2.5$ A", "$5$ A", "$2$ A", "$1$ A"]
        },
        {
            "id": 44,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "A particle of mass $m$ moving in a straight line is acted upon by a force $F$ which varies with its velocity as $F = -kv^n$. Here $k$ is a constant. For what values of $n$, the average value of velocity of the particle averaged over the time, till it stops, is one third the initial velocity. ($n \\neq 1$ or $2$)",
            "diagram": None,
            "options": ["$\\frac{1}{3}$", "$\\frac{1}{5}$", "$\\frac{1}{2}$", "$\\frac{1}{6}$"]
        },
        {
            "id": 45,
            "subject": "Physics",
            "type": "MCQ",
            "questionText": "A particle of charge $q$ and mass $m$ is projected with a velocity $v_0$ towards a circular region having uniform magnetic field $B$ perpendicular and into the plane of paper from point $P$ as shown in the figure. $R$ is the radius and $O$ is the centre of the circular region. If the line $OP$ makes an angle $\\theta$ with the direction of $v_0$ then the value of $v_0$ so that particle passes through $O$ is:",
            "diagram": "/questions/q45_diagram.png",
            "options": ["$\\frac{qBR}{m \\sin \\theta}$", "$\\frac{qBR}{2m \\sin \\theta}$", "$\\frac{2qBR}{m \\sin \\theta}$", "$\\frac{3qBR}{2m \\sin \\theta}$"]
        },
        {
            "id": 46,
            "subject": "Physics",
            "type": "Numerical",
            "questionText": "The principal section of glass prism is an isosceles $\\triangle PQR$ with $PQ = PR$. The face $PR$ is silvered. A ray is incident perpendicularly on face $PQ$ and after two reflections, it emerges from base $QR$, normal to it. The angle of the prism is given by $\\alpha$ rad. Find the value of $\\alpha$.",
            "diagram": "/questions/q46_diagram.png",
            "options": None
        },
        {
            "id": 47,
            "subject": "Physics",
            "type": "Numerical",
            "questionText": "A capillary tube of radius $r$ is immersed in water and water rises in it to a height $h$. The mass of water in the capillary tube is $5$ g. Another capillary tube of radius $2r$ is immersed in water. The mass of water (in grams) that will rise in this tube is:",
            "diagram": None,
            "options": None
        },
        {
            "id": 48,
            "subject": "Physics",
            "type": "Numerical",
            "questionText": "A $1000$ watt heater is designed to be operated on a $100$ volt line. It is connected to two resistances $10\\Omega$ and $R$, as shown in figure. If it now gives a power of $62.5$ watt, what is the value of $R$ (in ohm)?",
            "diagram": "/questions/q48_diagram.png",
            "options": None
        },
        {
            "id": 49,
            "subject": "Physics",
            "type": "Numerical",
            "questionText": "If on transition to the ground state an He$^+$ ion emits two photons in succession, having wavelengths $1026.7$ Å and $304$ Å, then the quantum number $n$ corresponding to the exciting state of He$^+$ ion is: [$R = 1.096 \\times 10^7$ m$^{-1}$]",
            "diagram": None,
            "options": None
        },
        {
            "id": 50,
            "subject": "Physics",
            "type": "Numerical",
            "questionText": "A physical quantity $Q$ is related to four observables $x$, $y$, $z$ and $t$ by the relation $Q = \\frac{x^2 z^3}{y \\sqrt{t}}$. The percentage errors of measurement in $x$, $y$, $z$ and $t$ are $2.5\\%$, $2\\%$, $0.5\\%$ and $1\\%$ respectively. The percentage error in $Q$ will be:",
            "diagram": None,
            "options": None
        },
        
        # CHEMISTRY SECTION (Questions 51-75)
        {
            "id": 51,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "Among the following, the plot that correctly represents the conductometric titration of $0.05$ M H$_2$SO$_4$ with $0.1$ M NH$_4$OH is:",
            "diagram": "/questions/q51_combined.png",
            "options": ["A", "B", "C", "D"]
        },
        {
            "id": 52,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "Addition of sodium hydroxide solution to a weak acid (HA) results in a buffer of pH $6$. If ionization constant of HA is $10^{-5}$, the ratio of salt to acid concentration in the buffer solution will be:",
            "diagram": None,
            "options": ["$10:1$", "$4:5$", "$5:4$", "$1:10$"]
        },
        {
            "id": 53,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "Vitamins are crucial organic compounds that the body needs in small amounts for various metabolic functions. They are broadly categorized based on their solubility. Which of the following options lists only fat-soluble vitamins?",
            "diagram": None,
            "options": ["Vitamin B$_1$, Vitamin C, Vitamin B$_6$", "Vitamin A, Vitamin D, Vitamin K", "Vitamin C, Vitamin B$_{12}$, Vitamin E", "Vitamin B$_2$, Vitamin A, Vitamin C"]
        },
        {
            "id": 54,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "Statement I: Lothar Meyer arranged elements in increasing order of atomic number and observed periodic trends in their physical properties. Statement II: Newlands' Law of Octaves states that every eighth element has properties similar to the first when elements are arranged in increasing order of atomic weight.",
            "diagram": None,
            "options": ["Statement I is false but Statement II is true", "Both Statement I and Statement II are true", "Statement I is true but Statement II is false", "Both Statement I and Statement II are false"]
        },
        {
            "id": 55,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "The angular momentum of an electron in a Bohr's orbit of He$^+$ is $3.1652 \\times 10^{-34}$ kg m$^2$/sec. What is the wave number in terms of Rydberg constant ($R$) of the spectral line emitted when an electron falls from this level to the first excited state? [Use $h = 6.626 \\times 10^{-34}$ J·s]",
            "diagram": None,
            "options": ["$3R$", "$\\frac{5R}{9}$", "$\\frac{3R}{4}$", "$\\frac{8R}{9}$"]
        },
        {
            "id": 56,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "In the context of preparing standard solutions for titrimetry, which of the following substances would be inappropriate for direct weighing to achieve an accurate concentration? I. Concentrated sulfuric acid (H$_2$SO$_4$) II. Anhydrous sodium carbonate (Na$_2$CO$_3$) III. Hydrated ferrous ammonium sulfate (Mohr's salt, Fe(NH$_4$)$_2$(SO$_4$)$_2$·6H$_2$O) IV. Potassium hydrogen phthalate (KHP)",
            "diagram": None,
            "options": ["I and III only", "II and IV only", "I, II and III only", "I, III and IV only"]
        },
        {
            "id": 57,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "The major product formed in the following reaction is:",
            "diagram": "/questions/q57_full.png",
            "options": ["A", "B", "C", "D"]
        },
        {
            "id": 58,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "X and Y are respectively:",
            "diagram": "/questions/q58_full.png",
            "options": ["A", "B", "C", "D"]
        },
        {
            "id": 59,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "In a hydrogen-bromine fuel cell, hydrogen is oxidized at the anode and bromine is reduced at the cathode. The standard reduction potential for the H$^+$/H$_2$ couple is $0.00$ V, and for the Br$_2$/Br$^-$ couple, it is $1.07$ V. Which of the following statements accurately describes this fuel cell?",
            "diagram": None,
            "options": ["The standard cell potential is $1.07$ V.", "Hydrogen is consumed at the cathode.", "The anode reaction is Br$_2$ + 2e$^-$ $\\rightarrow$ 2Br$^-$.", "The cell potential would increase if the concentration of H$^+$ ions at the anode increased."]
        },
        {
            "id": 60,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "Which of the following coordination compounds contain a central metal ion with a d$^4$ electronic configuration? (P) [Mn(H$_2$O)$_6$]$^{3+}$ (Q) [Cr(NH$_3$)$_6$]Cl$_2$ (R) [Fe(CN)$_6$]$^{3-}$ (S) [Co(en)$_3$]Cl$_3$ (T) [V(CO)$_6$]",
            "diagram": None,
            "options": ["(P) and (R) only", "(Q) and (S) only", "(P) and (Q) only", "(R) and (T) only"]
        },
        {
            "id": 61,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "A chemist performed Dumas' method to determine the nitrogen content in a $0.45$ g organic sample. The experiment produced $65$ mL of nitrogen gas, collected at $295$ K and a barometric pressure of $710$ mm Hg. Given that the vapor pressure of water at $295$ K is $16$ mm Hg, determine the percentage by mass of nitrogen in the organic compound. (Take $R = 0.0821$ L atm mol$^{-1}$ K$^{-1}$)",
            "diagram": None,
            "options": ["$15.24\\%$", "$14.50\\%$", "$16.05\\%$", "$13.89\\%$"]
        },
        {
            "id": 62,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "The complete combustion of propane, C$_3$H$_8$, with oxygen produces carbon dioxide and water according to the balanced equation: C$_3$H$_8$(g) + 5O$_2$(g) $\\rightarrow$ 3CO$_2$(g) + 4H$_2$O(l). If $88.0$ kg of propane is reacted with $400.0$ kg of O$_2$, what is the volume of water formed in litres?",
            "diagram": None,
            "options": ["$124$", "$154$", "$144$", "$134$"]
        },
        {
            "id": 63,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "Starch $\\xrightarrow{H_2O/H^+}$ mixture (A). Glycogen $\\xrightarrow{H_2O/H^+}$ mixture (B). Cellulose $\\xrightarrow{H_2O/H^+}$ mixture (C). Which of the following mixture contains $\\beta$-D-glucose, after treating following polymers with H$_3$O$^+$ for long time?",
            "diagram": None,
            "options": ["Only in mixture A", "Only in mixture B", "Only in mixture C", "In all mixtures A, B & C"]
        },
        {
            "id": 64,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "Which of the following best explains why chromium(VI) oxide (CrO$_3$) acts as a more powerful oxidizing agent compared to molybdenum(VI) oxide (MoO$_3$)?",
            "diagram": None,
            "options": ["The smaller atomic radius of chromium leading to higher charge density.", "The greater stability of the +6 oxidation state for molybdenum relative to chromium.", "The higher electronegativity of chromium compared to molybdenum.", "The presence of unpaired electrons in CrO$_3$ making it more reactive."]
        },
        {
            "id": 65,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "Which of the following are aromatic compounds?",
            "diagram": "/questions/q65_diagram.png",
            "options": ["I and III", "I, II and III", "I, II and IV", "III and IV"]
        },
        {
            "id": 66,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "Consider the following reactions... (i) NaNO$_2$/HCl... [P]. The compound [P] is:",
            "diagram": "/questions/q66_full.png",
            "options": ["A", "B", "C", "D"]
        },
        {
            "id": 67,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "The observed osmotic pressure for a $0.10$ M solution of Fe(NH$_4$)$_2$(SO$_4$)$_2$ at $25°$C is $10.8$ atm. The expected and experimental (observed) values of Van't Hoff factor '$i$' will be respectively: ($R = 0.082$ L atm K$^{-1}$ mol$^{-1}$)",
            "diagram": None,
            "options": ["$4$ and $4.00$", "$3$ and $5.42$", "$5$ and $4.42$", "$5$ and $3.42$"]
        },
        {
            "id": 68,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "Consider the elements Boron (B), Aluminium (Al), Gallium (Ga), Indium (In), and Thallium (Tl) from Group 13. Evaluate the following statements: I. The atomic radius of Gallium is smaller than that of Aluminium. II. The first ionization energy follows the order: In < Al < Ga < Tl < B. III. The electronegativity values show a monotonic decrease from Boron to Thallium. IV. The density of these elements consistently increases from Boron to Thallium. Which of the above statements are correct?",
            "diagram": None,
            "options": ["I, II, and III only", "I, II and IV only", "II, III, and IV only", "I, II, III, and IV only"]
        },
        {
            "id": 69,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "What is the IUPAC name of the given compound?",
            "diagram": "/questions/q69_diagram.png",
            "options": ["3-(3,4-dihydroxy-5-hydroxymethylcyclohexyl)-2-phenylpropane nitrile", "3-(4,5-dihydroxy-3-hydroxymethylcyclohexyl)-2-phenylpropane nitrile", "5-(2-cyano-2-phenyl)ethyl-3-hydroxymethylcyclohexane-1,2 diol", "4-(2-cyano-2-phenyl)ethyl-6-hydroxymethylcyclohexane-1,2 diol"]
        },
        {
            "id": 70,
            "subject": "Chemistry",
            "type": "MCQ",
            "questionText": "Consider the following statements regarding the Arrhenius equation, $k = Ae^{-E_a/RT}$: I. The Arrhenius equation is exclusively valid for elementary reactions. II. The pre-exponential factor, $A$, and the activation energy, $E_a$, are generally considered to be independent of temperature. III. For a given reaction at a constant temperature, a higher activation energy typically leads to a slower reaction rate. IV. The units of the pre-exponential factor, $A$, are always s$^{-1}$. Which of the above statements is/are correct?",
            "diagram": None,
            "options": ["I and II Only", "II and III Only", "I, III and IV Only", "II, III and IV Only"]
        },
        {
            "id": 71,
            "subject": "Chemistry",
            "type": "Numerical",
            "questionText": "A hydrocarbon (X) contains $91.2\\%$ carbon and $8.8\\%$ hydrogen. The compound on chlorination using Cl$_2$/h$\\nu$ and Cl$_2$/AlCl$_3$ gives three isomeric monochloro substituted products. Total number of atoms present in (X) = ?",
            "diagram": None,
            "options": None
        },
        {
            "id": 72,
            "subject": "Chemistry",
            "type": "Numerical",
            "questionText": "Calculate amount of heat supplied to the gas to go from A to B if internal energy change of gas along AB is $10$ J. The given figure shows a change of state A to state C by two paths ABC and AC for an ideal gas:",
            "diagram": "/questions/q72_diagram.png",
            "options": None
        },
        {
            "id": 73,
            "subject": "Chemistry",
            "type": "Numerical",
            "questionText": "The bond dissociation energies of N$\\equiv$N, N=N, O=O & N=O are $946$, $418$, $498$ and $607$ kJ/mole respectively. If heat of formation of N$_2$O is $82$ kJ/mole then the magnitude of resonance energy of N$_2$O in kJ/mole is:",
            "diagram": None,
            "options": None
        },
        {
            "id": 74,
            "subject": "Chemistry",
            "type": "Numerical",
            "questionText": "Sum of peroxide linkage present in K$_3$CrO$_8$ and CrO$_5$ is:",
            "diagram": None,
            "options": None
        },
        {
            "id": 75,
            "subject": "Chemistry",
            "type": "Numerical",
            "questionText": "How many cyclic isomers can be given by C$_5$H$_8$? (Excluding stereoisomers)",
            "diagram": None,
            "options": None
        }
    ]
}

# Write to JSON file
with open('d:/formula ap/personal-dashboard/src/data/examQuestions.json', 'w', encoding='utf-8') as f:
    json.dump(exam_data, f, indent=4, ensure_ascii=False)

print(f"Successfully wrote {len(exam_data['questions'])} questions with proper LaTeX formatting!")
