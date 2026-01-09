import fitz
import os
from PIL import Image

pdf_path = r"d:\formula ap\test pdf\QFT 4.pdf"
output_dir = r"d:\formula ap\personal-dashboard\src\data\qft4_images\diagrams"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

doc = fitz.open(pdf_path)

# Single Page Diagrams mapping: (page_index, question_id, crop_rect)
# page_index is 0-based.
diagrams = [
    (40, 51, (50, 100, 545, 450)),   # Page 41: Q51
    (42, 55, (50, 550, 545, 800)),   # Page 43: Q55
    (43, 56, (50, 100, 545, 350)),   # Page 44: Q56
    (45, 57, (50, 100, 545, 300)),   # Page 46: Q57
    (46, 60, (50, 500, 545, 750)),   # Page 47: Q60
    (49, 64, (50, 100, 545, 300)),   # Page 50: Q64
    (51, 68, (50, 550, 545, 800)),   # Page 52: Q68 (Bottom)
    (54, 74, (50, 500, 545, 650)),   # Page 55: Q74
]

print(f"Extracting {len(diagrams)} single-page Chemistry diagrams...")

for page_idx, q_id, rect in diagrams:
    try:
        page = doc[page_idx]
        clip = fitz.Rect(rect)
        pix = page.get_pixmap(clip=clip, dpi=150)
        
        filename = f"chemistry_q{q_id}.png"
        filepath = os.path.join(output_dir, filename)
        pix.save(filepath)
        print(f"Saved: {filename}")
    except Exception as e:
        print(f"Error on Q{q_id}: {e}")

# Multi-page Stitching for Q67 and Q69
print("Processing stitched diagrams for Q67 and Q69...")

def stitch_images(part1_tuple, part2_tuple, output_name):
    # part_tuple: (page_idx, rect)
    try:
        # Extract Part 1
        page1 = doc[part1_tuple[0]]
        clip1 = fitz.Rect(part1_tuple[1])
        pix1 = page1.get_pixmap(clip=clip1, dpi=150)
        img1 = Image.frombytes("RGB", [pix1.width, pix1.height], pix1.samples)
        
        # Extract Part 2
        page2 = doc[part2_tuple[0]]
        clip2 = fitz.Rect(part2_tuple[1])
        pix2 = page2.get_pixmap(clip=clip2, dpi=150)
        img2 = Image.frombytes("RGB", [pix2.width, pix2.height], pix2.samples)
        
        # Stitch
        total_height = img1.height + img2.height
        max_width = max(img1.width, img2.width)
        
        new_img = Image.new('RGB', (max_width, total_height), (255, 255, 255))
        new_img.paste(img1, (0, 0))
        new_img.paste(img2, (0, img1.height))
        
        filepath = os.path.join(output_dir, output_name)
        new_img.save(filepath)
        print(f"Saved stitched: {output_name}")
        
    except Exception as e:
        print(f"Error stitching {output_name}: {e}")

# Q67: Page 51 (Bottom) + Page 52 (Top)
stitch_images(
    (50, (50, 420, 545, 800)),  # Page 51 Bottom
    (51, (50, 50, 545, 500)),   # Page 52 Top
    "chemistry_q67.png"
)

# Q69: Page 53 (Bottom) + Page 54 (Top)
stitch_images(
    (52, (50, 350, 545, 840)),  # Page 53 Bottom
    (53, (50, 50, 545, 400)),   # Page 54 Top
    "chemistry_q69.png"
)

print("Chemistry diagram extraction complete.")
