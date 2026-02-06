const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'videos.html');
const jsonPath = path.join(__dirname, 'public', 'videos-data.json');

try {
    console.log('Reading files...');
    let html = fs.readFileSync(htmlPath, 'utf8');
    const data = fs.readFileSync(jsonPath, 'utf8');

    // Verify JSON
    JSON.parse(data);

    const startMarker = 'const VIDEO_DATA =';
    // We look for the component definition which comes after the data
    const endMarker = 'function VideoApp';

    const startIndex = html.indexOf(startMarker);
    const endIndex = html.indexOf(endMarker, startIndex);

    if (startIndex === -1) {
        throw new Error(`Start marker "${startMarker}" not found`);
    }
    if (endIndex === -1) {
        throw new Error(`End marker "${endMarker}" not found after start marker`);
    }

    console.log(`Replacing content between index ${startIndex} and ${endIndex}`);

    const newHtml = html.slice(0, startIndex) +
        `const VIDEO_DATA = ${data};\n\n        ` +
        html.slice(endIndex);

    fs.writeFileSync(htmlPath, newHtml);
    console.log('Injection successful!');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
