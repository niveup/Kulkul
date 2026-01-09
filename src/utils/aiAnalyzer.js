// AI Analyzer for Exam Results using Cerebras
export async function analyzeExamWithAI(resultData, questions, answers, answerKey) {
    try {
        // Prepare question-by-question breakdown
        const questionAnalysis = questions.map((q, idx) => {
            const userAns = answers[idx];
            const correctAns = answerKey?.[q.id || (idx + 1).toString()];
            const qResult = resultData.questionResults?.[idx];

            return {
                questionNum: idx + 1,
                subject: q.subject,
                question: q.question?.substring(0, 200), // Truncate long questions
                userAnswer: userAns || 'Skipped',
                correctAnswer: correctAns,
                status: qResult?.status || 'unattempted',
                timeSpent: qResult?.timeSpent || 0
            };
        });

        // Create comprehensive prompt
        const prompt = `You are an expert JEE exam coach. Analyze this student's performance and provide detailed feedback.

OVERALL PERFORMANCE:
- Total Score: ${resultData.totalScore}/${resultData.maxScore}
- Accuracy: ${resultData.accuracy}%
- Correct: ${resultData.correct}, Wrong: ${resultData.wrong}, Unattempted: ${resultData.unattempted}

SUBJECT-WISE PERFORMANCE:
${Object.entries(resultData.subjectStats || {}).map(([subject, stats]) =>
            `${subject}: ${stats.correct}/${stats.total} (${((stats.correct / stats.total) * 100).toFixed(1)}%)`
        ).join('\n')}

QUESTION-BY-QUESTION ANALYSIS:
${questionAnalysis.slice(0, 75).map(q => // Limit to 75 questions for token limit
            `Q${q.questionNum} [${q.subject}]: ${q.status} (${q.timeSpent}s)`
        ).join('\n')}

Please provide a comprehensive analysis in the following JSON format:
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "subjectInsights": {
    "Physics": "detailed feedback",
    "Chemistry": "detailed feedback",
    "Mathematics": "detailed feedback"
  },
  "timeManagement": "overall time management feedback",
  "attemptStrategy": "strategy suggestions for future attempts",
  "confidenceLevels": {
    "Physics": 75,
    "Chemistry": 60,
    "Mathematics": 85
  },
  "priorityAreas": [
    {"topic": "Organic Chemistry", "priority": "High", "score": 30},
    {"topic": "Mechanics", "priority": "Medium", "score": 60},
    {"topic": "Calculus", "priority": "Low", "score": 85}
  ],
  "recommendations": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]
}

IMPORTANT: Respond ONLY with valid JSON, no additional text.`;

        // Call Cerebras AI
        const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_CEREBRAS_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert JEE exam coach providing detailed performance analysis. Always respond with valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`Cerebras API error: ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Parse JSON response
        const analysis = JSON.parse(aiResponse);

        return {
            success: true,
            analysis
        };

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
