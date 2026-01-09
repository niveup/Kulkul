import json
import re

# Read the JSON file
with open('d:/formula ap/personal-dashboard/src/data/examQuestions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def final_cleanup(text):
    """Final cleanup pass to fix all remaining issues."""
    if not text:
        return text
    
    result = text
    
    # Fix excessive backslashes: \\\\command -> \\command
    result = re.sub(r'\\\\\\\\([a-zA-Z])', r'\\\\\1', result)
    
    # Fix $\\$\\sqrt$ -> $\\sqrt
    result = re.sub(r'\$\\\\\$\\\\', r'$\\', result)
    
    # Fix any remaining $\\\\command$ -> $\\command$
    result = re.sub(r'\$\\\\\\\\([a-zA-Z])', r'$\\\\\1', result)
    
    # Clean up $...$ $...$ -> $... ...$
    prev = None
    while prev != result:
        prev = result
        result = re.sub(r'\$([^$]+)\$\s+\$([^$]+)\$', r'$\1 \2$', result)
        result = re.sub(r'\$([^$]+)\$\$([^$]+)\$', r'$\1 \2$', result)
    
    # Remove empty $ pairs
    result = re.sub(r'\$\s*\$', '', result)
    
    return result

def process_question(q):
    q['questionText'] = final_cleanup(q['questionText'])
    if q.get('options'):
        q['options'] = [final_cleanup(opt) if opt else opt for opt in q['options']]
    return q

# Process all questions
print("Final cleanup...")
for i, question in enumerate(data['questions']):
    data['questions'][i] = process_question(question)

# Write back  
with open('d:/formula ap/personal-dashboard/src/data/examQuestions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Done!")
