import fitz

doc = fitz.open(r"d:\formula ap\test pdf\QFT 4.pdf")
print(f"Total pages: {len(doc)}")
for i, page in enumerate(doc):
    text = page.get_text()
    if len(text.strip()) > 50: # Arbitrary threshold for "real text"
        print(f"Page {i+1} has {len(text)} chars of text.")
        print(f"Sample: {text[:100]}...")
        break
else:
    print("No significant text found on any page.")
