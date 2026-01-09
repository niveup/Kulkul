import json

input_path = r"d:\formula ap\personal-dashboard\src\data\qft_04.json"
output_path = r"d:\formula ap\personal-dashboard\src\data\qft_04.json"

with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Flatten
all_qs = []
if data["subjects"] and len(data["subjects"]) > 0:
    # They are all in Physics (index 0)
    phy_sections = data["subjects"][0]["sections"]
    for sect in phy_sections:
        all_qs.extend(sect["questions"])

print(f"Total flattened questions: {len(all_qs)}")

# Distribute: Target 25 per subject
# We have 71. So roughly 24, 24, 23.
subj_qs = [[], [], []]
chunk_size = 25

for i, q in enumerate(all_qs):
    # Re-assign ID
    q["id"] = (i % 25) + 1
    
    # Bucket
    b_idx = min(i // 25, 2)
    subj_qs[b_idx].append(q)

# Rebuild
new_structure = {
    "examTitle": "QFT 4",
    "subjects": []
}

names = ["Physics", "Chemistry", "Mathematics"]
for i, name in enumerate(names):
    # Attempt to split into MCQ (20) and Numerical (5)
    # Just take first 20 as MCQ, rest as Numerical?
    qs = subj_qs[i]
    mcqs = qs[:20]
    nums = qs[20:]
    
    # Fix types
    for q in mcqs: q["type"] = "MCQ"
    for q in nums: q["type"] = "Numerical"
    
    new_structure["subjects"].append({
        "name": name,
        "sections": [
            {"type": "MCQ", "questions": mcqs},
            {"type": "Numerical", "questions": nums}
        ]
    })

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(new_structure, f, indent=2, ensure_ascii=False)
    
print("Redistributed questions.")
