from PIL import Image
import os

def crop_diagrams():
    base_path = r"d:\formula ap\personal-dashboard\public\pdf_pages"
    out_path = r"d:\formula ap\personal-dashboard\public\questions"
    
    if not os.path.exists(out_path):
        os.makedirs(out_path)

    # Page 11
    p11 = Image.open(os.path.join(base_path, "page-11.png"))
    w11, h11 = p11.size
    
    # Q38 (Top Half - Full Question + Options Layout)
    q38_img = p11.crop((0, 0, w11, h11//2))
    q38_img.save(os.path.join(out_path, "q38_full.png"))

    # Page 12
    p12 = Image.open(os.path.join(base_path, "page-12.png"))
    w12, h12 = p12.size
    
    # Q42 (Bottom Left - Diagram Only)
    q42_img = p12.crop((0, h12//2, w12//2, h12))
    q42_img.save(os.path.join(out_path, "q42_diagram.png"))

    print("Crops saved: q38_full.png, q42_diagram.png")

if __name__ == "__main__":
    crop_diagrams()
