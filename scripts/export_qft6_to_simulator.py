import json
import os
import shutil

def export_qft6():
    # predefined paths
    base_dir = r"d:\formula ap\personal-dashboard"
    source_json_path = os.path.join(base_dir, "src", "data", "qft_06.json")
    source_images_dir = os.path.join(base_dir, "public", "qft6_images")
    
    dest_dir = os.path.join(base_dir, "standalone-test-simulator")
    dest_json_path = os.path.join(dest_dir, "qft_06_sim.json")
    dest_images_dir = os.path.join(dest_dir, "qft6_images")

    print("--- QFT 6 Export to Standalone Simulator ---")

    # 1. READ JSON (ReadOnly)
    try:
        with open(source_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ Read source JSON: {source_json_path}")
    except Exception as e:
        print(f"❌ Failed to read source JSON: {e}")
        return

    # 2. TRANSFORM DATA
    new_questions = []
    
    if "subjects" in data:
        for subject in data["subjects"]:
            subject_name = subject.get("name", "Unknown Subject")
            for section in subject.get("sections", []):
                # section_name = section.get("name", "Unknown Section") 
                # Simulator doesn't really use sub-sections strongly, mostly just Subject
                
                for q in section.get("questions", []):
                    # Map fields to simulator format
                    new_q = {
                        "id": q.get("id"),
                        "type": q.get("type", "MCQ"),
                        "questionText": q.get("text", ""), # Renamed text -> questionText
                        "options": q.get("options", []),
                        "subject": subject_name
                        # "answer" field is optional in simulator JSON loading, can be added if needed for auto-grading
                    }
                    
                    # Handle answer mapping if present (mapped to simple index 1-4 or value)
                    if "answer" in q:
                        # Simulator expects 'answer' to be 1-based index for MCQs usually? 
                        # Looking at simulator code: state.answers[idx] = option (1,2,3,4)
                        # So if we provide an answer key, it should probably match that.
                        # But the JSON structure for "questions" usually doesn't strictly need the answer *inside* the question object for the simulator to RUN, 
                        # usually answer key is separate OR inside. 
                        # Let's keep it if it's there.
                        # The original QFT 6 has 0 as placeholder.
                        new_q["answer"] = q["answer"]

                    # Handle Images
                    # QFT 6 JSON has "image": { "sourcePage": "...", "crop": "..." }
                    # Simulator expects:
                    # - "diagram": The main image to show (cropped question)
                    # - "sourcePage": The full page context (for popup)
                    if "image" in q and q["image"]:
                        img_obj = q["image"]
                        
                        # 1. DIAGRAM (Inline) -> ONLY use crop
                        # If crop is present, use it.
                        crop_path = img_obj.get("crop")
                        if crop_path:
                            new_q["diagram"] = crop_path
                        
                        # 2. SOURCE PAGE (Popup) -> Always sourcePage
                        source_path = img_obj.get("sourcePage")
                        if source_path:
                            new_q["sourcePage"] = source_path

                    new_questions.append(new_q)

    # Wrap in simulator expected structure
    sim_data = {
        "title": "QFT 6 Exam (Standalone)",
        "questions": new_questions
    }

    # 3. WRITE NEW JSON
    try:
        with open(dest_json_path, 'w', encoding='utf-8') as f:
            json.dump(sim_data, f, indent=4)
        print(f"✅ Wrote extracted data to: {dest_json_path}")
        print(f"   Converted {len(new_questions)} questions.")
    except Exception as e:
        print(f"❌ Failed to write destination JSON: {e}")
        return

    # 4. COPY IMAGES
    # We want to copy public/qft6_images to standalone-test-simulator/qft6_images
    if os.path.exists(source_images_dir):
        if os.path.exists(dest_images_dir):
            print(f"ℹ️  Destination image folder already exists: {dest_images_dir}")
            print("   Skipping full copy to avoid overwriting or redundant work. Assuming images are up to date.")
            # If user *really* wants to force update, they can delete the folder manually or we can add a flag.
            # For now, safety first.
        else:
            try:
                shutil.copytree(source_images_dir, dest_images_dir)
                print(f"✅ Copied images folder to: {dest_images_dir}")
            except Exception as e:
                print(f"❌ Failed to copy images: {e}")
    else:
        print(f"⚠️  Source image folder not found: {source_images_dir}")
        print("   Test will run but images might be missing.")

if __name__ == "__main__":
    export_qft6()
