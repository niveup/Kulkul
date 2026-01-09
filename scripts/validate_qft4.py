import json

with open(r"d:\formula ap\personal-dashboard\src\data\qft_04.json", encoding="utf-8") as f:
    d = json.load(f)

total = 0
for subj in d["subjects"]:
    mcq = len(subj["sections"][0]["questions"])
    num = len(subj["sections"][1]["questions"])
    total += mcq + num
    print(f"{subj['name']}: MCQ={mcq}, Numerical={num}")

print(f"\nTotal questions: {total}")
