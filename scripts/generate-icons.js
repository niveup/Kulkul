// Generate simple icons for the Chrome extension
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple PNG with camera icon (minimal binary)
// These are base64-encoded minimal PNG icons with a camera symbol
const icons = {
    16: `iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADUSURBVDiNlZMxCsJAEEXfJoXgDbyAN/AK3sBbeAMbwQu4nddIYeEJbG0E7byBjWBhZSPYxCKwJJvNJrjwYZfZ+cx8hln4gwTYAN0A2QB74A6kktwF+MAK6Ek6lSB9SevA7QNMJGUtQN2IVNDMZsBY0tYDrCSNJJUBfGAM7IB+ENAGZpIuALJl28AB6Ei6/gD4wBBoSHoCnIFXSaMA2AcukvK/AHmXI+kApCRl/wGS3M/OxAAukq6ArKSbJwX4fmTvkQ0wkJT9BAC8gDXQl3T+F+ANeL01qNs9x/EAAAAASUVORK5CYII=`,
    48: `iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAIoSURBVGiB7ZoxaxRBFMd/7+3sXYwgNhZaiI2FYJFGbMTCzkaw8BO4+AEi2NjYiI2fwNLCRrARELERC0EbC0E7IYWNhVhYiIV2u7M2l7vdnZm9nV22yR9m2N15/3nzZmZnlmJBbgJvgXXgE7AWs4O+pC0FGaWcbACmwB1gJ/AAeBCz37RxIFWgFHHc78DHwCKRpJtAdRQ57cIu4L4k3Qcu5CZxCfgMdGwFXbp8ATq2gi5dvg49WkcJ/Aa+29paSugi4DfQtbS1REYJLzNKOMZ04dspDk1J2pZ0UtJ34JOl7Y2kRzZ+1Ek8AA5L6tr6VJJ+Wdo+StqT5H8BeAEctPGrIO1LWpV0QNJrS9uSpE2b35gT+CXppI1fBelQUl3SI0nbknYkXZTUtPWtJP2wtL2V9NzGbzy4IumApK6LYD0oSJuSqpKeSvpoaduTdMvGb8wJfJZ0wsavgrQlKZL0TNJnS9uupDs2vmNOYE3ScRu/CtKmpKKkVUnrNr7fpNCWBNwFHto4joNhAZiW4DZQsbQdl/QW+BJTQFC4BRyzAP8GGjZ+I0l3bPzGk/gi6aqNXwVpQ1JR0gtJXyxtByRd/wtgfCWNHwA=`,
    128: `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`
};

const iconsDir = path.join(__dirname, 'chrome-extension', 'icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Write icons
Object.entries(icons).forEach(([size, base64]) => {
    const buffer = Buffer.from(base64, 'base64');
    const filePath = path.join(iconsDir, `icon${size}.png`);
    fs.writeFileSync(filePath, buffer);
    console.log(`Created: ${filePath}`);
});

console.log('Icons generated successfully!');
