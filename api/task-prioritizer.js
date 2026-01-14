/**
 * Intelligent Task Prioritization API
 * 
 * Features:
 * - Smart task prioritization based on multiple factors
 * - Deadline awareness
 * - Task complexity analysis
 * - Priority scoring algorithm
 */

import { getDbPool, initDatabase } from './db.js';

// =============================================================================
// Configuration
// =============================================================================

const PRIORITY_WEIGHTS = {
    age: 0.3,        // Older tasks get higher priority
    complexity: 0.2,  // More complex tasks get higher priority
    deadline: 0.3,    // Tasks with deadlines get higher priority
    frequency: 0.2    // Frequently completed tasks get higher priority
};

const COMPLEXITY_PATTERNS = {
    high: ['implement', 'design', 'architecture', 'system', 'integrate', 'optimize'],
    medium: ['update', 'fix', 'improve', 'refactor', 'test'],
    low: ['review', 'document', 'cleanup', 'organize']
};

// =============================================================================
// Helper Functions
// =============================================================================

function calculateTaskComplexity(text) {
    const lowerText = text.toLowerCase();

    for (const word of COMPLEXITY_PATTERNS.high) {
        if (lowerText.includes(word)) return 'high';
    }

    for (const word of COMPLEXITY_PATTERNS.medium) {
        if (lowerText.includes(word)) return 'medium';
    }

    return 'low';
}

function calculateTaskAge(created_at) {
    const created = new Date(created_at);
    const now = new Date();
    const daysSinceCreation = (now - created) / (1000 * 60 * 60 * 24);
    return daysSinceCreation;
}

function calculatePriorityScore(task, completedTasks) {
    let score = 0;

    // Age score (0-100)
    const age = calculateTaskAge(task.created_at);
    const ageScore = Math.min(age * 10, 100);
    score += ageScore * PRIORITY_WEIGHTS.age;

    // Complexity score (0-100)
    const complexity = calculateTaskComplexity(task.text);
    const complexityScore = complexity === 'high' ? 100 : complexity === 'medium' ? 60 : 30;
    score += complexityScore * PRIORITY_WEIGHTS.complexity;

    // Deadline score (0-100) - if task has deadline in text
    const deadlineMatch = task.text.match(/\b(due|deadline|by|before)\s+(\d+)\s*(days?|hours?|weeks?)?\b/i);
    if (deadlineMatch) {
        const amount = parseInt(deadlineMatch[2]);
        const unit = deadlineMatch[3]?.toLowerCase() || 'days';
        const timeUntilDeadline = unit.startsWith('day') ? amount : 
                                  unit.startsWith('hour') ? amount / 24 : 
                                  unit.startsWith('week') ? amount * 7 : amount;

        const deadlineScore = Math.min(100 / (timeUntilDeadline + 1), 100);
        score += deadlineScore * PRIORITY_WEIGHTS.deadline;
    }

    // Frequency score (0-100) - based on similar completed tasks
    const similarCompleted = completedTasks.filter(t => {
        const taskWords = task.text.toLowerCase().split(/\s+/);
        const tWords = t.text.toLowerCase().split(/\s+/);
        const commonWords = taskWords.filter(w => tWords.includes(w));
        return commonWords.length >= 2;
    });

    const frequencyScore = Math.min(similarCompleted.length * 20, 100);
    score += frequencyScore * PRIORITY_WEIGHTS.frequency;

    return Math.round(score);
}

function categorizeTasks(tasks, completedTasks) {
    const categorized = {
        urgent: [],
        high: [],
        medium: [],
        low: []
    };

    tasks.forEach(task => {
        if (task.completed) return;

        const priorityScore = calculatePriorityScore(task, completedTasks);

        if (priorityScore >= 80) {
            categorized.urgent.push({ ...task, priorityScore });
        } else if (priorityScore >= 60) {
            categorized.high.push({ ...task, priorityScore });
        } else if (priorityScore >= 40) {
            categorized.medium.push({ ...task, priorityScore });
        } else {
            categorized.low.push({ ...task, priorityScore });
        }
    });

    // Sort each category by priority score
    Object.keys(categorized).forEach(category => {
        categorized[category].sort((a, b) => b.priorityScore - a.priorityScore);
    });

    return categorized;
}

function generateTaskRecommendations(categorizedTasks) {
    const recommendations = [];

    // Urgent tasks
    if (categorizedTasks.urgent.length > 0) {
        recommendations.push({
            type: 'urgent',
            message: `You have ${categorizedTasks.urgent.length} urgent task${categorizedTasks.urgent.length > 1 ? 's' : ''} that need immediate attention.`,
            count: categorizedTasks.urgent.length,
            priority: 'high'
        });
    }

    // High priority tasks
    if (categorizedTasks.high.length > 3) {
        recommendations.push({
            type: 'high_priority',
            message: `Consider breaking down your ${categorizedTasks.high.length} high-priority tasks into smaller, manageable chunks.`,
            count: categorizedTasks.high.length,
            priority: 'medium'
        });
    }

    // Task distribution
    const totalPending = categorizedTasks.urgent.length + 
                         categorizedTasks.high.length + 
                         categorizedTasks.medium.length + 
                         categorizedTasks.low.length;

    if (totalPending > 15) {
        recommendations.push({
            type: 'overload',
            message: 'You have many pending tasks. Focus on completing urgent and high-priority tasks first.',
            count: totalPending,
            priority: 'high'
        });
    }

    // Low priority tasks
    if (categorizedTasks.low.length > 5) {
        recommendations.push({
            type: 'low_priority',
            message: `Consider delegating or postponing ${categorizedTasks.low.length} low-priority tasks.`,
            count: categorizedTasks.low.length,
            priority: 'low'
        });
    }

    return recommendations;
}

// =============================================================================
// Main Handler
// =============================================================================

export default async function handler(req, res) {
    try {
        await initDatabase();
        const db = await getDbPool();

        if (req.method === 'GET') {
            // Fetch all todos
            const [todos] = await db.execute(
                'SELECT id, text, completed, created_at FROM todos ORDER BY created_at DESC'
            );

            // Separate completed and pending tasks
            const completedTasks = todos.filter(t => t.completed);
            const pendingTasks = todos.filter(t => !t.completed);

            // Categorize tasks
            const categorizedTasks = categorizeTasks(pendingTasks, completedTasks);

            // Generate recommendations
            const recommendations = generateTaskRecommendations(categorizedTasks);

            // Calculate overall task statistics
            const stats = {
                total: todos.length,
                completed: completedTasks.length,
                pending: pendingTasks.length,
                completionRate: todos.length > 0 
                    ? Math.round((completedTasks.length / todos.length) * 100) 
                    : 0
            };

            return res.status(200).json({
                categorized: categorizedTasks,
                recommendations,
                stats,
                generatedAt: new Date().toISOString()
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('[Task Prioritizer API] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to prioritize tasks',
            message: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
    }
}
