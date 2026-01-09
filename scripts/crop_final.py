from PIL import Image
import os

def crop_diagrams():
    base_path = r"d:\formula ap\personal-dashboard\public\pdf_pages"
    out_path = r"d:\formula ap\personal-dashboard\public\questions"
    
    if not os.path.exists(out_path):
        os.makedirs(out_path)

    # Page 21
    p21 = Image.open(os.path.join(base_path, "page-21.png"))
    w21, h21 = p21.size
    
    # Q69 (Top Right - Structure)
    q69_img = p21.crop((w21//2, 0, w21, h21//2))
    q69_img.save(os.path.join(out_path, "q69_diagram.png"))

    # Page 22
    p22 = Image.open(os.path.join(base_path, "page-22.png"))
    w22, h22 = p22.size
    
    # Q72 (Top Right - Graph)
    q72_img = p22.crop((w22//2, 0, w22, h22//2))
    q72_img.save(os.path.join(out_path, "q72_diagram.png"))

    print("Crops saved: q69_diagram.png, q72_diagram.png")

if __name__ == "__main__":
    crop_diagrams()
