import json
import re

# Read the JSON file
with open('d:/formula ap/personal-dashboard/src/data/examQuestions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Unicode to LaTeX mappings
replacements = {
    # Greek letters
    'α': '\\\\alpha',
    'β': '\\\\beta',
    'γ': '\\\\gamma',
    'θ': '\\\\theta',
    'π': '\\\\pi',
    'ρ': '\\\\rho',
    'η': '\\\\eta',
    'λ': '\\\\lambda',
    'Δ': '\\\\Delta',
    '∆': '\\\\Delta',
    
    # Subscripts
    '₀': '_0',
    '₁': '_1',
    '₂': '_2',
    '₃': '_3',
    '₄': '_4',
    '₅': '_5',
    '₆': '_6',
    '₇': '_7',
    '₈': '_8',
    '₉': '_9',
    'ₙ': '_n',
    'ᵣ': '_r',
    'ₓ': '_x',
    
    # Superscripts
    '⁰': '^0',
    '¹': '^1',
    '²': '^2',
    '³': '^3',
    '⁴': '^4',
    '⁵': '^5',
    '⁶': '^6',
    '⁷': '^7',
    '⁸': '^8',
    '⁹': '^9',
    'ⁿ': '^n',
    'ᵗʰ': '^{th}',
    '⁺': '^+',
    '⁻': '^-',
    '⊕': '^\\\\oplus',
    
    # Math symbols
    '√': '\\\\sqrt',
    '∞': '\\\\infty',
    '∫': '\\\\int',
    '∑': '\\\\sum',
    '≤': '\\\\leq',
    '≥': '\\\\geq',
    '≠': '\\\\neq',
    '→': '\\\\rightarrow',
    '×': '\\\\times',
    '·': '\\\\cdot',
    '±': '\\\\pm',
    '∈': '\\\\in',
    '∪': '\\\\cup',
    '∩': '\\\\cap',
    
    # Vectors
    'î': '\\\\hat{i}',
    'ĵ': '\\\\hat{j}',
    'k̂': '\\\\hat{k}',
    
    # Special characters for chemistry
    'Å': '\\\\text{\\\\AA}',
}

def convert_to_latex(text):
    if not text:
        return text
    
    result = text
    
    # Apply replacements
    for unicode_char, latex in replacements.items():
        result = result.replace(unicode_char, f'${latex}$')
    
    # Clean up consecutive $ signs (merge adjacent math mode)
    result = re.sub(r'\$\s*\$', ' ', result)
    
    return result

def process_question(q):
    # Convert question text
    q['questionText'] = convert_to_latex(q['questionText'])
    
    # Convert options if they exist
    if q.get('options'):
        q['options'] = [convert_to_latex(opt) if opt else opt for opt in q['options']]
    
    return q

# Process all questions
for i, question in enumerate(data['questions']):
    data['questions'][i] = process_question(question)

# Write back
with open('d:/formula ap/personal-dashboard/src/data/examQuestions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Conversion complete! All questions updated with LaTeX notation.")
