const axios = require('axios');

const QUIZAPI_URL = 'https://quizapi.io/api/v1/questions';

/**
 * Fetch questions from QuizAPI based on filters.
 * @param {Object} filters - Filtering criteria (category, difficulty, tags, limit)
 * @returns {Promise<Array>} - List of questions
 */
exports.fetchQuestions = async (filters) => {
  try {
    const { category, difficulty, tags, limit } = filters;
    const apiKey = process.env.QUIZAPI_KEY;

    if (!apiKey) {
      throw new Error('QuizAPI key is missing in backend environment');
    }

    const response = await axios.get(QUIZAPI_URL, {
      headers: {
        'X-Api-Key': apiKey,
      },
      params: {
        category: category || '',
        difficulty: difficulty || '',
        tags: tags ? tags.join(',') : '',
        limit: limit || 10,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`❌ QuizAPI Error: ${error.message}`);
    if (error.response && error.response.status === 401) {
      throw new Error('Invalid QuizAPI key');
    }
    if (error.response && error.response.status === 429) {
      throw new Error('QuizAPI rate limit exceeded');
    }
    throw new Error('Failed to fetch questions from QuizAPI');
  }
};
