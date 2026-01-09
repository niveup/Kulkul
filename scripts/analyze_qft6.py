import fitz  # PyMuPDF
import json

pdf_path = r"d:\formula ap\test pdf\QFT 6 .pdf"
output_path = r"d:\formula ap\personal-dashboard\qft6_analysis.txt"

doc = fitz.open(pdf_path)
analysis_data = []

with open(output_path, "w", encoding="utf-8") as f:
    for page_num, page in enumerate(doc):
        # Extract Text
        text = page.get_text("text")
        
        # Extract Image/Drawing Rects
        # geometric drawings (paths) and images
        images = page.get_images(full=True)
        drawings = page.get_drawings()
        
        page_info = {
            "page": page_num + 1,
            "text_snippet": text[:100].replace('\n', ' '), # Just preview
            "image_count": len(images),
            "drawing_count": len(drawings)
        }
        
        f.write(f"--- Page {page_num + 1} ---\n")
        f.write(text)
        f.write("\n\n[IMAGES/DIAGRAMS]\n")
        
        # Log images found
        for img_index, img in enumerate(images):
            xref = img[0]
            try:
                rect = page.get_image_rects(xref)[0]
                f.write(f"Image {img_index}: Rect(x={rect.x0:.1f}, y={rect.y0:.1f}, w={rect.width:.1f}, h={rect.height:.1f})\n")
            except:
                f.write(f"Image {img_index}: (No rect found)\n")
                
        # Log drawings (approximate areas of vector graphics)
        for draw_index, draw in enumerate(drawings):
            rect = draw["rect"]
            # Filter out tiny things (bullets, lines?)
            if rect.width > 20 and rect.height > 20: 
                 f.write(f"Drawing {draw_index}: Rect(x={rect.x0:.1f}, y={rect.y0:.1f}, w={rect.width:.1f}, h={rect.height:.1f})\n")

        f.write("\n" + "="*50 + "\n")

print(f"Analysis saved to {output_path}")
