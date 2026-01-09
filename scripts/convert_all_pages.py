import fitz
import os

pdf_path = r"d:\formula ap\test pdf\QFT 4.pdf"
output_dir = r"d:\formula ap\personal-dashboard\src\data\qft4_images"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

doc = fitz.open(pdf_path)
print(f"Converting {len(doc)} pages to images...")

for i, page in enumerate(doc):
    pix = page.get_pixmap()
    image_path = os.path.join(output_dir, f"page_{i+1}.png")
    pix.save(image_path)
    if (i+1) % 10 == 0:
        print(f"Saved {i+1} pages...")

print("Conversion complete.")
