import json
import re

# Read the JSON file
with open('d:/formula ap/personal-dashboard/src/data/examQuestions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def fix_text(text):
    """
    Comprehensive fix for all math notation issues.
    Ensures all LaTeX commands are properly wrapped in $...$ delimiters.
    """
    if not text:
        return text
    
    result = text
    
    # Step 1: Remove excessive escaping (\\\\command -> \\command)
    result = re.sub(r'\\\\\\\\([a-zA-Z])', r'\\\1', result)
    result = re.sub(r'\\\\\\\\', r'\\\\', result)
    
    # Step 2: Fix split dollar signs like $something$/$something$
    # Convert to proper fractions
    result = re.sub(r'\$([^$]+)\$/\$([^$]+)\$', r'$\\frac{\1}{\2}$', result)
    
    # Step 3: Wrap standalone LaTeX commands in $...$
    # Match \command that's NOT already inside $...$
    latex_commands = [
        'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'theta', 'lambda', 'mu', 'pi', 'rho', 'sigma', 'phi', 'psi', 'omega',
        'Delta', 'Gamma', 'Theta', 'Lambda', 'Phi', 'Psi', 'Omega', 'Sigma',
        'infty', 'sqrt', 'frac', 'int', 'sum', 'prod', 'lim', 'partial', 'nabla',
        'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'ln', 'log', 'exp',
        'leq', 'geq', 'neq', 'approx', 'equiv', 'times', 'div', 'pm', 'mp', 'cdot',
        'rightarrow', 'leftarrow', 'Rightarrow', 'Leftarrow',
        'hat', 'vec', 'bar', 'dot', 'text'
    ]
    
    for cmd in latex_commands:
        # Pattern: \command NOT inside $...$
        # Match \command followed by content up to space or newline or ( or { or end
        pattern = r'(?<!\$)\\' + cmd + r'(\^?\{[^}]*\}|\^\{?-?\d+\}?)?(?!\$)'
        
        def wrap_match(m):
            full = m.group(0)
            # Check if already has $ around it
            return '$' + full + '$'
        
        result = re.sub(pattern, wrap_match, result)
    
    # Step 4: Fix options like "\tan^{-1} 2" -> "$\tan^{-1} 2$"
    # Wrap entire option if it starts with a backslash
    if result.startswith('\\') and not result.startswith('$'):
        result = '$' + result + '$'
    if result.startswith('-\\') and not result.startswith('$'):
        result = '$' + result + '$'
    
    # Step 5: Clean up double/triple $$$
    result = re.sub(r'\$\$+', '$', result)
    result = re.sub(r'\$\s*\$', '', result)
    
    # Step 6: Merge adjacent math blocks
    prev = None
    while prev != result:
        prev = result
        result = re.sub(r'\$([^$]+)\$\s*\$([^$]+)\$', r'$\1 \2$', result)
    
    # Step 7: Fix common broken patterns
    # Pattern: "infty" without backslash -> add it
    result = re.sub(r'(?<!\\)\binfty\b', r'\\infty', result)
    # Then wrap
    result = re.sub(r'(?<!\$)\\infty(?!\$)', r'$\\infty$', result)
    
    # Step 8: Fix "x^2" patterns not in math mode
    result = re.sub(r'(?<!\$)([a-zA-Z])\^(\{[^}]+\}|\d+)(?!\$)', r'$\1^\2$', result)
    result = re.sub(r'(?<!\$)([a-zA-Z])_(\{[^}]+\}|\d+)(?!\$)', r'$\1_\2$', result)
    
    # Step 9: Final cleanup - merge again
    prev = None
    while prev != result:
        prev = result
        result = re.sub(r'\$([^$]+)\$\s*\$([^$]+)\$', r'$\1 \2$', result)
    
    return result

def process_question(q):
    """Process a single question and its options."""
    q['questionText'] = fix_text(q['questionText'])
    if q.get('options'):
        q['options'] = [fix_text(opt) if opt else opt for opt in q['options']]
    return q

# Process all questions
print("Processing questions...")
for i, question in enumerate(data['questions']):
    data['questions'][i] = process_question(question)
    if (i + 1) % 10 == 0:
        print(f"  Processed {i + 1} questions")

# Write back
with open('d:/formula ap/personal-dashboard/src/data/examQuestions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f"\nComplete! Fixed {len(data['questions'])} questions.")
