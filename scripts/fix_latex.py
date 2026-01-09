import json
import re

# Read the JSON file
with open('d:/formula ap/personal-dashboard/src/data/examQuestions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def fix_latex(text):
    if not text:
        return text
    
    # 1. Merge "text$^2$" -> "$text^2$"
    # Matches: word characters followed by $^something$ or $_something$
    # Example: x$^2$ -> $x^2$, y$_1$ -> $y_1$
    text = re.sub(r'([a-zA-Z0-9]+)\$\^([a-zA-Z0-9-]+)\$', r'$\1^\2$', text)
    text = re.sub(r'([a-zA-Z0-9]+)\$_([a-zA-Z0-9-]+)\$', r'$\1_\2$', text)

    # 2. Fix trig inverse: tan$^- ^1$ -> \tan^{-1}
    # Pattern: word (sin/cos/tan/cot) followed by $^-$ $^1$ or similar split
    text = re.sub(r'(sin|cos|tan|cot)\$\^-\$\s*\$\^1\$', r'\\\1^{-1}', text) # Case: tan$^-$$^1$
    text = re.sub(r'(sin|cos|tan|cot)\$\^-\s*\^1\$', r'\\\1^{-1}', text)     # Case: tan$^- ^1$
    
    # Also simple trig without inverse if not already backslashed
    # Matches " sin " but not "\sin"
    # Negative lookbehind (?<!\\)
    text = re.sub(r'(?<!\\)(sin|cos|tan|cot|ln|log|sec|csc)\s', r'\\\1 ', text)
    text = re.sub(r'(?<!\\)(sin|cos|tan|cot|ln|log|sec|csc)(?![a-zA-Z])', r'\\\1', text)


    # 3. Fix Integral with limits: $\int$ $sub$ $sup$ -> $\int_{sub}^{sup}$
    # Q17 case: $\\int _2 ^4$ or similar.
    # Previous script replaced ∫ with $\\int$. And subscripts/superscripts might be separate.
    # Case: $\int$ _2 ^4
    text = re.sub(r'\$\\\\int\$\s*_([a-zA-Z0-9]+)\s*\^([a-zA-Z0-9]+)', r'$\\int_{\1}^{\2}', text) 
    text = re.sub(r'\$\\\\int\$\s*\$\_([a-zA-Z0-9]+)\$\s*\$\^([a-zA-Z0-9]+)\$', r'$\\int_{\1}^{\2}$', text)

    # 4. Fix Sqrt: $\\sqrt$2 -> $\sqrt{2}$
    # Case: $\\sqrt$2
    text = re.sub(r'\$\\\\sqrt\$([a-zA-Z0-9]+)', r'$\\\\sqrt{\1}$', text)
    # Case: $\\sqrt$(...)
    text = re.sub(r'\$\\\\sqrt\$\(([^)]+)\)', r'$\\\\sqrt{\1}$', text)

    # 5. Fix "e^x" where e is text and x is math -> $e^x$
    text = re.sub(r'e\$\^([a-zA-Z0-9]+)\$', r'$e^{\1}$', text)
    # Fix "e^expression"
    text = re.sub(r'e\$\^([a-zA-Z0-9\{\}\\\s]+)\$', r'$e^{\1}$', text)

    # 6. Cleanup empty math groups e.g. $$ or similar if any created
    text = re.sub(r'\$\s*\$', '', text)
    
    # 7. Merge adjacent math: $a$$b$ -> $ab$
    # Repeatedly merge until no more changes
    while True:
        new_text = re.sub(r'\$([^\$]+)\$\s*\$([^\$]+)\$', r'$\1 \2$', text)
        if new_text == text:
            break
        text = new_text

    return text

def process_question(q):
    q['questionText'] = fix_latex(q['questionText'])
    if q.get('options'):
        q['options'] = [fix_latex(opt) if opt else opt for opt in q['options']]
    return q

# Process all questions
for i, question in enumerate(data['questions']):
    data['questions'][i] = process_question(question)

# Write back
with open('d:/formula ap/personal-dashboard/src/data/examQuestions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Latex Fix Complete")
