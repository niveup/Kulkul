
// Chapter Code Mapping
// Maps full chapter names to short codes for compact display
export const CHAPTER_CODES = {
    // Physics
    'Electromagnetism': 'EM',
    'Mechanics': 'MECH',
    'Optics': 'OPT',
    'Thermodynamics': 'THM',
    'Quantum Mechanics': 'QM',
    'Waves': 'WAV',
    'Modern Physics': 'MP',
    'Kinematics': 'KIN',
    'Dynamics': 'DYN',
    'Rotational Motion': 'ROT',
    'Gravitation': 'GRAV',
    'Fluid Mechanics': 'FLUID',

    // Chemistry
    'Organic Chemistry': 'OG',
    'Inorganic Chemistry': 'INOG',
    'Physical Chemistry': 'PHY chem',
    'Atomic Structure': 'ATOM',
    'Chemical Bonding': 'BOND',
    'Periodic Table': 'PT',
    'Chemical Reactions': 'RXN',

    // Mathematics
    'Calculus': 'CALCu',
    'Algebra': 'ALG',
    'Geometry': 'GEO',
    'Trigonometry': 'TRIGO',
    'Statistics': 'STAT',
    'Probability': 'PROB',
    'Differential Equations': 'DE',
    'Linear Algebra': 'LA',
    'Number Theory': 'NT',

    // Biology
    'Cell Biology': 'CELL',
    'Genetics': 'GEN',
    'Ecology': 'ECO',
    'Evolution': 'EVO',
    'Human Anatomy': 'ANAT',
    'Molecular Biology': 'MOL',

    // Computer Science
    'Data Structures': 'DS',
    'Algorithms': 'ALGO',
    'Programming': 'PROG',
    'Databases': 'DB',
    'Operating Systems': 'OS',
    'Networks': 'NET',
    'Machine Learning': 'ML',
    'Artificial Intelligence': 'AI',
    'Web Development': 'WEB',

    // Default for unknown chapters
    'default': 'CH'
};

// Function to get chapter code
export const getChapterCode = (chapterName) => {
    if (!chapterName) return 'CH';

    // Check for exact match
    if (CHAPTER_CODES[chapterName]) {
        return CHAPTER_CODES[chapterName];
    }

    // Check for partial match (case insensitive)
    const lowerChapterName = chapterName.toLowerCase();
    for (const [fullName, code] of Object.entries(CHAPTER_CODES)) {
        if (fullName.toLowerCase().includes(lowerChapterName) ||
            lowerChapterName.includes(fullName.toLowerCase())) {
            return code;
        }
    }

    // If no match, generate a code from first letters
    const words = chapterName.split(' ');
    if (words.length === 1) {
        return chapterName.substring(0, 3).toUpperCase();
    }
    return words.map(word => word[0]).join('').substring(0, 4).toUpperCase();
};

// Function to get formatted chapter display
export const getFormattedChapter = (chapterName, chapterNumber = null) => {
    const code = getChapterCode(chapterName);
    if (chapterNumber) {
        return `${code} (Ch.${chapterNumber})`;
    }
    return code;
};
