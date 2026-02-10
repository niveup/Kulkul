const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'public', 'videos-data.json');
const rawData = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(rawData);

function beautify(caption, subject, chapter) {
    if (!caption) return 'Untitled Module';
    let text = caption.trim();

    // 1. Identification
    let index = null;
    let title = text;

    // Matches P1, Part 1, Mole P1, etc.
    const pMatch = text.match(/(?:P|Part\s*|Part\s*)(\d+)/i);
    // Matches 01, 1, etc. at start
    const startNumMatch = text.match(/^(\d+)[\s.]+/);

    if (pMatch) {
        index = `P${pMatch[1]}`;
        // Remove everything up to the index indicator
        title = text.slice(pMatch.index + pMatch[0].length).trim();
    } else if (startNumMatch) {
        index = startNumMatch[1].padStart(2, '0');
        title = text.replace(startNumMatch[0], '').trim();
    }

    // 2. Formatting
    const topics = [subject, chapter, 'Mole', 'ATOM', 'Physics', 'Chemistry', 'Mathematics', 'General'];
    topics.forEach(t => {
        if (!t) return;
        // Remove topic prefix if present
        title = title.replace(new RegExp(`^${t}\\s*`, 'i'), '');
    });

    // 3. Cleanup Detail Bloat
    let clean = title
        .split('  ')[0]           // Break at double spaces
        .split(' - ')[0]          // Break at dashes
        .split(' : ')[0]          // Break at colons
        .replace(/^[_\s-:|]+/, '') // Leading junk
        .replace(/\[.*?\]/g, '')   // Bracketed text
        .trim();

    // 4. Word Limit
    const words = clean.split(/\s+/);
    if (words.length > 5) {
        clean = words.slice(0, 5).join(' ');
    }

    if (!clean || clean.length < 2) clean = "Detailed Lesson";

    return index ? `${index} | ${clean}` : clean;
}

// Map videos
data.videos = data.videos.map(video => {
    return {
        ...video,
        lesson: beautify(video.lesson, video.subject, video.chapter)
    };
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully renamed ${data.videos.length} videos to Cloud format.`);
