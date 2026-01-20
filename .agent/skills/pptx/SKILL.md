---
name: pptx
description: "Comprehensive PowerPoint creation, editing, and analysis with support for templates, slide layouts, formatting preservation, and visual design. Use when working with presentations (.pptx files) for: (1) Creating new presentations, (2) Editing existing slides, (3) Working with templates, (4) Adding charts and tables, or any other presentation tasks"
license: Proprietary. LICENSE.txt has complete terms
---

# PPTX creation, editing, and analysis

## Overview
A user may ask you to create, edit, or analyze the contents of a .pptx file. You have different tools and workflows available for different tasks.

## Creating a new PowerPoint presentation

When creating a new PowerPoint presentation from scratch, build slides using HTML/CSS and convert them to PowerPoint using the html2pptx library.

### Workflow
1. **Read the html2pptx documentation** to understand the conversion process
2. Create HTML files for each slide using modern CSS styling:
   - Use `<h1>`, `<h2>`, `<h3>` for headings
   - Use `<p>`, `<ul>`, `<ol>` for text content
   - Use `class="placeholder"` for areas where charts/tables will be added (render with gray background for visibility)
   - **CRITICAL**: Rasterize gradients and icons as PNG images FIRST using Sharp, then reference in HTML
   - **LAYOUT**: For slides with charts/tables/images, use either full-slide layout or two-column layout for better readability
3. Create and run a JavaScript file using the `html2pptx.js` library to convert HTML slides to PowerPoint and save the presentation
4. **Visual validation**: Generate thumbnails and inspect for layout issues
   - Create thumbnail grid: `python scripts/thumbnail.py output.pptx workspace/thumbnails --cols 4`
   - Examine the thumbnail image for text cutoff, overlap, positioning issues, contrast issues
   - If issues found, adjust HTML margins/spacing/colors and regenerate the presentation

## Editing an existing PowerPoint presentation

When editing slides in an existing PowerPoint presentation, you need to work with the raw Office Open XML (OOXML) format.

### Workflow
1. **MANDATORY - READ ENTIRE FILE**: Read `ooxml.md` (~500 lines) completely from start to finish.
2. Unpack the presentation: `python ooxml/scripts/unpack.py <file.pptx> <output_directory>`
3. Edit the XML files (primarily `ppt/slides/slide{N}.xml` and related files)
4. **CRITICAL**: Validate immediately after each edit: `python ooxml/scripts/validate.py --original <file.pptx>`
5. Pack the final presentation: `python ooxml/scripts/pack.py <input_directory> <file.pptx>`

## Creating a new PowerPoint presentation using a template

When you need to create a presentation that follows an existing template's design, you'll need to duplicate and re-arrange template slides before then replacing placeholder context.

### Workflow
1. **Extract template text AND create visual thumbnail grid**:
   - Extract text: `python -m markitdown template.pptx > template-content.md`
   - Create thumbnail grids: `python scripts/thumbnail.py template.pptx`

2. **Analyze template and save inventory to a file**:
   - Review thumbnail grid(s) to understand slide layouts
   - Create and save a template inventory file at `template-inventory.md`

3. **Create presentation outline based on template inventory**:
   - Choose appropriate templates for each slide
   - Match layout structure to actual content
   - Save `outline.md` with content AND template mapping

4. **Duplicate, reorder, and delete slides using `rearrange.py`**:
   ```bash
   python scripts/rearrange.py template.pptx working.pptx 0,34,34,50,52
   ```

5. **Extract ALL text using the `inventory.py` script**:
   ```bash
   python scripts/inventory.py working.pptx text-inventory.json
   ```

6. **Generate replacement text and save the data to a JSON file**

7. **Apply replacements using the `replace.py` script**:
   ```bash
   python scripts/replace.py working.pptx replacement-text.json output.pptx
   ```

## Creating Thumbnail Grids

To create visual thumbnail grids of PowerPoint slides for quick analysis and reference:

```bash
python scripts/thumbnail.py template.pptx [output_prefix]
```

**Features**:
- Creates: `thumbnails.jpg` (or `thumbnails-1.jpg`, `thumbnails-2.jpg`, etc. for large decks)
- Default: 5 columns, max 30 slides per grid (5×6)
- Slides are zero-indexed (Slide 0, Slide 1, etc.)

## Converting Slides to Images

To visually analyze PowerPoint slides, convert them to images using a two-step process:

1. **Convert PPTX to PDF**:
   ```bash
   soffice --headless --convert-to pdf template.pptx
   ```

2. **Convert PDF pages to JPEG images**:
   ```bash
   pdftoppm -jpeg -r 150 template.pdf slide
   ```

## Code Style Guidelines
**IMPORTANT**: When generating code for PPTX operations:
- Write concise code
- Avoid verbose variable names and redundant operations
- Avoid unnecessary print statements

## Dependencies
Required dependencies (should already be installed):
- **markitdown**: `pip install "markitdown[pptx]"` (for text extraction from presentations)
- **pptxgenjs**: `npm install -g pptxgenjs` (for creating presentations via html2pptx)
- **playwright**: `npm install -g playwright` (for HTML rendering in html2pptx)
- **react-icons**: `npm install -g react-icons react react-dom` (for icons)
- **sharp**: `npm install -g sharp` (for SVG rasterization and image processing)
- **LibreOffice**: `sudo apt-get install libreoffice` (for PDF conversion)
- **Poppler**: `sudo apt-get install poppler-utils` (for pdftoppm to convert PDF to images)
- **defusedxml**: `pip install defusedxml` (for secure XML parsing)
