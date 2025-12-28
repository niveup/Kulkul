
const fs = require('fs');
const path = require('path');

const publicDir = String.raw`d:\formula ap\personal-dashboard\public`;
const files = [
    String.raw`d:\formula ap\personal-dashboard\src\data\formulas_11.json`,
    String.raw`d:\formula ap\personal-dashboard\src\data\formulas_12.json`
];

files.forEach(file => {
    console.log(`Checking ${file}...`);
    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        let missingCount = 0;

        const checkImage = (img, loc) => {
            // Image paths in JSON usually start with "formula/diagrams/..."
            // We need to resolve this against the public dir.
            // Sometimes they might have leading slashes.
            const cleanPath = img.startsWith('/') ? img.slice(1) : img;
            const fullPath = path.join(publicDir, cleanPath);

            if (!fs.existsSync(fullPath)) {
                console.log(`MISSING: ${img} (in ${loc})`);
                missingCount++;
            }
        };

        const traverse = (obj, location) => {
            if (!obj) return;
            if (Array.isArray(obj)) {
                obj.forEach((item, i) => traverse(item, `${location}[${i}]`));
            } else if (typeof obj === 'object') {
                if (obj.image) {
                    checkImage(obj.image, location);
                }
                // Recursively check other properties just in case, though schema is flat-ish
                Object.keys(obj).forEach(key => {
                    if (typeof obj[key] === 'object') {
                        traverse(obj[key], `${location}.${key}`);
                    }
                });
            }
        };

        traverse(data, 'root');
        console.log(`Total missing in ${path.basename(file)}: ${missingCount}\n`);

    } catch (e) {
        console.error(`Error reading ${file}:`, e);
    }
});
