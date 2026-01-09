import json
import os

json_path = r"d:\formula ap\personal-dashboard\src\data\qft_04.json"
img_dir = r"d:\formula ap\personal-dashboard\src\data"

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Exam Title: {data.get('title')}")
print(f"Total Subjects: {len(data['subjects'])}")

total_q = 0
missing_imgs = []
empty_texts = []

for subj in data['subjects']:
    subj_name = subj['name']
    print(f"\nSubject: {subj_name}")
    subj_total = 0
    for sect in subj['sections']:
        sect_name = sect['name']
        q_count = len(sect['questions'])
        subj_total += q_count
        print(f"  {sect_name}: {q_count} questions")
        
        for q in sect['questions']:
            total_q += 1
            if not q['text'] or q['text'].strip() == "":
                empty_texts.append(q['id'])
            
            if q.get('image'):
                img_path = os.path.join(img_dir, q['image'])
                if not os.path.exists(img_path):
                    missing_imgs.append(f"Q{q['id']}: {q['image']}")
                else:
                    # Check file size to ensure it's not empty
                    if os.path.getsize(img_path) == 0:
                         missing_imgs.append(f"Q{q['id']} (Empty File): {q['image']}")

    print(f"  Total {subj_name}: {subj_total}")

print(f"\nTotal Questions: {total_q}")
print(f"Missing Images: {len(missing_imgs)}")
if missing_imgs:
    for m in missing_imgs:
        print(f"  - {m}")
print(f"Empty Texts: {len(empty_texts)}")
if empty_texts:
    print(f"  - IDs: {empty_texts}")
