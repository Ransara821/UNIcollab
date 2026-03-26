import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

// ─── Quiz APIs ────────────────────────────────────────────
export const getQuizzes = (year, semester) =>
  axios.get(`${API_URL}/quizzes`, { ...authHeaders(), params: { year, semester } });

export const getQuizDetails = (id) =>
  axios.get(`${API_URL}/quizzes/${id}`, authHeaders());

export const getQuizQuestions = (id) =>
  axios.get(`${API_URL}/quizzes/${id}/questions`, authHeaders());

export const submitQuiz = (id, payload) =>
  axios.post(`${API_URL}/quizzes/${id}/submit`, payload, authHeaders());

export const getQuizResult = (attemptId) =>
  axios.get(`${API_URL}/quizzes/result/${attemptId}`, authHeaders());

export const getQuizLeaderboard = (id) =>
  axios.get(`${API_URL}/quizzes/${id}/leaderboard`, authHeaders());

export const getGlobalLeaderboard = (year, semester) =>
  axios.get(`${API_URL}/quizzes/leaderboard`, {
    ...authHeaders(),
    params: { year, semester },
  });

// ─── Admin Quiz APIs ──────────────────────────────────────
export const createQuiz = (data) =>
  axios.post(`${API_URL}/quizzes`, data, authHeaders());

export const updateQuiz = (id, data) =>
  axios.put(`${API_URL}/quizzes/${id}`, data, authHeaders());

export const deleteQuiz = (id) =>
  axios.delete(`${API_URL}/quizzes/${id}`, authHeaders());

export const getAdminAllQuizzes = () =>
  axios.get(`${API_URL}/quizzes?adminView=true`, authHeaders());

export const getAdminAttempts = (id) =>
  axios.get(`${API_URL}/quizzes/admin/${id}/attempts`, authHeaders());
