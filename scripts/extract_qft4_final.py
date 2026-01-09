import fitz
import json
import re

def clean_text(text):
    text = text.replace("ﬁ", "fi").replace("ﬂ", "fl")
    # Remove common junk
    text = re.sub(r"https?://\S+", "", text)
    return text.strip()

def extract_questions_final(pdf_path, output_path):
    doc = fitz.open(pdf_path)
    
    final_output = {
        "examTitle": "QFT 4",
        "subjects": [
            {"name": "Physics", "sections": [{"type": "MCQ", "questions": []}, {"type": "Numerical", "questions": []}]},
            {"name": "Chemistry", "sections": [{"type": "MCQ", "questions": []}, {"type": "Numerical", "questions": []}]},
            {"name": "Mathematics", "sections": [{"type": "MCQ", "questions": []}, {"type": "Numerical", "questions": []}]}
        ]
    }
    
    # We will treat the document as a stream of tokens/blocks
    # We'll use a simple parser:
    # Buffer text.
    # If we see (A)...(B)...(C)...(D), we package the buffer as Question Text and the opts as Options.
    # Then we reset buffer.
    # If we hit "Subject Header", we switch subject.
    
    current_subject = "Physics" # Start
    current_buffer = []

    # Patterns
    opt_pat = re.compile(r"^\(?([A-D])[\)\.]\s*(.*)", re.DOTALL)
    
    # We'll flatten all blocks first
    all_blocks = []
    
    print("Reading blocks...")
    for page_num, page in enumerate(doc):
        # crop header/footer?
        # Standard A4 is approx 595x842.
        # Headers usually top 50, footers bottom 50.
        try:
            rect = page.rect
            clip_rect = fitz.Rect(0, 50, rect.width, rect.height - 50)
            blocks = page.get_text("blocks", clip=clip_rect)
            blocks.sort(key=lambda b: (b[1], b[0]))
            for b in blocks:
                text = clean_text(b[4])
                if not text: continue
                # Block skip logic
                if "Space for Rough Work" in text or "Page" in text: continue
                all_blocks.append(text)
        except:
            pass
            
    # Parsing loop
    questions = []
    
    current_q_text = ""
    current_options = {} # Map A,B,C,D to text
    
    # State: 0=Collecting Text, 1=Collecting Options
    state = 0
    
    # Helper to push question
    def push_question(q_txt, opts, subj):
        if not q_txt.strip(): return
        # Determine Type
        q_type = "MCQ" if len(opts) >= 2 else "Numerical"
        
        # Add to structure
        # Find subject index
        s_idx = 0
        if subj == "Chemistry": s_idx = 1
        elif subj == "Mathematics": s_idx = 2
        
        # Find section index
        sect_idx = 0 if q_type == "MCQ" else 1
        
        q_data = {
            "id": len(final_output["subjects"][s_idx]["sections"][sect_idx]["questions"]) + 1,
            "text": q_txt.strip(),
            "options": [f"({k}) {v}" for k,v in sorted(opts.items())] if q_type=="MCQ" else [],
            "type": q_type
        }
        
        final_output["subjects"][s_idx]["sections"][sect_idx]["questions"].append(q_data)

    for text in all_blocks:
        # Check Subject Switch
        if "PHYSICS" in text.upper() and len(text) < 20: 
            current_subject = "Physics"
            # Flush existing?
            continue
        if "CHEMISTRY" in text.upper() and len(text) < 20:
            current_subject = "Chemistry"
            continue
        if "MATHEMATICS" in text.upper() and len(text) < 20:
            current_subject = "Mathematics"
            continue
            
        # Check Option Match
        match = opt_pat.match(text)
        if match:
             # Found an option line like "(A) 5"
             opt_label = match.group(1).upper() # A,B,C,D
             opt_val = match.group(2)
             
             # If we were collecting text, switch to options
             if state == 0:
                 state = 1
                 current_options = {} # Reset options
             
             # If we see (A) again, it might mean we missed the previous question end?
             # Or it's a new question starting immediately?
             if opt_label == "A" and "A" in current_options:
                 # We found (A) but we already have (A). imply previous question ended.
                 # Push previous
                 push_question(current_q_text, current_options, current_subject)
                 # Start new
                 current_q_text = "" # We lost the text for this new question! 
                 # Wait, if we see (A) indiscriminately, we assume previous text was question.
                 # But if we just pushed, current_q_text is used.
                 # The text *before* this (A) was explicitly part of the *previous* question's options if state=1.
                 # This is the flaw.
                 # Better:
                 # If we see (A), the currently buffered "Question Text" is valid.
                 pass

             current_options[opt_label] = opt_val
             
             # If we strictly look for (D), we can close?
             # But sometimes options are (a),(b)...
             # Let's rely on "Text that is NOT an option" means new question started.
             
        else:
            # Text line.
            # If we are in State 1 (Collecting Options) and we see Non-Option text:
            # It implies the PREVIOUS Question ended, and THIS is the start of NEW Question text.
            if state == 1:
                # Close previous
                push_question(current_q_text, current_options, current_subject)
                # Reset
                current_q_text = text # Start text
                current_options = {}
                state = 0
            else:
                # Append to current text
                current_q_text += "\n" + text

    # Push last
    push_question(current_q_text, current_options, current_subject)
    
    # Save
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=2, ensure_ascii=False)
        
    # Stats
    print("Counts:")
    for subj in final_output["subjects"]:
        mcq = len(subj["sections"][0]["questions"])
        num = len(subj["sections"][1]["questions"])
        print(f"{subj['name']}: MCQ={mcq}, Num={num}")

extract_questions_final(r"d:\formula ap\test pdf\QFT 4.pdf", r"d:\formula ap\personal-dashboard\src\data\qft_04.json")
