import axios from 'axios';

// All requests now go through API Gateway on port 5000!
const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

// Auth
export const registerUser = (data) => axios.post(`${API_URL}/auth/register`, data);
export const loginUser = (data) => axios.post(`${API_URL}/auth/login`, data);
export const getProfile = () => axios.get(`${API_URL}/auth/profile`, authHeaders());

// Kuppi Classes
export const getKuppiFilterOptions = () => axios.get(`${API_URL}/kuppi-class/filters`, authHeaders());
export const getKuppiClasses = (params = {}) => axios.get(`${API_URL}/kuppi-class`, { ...authHeaders(), params });
export const enrollKuppiClass = (id) => axios.post(`${API_URL}/kuppi-class/${id}/enroll`, {}, authHeaders());
export const getMyEnrollments = () => axios.get(`${API_URL}/enrollments/my`, authHeaders());

// Study Group Finder
export const getStudyGroups = () => axios.get(`${API_URL}/study-groups`, authHeaders());
export const joinStudyGroup = (id) => axios.post(`${API_URL}/study-groups/${id}/join`, {}, authHeaders());
export const getMyProgress = () => axios.get(`${API_URL}/study-groups/progress/me`, authHeaders());

// Resource Sharing
export const getResources = () => axios.get(`${API_URL}/resources`, authHeaders());
export const createResource = (data) => axios.post(`${API_URL}/resources`, data, authHeaders());
export const deleteResource = (id) => axios.delete(`${API_URL}/resources/${id}`, authHeaders());