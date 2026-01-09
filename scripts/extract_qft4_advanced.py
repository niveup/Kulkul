import fitz
import json
import re

def clean_text(text):
    # Basic cleanup
    text = text.replace("ﬁ", "fi").replace("ﬂ", "fl")
    return text.strip()

def extract_questions_advanced(pdf_path, output_path):
    doc = fitz.open(pdf_path)
    
    # Structure to hold results
    data = {
        "examTitle": "QFT 4",
        "subjects": []
    }
    
    # State tracking
    current_subject = "Physics"
    current_section = "MCQ" # MCQ or Numerical
    
    # We will collect all questions linearly and then regroup them
    extracted_questions = [] # List of dicts
    
    current_q = {
        "id": 1,
        "text_lines": [],
        "options": [], 
        "subject": "Physics",
        "type": "MCQ"
    }

    # Regex patterns
    # Option pattern: Starts with (A), (a), A., A) etc
    item_pattern = re.compile(r"^\(?[A-D][\)\.]\s", re.IGNORECASE)
    # Question Header pattern (if present, though we know it's unreliable)
    q_header_pattern = re.compile(r"^Question\s*\d+:", re.IGNORECASE)
    
    # Skip list
    skip_keywords = ["jeematerialmathango", "JEE MAINS", "Time Allowed", "Page ", "QUIZRR"]

    print("Extracting text blocks...")
    all_blocks = []
    
    for page_num, page in enumerate(doc):
        blocks = page.get_text("blocks")
        # Sort by Y then X
        blocks.sort(key=lambda b: (b[1], b[0]))
        
        for b in blocks:
            text = clean_text(b[4])
            if not text: continue
            
            # Skip Headers/Footers
            if any(k in text for k in skip_keywords):
                continue
            
            # Detect Subject Change
            if text in ["PHYSICS", "CHEMISTRY", "MATHEMATICS"]:
                current_subject = text.title()
                # If we were building a question, might trigger a save if it looks complete?
                # Actually, subject headers usually appear at start of sections.
                continue
                
            # Detect Section Change (Section A = MCQ, Section B = Numerical usually)
            if "SECTION" in text.upper() and ("A" in text.upper() or "B" in text.upper()):
                if "A" in text.upper() or "MCQ" in text.upper():
                    current_section = "MCQ"
                elif "B" in text.upper() or "NUMERICAL" in text.upper():
                    current_section = "Numerical"
                continue

            all_blocks.append({
                "text": text,
                "subject": current_subject,
                "section": current_section
            })

    print(f"Total text blocks: {len(all_blocks)}")
    
    # Process blocks
    for i, block in enumerate(all_blocks):
        text = block["text"]
        
        # Check if it's an Option
        # Heuristic: If we are in MCQ section, and text starts with (A).
        is_option = False
        if current_q["type"] == "MCQ" or block["section"] == "MCQ":
            if item_pattern.match(text):
                is_option = True
        
        # Explicit Question Start Check (if found)
        is_new_q_explicit = q_header_pattern.match(text)
        
        # Decision Logic
        if is_new_q_explicit:
            # SAVE PREVIOUS
            if current_q["text_lines"] or current_q["options"]:
                current_q["text"] = "\n".join(current_q["text_lines"])
                del current_q["text_lines"]
                extracted_questions.append(current_q)
                
            # START NEW
            current_q = {
                "id": len(extracted_questions) + 1,
                "text_lines": [], 
                "options": [],
                "subject": block["subject"],
                "type": block["section"] # Default to current section
            }
            # Remove "Question XX:" text from body?
            text = q_header_pattern.sub("", text).strip()
            if text: current_q["text_lines"].append(text)
            
        elif is_option:
            # It's an option.
            current_q["options"].append(text)
            # Ensure type is MCQ
            current_q["type"] = "MCQ" 
            
        else:
            # It's content.
            # Determine if it belongs to current question or starts a new one implicitly?
            # If we just finished options (A,B,C,D) and now see "normal text", it's likely a NEW question.
            if len(current_q["options"]) >= 4:
                 # Previous question is done.
                 # SAVE PREVIOUS
                current_q["text"] = "\n".join(current_q["text_lines"])
                del current_q["text_lines"]
                extracted_questions.append(current_q)
                
                # START NEW
                current_q = {
                    "id": len(extracted_questions) + 1,
                    "text_lines": [text], 
                    "options": [],
                    "subject": block["subject"],
                    "type": block["section"]
                }
            else:
                # Still building text for current question
                current_q["text_lines"].append(text)

    # Save last
    if current_q.get("text_lines") or current_q.get("options"):
        current_q["text"] = "\n".join(current_q["text_lines"])
        if "text_lines" in current_q: del current_q["text_lines"]
        extracted_questions.append(current_q)

    # Organise into final JSON
    final_output = {
        "examTitle": "QFT 4",
        "subjects": []
    }
    
    for subj in ["Physics", "Chemistry", "Mathematics"]:
        subj_qs = [q for q in extracted_questions if q["subject"] == subj]
        
        mcqs = [q for q in subj_qs if q["type"] == "MCQ"]
        numericals = [q for q in subj_qs if q["type"] == "Numerical"]
        
        # Cap/Verify counts
        # We need 20 MCQ, 5 Numerical.
        # We'll just dump what we found.
        
        final_output["subjects"].append({
            "name": subj,
            "sections": [
                {
                    "type": "MCQ",
                    "questions": mcqs
                },
                {
                    "type": "Numerical",
                    "questions": numericals
                }
            ]
        })

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=2, ensure_ascii=False)
        
    print(f"Extraction complete. Found {len(extracted_questions)} questions total.")
    print(f"Physics: {len([q for q in extracted_questions if q['subject']=='Physics'])}")

extract_questions_advanced(r"d:\formula ap\test pdf\QFT 4.pdf", r"d:\formula ap\personal-dashboard\src\data\qft_04.json")
