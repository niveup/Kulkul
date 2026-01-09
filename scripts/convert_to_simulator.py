"""
Convert qft_06.json to standalone simulator format.
This script reads from the original and creates a NEW file for the simulator.
Original file is NOT modified.
"""

import json
from pathlib import Path

# Paths
INPUT_FILE = Path(r"d:\formula ap\personal-dashboard\src\data\qft_06.json")
OUTPUT_FILE = Path(r"d:\formula ap\personal-dashboard\standalone-test-simulator\qft_06_sim.json")

def convert_to_simulator_format(input_path, output_path):
    """Convert the nested exam format to flat simulator format."""
    
    # Read original file
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create simulator format
    simulator_data = {
        "title": data.get("examTitle", "QFT 6 Exam") + " (Standalone)",
        "questions": []
    }
    
    # Flatten the nested structure
    for subject in data.get("subjects", []):
        subject_name = subject.get("name", "Unknown")
        
        for section in subject.get("sections", []):
            for question in section.get("questions", []):
                # Create simulator question format
                sim_question = {
                    "id": question.get("id"),
                    "type": question.get("type", "MCQ"),
                    "questionText": question.get("text", ""),
                    "options": question.get("options", []),
                    "subject": subject_name,
                    "answer": question.get("answer", 0)
                }
                
                # Handle images
                image_data = question.get("image", {})
                if image_data:
                    # Add diagram (cropped image) if exists
                    if image_data.get("crop"):
                        sim_question["diagram"] = image_data["crop"]
                    
                    # Add source page
                    if image_data.get("sourcePage"):
                        sim_question["sourcePage"] = image_data["sourcePage"]
                
                simulator_data["questions"].append(sim_question)
    
    # Write to output file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(simulator_data, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Converted {len(simulator_data['questions'])} questions")
    print(f"📁 Original: {input_path}")
    print(f"📁 Output: {output_path}")
    
    # Summary by subject
    subjects = {}
    for q in simulator_data["questions"]:
        subj = q.get("subject", "Unknown")
        subjects[subj] = subjects.get(subj, 0) + 1
    
    print("\n📊 Questions by subject:")
    for subj, count in subjects.items():
        print(f"   - {subj}: {count}")

if __name__ == "__main__":
    convert_to_simulator_format(INPUT_FILE, OUTPUT_FILE)
    print("\n🎯 Done! You can now load qft_06_sim.json in the simulator.")
