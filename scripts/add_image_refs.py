import json

# Load the JSON
with open(r"d:\formula ap\personal-dashboard\src\data\qft_04.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Define which questions have diagrams
# Format: (subject_index, section_index, question_id, image_filename)
diagram_mappings = [
    # Physics MCQ (subject index 1, section index 0)
    (1, 0, 1, "physics_mcq_q1.png"),    # Rolling sphere on loop
    (1, 0, 2, "physics_mcq_q2.png"),    # Circuit matching
    (1, 0, 5, "physics_mcq_q5.png"),    # Photoelectric effect graph
    (1, 0, 7, "physics_mcq_q7.png"),    # SHM displacement-time graph
    (1, 0, 9, "physics_mcq_q9.png"),    # Pulley system
    (1, 0, 10, "physics_mcq_q10.png"),  # Hemispherical bowl
    (1, 0, 13, "physics_mcq_q13.png"),  # Water stream and block
    (1, 0, 14, "physics_mcq_q14.png"),  # AC circuit with iron rod
    (1, 0, 15, "physics_mcq_q15.png"),  # V-I characteristic
    (1, 0, 16, "physics_mcq_q16.png"),  # Logic gates
    (1, 0, 20, "physics_mcq_q20.png"),  # Force-time graph
    
    # Physics Numerical (subject index 1, section index 1)
    (1, 1, 1, "physics_num_q1.png"),    # Square frame and wire
    (1, 1, 2, "physics_num_q2.png"),    # Mass on spring pan
    (1, 1, 3, "physics_num_q3.png"),    # Mance's experiment
    (1, 1, 4, "physics_num_q4.png"),    # Two charges
    (1, 1, 5, "physics_num_q5.png"),    # Disc with boys
    
    # Chemistry MCQ (subject index 2, section index 0)
    (2, 0, 1, "chemistry_mcq_q1.png"),   # Enol structures
    (2, 0, 5, "chemistry_mcq_q5.png"),   # Organic reaction A
    (2, 0, 6, "chemistry_mcq_q6.png"),   # Organic reaction Q
    (2, 0, 10, "chemistry_mcq_q10.png"), # Reaction sequence P
    (2, 0, 17, "chemistry_mcq_q17.png"), # Reaction sequence Y
    (2, 0, 18, "chemistry_mcq_q18.png"), # Structures I, II, III
    (2, 0, 19, "chemistry_mcq_q19.png"), # Product C structure
]

# Add image field to relevant questions
for subj_idx, sect_idx, q_id, img_filename in diagram_mappings:
    questions = data["subjects"][subj_idx]["sections"][sect_idx]["questions"]
    for q in questions:
        if q["id"] == q_id:
            q["image"] = f"qft4_images/diagrams/{img_filename}"
            print(f"Added image to {data['subjects'][subj_idx]['name']} Q{q_id}")
            break

# Save updated JSON
with open(r"d:\formula ap\personal-dashboard\src\data\qft_04.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nJSON updated with image references.")
