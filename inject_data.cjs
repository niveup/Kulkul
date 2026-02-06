const fs = require('fs');
const path = require('path');

// Use relative paths since we are running from the same dir
const htmlPath = path.resolve('videos.html');
const jsonPath = path.resolve('public/videos-data.json');

try {
    console.log('Reading files...');
    let html = fs.readFileSync(htmlPath, 'utf8');
    const data = fs.readFileSync(jsonPath, 'utf8');

    // Verify JSON validity
    const json = JSON.parse(data);
    console.log(`JSON loaded. Total videos: ${json.totalVideos}`);

    const startMarker = 'const VIDEO_DATA =';
    const endMarker = 'function VideoApp';

    const startIndex = html.indexOf(startMarker);
    const endIndex = html.indexOf(endMarker, startIndex);

    if (startIndex === -1) throw new Error(`Start marker "${startMarker}" not found`);
    if (endIndex === -1) throw new Error(`End marker "${endMarker}" not found`);

    console.log(`Injecting data at index ${startIndex}...`);

    const newHtml = html.slice(0, startIndex) +
        `const VIDEO_DATA = ${data};\n\n        ` +
        html.slice(endIndex);

    fs.writeFileSync(htmlPath, newHtml);
    console.log('Injection successful!');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
