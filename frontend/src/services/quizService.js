import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Subjects ──────────────────────────────────────
export const getSubjects    = (params) => api.get('/subjects', { params });
export const createSubject  = (data)   => api.post('/subjects', data);
export const updateSubject  = (id, d)  => api.put(`/subjects/${id}`, d);
export const deleteSubject  = (id)     => api.delete(`/subjects/${id}`);

// ── Quizzes ──────────────────────────────────────
export const getQuizzes        = (params) => api.get('/quizzes', { params });
export const getQuizById       = (id)     => api.get(`/quizzes/${id}`);
export const createQuiz        = (data)   => api.post('/quizzes', data);
export const updateQuiz        = (id, d)  => api.put(`/quizzes/${id}`, d);
export const deleteQuiz        = (id)     => api.delete(`/quizzes/${id}`);
export const importQuestionsFromApi = (id, data) => api.post(`/quizzes/${id}/import`, data);

// ── Questions ─────────────────────────────────────
export const getQuestions      = (quizId) => api.get(`/quizzes/${quizId}/questions`);
export const addQuestion       = (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data);
export const updateQuestion    = (id, data) => api.put(`/questions/${id}`, data);
export const deleteQuestion    = (id)       => api.delete(`/questions/${id}`);

// ── Attempts ──────────────────────────────────────
export const startAttempt      = (data) => api.post(`/attempts/start`, data);
export const submitAttempt     = (attemptId, answers) => api.post(`/attempts/${attemptId}/submit`, { answers });
export const getMyAttempts     = ()       => api.get('/attempts/my');
export const getAllAttempts    = ()       => api.get('/attempts/all');

// ── Leaderboard ───────────────────────────────────
export const getLeaderboard    = (params) => api.get('/leaderboard', { params });

export default api;
