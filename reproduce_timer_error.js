
const { getBuildingConfig } = require('./src/utils/pomodoroConfig');
// Mocking BuildingIcons since they are React components and we are running in node
const mockIcons = {
    TentIcon: 'TentIcon', HouseIcon: 'HouseIcon', ApartmentIcon: 'ApartmentIcon',
    SkyscraperIcon: 'SkyscraperIcon', BurjKhalifaIcon: 'BurjKhalifaIcon',
    TentRuinIcon: 'TentRuinIcon', HouseRuinIcon: 'HouseRuinIcon',
    ApartmentRuinIcon: 'ApartmentRuinIcon', SkyscraperRuinIcon: 'SkyscraperRuinIcon',
    BurjKhalifaRuinIcon: 'BurjKhalifaRuinIcon'
};

// We need to intercept the require to BuildingIcons
const originalRequire = require;
require = (modulePath) => {
    if (modulePath.includes('BuildingIcons')) {
        return mockIcons;
    }
    return originalRequire(modulePath);
};


// Test cases
const testCases = [0, 1, 25, 30, 31, 59, 60, 61, 90, 120, 121, 999, NaN, null, undefined];

console.log('Testing getBuildingConfig...');

testCases.forEach(mins => {
    try {
        const config = getBuildingConfig(mins);
        console.log(`Input: ${mins}, Result ID: ${config?.id}, Label: ${config?.label}`);
    } catch (error) {
        console.error(`ERROR for input ${mins}:`, error);
    }
});

console.log('Done.');
