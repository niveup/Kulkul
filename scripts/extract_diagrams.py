import fitz
import os

pdf_path = r"d:\formula ap\test pdf\QFT 4.pdf"
output_dir = r"d:\formula ap\personal-dashboard\src\data\qft4_images\diagrams"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

doc = fitz.open(pdf_path)

# Diagram locations identified from visual analysis
# Format: (page_index, subject, question_id, section_type, crop_rect as (x0, y0, x1, y1) in points)
# Page dimensions are roughly 595 x 842 points for A4

diagrams = [
    # Physics MCQ diagrams
    (12, "physics", 1, "mcq", (50, 100, 545, 400)),   # Page 13: Rolling sphere on loop
    (12, "physics", 2, "mcq", (50, 420, 545, 700)),   # Page 13: Circuit matching
    (13, "physics", 5, "mcq", (50, 300, 545, 550)),   # Page 14: Photoelectric effect graph
    (14, "physics", 7, "mcq", (50, 100, 545, 350)),   # Page 15: SHM displacement-time graph
    (15, "physics", 9, "mcq", (50, 100, 545, 400)),   # Page 16: Pulley system
    (15, "physics", 10, "mcq", (50, 420, 545, 700)),  # Page 16: Hemispherical bowl refraction
    (16, "physics", 13, "mcq", (50, 100, 545, 350)),  # Page 17: Water stream and block
    (16, "physics", 14, "mcq", (50, 400, 545, 650)),  # Page 17: AC circuit with iron rod
    (17, "physics", 15, "mcq", (50, 100, 545, 400)),  # Page 18: V-I characteristic of diode
    (17, "physics", 16, "mcq", (50, 420, 545, 700)),  # Page 18: Logic gates system
    (18, "physics", 20, "mcq", (50, 100, 545, 400)),  # Page 19: Force-time graph
    
    # Physics Numerical diagrams
    (18, "physics", 1, "num", (50, 420, 545, 700)),   # Page 19: Square frame and wire
    (19, "physics", 2, "num", (50, 100, 545, 400)),   # Page 20: Mass on spring pan
    (19, "physics", 3, "num", (50, 420, 545, 700)),   # Page 20: Mance's experiment
    (20, "physics", 4, "num", (50, 100, 545, 400)),   # Page 21: Two charges and moving charge
    (20, "physics", 5, "num", (50, 420, 545, 700)),   # Page 21: Disc with boys
    
    # Chemistry MCQ diagrams (organic structures)
    (21, "chemistry", 1, "mcq", (50, 100, 545, 350)),  # Page 22: Enol structures
    (22, "chemistry", 5, "mcq", (50, 100, 545, 400)),  # Page 23: Organic reaction A
    (22, "chemistry", 6, "mcq", (50, 420, 545, 700)),  # Page 23: Organic reaction Q
    (23, "chemistry", 10, "mcq", (50, 100, 545, 400)), # Page 24: Reaction sequence P
    (24, "chemistry", 17, "mcq", (50, 100, 545, 350)), # Page 25: Reaction sequence Y
    (24, "chemistry", 18, "mcq", (50, 400, 545, 650)), # Page 25: Structures I, II, III
    (25, "chemistry", 19, "mcq", (50, 100, 545, 400)), # Page 26: Product C structure
]

print(f"Extracting {len(diagrams)} diagrams...")

for page_idx, subject, q_id, section_type, rect in diagrams:
    try:
        page = doc[page_idx]
        clip = fitz.Rect(rect)
        pix = page.get_pixmap(clip=clip, dpi=150)
        
        filename = f"{subject}_{section_type}_q{q_id}.png"
        filepath = os.path.join(output_dir, filename)
        pix.save(filepath)
        print(f"Saved: {filename}")
    except Exception as e:
        print(f"Error on page {page_idx+1}, Q{q_id}: {e}")

print("Diagram extraction complete.")
