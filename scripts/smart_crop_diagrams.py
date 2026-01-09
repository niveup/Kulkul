from PIL import Image
import os
import sys

# Paths
BASE_DIR = r"d:\formula ap\personal-dashboard"
SOURCE_DIR = os.path.join(BASE_DIR, "public", "qft4_images")
DEST_DIR = os.path.join(SOURCE_DIR, "diagrams")

# Ensure destination exists
os.makedirs(DEST_DIR, exist_ok=True)

# Standard horizontal scan range (to avoid margins)
# We scan for content between X=50 and X=560
SCAN_X_START = 50
SCAN_X_END = 560

# Margin to add around the detected content
PADDING = 20

# Search Zones: QID -> {page, y_search_start, y_search_end, name}
# The script will look for non-white pixels ONLY within this vertical zone.
# Once found, it will determine the exact bbox of that content.
ZONES = {
    # Physics
    26: {'page': 21, 'y': (550, 720), 'name': 'physics_q26.png'}, # Sphere on ramp
    27: {'page': 22, 'y': (210, 740), 'name': 'physics_q27.png'}, # Circuit Table
    30: {'page': 24, 'y': (590, 790), 'name': 'physics_q30.png'}, # Photoelectric graph
    32: {'page': 25, 'y': (530, 740), 'name': 'physics_q32.png'}, # SHM Graph
    33: {'page': 26, 'y': (130, 390), 'name': 'physics_q33.png'}, # Wave Graph

    # Chemistry
    51: {'page': 41, 'y': (190, 740), 'name': 'chemistry_q51.png'}, # Enol structures
    55: {'page': 43, 'y': (530, 710), 'name': 'chemistry_q55.png'}, # Reaction
    57: {'page': 46, 'y': (390, 520), 'name': 'chemistry_q57.png'}, # Reaction sequence
    60: {'page': 47, 'y': (630, 810), 'name': 'chemistry_q60.png'}, # Reaction sequence
    64: {'page': 50, 'y': (150, 290), 'name': 'chemistry_q64.png'}, # Halide structures
    67: {'page': 51, 'y': (440, 690), 'name': 'chemistry_q67.png'}, # Ozonolysis
    68: {'page': 52, 'y': (610, 790), 'name': 'chemistry_q68.png'}, # Dipole structures (Tightened search)
    69: {'page': 52, 'y': (360, 540), 'name': 'chemistry_q69.png'}, # Reaction cyclobutane
    74: {'page': 55, 'y': (460, 590), 'name': 'chemistry_q74.png'}, # Ozonolysis reaction
}

def is_pixel_content(pixel, threshold=240):
    # Returns True if pixel is "dark enough" to be content (not white/transparent)
    # Assumes pixel is (R, G, B, A) or (R, G, B) or L
    if isinstance(pixel, int): # Grayscale
        return pixel < threshold
    if len(pixel) >= 3:
        r, g, b = pixel[:3]
        # White is (255, 255, 255). We want not white.
        return r < threshold or g < threshold or b < threshold
    return False

def smart_crop():
    print(f"Starting smart crop for {len(ZONES)} diagrams...")
    
    for qid, data in ZONES.items():
        page_num = data['page']
        y_search_start, y_search_end = data['y']
        filename = data['name']
        
        src_path = os.path.join(SOURCE_DIR, f"page_{page_num}.png")
        if not os.path.exists(src_path):
            print(f"Error: Source page {page_num} not found")
            continue
            
        try:
            img = Image.open(src_path)
            width, height = img.size
            rgb_img = img.convert("RGB")
            
            # 1. Scan the search zone to find min_x, max_x, min_y, max_y
            min_x, max_x = width, 0
            min_y, max_y = y_search_end, y_search_start
            
            found_pixel = False
            
            # Scan only within the vertical search zone
            # Optimization: We can afford to iterate pixels in this small zone
            for y in range(y_search_start, min(y_search_end, height)):
                for x in range(SCAN_X_START, min(SCAN_X_END, width)):
                   r, g, b = rgb_img.getpixel((x, y))
                   # Simple threshold for "darkness"
                   if r < 240 or g < 240 or b < 240:
                       found_pixel = True
                       if x < min_x: min_x = x
                       if x > max_x: max_x = x
                       if y < min_y: min_y = y
                       if y > max_y: max_y = y
            
            if not found_pixel:
                print(f"Warning: No content found for Q{qid} in search zone Y={y_search_start}-{y_search_end}")
                # Fallback to the search zone itself if nothing found (shouldn't happen)
                min_x, max_x = SCAN_X_START, SCAN_X_END
                min_y, max_y = y_search_start, y_search_end
            else:
                print(f"Q{qid}: Content detected at X({min_x}-{max_x}), Y({min_y}-{max_y})")

            # 2. Apply Padding
            final_left = max(0, min_x - PADDING)
            final_top = max(0, min_y - PADDING)
            final_right = min(width, max_x + PADDING)
            final_bottom = min(height, max_y + PADDING)
            
            # 3. Crop
            box = (final_left, final_top, final_right, final_bottom)
            cropped = img.crop(box)
            
            dest_path = os.path.join(DEST_DIR, filename)
            cropped.save(dest_path)
            print(f"Saved {filename} (Size: {final_right-final_left}x{final_bottom-final_top})")
            
        except Exception as e:
            print(f"Failed to process Q{qid}: {e}")

if __name__ == "__main__":
    smart_crop()
