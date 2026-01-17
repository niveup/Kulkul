const fs = require('fs');
const path = require('path');
const pdfImgConvert = require('pdf-img-convert');
const Jimp = require('jimp');
const crypto = require('crypto');

const PDF_PATH = 'd:\\formula ap\\test pdf\\QFT 5.pdf';
const OUTPUT_DIR = 'd:\\formula ap\\personal-dashboard\\public\\questions';
const JSON_PATH = 'd:\\formula ap\\personal-dashboard\\src\\data\\examQuestions.json';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function processPdf() {
    console.log('Converting PDF to images...');

    try {
        // Convert PDF to images (returns array of Uint8Arrays)
        // scale: 2.0 for better quality
        const pdfArray = await pdfImgConvert.convert(PDF_PATH, { scale: 2.0 });

        console.log(`Converted ${pdfArray.length} pages. Processing layout...`);

        const questionsData = [];
        let questionCounter = 1;

        for (let i = 0; i < pdfArray.length; i++) {
            console.log(`Processing page ${i + 1}...`);
            const imageBuffer = pdfArray[i];

            // Load into Jimp
            const image = await Jimp.read(imageBuffer);

            // Find content blocks
            const blocks = findContentBlocks(image);

            for (const block of blocks) {
                // Crop
                const cropHeight = block.end - block.start;
                // Clone image to crop
                const cropped = image.clone().crop(0, block.start, image.bitmap.width, cropHeight);

                // Save
                const filename = `q${questionCounter}_${crypto.randomBytes(4).toString('hex')}.png`;
                const filepath = path.join(OUTPUT_DIR, filename);

                await cropped.writeAsync(filepath);

                // Assign Subject (Simple heuristic)
                let subject = 'Physics';
                if (questionCounter > 30) subject = 'Chemistry';
                if (questionCounter > 60) subject = 'Math';

                questionsData.push({
                    id: questionCounter,
                    image: `/questions/${filename}`,
                    subject: subject,
                    type: 'MCQ',
                    options: ['A', 'B', 'C', 'D']
                });

                questionCounter++;
            }
        }

        // Save JSON
        const examData = {
            title: 'QFT 5 Exam',
            questions: questionsData
        };

        // Ensure dir for JSON
        const jsonDir = path.dirname(JSON_PATH);
        if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir, { recursive: true });

        fs.writeFileSync(JSON_PATH, JSON.stringify(examData, null, 2));

        console.log(`Done! Extracted ${questionsData.length} questions.`);

    } catch (err) {
        console.error('Error processing PDF:', err);
    }
}

function findContentBlocks(image) {
    const height = image.bitmap.height;
    const width = image.bitmap.width;
    const blocks = [];

    // Config
    const whiteThreshold = 240; // Pixel value > 240 is "white"
    const emptyLineThreshold = 0.01; // < 1% of pixels are dark = empty line
    const minBlockHeight = 50;
    const minGapHeight = 40; // Gaps smaller than this don't split blocks

    // 1. Build line map
    const isLineEmpty = [];

    for (let y = 0; y < height; y += 2) { // Scan every 2nd line
        let nonWhitePixels = 0;
        for (let x = 0; x < width; x += 4) { // Scan every 4th pixel
            const idx = image.getPixelIndex(x, y);
            const r = image.bitmap.data[idx];
            const g = image.bitmap.data[idx + 1];
            const b = image.bitmap.data[idx + 2];

            // Grayscale
            const gray = (r + g + b) / 3;

            if (gray < whiteThreshold) {
                nonWhitePixels++;
            }
        }

        const contentRatio = nonWhitePixels / (width / 4);
        isLineEmpty.push(contentRatio < emptyLineThreshold);
    }

    // Helper to access line map
    const isEmpty = (y) => {
        const idx = Math.floor(y / 2);
        if (idx < isLineEmpty.length) return isLineEmpty[idx];
        return true;
    };

    // 2. Find blocks
    let inBlock = false;
    let startY = 0;
    let currentGap = 0;

    // Skip header (first 100px)
    const headerSkip = 100;

    for (let y = headerSkip; y < height; y++) {
        if (!inBlock) {
            if (!isEmpty(y)) {
                inBlock = true;
                startY = y;
                currentGap = 0;
            }
        } else {
            if (isEmpty(y)) {
                currentGap++;
                if (currentGap > minGapHeight) {
                    // Block ended
                    const endY = y - currentGap;
                    if (endY - startY > minBlockHeight) {
                        blocks.push({ start: Math.max(0, startY - 10), end: Math.min(height, endY + 10) });
                    }
                    inBlock = false;
                    currentGap = 0;
                }
            } else {
                currentGap = 0;
            }
        }
    }

    // Last block
    if (inBlock && (height - startY > minBlockHeight)) {
        blocks.push({ start: startY, end: height });
    }

    return blocks;
}

processPdf();
