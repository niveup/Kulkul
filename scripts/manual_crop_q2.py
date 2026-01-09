
import fitz
import os

pdf_path = r"d:\formula ap\test pdf\QFT 6 .pdf"
output_dir = r"d:\formula ap\personal-dashboard\public\qft6_images\diagrams"
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)

# Page 3 (Index 2) - Q2 Reaction
page = doc[2]
# Visual Estimate: Top 20% of page roughly, centered.
# Rect(x=43.4, y=15.0, w=755.2, h=565.0) was from automated analysis, let's refine based on "image only" logic.
# The user wants "crop". Looking at page_3.png, the question text is at top, diagram below.
# I will crop the reaction scheme.
# Estimated: x=50, y=120, w=700, h=150 (approximate for typical reaction block)
# Better to use the previous automated rect but tighten it if possible, or just generate it.
# I will use a safe wide crop for the reaction.
rect = fitz.Rect(50, 100, 750, 300) 
pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=rect)
pix.save(os.path.join(output_dir, "Chemistry_q2.png"))
print("Chemistry_q2.png created")
