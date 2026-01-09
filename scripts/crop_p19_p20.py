from PIL import Image
import os

def crop_diagrams():
    base_path = r"d:\formula ap\personal-dashboard\public\pdf_pages"
    out_path = r"d:\formula ap\personal-dashboard\public\questions"
    
    if not os.path.exists(out_path):
        os.makedirs(out_path)

    # Page 19
    p19 = Image.open(os.path.join(base_path, "page-19.png"))
    w19, h19 = p19.size
    
    # Q65 (Bottom Left - Structures)
    q65_img = p19.crop((0, h19//2, w19//2, h19))
    q65_img.save(os.path.join(out_path, "q65_diagram.png"))

    # Page 20
    p20 = Image.open(os.path.join(base_path, "page-20.png"))
    w20, h20 = p20.size
    
    # Q66 (Top Half - Reaction + Options)
    q66_img = p20.crop((0, 0, w20, h20//2))
    q66_img.save(os.path.join(out_path, "q66_full.png"))

    print("Crops saved: q65_diagram.png, q66_full.png")

if __name__ == "__main__":
    crop_diagrams()
