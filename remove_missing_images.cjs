
const fs = require('fs');
const path = require('path');

const publicDir = String.raw`d:\formula ap\personal-dashboard\public`;
const files = [
    String.raw`d:\formula ap\personal-dashboard\src\data\formulas_11.json`,
    String.raw`d:\formula ap\personal-dashboard\src\data\formulas_12.json`
];

files.forEach(file => {
    console.log(`Processing ${file}...`);
    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        let removedCount = 0;

        const checkAndRemove = (obj) => {
            if (!obj.image) return;

            const img = obj.image;
            const cleanPath = img.startsWith('/') ? img.slice(1) : img;
            const fullPath = path.join(publicDir, cleanPath);

            if (!fs.existsSync(fullPath)) {
                // console.log(`Removing missing image: ${img}`);
                delete obj.image;
                if (obj.diagram_desc) {
                    delete obj.diagram_desc;
                }
                removedCount++;
            }
        };

        const traverse = (obj) => {
            if (!obj) return;
            if (Array.isArray(obj)) {
                obj.forEach(item => traverse(item));
            } else if (typeof obj === 'object') {
                checkAndRemove(obj);
                // Recursively check other properties
                Object.keys(obj).forEach(key => {
                    if (typeof obj[key] === 'object') {
                        traverse(obj[key]);
                    }
                });
            }
        };

        traverse(data);

        if (removedCount > 0) {
            fs.writeFileSync(file, JSON.stringify(data, null, 4), 'utf8');
            console.log(`Removed ${removedCount} missing images from ${path.basename(file)}.`);
        } else {
            console.log(`No missing images found in ${path.basename(file)}.`);
        }

    } catch (e) {
        console.error(`Error processing ${file}:`, e);
    }
});
