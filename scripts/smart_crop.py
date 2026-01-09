from PIL import Image, ImageOps
import sys
import os

def smart_crop(image_path, output_path, padding=20):
    try:
        img = Image.open(image_path).convert("RGB")
        width, height = img.size
        
        # Convert to grayscale for thresholding
        gray = img.convert("L")
        
        # Invert so content is white, background is black (assuming dark content on light bg)
        # Actually the images shown were dark mode (black bg, white text).
        # Let's check the images provided in previous turns.
        # They look like dark background with white text/boxes.
        # So we want to find the non-black textual/content area.
        
        # Threshold: anything brighter than very dark gray is content
        # The background is #1e1e1e approx (dark). Text is white/gray.
        # Let's verify by just getting the bounding box of non-black pixels.
        
        # Standardize: Invert if it's dark mode to make content dark on white, usually easier for bbox
        # But getbbox() works on non-zero regions.
        # If image is dark mode, background is dark (low values). Content is light (high values).
        # We want to keep high values.
        # We can threshold so that background ( < 50) becomes 0, content ( > 50) becomes 255.
        
        threshold = 50
        bw = gray.point(lambda x: 255 if x > threshold else 0, '1')
        
        # The header text "BATMAN MATHONGO..." is at the top/bottom.
        # We want to exclude the very top and very bottom.
        # Let's crop the BW mask to the middle region first to find the main content bbox.
        
        ignore_margin_top = int(height * 0.15) # Ignore top 15%
        ignore_margin_bottom = int(height * 0.15) # Ignore bottom 15%
        
        # Create a mask that is black in the header/footer regions
        mask = Image.new('1', (width, height), 0)
        core_region = bw.crop((0, ignore_margin_top, width, height - ignore_margin_bottom))
        mask.paste(core_region, (0, ignore_margin_top))
        
        # Now find bbox of the mask
        bbox = mask.getbbox()
        
        if bbox:
            left, top, right, bottom = bbox
            
            # Add padding
            left = max(0, left - padding)
            top = max(0, top - padding)
            right = min(width, right + padding)
            bottom = min(height, bottom + padding)
            
            # Crop original image
            cropped = img.crop((left, top, right, bottom))
            cropped.save(output_path)
            print(f"Cropped {image_path} to {output_path}")
            return True
        else:
            print(f"No content found in {image_path}")
            return False
            
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python smart_crop.py <input_path> <output_path>")
    else:
        smart_crop(sys.argv[1], sys.argv[2])
