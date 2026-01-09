import cv2
import numpy as np
import os
import glob

def crop_dark_content(image_path, output_path):
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            print(f"Failed to read {image_path}")
            return False

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # The question card is dark, background is white-ish
        # Threshold to separate dark content from bright background
        # Inverted threshold: Dark becomes bright, bright becomes dark
        # Adjust 200 based on the white background (usually 255) vs dark content
        _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not contours:
            print(f"No content found in {image_path}")
            return False

        # Find the largest contour by area (assuming it's the question card)
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Get bounding box
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Check if the found area is significant (avoid noise)
        if w * h < 1000:
             print(f"Content too small in {image_path}")
             return False

        # Crop with some padding if possible, but stay within bounds
        padding = 0 
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(img.shape[1] - x, w + 2*padding)
        h = min(img.shape[0] - y, h + 2*padding)

        cropped = img[y:y+h, x:x+w]

        # Save
        cv2.imwrite(output_path, cropped)
        print(f"Saved {output_path}")
        return True

    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return False

# Directory setup
input_dir = "public/qft6_images"
output_dir = "public/qft6_images/crops"
os.makedirs(output_dir, exist_ok=True)

# Process pages 1 to 10
for i in range(1, 11):
    filename = f"page_{i}.png"
    input_path = os.path.join(input_dir, filename)
    output_path = os.path.join(output_dir, f"q_{i}.png")
    
    if os.path.exists(input_path):
        crop_dark_content(input_path, output_path)
    else:
        print(f"File not found: {input_path}")
