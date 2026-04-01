const QUIZAPI_BASE_URL = 'https://quizapi.io/api/v1';

/**
 * Fetch questions from QuizAPI
 * @param {Object} options - filters (category, difficulty, limit, tags)
 */
async function fetchQuizApiQuestions({ category, difficulty, limit = 10, tags }) {
  const apiKey = process.env.QUIZAPI_KEY;
  if (!apiKey) {
    throw new Error('QuizAPI key is missing in environment variables');
  }

  const params = new URLSearchParams();
  params.append('limit', limit);
  if (category) params.append('category', category);
  if (difficulty) params.append('difficulty', difficulty);
  if (tags) params.append('tags', tags);

  try {
    const response = await fetch(`${QUIZAPI_BASE_URL}/questions?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to fetch from QuizAPI (Status: ${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error('QuizAPI Service Error:', error.message);
    throw error;
  }
}

/**
 * Transforms QuizAPI response format to our local Mongoose format
 * @param {Array} apiQuestions - raw questions from QuizAPI
 * @param {String} quizId - the ID of the local quiz to attach to
 */
function transformQuizApiToLocal(apiQuestions, quizId) {
  return apiQuestions.map(q => {
    const options = [];
    let correctAnswer = null;

    for (const [key, value] of Object.entries(q.answers)) {
      if (value !== null) {
        const shortKey = key.replace('answer_', '');
        options.push({ key: shortKey, text: value });

        const correctKey = key + '_correct';
        if (q.correct_answers && q.correct_answers[correctKey] === 'true') {
          correctAnswer = shortKey;
        }
      }
    }

    if (!correctAnswer && q.correct_answer) {
      correctAnswer = q.correct_answer.replace('answer_', '');
    }

    return {
      quizId,
      questionText: q.question,
      options: options,
      correctAnswer: correctAnswer || 'a',
      explanation: q.explanation || null,
      marks: 1, 
      source: 'quizapi'
    };
  });
}

module.exports = {
  fetchQuizApiQuestions,
  transformQuizApiToLocal
};
