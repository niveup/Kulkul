import fitz
import os

pdf_path = r"d:\formula ap\test pdf\QFT 4.pdf"
output_dir = r"d:\formula ap\personal-dashboard\src\data\qft4_images\diagrams"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

doc = fitz.open(pdf_path)

# Diagram mapping: (page_index, question_id, crop_rect)
# page_index is 0-based. Page 21 -> index 20.
diagrams = [
    (20, 26, (50, 450, 545, 700)),   # Page 21: Q26 Spherical loop
    (21, 27, (50, 200, 545, 750)),   # Page 22: Q27 Circuit list matching (Wait, check size)
    (23, 30, (50, 520, 545, 800)),   # Page 24: Q30 Stopping potential graph
    (25, 32, (50, 100, 545, 400)),   # Page 26: Q32 Displacement graph (Top)
    (26, 34, (50, 400, 545, 800)),   # Page 27: Q34 Pulley system (Bottom)
    (27, 35, (50, 500, 545, 800)),   # Page 28: Q35 Bowl refraction (Bottom)
    (30, 38, (50, 100, 545, 400)),   # Page 31: Q38 Water stream (Top)
    (30, 39, (50, 550, 545, 800)),   # Page 31: Q39 AC Circuit (Bottom)
    (31, 40, (50, 200, 545, 550)),   # Page 32: Q40 V-I Char (Middle)
    (32, 41, (50, 200, 545, 550)),   # Page 33: Q41 Logic Gates (Middle)
    (34, 45, (50, 350, 545, 700)),   # Page 35: Q45 Force-time graph (Middle/Bottom)
    (35, 46, (50, 250, 545, 650)),   # Page 36: Q46 Square frame (Middle)
    (36, 47, (50, 250, 545, 650)),   # Page 37: Q47 Spring Mass (Middle)
    (37, 48, (50, 250, 545, 650)),   # Page 38: Q48 Bridge circuit (Middle)
    (38, 49, (50, 250, 545, 650)),   # Page 39: Q49 Charges (Middle)
    (39, 50, (50, 350, 545, 650)),   # Page 40: Q50 Disc boys (Middle)
]

print(f"Extracting {len(diagrams)} Physics diagrams...")

for page_idx, q_id, rect in diagrams:
    try:
        page = doc[page_idx]
        clip = fitz.Rect(rect)
        pix = page.get_pixmap(clip=clip, dpi=150)
        
        filename = f"physics_q{q_id}.png"
        filepath = os.path.join(output_dir, filename)
        pix.save(filepath)
        print(f"Saved: {filename}")
    except Exception as e:
        print(f"Error on Q{q_id}: {e}")

print("Physics diagram extraction complete.")
