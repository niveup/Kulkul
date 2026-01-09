import {
    TentIcon, HouseIcon, ApartmentIcon, SkyscraperIcon, BurjKhalifaIcon,
    TentRuinIcon, HouseRuinIcon, ApartmentRuinIcon, SkyscraperRuinIcon, BurjKhalifaRuinIcon
} from '../components/tools/BuildingIcons';

export const getBuildingConfig = (minutes) => {
    if (minutes <= 30) return { id: 'tent', label: 'Camping Tent', icon: TentIcon, ruinIcon: TentRuinIcon, color: 'text-orange-500', bg: 'bg-orange-500', sky: 'from-orange-50' };
    if (minutes <= 60) return { id: 'house', label: 'Cozy House', icon: HouseIcon, ruinIcon: HouseRuinIcon, color: 'text-emerald-500', bg: 'bg-emerald-500', sky: 'from-emerald-50' };
    if (minutes <= 90) return { id: 'apartment', label: 'Modern Apt', icon: ApartmentIcon, ruinIcon: ApartmentRuinIcon, color: 'text-blue-500', bg: 'bg-blue-500', sky: 'from-blue-50' };
    if (minutes <= 120) return { id: 'skyscraper', label: 'Office Tower', icon: SkyscraperIcon, ruinIcon: SkyscraperRuinIcon, color: 'text-purple-500', bg: 'bg-purple-500', sky: 'from-purple-50' };
    return { id: 'landmark', label: 'Skyscraper', icon: BurjKhalifaIcon, ruinIcon: BurjKhalifaRuinIcon, color: 'text-sky-500', bg: 'bg-sky-500', sky: 'from-sky-50' };
};
