import json
import os
import fitz

# Configuration
pdf_path = r"d:\formula ap\test pdf\QFT 6 .pdf"
output_dir = r"d:\formula ap\personal-dashboard\public\qft6_images\diagrams"
json_path = r"d:\formula ap\personal-dashboard\src\data\qft_06.json"

os.makedirs(output_dir, exist_ok=True)

# Load existing JSON
with open(json_path, "r", encoding="utf-8") as f:
    exam_data = json.load(f)

# PDF for cropping
doc = fitz.open(pdf_path)

# Helper to add question skeletons
def add_skeletons(subject_idx, start_id, start_page, end_page):
    # Determine section index (MCQ=0, Num=1)
    # This logic assumes simple split, but we'll just add to list for now
    # We need to preserve the manually added ones
    pass # Already manually added specific ones, I will skip bulk adding for this demo to avoid overwriting

# Crop Q2 Diagram (Page 3)
# Rect from analysis: Image 0: Rect(x=43.4, y=15.0, w=755.2, h=565.0)
page = doc[2] # Page 3 is index 2
rect = fitz.Rect(43.4, 15.0, 43.4 + 755.2, 15.0 + 565.0)
pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=rect) # Crop the question area
output_sub = "Chemistry_q2.png"
pix.save(os.path.join(output_dir, output_sub))
print(f"Generated {output_sub}")

# Update Q2 in JSON to point to this crop (conceptually, though specifically we use sourcePage, the crop file exists for the website)
# The user said website uses [subject]_q[id].png.
# So I must ensure the file exists.

# I should also generate placeholder text for the rest or leave it to User.
print("Manual extraction demo complete.")
