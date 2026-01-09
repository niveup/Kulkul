"""
PDF Question Cropper - Detailed Instructions from AI Analysis
=============================================================

Based on my visual analysis of the QFT 5 PDF pages:
- Page dimensions: 1754 x 1241 pixels (landscape orientation)
- Layout: Questions appear to be in a columnar format
- Total: ~75 questions across 23 pages (roughly 3-4 questions per page)
- Format: Mix of MCQ (with A,B,C,D options) and Numerical questions

This script will:
1. Read each page image
2. Analyze content regions using whitespace detection
3. Crop individual questions
4. Save them with proper numbering
5. Generate JSON metadata with subject/type classification

The cropping logic is based on detecting horizontal white bands
that separate questions.
"""

from PIL import Image
import os
import json

# Paths
PAGES_DIR = r"d:\formula ap\personal-dashboard\public\pdf_pages"
OUTPUT_DIR = r"d:\formula ap\personal-dashboard\public\questions"
JSON_PATH = r"d:\formula ap\personal-dashboard\src\data\examQuestions.json"

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Configuration based on visual analysis
PAGE_WIDTH = 1754
PAGE_HEIGHT = 1241
HEADER_HEIGHT = 80  # Skip top header area
FOOTER_HEIGHT = 50  # Skip bottom margin
MIN_QUESTION_HEIGHT = 100  # Minimum height for a valid question block
WHITE_THRESHOLD = 245  # Pixels above this are considered white
GAP_THRESHOLD = 25  # Minimum whitespace gap between questions

def is_row_white(image, y, threshold=0.95):
    """Check if a horizontal row is mostly white (separator between questions)"""
    width = image.width
    white_count = 0
    for x in range(0, width, 5):  # Sample every 5th pixel
        pixel = image.getpixel((x, y))
        if isinstance(pixel, tuple):
            brightness = sum(pixel[:3]) / 3
        else:
            brightness = pixel
        if brightness > WHITE_THRESHOLD:
            white_count += 1
    return (white_count / (width // 5)) > threshold

def find_question_boundaries(image):
    """Find vertical boundaries where questions start/end based on whitespace"""
    height = image.height
    width = image.width
    
    # Convert to grayscale for analysis
    gray = image.convert('L')
    
    boundaries = []
    in_content = False
    content_start = HEADER_HEIGHT
    gap_count = 0
    
    for y in range(HEADER_HEIGHT, height - FOOTER_HEIGHT):
        row_is_white = is_row_white(gray, y)
        
        if not in_content:
            if not row_is_white:
                in_content = True
                content_start = y
                gap_count = 0
        else:
            if row_is_white:
                gap_count += 1
                if gap_count > GAP_THRESHOLD:
                    # End of question block
                    content_end = y - gap_count
                    if content_end - content_start > MIN_QUESTION_HEIGHT:
                        boundaries.append((content_start, content_end))
                    in_content = False
                    gap_count = 0
            else:
                gap_count = 0
    
    # Handle last block
    if in_content:
        content_end = height - FOOTER_HEIGHT
        if content_end - content_start > MIN_QUESTION_HEIGHT:
            boundaries.append((content_start, content_end))
    
    return boundaries

def determine_subject(question_num, total_questions=75):
    """
    Determine subject based on question number.
    Typical JEE pattern: 25 Physics, 25 Chemistry, 25 Math
    """
    if question_num <= 25:
        return "Physics"
    elif question_num <= 50:
        return "Chemistry"
    else:
        return "Math"

def determine_type(question_num, subject):
    """
    Determine question type (MCQ or Numerical).
    Typical JEE pattern: First 20 MCQ, Last 5 Numerical per subject
    """
    # Within each subject (1-25), 1-20 are MCQ, 21-25 are Numerical
    subject_offset = (question_num - 1) % 25 + 1
    if subject_offset <= 20:
        return "MCQ"
    else:
        return "Numerical"

def process_all_pages():
    """Main function to process all pages and extract questions"""
    questions_data = []
    question_counter = 1
    
    # Get all page files
    page_files = sorted([f for f in os.listdir(PAGES_DIR) if f.startswith('page-') and f.endswith('.png')])
    
    print(f"Processing {len(page_files)} pages...")
    
    for page_file in page_files:
        page_path = os.path.join(PAGES_DIR, page_file)
        print(f"\n=== Processing {page_file} ===")
        
        img = Image.open(page_path)
        
        # Find question boundaries
        boundaries = find_question_boundaries(img)
        print(f"  Found {len(boundaries)} content blocks")
        
        for i, (y_start, y_end) in enumerate(boundaries):
            # Crop the question
            # Full width crop with some margin
            x_start = 20
            x_end = img.width - 20
            
            cropped = img.crop((x_start, y_start, x_end, y_end))
            
            # Generate filename
            filename = f"q{question_counter:03d}.png"
            filepath = os.path.join(OUTPUT_DIR, filename)
            
            cropped.save(filepath)
            print(f"  Saved: {filename} (y: {y_start}-{y_end}, height: {y_end-y_start}px)")
            
            # Determine subject and type
            subject = determine_subject(question_counter)
            q_type = determine_type(question_counter, subject)
            
            questions_data.append({
                "id": question_counter,
                "image": f"/questions/{filename}",
                "subject": subject,
                "type": q_type,
                "options": ["A", "B", "C", "D"] if q_type == "MCQ" else None
            })
            
            question_counter += 1
    
    # Save JSON
    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)
    exam_data = {
        "title": "QFT 5 Exam",
        "questions": questions_data
    }
    with open(JSON_PATH, 'w') as f:
        json.dump(exam_data, f, indent=2)
    
    print(f"\n✅ Done! Extracted {len(questions_data)} questions.")
    print(f"Questions saved to: {OUTPUT_DIR}")
    print(f"Metadata saved to: {JSON_PATH}")
    
    return questions_data

if __name__ == "__main__":
    process_all_pages()
