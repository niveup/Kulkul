import json
import os

# Paths
BASE_DIR = r"d:\formula ap\personal-dashboard"
JSON_PATH = os.path.join(BASE_DIR, "src", "data", "qft_04.json")

# Mapping: question ID -> {sourcePage, crop}
# Based on our previous robust_crop_diagrams.py STRIPS definition
DIAGRAM_META = {
    # Physics
    26: {'sourcePage': 'qft4_images/page_21.png', 'crop': {'x': 0, 'y': 430, 'width': 612, 'height': 250}},
    27: {'sourcePage': 'qft4_images/page_22.png', 'crop': {'x': 0, 'y': 180, 'width': 612, 'height': 580}},
    30: {'sourcePage': 'qft4_images/page_24.png', 'crop': {'x': 0, 'y': 450, 'width': 612, 'height': 300}},
    32: {'sourcePage': 'qft4_images/page_25.png', 'crop': {'x': 0, 'y': 480, 'width': 612, 'height': 280}},
    33: {'sourcePage': 'qft4_images/page_26.png', 'crop': {'x': 0, 'y': 80, 'width': 612, 'height': 340}},

    # Chemistry
    51: {'sourcePage': 'qft4_images/page_41.png', 'crop': {'x': 0, 'y': 150, 'width': 612, 'height': 610}},
    55: {'sourcePage': 'qft4_images/page_43.png', 'crop': {'x': 0, 'y': 480, 'width': 612, 'height': 260}},
    57: {'sourcePage': 'qft4_images/page_46.png', 'crop': {'x': 0, 'y': 360, 'width': 612, 'height': 200}},
    60: {'sourcePage': 'qft4_images/page_47.png', 'crop': {'x': 0, 'y': 580, 'width': 612, 'height': 212}},
    64: {'sourcePage': 'qft4_images/page_50.png', 'crop': {'x': 0, 'y': 120, 'width': 612, 'height': 200}},
    67: {'sourcePage': 'qft4_images/page_51.png', 'crop': {'x': 0, 'y': 400, 'width': 612, 'height': 320}},
    68: {'sourcePage': 'qft4_images/page_52.png', 'crop': {'x': 0, 'y': 580, 'width': 612, 'height': 212}},
    69: {'sourcePage': 'qft4_images/page_52.png', 'crop': {'x': 0, 'y': 320, 'width': 612, 'height': 240}},
    74: {'sourcePage': 'qft4_images/page_55.png', 'crop': {'x': 0, 'y': 420, 'width': 612, 'height': 200}},
}

def transform_json():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updates = 0
    for subject in data.get('subjects', []):
        for section in subject.get('sections', []):
            for question in section.get('questions', []):
                qid = question.get('id')
                if qid in DIAGRAM_META:
                    question['image'] = DIAGRAM_META[qid]
                    updates += 1
                    print(f"Updated Q{qid}")
                elif 'image' in question and question['image']:
                    # Question has image but not in our meta - keep as string for now
                    pass
    
    # Write back
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Transformed {updates} questions with new image format")

if __name__ == "__main__":
    transform_json()
