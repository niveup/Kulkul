import fitz

doc = fitz.open(r"d:\formula ap\test pdf\QFT 4.pdf")
page = doc[5] # Page 6
pix = page.get_pixmap()
pix.save(r"d:\formula ap\personal-dashboard\src\data\qft4_p6.png")
print("Saved qft4_p6.png")
