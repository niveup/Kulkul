
import { describe, it, expect, vi } from 'vitest';
import { getBuildingConfig } from './pomodoroConfig';

// Mock BuildingIcons
vi.mock('../components/tools/BuildingIcons', () => ({
    TentIcon: () => null, HouseIcon: () => null, ApartmentIcon: () => null,
    SkyscraperIcon: () => null, BurjKhalifaIcon: () => null,
    TentRuinIcon: () => null, HouseRuinIcon: () => null,
    ApartmentRuinIcon: () => null, SkyscraperRuinIcon: () => null,
    BurjKhalifaRuinIcon: () => null
}));

describe('getBuildingConfig Reproduction', () => {
    const testCases = [0, 1, 25, 30, 31, 59, 60, 61, 90, 120, 121, 999];

    testCases.forEach(mins => {
        it(`should return valid config for ${mins} minutes`, () => {
            const config = getBuildingConfig(mins);
            console.log(`Input: ${mins}, Result ID: ${config?.id}, Label: ${config?.label}`);
            expect(config).toBeDefined();
            expect(config.id).toBeDefined();
            expect(config.icon).toBeDefined();
        });
    });

    it('should handle NaN gracefully (if possible)', () => {
        const config = getBuildingConfig(NaN);
        console.log(`Input: NaN, Result ID: ${config?.id}, Label: ${config?.label}`);
        expect(config).toBeDefined();
    });

    it('should handle undefined gracefully (if possible)', () => {
        const config = getBuildingConfig(undefined);
        console.log(`Input: undefined, Result ID: ${config?.id}, Label: ${config?.label}`);
        expect(config).toBeDefined();
    });
});
