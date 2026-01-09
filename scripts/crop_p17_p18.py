from PIL import Image
import os

def crop_diagrams():
    base_path = r"d:\formula ap\personal-dashboard\public\pdf_pages"
    out_path = r"d:\formula ap\personal-dashboard\public\questions"
    
    if not os.path.exists(out_path):
        os.makedirs(out_path)

    # Page 17 (Organic Chemistry Visuals)
    p17 = Image.open(os.path.join(base_path, "page-17.png"))
    w, h = p17.size
    
    # Q57 (Top Half - Full Width)
    q57_img = p17.crop((0, 0, w, h//2))
    q57_img.save(os.path.join(out_path, "q57_full.png"))
    
    # Q58 (Bottom Half - Full Width)
    q58_img = p17.crop((0, h//2, w, h))
    q58_img.save(os.path.join(out_path, "q58_full.png"))

    print("Crops saved: q57_full.png, q58_full.png")

if __name__ == "__main__":
    crop_diagrams()
