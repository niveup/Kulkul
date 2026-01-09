import fitz  # PyMuPDF
import cv2
import numpy as np
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

def process_pdf():
    doc = fitz.open(PDF_PATH)
    questions_data = []
    question_counter = 1
    
    print(f"Processing {len(doc)} pages...")

    for page_num, page in enumerate(doc):
        # Render page to high-res image (zoom=2 for 2x resolution)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        img_data = pix.tobytes("png")
        
        # Convert to numpy array for OpenCV
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Threshold: assume white background
        # Invert so text is white on black
        _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        
        # Dilation to connect text blocks within a paragraph/question
        # This brings individual lines of text together into a 'blob'
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (20, 10)) # Wide kernel to connect lines horizontally
        dilated = cv2.dilate(thresh, kernel, iterations=2)
        
        # Find contours of these blobs
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Sort contours from top to bottom
        bounding_boxes = [cv2.boundingRect(c) for c in contours]
        # Sort by Y coordinate
        bounding_boxes.sort(key=lambda x: x[1])
        
        processed_boxes = []
        
        # Filter and crop
        for x, y, w, h in bounding_boxes:
            # Filter out small noise (too small to be a question)
            # Adjust these thresholds based on standard question size
            if h < 50 or w < 100: 
                continue
                
            # Check if this box overlaps significantly with previous ones (optional, simple logic for now)
            # For now, we take valid distinct blocks
            
            # Crop the original image
            # Add some padding
            pad = 10
            y1 = max(0, y - pad)
            y2 = min(img.shape[0], y + h + pad)
            x1 = max(0, x - pad)
            x2 = min(img.shape[1], x + w + pad)
            
            cropped = img[y1:y2, x1:x2]
            
            # Save image
            filename = f"q{question_counter}_{uuid.uuid4().hex[:8]}.png"
            filepath = os.path.join(OUTPUT_DIR, filename)
            cv2.imwrite(filepath, cropped)
            
            # Attempt simple subject detection by checking page number ranges or content (naive for now)
            # Defaulting to Physics for first 1/3, Chem for 2nd, Math for 3rd is a common heuristic if we know total questions
            # But let's just make them "Physics" by default and user can edit
            subject = "Physics" 
            
            questions_data.append({
                "id": question_counter,
                "image": f"/questions/{filename}",
                "subject": subject,
                "type": "MCQ", # Default
                "options": ["A", "B", "C", "D"]
            })
            
            question_counter += 1
            
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
    process_pdf()
