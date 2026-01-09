from PIL import Image
import os

# Paths
BASE_DIR = r"d:\formula ap\personal-dashboard"
SOURCE_DIR = os.path.join(BASE_DIR, "public", "qft4_images")
DEST_DIR = os.path.join(SOURCE_DIR, "diagrams")

# Ensure destination exists
os.makedirs(DEST_DIR, exist_ok=True)

# Standard horizontal margins
LEFT = 60
RIGHT = 550

# Crop definitions: QID -> {page, y_start, y_end} factoring in header/footer/text
# Page size assumed 612x792
CROPS = {
    # Physics
    26: {'page': 21, 'y': (540, 730), 'name': 'q_physics_26.png'}, # Sphere on ramp (Bottom of P21)
    27: {'page': 22, 'y': (200, 750), 'name': 'q_physics_27.png'}, # Circuit Table (Full P22 minus header)
    30: {'page': 24, 'y': (580, 800), 'name': 'q_physics_30.png'}, # Photoelectric graph (Bottom P24)
    32: {'page': 25, 'y': (520, 750), 'name': 'q_physics_32.png'}, # SHM Graph (Bottom P25)
    33: {'page': 26, 'y': (120, 400), 'name': 'q_physics_33.png'}, # Wave Graph (Top P26)

    # Chemistry
    51: {'page': 41, 'y': (180, 750), 'name': 'q_chemistry_51.png'}, # Enol structures (Full P41)
    55: {'page': 43, 'y': (520, 720), 'name': 'q_chemistry_55.png'}, # Reaction (Bottom P43)
    57: {'page': 46, 'y': (380, 530), 'name': 'q_chemistry_57.png'}, # Reaction sequence (Middle P46)
    60: {'page': 47, 'y': (620, 820), 'name': 'q_chemistry_60.png'}, # Reaction sequence (Bottom P47)
    64: {'page': 50, 'y': (140, 300), 'name': 'q_chemistry_64.png'}, # Halide structures (Top P50)
    67: {'page': 51, 'y': (430, 700), 'name': 'q_chemistry_67.png'}, # Ozonolysis (Bottom P51)
    68: {'page': 52, 'y': (600, 800), 'name': 'q_chemistry_68.png'}, # Dipole structures (Bottom P51/Top P52? Tuning for P51 check)
    69: {'page': 52, 'y': (350, 550), 'name': 'q_chemistry_69.png'}, # Reaction cyclobutane (Middle P52)
    74: {'page': 55, 'y': (450, 600), 'name': 'q_chemistry_74.png'}, # Ozonolysis reaction (Middle P55)
}

# Adjust Q68 page: based on snippets, Q68 header appeared on P51? No, wait. 
# Step 619 showed Q68. If it was P51, it would be at the very bottom.
# Let's try P51 for Q68 first. If it's empty/wrong, we'll try P52.
# Actually, let's process 68 on P51 with y=(600, 792) AND P52 y=(0, 200)? 
# No, let's assume it's on P52 based on Q69 being there too. 
# Wait, Q69 is definitely P52. Q67 is P51. Q68 is between them. P51 ends with Q67? 
# I will check Page 51 again later if needed. For now assume P51 bottom.
# Wait, let's fix Q68 to P51 bottom (600, 800) but be careful.

def crop_diagrams():
    for qid, data in CROPS.items():
        page_num = data['page']
        y_start, y_end = data['y']
        filename = data['name']
        
        src_path = os.path.join(SOURCE_DIR, f"page_{page_num}.png")
        if not os.path.exists(src_path):
            print(f"Error: Source page {page_num} not found at {src_path}")
            continue
            
        try:
            img = Image.open(src_path)
            # Crop
            # Box: (left, upper, right, lower)
            box = (LEFT, y_start, RIGHT, y_end)
            cropped = img.crop(box)
            
            dest_path = os.path.join(DEST_DIR, filename)
            cropped.save(dest_path)
            print(f"Saved {filename} (Q{qid}) from Page {page_num} {box}")
            
        except Exception as e:
            print(f"Failed to crop Q{qid}: {e}")

if __name__ == "__main__":
    crop_diagrams()
