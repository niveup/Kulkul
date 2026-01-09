import fitz
import os

pdf_path = r"d:\formula ap\test pdf\QFT 6 .pdf"
output_dir = r"d:\formula ap\personal-dashboard\public\qft6_images"

# Create output directory
os.makedirs(output_dir, exist_ok=True)
os.makedirs(os.path.join(output_dir, "diagrams"), exist_ok=True)

doc = fitz.open(pdf_path)

print(f"Processing {len(doc)} pages...")

for page_num, page in enumerate(doc):
    # Render page to image (high resolution for clarity)
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2x zoom for better quality
    output_filename = f"page_{page_num + 1}.png"
    save_path = os.path.join(output_dir, output_filename)
    pix.save(save_path)
    print(f"Saved {output_filename}")

print("All pages saved.")
