
import re

file_path = r'd:\formula ap\formula\diagrams\full_pdf_diagram_list.md'

def count_diagrams():
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    count = 0
    print("--- Detailed Count ---")
    for i, line in enumerate(lines, 1):
        # Check for indented bullets (standard 4 spaces or tab)
        # We also want to exclude top-level bullets like "- **Page X**"
        
        # Regex for sub-item: Start of line, optional whitespace (at least 2 spaces or 1 tab), hyphen, space, not starting with **Page
        # Actually in this file, pages are "- **Page"
        # Diagrams are "    - "
        
        if re.match(r'^\s{2,}-\s', line) or re.match(r'^\t+-\s', line):
            count += 1
            print(f"{count}. [Line {i}] {line.strip()}")
            
    print(f"\nTotal Diagrams Found: {count}")

if __name__ == "__main__":
    count_diagrams()
