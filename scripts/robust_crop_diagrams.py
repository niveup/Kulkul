from PIL import Image, ImageOps
import os

# Paths
BASE_DIR = r"d:\formula ap\personal-dashboard"
SOURCE_DIR = os.path.join(BASE_DIR, "public", "qft4_images")
DEST_DIR = os.path.join(SOURCE_DIR, "diagrams")

# Ensure destination exists
os.makedirs(DEST_DIR, exist_ok=True)

# Padding around detected content (pixels)
PADDING = 25

# Search Strips: QID -> {page, scan_y_start, scan_y_end, name}
# We scan the FULL WIDTH of the page within this vertical strip.
# The strip should capture the diagram + whitespace, but exclude Q-text and Options if possible.
STRIPS = {
    # Physics
    26: {'page': 21, 'y': (430, 680), 'name': 'physics_q26.png'},   # Sphere on ramp. Expanded Up/Down.
    27: {'page': 22, 'y': (180, 760), 'name': 'physics_q27.png'},   # Circuit Table. Full page list.
    30: {'page': 24, 'y': (450, 750), 'name': 'physics_q30.png'},   # Photoelectric graph. Expanded Up.
    32: {'page': 25, 'y': (480, 760), 'name': 'physics_q32.png'},   # SHM Graph. Expanded.
    33: {'page': 26, 'y': (80, 420), 'name': 'physics_q33.png'},    # Wave Graph. Top of page.

    # Chemistry
    51: {'page': 41, 'y': (150, 760), 'name': 'chemistry_q51.png'}, # Enol structures.
    55: {'page': 43, 'y': (480, 740), 'name': 'chemistry_q55.png'}, # Reaction.
    57: {'page': 46, 'y': (360, 560), 'name': 'chemistry_q57.png'}, # Reaction sequence.
    60: {'page': 47, 'y': (580, 810), 'name': 'chemistry_q60.png'}, # Reaction sequence.
    64: {'page': 50, 'y': (120, 320), 'name': 'chemistry_q64.png'}, # Halide structures.
    67: {'page': 51, 'y': (400, 720), 'name': 'chemistry_q67.png'}, # Ozonolysis.
    68: {'page': 52, 'y': (580, 800), 'name': 'chemistry_q68.png'}, # Dipole structures.
    69: {'page': 52, 'y': (320, 560), 'name': 'chemistry_q69.png'}, # Reaction cyclobutane.
    74: {'page': 55, 'y': (420, 620), 'name': 'chemistry_q74.png'}, # Ozonolysis reaction.
}

def robust_crop():
    print(f"Starting robust crop for {len(STRIPS)} diagrams...")
    
    for qid, data in STRIPS.items():
        page_num = data['page']
        y_start, y_end = data['y']
        filename = data['name']
        
        src_path = os.path.join(SOURCE_DIR, f"page_{page_num}.png")
        if not os.path.exists(src_path):
            print(f"Error: Source page {page_num} not found")
            continue
            
        try:
            img = Image.open(src_path)
            width, height = img.size
            
            # Crop the analysis strip
            # We crop the full width to ensure we don't cut off X-axis labels
            strip_box = (0, y_start, width, y_end)
            strip_img = img.crop(strip_box)
            
            # Find content bbox in the strip
            # Invert so content is white, bg is black
            inverted = ImageOps.invert(strip_img.convert('RGB'))
            bbox = inverted.getbbox() # returns (left, top, right, bottom) ignoring black regions
            
            if not bbox:
                print(f"Warning: No content found for Q{qid} in strip Y={y_start}-{y_end}")
                continue
                
            local_left, local_top, local_right, local_bottom = bbox
            
            # Convert to global coordinates
            global_left = local_left
            global_top = y_start + local_top
            global_right = local_right
            global_bottom = y_start + local_bottom
            
            print(f"Q{qid}: Detected content at X({global_left}-{global_right}), Y({global_top}-{global_bottom})")
            
            # Apply Padding
            final_left = max(0, global_left - PADDING)
            final_top = max(0, global_top - PADDING)
            final_right = min(width, global_right + PADDING)
            final_bottom = min(height, global_bottom + PADDING)
            
            # Final Crop
            final_box = (final_left, final_top, final_right, final_bottom)
            final_img = img.crop(final_box)
            
            dest_path = os.path.join(DEST_DIR, filename)
            final_img.save(dest_path)
            print(f"Saved {filename} (Size: {final_right-final_left}x{final_bottom-final_top})")
            
        except Exception as e:
            print(f"Failed to process Q{qid}: {e}")

if __name__ == "__main__":
    robust_crop()
