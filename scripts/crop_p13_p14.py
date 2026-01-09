from PIL import Image
import os

def crop_diagrams():
    base_path = r"d:\formula ap\personal-dashboard\public\pdf_pages"
    out_path = r"d:\formula ap\personal-dashboard\public\questions"
    
    if not os.path.exists(out_path):
        os.makedirs(out_path)

    # Page 13
    p13 = Image.open(os.path.join(base_path, "page-13.png"))
    w13, h13 = p13.size
    
    # Q43 (Top Left - Ammeter Circuit)
    q43_img = p13.crop((0, 0, w13//2, h13//2))
    q43_img.save(os.path.join(out_path, "q43_diagram.png"))

    # Q45 (Bottom Left - Magnetic Field)
    q45_img = p13.crop((0, h13//2, w13//2, h13))
    q45_img.save(os.path.join(out_path, "q45_diagram.png"))

    # Page 14
    p14 = Image.open(os.path.join(base_path, "page-14.png"))
    w14, h14 = p14.size
    
    # Q46 (Top Left - Prism)
    q46_img = p14.crop((0, 0, w14//2, h14//2))
    q46_img.save(os.path.join(out_path, "q46_diagram.png"))

    # Q48 (Bottom Left - Heater Circuit)
    q48_img = p14.crop((0, h14//2, w14//2, h14))
    q48_img.save(os.path.join(out_path, "q48_diagram.png"))

    print("Crops saved: q43_diagram, q45_diagram, q46_diagram, q48_diagram")

if __name__ == "__main__":
    crop_diagrams()
