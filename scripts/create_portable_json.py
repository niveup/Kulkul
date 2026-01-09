"""
Creates a portable version of examQuestions.json with embedded Base64 images.
The original file remains unchanged.
Output: examQuestions_portable.json (in the same directory as the original)
"""

import json
import base64
import os
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ORIGINAL_JSON = PROJECT_ROOT / "src" / "data" / "examQuestions.json"
OUTPUT_JSON = PROJECT_ROOT / "src" / "data" / "examQuestions_portable.json"
PUBLIC_DIR = PROJECT_ROOT / "public"

def image_to_base64(image_path: Path) -> str:
    """Convert an image file to a Base64 data URL."""
    if not image_path.exists():
        print(f"  ⚠️  Warning: Image not found: {image_path}")
        return None
    
    # Determine MIME type from extension
    ext = image_path.suffix.lower()
    mime_types = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml'
    }
    mime_type = mime_types.get(ext, 'image/png')
    
    # Read and encode the image
    with open(image_path, 'rb') as f:
        image_data = f.read()
    
    base64_data = base64.b64encode(image_data).decode('utf-8')
    return f"data:{mime_type};base64,{base64_data}"

def create_portable_json():
    """Create a portable JSON with embedded Base64 images."""
    print("=" * 60)
    print("Creating Portable JSON with Embedded Images")
    print("=" * 60)
    
    # Load original JSON
    print(f"\n📂 Loading: {ORIGINAL_JSON}")
    with open(ORIGINAL_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    questions = data.get('questions', [])
    print(f"   Found {len(questions)} questions")
    
    # Process each question
    images_converted = 0
    images_failed = 0
    
    for question in questions:
        diagram = question.get('diagram')
        if diagram:
            # Convert relative path to absolute path
            # Remove leading slash if present
            relative_path = diagram.lstrip('/')
            image_path = PUBLIC_DIR / relative_path
            
            print(f"\n🖼️  Question {question['id']}: {diagram}")
            
            base64_url = image_to_base64(image_path)
            if base64_url:
                question['diagram'] = base64_url
                images_converted += 1
                print(f"   ✅ Converted ({len(base64_url):,} chars)")
            else:
                images_failed += 1
    
    # Save portable JSON
    print(f"\n💾 Saving to: {OUTPUT_JSON}")
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    # Get file sizes for comparison
    original_size = ORIGINAL_JSON.stat().st_size
    portable_size = OUTPUT_JSON.stat().st_size
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"✅ Images converted: {images_converted}")
    print(f"⚠️  Images failed: {images_failed}")
    print(f"📁 Original file size: {original_size:,} bytes ({original_size/1024:.1f} KB)")
    print(f"📁 Portable file size: {portable_size:,} bytes ({portable_size/1024/1024:.1f} MB)")
    print(f"\n🎉 Portable JSON created successfully!")
    print(f"   File: {OUTPUT_JSON}")
    print("\n💡 This JSON can now be used anywhere - images are embedded!")

if __name__ == "__main__":
    create_portable_json()
