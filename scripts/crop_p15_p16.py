from PIL import Image
import os

def crop_diagrams():
    base_path = r"d:\formula ap\personal-dashboard\public\pdf_pages"
    out_path = r"d:\formula ap\personal-dashboard\public\questions"
    
    if not os.path.exists(out_path):
        os.makedirs(out_path)

    # Page 15
    p15 = Image.open(os.path.join(base_path, "page-15.png"))
    w, h = p15.size
    
    # Q51 Part 1 (Top Right - Question + Options A, B)
    q51_tr = p15.crop((w//2, 0, w, h//2))
    
    # Q51 Part 2 (Bottom Left - Options C, D)
    q51_bl = p15.crop((0, h//2, w//2, h))
    
    # Stitch Q51
    combined = Image.new('RGB', (q51_tr.width, q51_tr.height + q51_bl.height))
    combined.paste(q51_tr, (0, 0))
    combined.paste(q51_bl, (0, q51_tr.height))
    
    combined.save(os.path.join(out_path, "q51_combined.png"))

    print("Crops saved: q51_combined.png")

if __name__ == "__main__":
    crop_diagrams()
