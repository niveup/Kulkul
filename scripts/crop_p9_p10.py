from PIL import Image
import os

def crop_diagrams():
    base_path = r"d:\formula ap\personal-dashboard\public\pdf_pages"
    out_path = r"d:\formula ap\personal-dashboard\public\questions"
    
    if not os.path.exists(out_path):
        os.makedirs(out_path)

    # Page 9
    p9 = Image.open(os.path.join(base_path, "page-09.png"))
    w, h = p9.size
    
    # Q33 (Bottom Left - Capacitors)
    q33_img = p9.crop((0, h//2, w//2, h))
    q33_img.save(os.path.join(out_path, "q33_diagram.png"))

    # Page 10
    p10 = Image.open(os.path.join(base_path, "page-10.png"))
    w10, h10 = p10.size
    
    # Q35 (Top Left - Blocks)
    q35_img = p10.crop((0, 0, w10//2, h10//2))
    q35_img.save(os.path.join(out_path, "q35_diagram.png"))
    
    # Q36 (Top Right - Projectile)
    q36_img = p10.crop((w10//2, 0, w10, h10//2))
    q36_img.save(os.path.join(out_path, "q36_diagram.png"))

    print("Crops saved: q33_diagram.png, q35_diagram.png, q36_diagram.png")

if __name__ == "__main__":
    crop_diagrams()
