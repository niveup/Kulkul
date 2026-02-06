const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'videos.html');
const jsonPath = path.join(__dirname, 'public', 'videos-data.json');

try {
    // 1. Read files
    console.log('Reading files...');
    let html = fs.readFileSync(htmlPath, 'utf8');
    const data = fs.readFileSync(jsonPath, 'utf8');

    // 2. Validate JSON to ensure it's not corrupt
    const parsedData = JSON.parse(data);
    console.log(`Loaded ${parsedData.totalVideos} videos from JSON.`);

    // 3. Find the injection point
    // We look for "const VIDEO_DATA = { ... };" OR the previous truncated version
    // Regex strategy: match "const VIDEO_DATA =" until the next "function VideoApp" or enough context
    // Actually, simpler: We replaced it earlier with:
    // const VIDEO_DATA = {
    // ...
    // };
    // function VideoApp...

    // Let's replace the whole variable definition block.
    // We'll search for the start "const VIDEO_DATA =" and find the next "function VideoApp"

    const startMarker = 'const VIDEO_DATA =';
    const endMarker = 'function VideoApp() {';

    const startIndex = html.indexOf(startMarker);
    const endIndex = html.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
        throw new Error('Could not find injection markers in videos.html');
    }

    console.log('Found injection point. Replacing content...');

    // 4. Construct new content
    // We add the timestamp to ensure the user knows it's fresh
    const newDataStr = `const VIDEO_DATA = ${data};\n\n            `;

    const newHtml = html.substring(0, startIndex) + newDataStr + html.substring(endIndex);

    // 5. Write back
    fs.writeFileSync(htmlPath, newHtml);
    console.log(`Successfully injected ${newHtml.length} bytes into videos.html`);
    console.log('You can now open the file!');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
