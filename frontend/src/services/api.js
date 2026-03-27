import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

// ── Auth ──
export const registerUser = (data) => axios.post(`${API_URL}/auth/register`, data);
export const loginUser    = (data) => axios.post(`${API_URL}/auth/login`, data);
export const getProfile   = ()     => axios.get(`${API_URL}/auth/profile`, authHeaders());

// ── Kuppi Classes ──
export const getKuppiClasses  = ()     => axios.get(`${API_URL}/kuppi-class`, authHeaders());
export const enrollKuppiClass = (id)   => axios.post(`${API_URL}/kuppi-class/${id}/enroll`, {}, authHeaders());
export const getMyEnrollments = ()     => axios.get(`${API_URL}/enrollments/my`, authHeaders());

// ── Resource Sharing ──
export const getResources    = ()     => axios.get(`${API_URL}/resources`, authHeaders());
export const createResource  = (data) => axios.post(`${API_URL}/resources`, data, authHeaders());
export const deleteResource  = (id)   => axios.delete(`${API_URL}/resources/${id}`, authHeaders());

// ── Study Groups: Profile ──
export const getMyStudyProfile = ()     => axios.get(`${API_URL}/study-groups/profile/me`, authHeaders());
export const saveStudyProfile  = (data) => axios.post(`${API_URL}/study-groups/profile`, data, authHeaders());

// ── Study Groups: Groups ──
export const getStudyGroups      = (params) => axios.get(`${API_URL}/study-groups`, { ...authHeaders(), params });
export const createStudyGroup    = (data)   => axios.post(`${API_URL}/study-groups`, data, authHeaders());
export const getStudyGroup       = (id)     => axios.get(`${API_URL}/study-groups/${id}`, authHeaders());
export const getMyGroup          = ()       => axios.get(`${API_URL}/study-groups/my`, authHeaders());
export const toggleGroupStatus   = (id)     => axios.patch(`${API_URL}/study-groups/${id}/status`, {}, authHeaders());
export const updateSkillsNeeded  = (id, data) => axios.patch(`${API_URL}/study-groups/${id}/skills-needed`, data, authHeaders());

// ── Study Groups: Requests ──
export const sendJoinRequest   = (id, data)           => axios.post(`${API_URL}/study-groups/${id}/request`, data, authHeaders());
export const sendGroupInvite   = (id, studentId, data) => axios.post(`${API_URL}/study-groups/${id}/invite/${studentId}`, data, authHeaders());
export const getMyStudyRequests = ()                   => axios.get(`${API_URL}/study-groups/requests/my`, authHeaders());
export const getGroupRequests  = (id)                 => axios.get(`${API_URL}/study-groups/${id}/requests`, authHeaders());
export const updateJoinRequest = (requestId, data)    => axios.patch(`${API_URL}/study-groups/requests/${requestId}`, data, authHeaders());

// ── Study Groups: AI Match ──
export const getStudySuggestions = () => axios.get(`${API_URL}/study-groups/match/suggestions`, authHeaders());

// ── Study Groups: Pool ──
export const getGrouplessPool = () => axios.get(`${API_URL}/study-groups/pool`, authHeaders());
