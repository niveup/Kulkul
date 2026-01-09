from PIL import Image
import os

def crop_diagrams():
    base_path = r"d:\formula ap\personal-dashboard\public\pdf_pages"
    out_path = r"d:\formula ap\personal-dashboard\public\questions"
    
    if not os.path.exists(out_path):
        os.makedirs(out_path)

    # Page 7 Processing
    p7 = Image.open(os.path.join(base_path, "page-07.png"))
    w, h = p7.size
    
    # Q26 (Top Right)
    q26_img = p7.crop((w//2, 0, w, h//2))
    q26_img.save(os.path.join(out_path, "q26_diagram.png"))
    
    # Q28 (Bottom Right)
    q28_img = p7.crop((w//2, h//2, w, h))
    q28_img.save(os.path.join(out_path, "q28_diagram.png"))

    # Page 8 Processing
    p8 = Image.open(os.path.join(base_path, "page-08.png"))
    w8, h8 = p8.size
    
    # Q30 (Bottom Left)
    q30_img = p8.crop((0, h8//2, w8//2, h8))
    q30_img.save(os.path.join(out_path, "q30_diagram.png"))

    print("Crops saved: q26_diagram.png, q28_diagram.png, q30_diagram.png")

if __name__ == "__main__":
    crop_diagrams()
