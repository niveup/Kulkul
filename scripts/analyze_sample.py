import fitz

try:
    doc = fitz.open(r"d:\formula ap\test pdf\QFT 4.pdf")
    if len(doc) > 1:
        page = doc[2] # Page 3 (just to be safe, usually p2 or p3 has questions)
        text = page.get_text("text")
        print("--- PAGE 3 TEXT START ---")
        print(text)
        print("--- PAGE 3 TEXT END ---")
    else:
        print("Error: PDF has fewer than 2 pages")
except Exception as e:
    print(f"Error: {e}")
