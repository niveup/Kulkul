import pypdf
from PIL import Image
import io
import os
import json
import uuid

# Configuration
PDF_PATH = r"d:\formula ap\test pdf\QFT 5.pdf"
OUTPUT_DIR = r"d:\formula ap\personal-dashboard\public\questions"
# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def is_line_empty(image, y, threshold=250):
    """Check if a horizontal line is mostly white/empty"""
    width = image.width
    # Sample pixels
    pixels = image.load()
    non_white_pixels = 0
    scan_step = 2 # Check every 2nd pixel for speed
    
    for x in range(0, width, scan_step):
        # Grayscale check
        pixel = pixels[x, y]
        # Pixel is tuple (R, G, B) or int
        if isinstance(pixel, tuple):
            if len(pixel) == 4: # RGBA
                if pixel[3] < 50: # Transparent
                    continue
                val = sum(pixel[:3]) / 3
            else:
             val = sum(pixel) / 3
        else:
            val = pixel
            
        if val < threshold: # Dark pixel
            non_white_pixels += 1
            
    # If more than 1% of line is dark, it's content
    return non_white_pixels < (width / scan_step * 0.01)

def find_content_blocks(image, min_height=50):
    """Find vertical ranges containing content using whitespace detection"""
    width, height = image.size
    
    # 1. Scan for empty lines
    is_empty_map = []
    # Convert to grayscale for faster checking (handle transparency)
    if image.mode in ('RGBA', 'LA'):
        background = Image.new(image.mode[:-1], image.size, (255, 255, 255))
        background.paste(image, image.split()[-1])
        gray_img = background.convert('L')
    else:
        gray_img = image.convert('L')
    
    # Scan every 2nd line
    for y in range(0, height, 2):
        is_empty_map.append(is_line_empty(gray_img, y))
        
    # Scale back to original height logic
    def is_empty(y):
        idx = y // 2
        if idx < len(is_empty_map):
            return is_empty_map[idx]
        return True

    blocks = []
    in_block = False
    start_y = 0
    
    gap_threshold = 40 # Minimum pixels of whitespace to count as a separator
    current_gap_size = 0
    
    for y in range(height):
        line_empty = is_empty(y)
        
        if not in_block:
            if not line_empty:
                in_block = True
                start_y = y
                current_gap_size = 0
        else:
            if line_empty:
                current_gap_size += 1
                if current_gap_size > gap_threshold:
                    # End of block found (retroactively at start of gap)
                    end_y = y - current_gap_size
                    if (end_y - start_y) > min_height:
                        blocks.append((start_y, end_y))
                    in_block = False
                    current_gap_size = 0
            else:
                current_gap_size = 0
                
    # Handle last block
    if in_block and (height - start_y) > min_height:
        blocks.append((start_y, height))
        
    return blocks

def process_pdf_extraction():
    try:
        reader = pypdf.PdfReader(PDF_PATH)
    except Exception as e:
        print(f"Error opening PDF: {e}")
        return

    questions_data = []
    question_counter = 1
    
    print(f"Processing {len(reader.pages)} pages...")

    for page_num, page in enumerate(reader.pages):
        print(f"Page {page_num+1}...")
        
        # Extract images
        count = 0
        for image_file_object in page.images:
            try:
                # Filter out small images (logos/icons)
                img = Image.open(io.BytesIO(image_file_object.data))
                if img.width < 300 or img.height < 100:
                    continue
                    
                print(f"  Found image {img.width}x{img.height}")
                
                # Check if this image IS the whole page? 
                # If so, crop it. If it's already a crop (e.g. from a previous tool), just save it?
                # Assuming scanned A4 page
                
                blocks = find_content_blocks(img)
                if not blocks:
                    # If no blocks found (maybe dark background or solid), just save whole image
                    blocks = [(0, img.height)]
                
                for y1, y2 in blocks:
                    # Add padding
                    y1 = max(0, y1 - 10)
                    y2 = min(img.height, y2 + 10)
                    
                    # Crop
                    cropped = img.crop((0, y1, img.width, y2))
                    
                    # Save
                    filename = f"q{question_counter}_{uuid.uuid4().hex[:8]}.png"
                    filepath = os.path.join(OUTPUT_DIR, filename)
                    cropped.save(filepath)
                    
                    # Subject Heuristic
                    subject = 'Physics'
                    if question_counter <= 30: subject = 'Physics'
                    elif question_counter <= 60: subject = 'Chemistry'
                    else: subject = 'Math'
                    
                    questions_data.append({
                        "id": question_counter,
                        "image": f"/questions/{filename}",
                        "subject": subject,
                        "type": "MCQ", 
                        "options": ["A", "B", "C", "D"]
                    })
                    
                    question_counter += 1
            except Exception as e:
                print(f"  Error processing image: {e}")

    # Save JSON metadata
    json_path = r"d:\formula ap\personal-dashboard\src\data\examQuestions.json"
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    
    exam_data = {
        "title": "QFT 5 Exam",
        "questions": questions_data
    }
    
    with open(json_path, 'w') as f:
        json.dump(exam_data, f, indent=2)
        
    print(f"Done! Extracted {len(questions_data)} questions.")

if __name__ == "__main__":
    process_pdf_extraction()
