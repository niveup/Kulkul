/**
 * Slash Commands Configuration
 * 
 * Defines available slash commands for the AI Chat
 */

import {
    Lightbulb,
    Calculator,
    BookOpen,
    HelpCircle,
    FlaskConical,
    Atom,
    Zap,
    GraduationCap,
    ListChecks,
    FileQuestion
} from 'lucide-react';

export const SLASH_COMMANDS = [
    {
        id: 'solve',
        name: '/solve',
        description: 'Solve a math or physics problem step by step',
        icon: Calculator,
        prompt: 'Please solve this problem step by step, showing all work:\n\n',
        color: 'from-blue-500 to-indigo-500',
    },
    {
        id: 'explain',
        name: '/explain',
        description: 'Get a detailed explanation of a concept',
        icon: Lightbulb,
        prompt: 'Please explain this concept in simple terms with examples:\n\n',
        color: 'from-amber-500 to-orange-500',
    },
    {
        id: 'formula',
        name: '/formula',
        description: 'Get formulas related to a topic',
        icon: BookOpen,
        prompt: 'List all important formulas related to this topic with explanations:\n\n',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        id: 'quiz',
        name: '/quiz',
        description: 'Generate a quick quiz on a topic',
        icon: FileQuestion,
        prompt: 'Create a 5-question multiple choice quiz on this topic. After I answer, tell me which ones I got right:\n\n',
        color: 'from-violet-500 to-purple-500',
    },
    {
        id: 'hint',
        name: '/hint',
        description: 'Get a hint without the full solution',
        icon: HelpCircle,
        prompt: 'Give me a helpful hint to solve this problem, but do NOT give me the full solution. Just point me in the right direction:\n\n',
        color: 'from-cyan-500 to-blue-500',
    },
    {
        id: 'physics',
        name: '/physics',
        description: 'Solve a physics problem with diagrams',
        icon: Atom,
        prompt: 'Solve this physics problem. Draw diagrams if necessary and explain the physics concepts involved:\n\n',
        color: 'from-indigo-500 to-blue-600',
    },
    {
        id: 'chemistry',
        name: '/chemistry',
        description: 'Help with chemistry problems and reactions',
        icon: FlaskConical,
        prompt: 'Help me with this chemistry problem. Show reaction mechanisms or equations where applicable:\n\n',
        color: 'from-green-500 to-emerald-600',
    },
    {
        id: 'quick',
        name: '/quick',
        description: 'Get a quick, concise answer',
        icon: Zap,
        prompt: 'Give me a very brief, direct answer (1-2 sentences max):\n\n',
        color: 'from-yellow-500 to-amber-500',
    },
    {
        id: 'elaborate',
        name: '/elaborate',
        description: 'Get a comprehensive, detailed response',
        icon: GraduationCap,
        prompt: 'Give me a very detailed and comprehensive explanation covering all aspects:\n\n',
        color: 'from-rose-500 to-pink-500',
    },
    {
        id: 'practice',
        name: '/practice',
        description: 'Generate practice problems on a topic',
        icon: ListChecks,
        prompt: 'Generate 5 practice problems of increasing difficulty on this topic. Include JEE-style problems:\n\n',
        color: 'from-fuchsia-500 to-violet-500',
    },
];

/**
 * Find matching slash commands based on input
 * @param {string} input - Current input text
 * @returns {Array} Matching commands or empty array
 */
export const findMatchingCommands = (input) => {
    if (!input.startsWith('/')) return [];

    const query = input.toLowerCase();
    return SLASH_COMMANDS.filter(cmd =>
        cmd.name.toLowerCase().startsWith(query)
    );
};

/**
 * Check if input starts with a known command
 * @param {string} input - Current input text
 * @returns {Object|null} Matched command or null
 */
export const getActiveCommand = (input) => {
    if (!input.startsWith('/')) return null;

    const parts = input.split(' ');
    const cmdText = parts[0].toLowerCase();

    return SLASH_COMMANDS.find(cmd => cmd.name.toLowerCase() === cmdText) || null;
};

/**
 * Process input with slash command
 * @param {string} input - Raw input with slash command
 * @returns {string} Processed prompt to send to AI
 */
export const processSlashCommand = (input) => {
    const command = getActiveCommand(input);

    if (!command) return input;

    // Extract the user's actual query (everything after the command)
    const userQuery = input.slice(command.name.length).trim();

    // Combine command prompt with user query
    return command.prompt + userQuery;
};
