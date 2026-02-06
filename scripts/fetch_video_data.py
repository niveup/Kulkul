# Fetch all video data with CORRECT chapter extraction
# Caption format: Video Title : [CHAPTER] LessonName - VIDEO

from telethon import TelegramClient
import asyncio
import json
import re
from datetime import datetime

API_ID = 36005492
API_HASH = '66b18d73d1c4003cfcb52d8f5ca5f30f'
CHANNEL = 'kulkuljujum'
OUTPUT_FILE = 'public/videos-data.json'

# Map chapters to subjects
CHEMISTRY_CHAPTERS = {
    'ionic equilibrium', 'chemical kinetics', 'chemical equilibrium', 
    'electrochemistry', 'goc', 'hydrocarbons', 'alcohol phenol ether',
    'aldehyde ketone', 'aldehydes ketones carboxylic acids', 'akca',
    'aldehydes ketones carboxylic acid', 'amines', 'amine',
    'haloalkanes haloarenes', 'haloalkanes and haloarenes',
    'isomerism', 'nomenclature', 'nommasterlature',
    'periodic properties', 'periodic table', 'mole', 'mole concept',
    'redox reaction', 'redox reactions', 'salt analysis',
    'chemical bonding', 'coordination compound', 'coordination compounds',
    'p block', 'group 13', 'group 14', 'group 15', 'group 16', 'group 17', 'group 18',
    'd and f block', 'd block', 'f block', 'd and f block elements',
    'biomolecules', 'polymer', 'carbohydrates', 'amino acids', 'proteins',
    'dilute solution', 'surface chemistry', 'solid state',
    'structure of atom', 'atom', 'atomic structure',
    'qualitative analysis', 'poc', 'practical organic chemistry',
    'thermodynamics', 'thermochemistry', 'thermodynamics and thermochemistry',
    's block', 'alkane', 'alkene', 'alkyne', 'aromatic',
    'mod', 'metallurgy', 'hydrogen',
    'aldehydes, ketones & carboxylic acids', 'general organic chemistry',
    'coordination compounds', 'practical organic chemistry'
}

PHYSICS_CHAPTERS = {
    'kinematics', 'laws of motion', 'work energy power', 'work power energy',
    'center of mass', 'centre of mass', 'collision', 'momentum',
    'rotational motion', 'rotational dynamics', 'moment of inertia',
    'gravitation', 'oscillations', 'shm', 'simple harmonic motion',
    'waves', 'sound', 'fluids', 'fluid mechanics', 'fluid dynamics',
    'thermal properties', 'heat', 'calorimetry', 'ktg', 'kinetic theory',
    'thermodynamics lecture', 'electrostatics', 'electric field',
    'capacitor', 'capacitors', 'dielectric',
    'current electricity', 'ohm', 'resistance', 'kirchhoff',
    'magnetic effect', 'magnetic effect of current', 'magnetism',
    'electromagnetic induction', 'emi', 'faraday',
    'alternating current', 'ac circuits',
    'electromagnetic waves', 'em waves', 'electromagnetic wave',
    'ray optics', 'wave optics', 'optics', 'reflection', 'refraction',
    'dual nature', 'photoelectric effect', 'matter waves',
    'atomic physics', 'nuclear physics', 'radioactivity',
    'semiconductor', 'semiconductors', 'diode', 'transistor',
    'mechanical properties', 'elasticity', 'motion in 1 d', 'motion in 2 d',
    'projectile', 'circular motion', 'friction', 'units and measurements',
    'vernier', 'screw gauge', 'dimensions'
}

MATHS_CHAPTERS = {
    'sets', 'relations', 'functions', 'function', 'relation',
    'limits', 'continuity', 'differentiability', 'differentiation',
    'integration', 'indefinite integration', 'definite integration',
    'differential equation', 'differential equations',
    'application of derivative', 'aod', 'maxima', 'minima',
    'straight line', 'straight lines', 'circle', 'circles',
    'parabola', 'ellipse', 'hyperbola', 'conic', 'conics',
    'vector', 'vectors', 'vector algebra', '3d geometry', '3d',
    'complex number', 'complex numbers',
    'quadratic', 'quadratic equation', 'quadratic equations',
    'sequence', 'series', 'sequences and series', 'ap', 'gp', 'progression',
    'binomial', 'binomial theorem',
    'permutation', 'combination', 'pnc', 'permutation and combination',
    'probability', 'matrices', 'matrix', 'determinant', 'determinants',
    'trigonometry', 'trigonometric', 'itf', 'inverse trigonometric',
    'area under curve', 'area under curves',
    'mathematical induction', 'reasoning', 'logarithm',
    'sets and relations', 'ellipse and hyperbola'
}

def extract_chapter_and_lesson(caption):
    """Extract chapter and lesson from Video Title : [Chapter] Lesson - VIDEO format"""
    if not caption:
        return None, None
    
    # Look for Video Title : [Chapter] Lesson - VIDEO pattern
    match = re.search(r'Video Title\s*:\s*\[([^\]]+)\]\s*(.+?)\s*-\s*VIDEO', caption, re.IGNORECASE)
    
    if match:
        chapter = match.group(1).strip()
        lesson = match.group(2).strip()
        
        # Clean lesson - remove file extension and extra stuff
        lesson = re.sub(r'\[.*?\].*$', '', lesson).strip()
        lesson = re.sub(r'\.mkv|\.mp4', '', lesson, flags=re.IGNORECASE).strip()
        lesson = lesson.strip(' -_')
        
        return chapter, lesson if lesson else chapter
    
    # Fallback - try to find any [Text] pattern
    bracket_match = re.search(r'\[([^\]🎥]+)\]', caption)
    if bracket_match:
        chapter = bracket_match.group(1).strip()
        return chapter, chapter
    
    return None, None

def get_subject(chapter):
    """Determine subject from chapter name"""
    if not chapter:
        return 'General'
    
    chapter_lower = chapter.lower()
    
    # Check each subject's chapters
    for chem_chapter in CHEMISTRY_CHAPTERS:
        if chem_chapter in chapter_lower or chapter_lower in chem_chapter:
            return 'Chemistry'
    
    for phys_chapter in PHYSICS_CHAPTERS:
        if phys_chapter in chapter_lower or chapter_lower in phys_chapter:
            return 'Physics'
    
    for math_chapter in MATHS_CHAPTERS:
        if math_chapter in chapter_lower or chapter_lower in math_chapter:
            return 'Mathematics'
    
    # Heuristic checks
    if any(x in chapter_lower for x in ['reaction', 'compound', 'acid', 'element', 'organic', 'block', 'equilibrium', 'bonding', 'amine', 'alcohol', 'ether', 'aldehyde', 'ketone', 'halogen']):
        return 'Chemistry'
    elif any(x in chapter_lower for x in ['motion', 'force', 'energy', 'wave', 'electric', 'magnetic', 'optic', 'nuclear', 'fluid', 'thermal', 'gravit', 'oscillat', 'electro']):
        return 'Physics'
    elif any(x in chapter_lower for x in ['equation', 'function', 'theorem', 'integr', 'differ', 'limit', 'matrix', 'vector', 'probability', 'complex', 'circle', 'line', 'parabola', 'ellipse', 'hyperbola', 'binomial', 'trigono']):
        return 'Mathematics'
    
    return 'General'

def normalize_chapter(chapter):
    """Normalize chapter names for consistency"""
    if not chapter:
        return 'Uncategorized'
    
    # Common normalizations
    replacements = {
        'NomMasterlature': 'Nomenclature',
        'Aldehyde Ketones Carboxylic acids': 'Aldehydes, Ketones & Carboxylic Acids',
        'Alcohol Phenol Ether': 'Alcohols, Phenols & Ethers',
        'Haloalkanes Haloarenes': 'Haloalkanes & Haloarenes',
        'Differential Equation': 'Differential Equations',
        'Indefinite Integration': 'Integration',
        'Definite Integration': 'Integration (Definite)',
        'Complex Number': 'Complex Numbers',
        'Quadratic Equation': 'Quadratic Equations',
        'Straight Line': 'Straight Lines',
        'd and f Block Elements': 'd & f Block Elements',
        'Coordination Compound': 'Coordination Compounds',
        'Area Under Curve': 'Area Under Curves',
        'PERMUTATION AND COMBINATION': 'Permutations & Combinations',
        'ELLIPSE AND HYPERBOLA': 'Ellipse & Hyperbola',
        'Ellipse and Hyperbola': 'Ellipse & Hyperbola',
        'GOC': 'General Organic Chemistry',
        'POC': 'Practical Organic Chemistry',
        'ITF': 'Inverse Trigonometric Functions',
        'AOD': 'Application of Derivatives',
        'KTG': 'Kinetic Theory of Gases',
        'Coordination Compunds': 'Coordination Compounds'
    }
    
    # Check for exact replacement
    for old, new in replacements.items():
        if chapter.lower() == old.lower():
            return new
    
    return chapter

def format_duration(seconds):
    if not seconds:
        return None
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"

async def main():
    print("=" * 60)
    print("📚 Extracting Chapters from Video Captions")
    print("=" * 60)
    
    async with TelegramClient('forwarder_session', API_ID, API_HASH) as client:
        print("\n📱 Connecting...")
        await client.start()
        me = await client.get_me()
        print(f"✅ Logged in as: {me.first_name}")
        
        print(f"\n📺 Fetching messages from: @{CHANNEL}")
        
        videos = []
        all_messages = []
        
        async for message in client.iter_messages(CHANNEL):
            all_messages.append(message)
        
        print(f"📊 Found {len(all_messages)} total messages")
        
        for i, message in enumerate(all_messages):
            is_video = False
            duration = None
            file_size = None
            
            if message.video:
                is_video = True
                duration = getattr(message.video, 'duration', None)
                file_size = getattr(message.video, 'file_size', None)
            elif message.document:
                mime = getattr(message.document, 'mime_type', '') or ''
                if 'video' in mime:
                    is_video = True
                    file_size = getattr(message.document, 'file_size', None)
                    for attr in getattr(message.document, 'attributes', []) or []:
                        if hasattr(attr, 'duration'):
                            duration = attr.duration
                            break
            
            if is_video:
                caption = message.text or message.caption or ''
                
                # Extract chapter and lesson
                chapter_raw, lesson = extract_chapter_and_lesson(caption)
                
                if chapter_raw:
                    chapter = normalize_chapter(chapter_raw)
                    subject = get_subject(chapter)
                else:
                    chapter = 'Uncategorized'
                    subject = 'General'
                    lesson = f'Video #{message.id}'
                
                video_data = {
                    'id': message.id,
                    'date': message.date.isoformat() if message.date else None,
                    'subject': subject,
                    'chapter': chapter,
                    'lesson': lesson if lesson else chapter,
                    'isVideo': True,
                    'duration': format_duration(duration),
                    'durationSeconds': duration,
                    'fileSize': file_size,
                    'telegramUrl': f"https://t.me/{CHANNEL}/{message.id}"
                }
                
                videos.append(video_data)
            
            if (i + 1) % 100 == 0:
                print(f"   Processed {i + 1}/{len(all_messages)}...")
        
        print(f"\n📹 Found {len(videos)} videos")
        
        # Reverse videos to be Oldest -> Newest (First to Last)
        videos.reverse()
        
        # Organize by subject -> chapter
        subjects = {}
        for v in videos:
            subj = v['subject']
            chap = v['chapter']
            
            if subj not in subjects:
                subjects[subj] = {'chapters': {}, 'count': 0}
            
            if chap not in subjects[subj]['chapters']:
                subjects[subj]['chapters'][chap] = 0
            
            subjects[subj]['chapters'][chap] += 1
            subjects[subj]['count'] += 1
        
        print("\n📊 Summary:")
        for subj in ['Chemistry', 'Physics', 'Mathematics', 'General']:
            if subj in subjects:
                data = subjects[subj]
                print(f"\n   📁 {subj}: {data['count']} videos, {len(data['chapters'])} chapters")
                sorted_chapters = sorted(data['chapters'].items(), key=lambda x: -x[1])[:8]
                for chap, count in sorted_chapters:
                    print(f"      └─ {chap}: {count}")
                if len(data['chapters']) > 8:
                    print(f"      └─ ... and {len(data['chapters']) - 8} more")
        
        # Save
        output = {
            'channel': CHANNEL,
            'fetchedAt': datetime.now().isoformat(),
            'totalVideos': len(videos),
            'subjects': {k: {'chapters': list(v['chapters'].keys()), 'chapterCounts': v['chapters'], 'count': v['count']} for k, v in subjects.items()},
            'videos': videos
        }
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Saved to: {OUTPUT_FILE}")
        print("=" * 60)

if __name__ == '__main__':
    asyncio.run(main())
