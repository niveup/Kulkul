import fitz
import json
import re

def extract_questions_from_pdf(pdf_path, output_path):
    doc = fitz.open(pdf_path)
    questions = []
    current_question = {"id": 0, "text": "", "options": [], "type": "MCQ"} # Default
    current_subject = "Physics" # Default start
    
    # Heuristic for subject detection
    subject_map = {
        "PHYSICS": "Physics",
        "CHEMISTRY": "Chemistry", 
        "MATHEMATICS": "Mathematics"
    }

    raw_text_blocks = []

    print(f"Processing {len(doc)} pages...")

    for page_num, page in enumerate(doc):
        # get_text("blocks") returns (x0, y0, x1, y1, text, block_no, block_type)
        blocks = page.get_text("blocks")
        # Sort by vertical position (y0), then horizontal (x0)
        blocks.sort(key=lambda b: (b[1], b[0]))
        
        for b in blocks:
            text = b[4].strip()
            if not text:
                continue
            
            # Filter out headers/footers (approximate check)
            if "jeematerialmathango" in text or "JEE MAINS" in text or "Time Allowed" in text or "Page" in text:
                continue

            raw_text_blocks.append({"page": page_num + 1, "text": text})

    # Now parse the linear sequence of blocks
    # We look for "Question XX:" patterns. 
    # Since earlier check showed they might be missing, we might need fallback.
    # But wait, let's re-verify if "Question 03:" was REALLY missing or just in a separate block I missed.
    # I'll rely on "Question \d+:" or just sequential text grouping.
    
    # Enhanced logic: 
    # If we see "(A)", it's likely an MCQ option. 
    # If we see "Question", it's a new question.
    
    parsed_questions = []
    current_q_text = []
    current_options = []
    q_count = 0
    
    for block in raw_text_blocks:
        text = block["text"]
        
        # Check for Subject Header
        if text.upper() in subject_map:
            current_subject = subject_map[text.upper()]
            continue
            
        # Check for "Question XX:"
        # Regex for "Question" followed by digits
        q_match = re.search(r"Question\s*(\d+)\s*:", text, re.IGNORECASE)
        
        if q_match:
            # Save previous question
            if current_q_text or current_options:
                parsed_questions.append({
                    "id": q_count,
                    "subject": current_subject,
                    "text": "\n".join(current_q_text),
                    "options": current_options,
                    "type": "MCQ" if current_options else "Numerical"
                })
                q_count += 1
                current_q_text = []
                current_options = []
            
            # Start new question
            # Remove "Question XX:" from the text if desired, or keep it
            # clean_text = re.sub(r"Question\s*\d+\s*:", "", text).strip()
            # if clean_text: current_q_text.append(clean_text)
            pass # We don't add the "Question XX:" line itself to the text usually, or maybe we do? 
                 # Let's Skip adding the label line to text for now, assuming next block is text.
                 # Wait, sometimes text follows on same line.
            clean_text = text[q_match.end():].strip()
            if clean_text:
                current_q_text.append(clean_text)
            
        elif text.startswith("(A)") or text.startswith("(a)") or text.startswith("A)"):
            current_options.append(text)
        elif text.startswith("(B)") or text.startswith("(b)") or text.startswith("B)"):
            current_options.append(text)
        elif text.startswith("(C)") or text.startswith("(c)") or text.startswith("C)"):
            current_options.append(text)
        elif text.startswith("(D)") or text.startswith("(d)") or text.startswith("D)"):
            current_options.append(text)
        else:
            # Just content
            current_q_text.append(text)

    # Add last
    if current_q_text or current_options:
        parsed_questions.append({
            "id": q_count,
            "subject": current_subject,
            "text": "\n".join(current_q_text),
            "options": current_options,
             "type": "MCQ" if current_options else "Numerical"
        })

    # Save to JSON
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(parsed_questions, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(parsed_questions)} questions.")

extract_questions_from_pdf(r"d:\formula ap\test pdf\QFT 4.pdf", r"d:\formula ap\personal-dashboard\src\data\qft_04_raw.json")
