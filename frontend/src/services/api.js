import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

// ── Auth ──
export const registerUser = (data) => axios.post(`${API_URL}/auth/register`, data);
export const loginUser = (data) => axios.post(`${API_URL}/auth/login`, data);
export const getProfile = () => axios.get(`${API_URL}/auth/profile`, authHeaders());
export const getAllUsers = () => axios.get(`${API_URL}/auth/users`, authHeaders());
export const updateUserStatus = (id, status) => axios.put(`${API_URL}/auth/users/${id}/status`, { status }, authHeaders());
export const deleteUser = (id) => axios.delete(`${API_URL}/auth/users/${id}`, authHeaders());

// Kuppi Classes
export const getKuppiFilterOptions  = () => axios.get(`${API_URL}/kuppi-class/filters`, authHeaders());
export const getKuppiClasses        = (params = {}) => axios.get(`${API_URL}/kuppi-class`, { ...authHeaders(), params });
export const createKuppiClass       = (data) => axios.post(`${API_URL}/kuppi-class`, data, authHeaders());
export const enrollKuppiClass       = (id) => axios.post(`${API_URL}/kuppi-class/${id}/enroll`, {}, authHeaders());
export const getMyEnrollments       = () => axios.get(`${API_URL}/enrollments/my`, authHeaders());
export const getMyRecognitionStatus = () => axios.get(`${API_URL}/kuppi-class/my-status`, authHeaders());
export const rateKuppiClass         = (id, rating) => axios.post(`${API_URL}/kuppi-class/${id}/rate`, { rating }, authHeaders());
export const getMySessions                = () => axios.get(`${API_URL}/kuppi-class/my-sessions`, authHeaders());
export const updateKuppiClass             = (id, data) => axios.put(`${API_URL}/kuppi-class/${id}`, data, authHeaders());
export const deleteKuppiClass             = (id) => axios.delete(`${API_URL}/kuppi-class/${id}`, authHeaders());
export const applyForRecognition          = (data) => axios.post(`${API_URL}/kuppi-class/recognition/apply`, data, authHeaders());
export const getAllRecognitionApplications = () => axios.get(`${API_URL}/kuppi-class/recognition/all`);
export const getMyRecognitionApplication  = () => axios.get(`${API_URL}/kuppi-class/recognition/mine`, authHeaders());
export const updateRecognitionApplication = (data) => axios.put(`${API_URL}/kuppi-class/recognition/mine`, data, authHeaders());

// ── Resource Sharing ──
export const getResources   = ()     => axios.get(`${API_URL}/resources`, authHeaders());
export const createResource  = (data) => axios.post(`${API_URL}/resources`, data, authHeaders());
export const deleteResource  = (id)   => axios.delete(`${API_URL}/resources/${id}`, authHeaders());

// ── Study Groups: Profile ──
export const getMyStudyProfile = ()     => axios.get(`${API_URL}/study-groups/profile/me`, authHeaders());
export const saveStudyProfile  = (data) => axios.post(`${API_URL}/study-groups/profile`, data, authHeaders());
export const getMyProgress     = ()     => axios.get(`${API_URL}/study-groups/progress/me`, authHeaders()); // Added from main

// ── Study Groups: Groups ──
export const getStudyGroups      = (params) => axios.get(`${API_URL}/study-groups`, { ...authHeaders(), params });
export const createStudyGroup    = (data)   => axios.post(`${API_URL}/study-groups`, data, authHeaders());
export const getStudyGroup       = (id)     => axios.get(`${API_URL}/study-groups/${id}`, authHeaders());
export const getMyGroup          = ()       => axios.get(`${API_URL}/study-groups/my`, authHeaders());
export const joinStudyGroup      = (id)     => axios.post(`${API_URL}/study-groups/${id}/join`, {}, authHeaders()); // Added from main
export const updateStudyGroup    = (id, data) => axios.patch(`${API_URL}/study-groups/${id}`, data, authHeaders());
export const toggleGroupStatus   = (id)     => axios.patch(`${API_URL}/study-groups/${id}/status`, {}, authHeaders());
export const closeStudyGroup     = (id)     => axios.patch(`${API_URL}/study-groups/${id}/close`, {}, authHeaders());
export const deleteStudyGroup    = (id)     => axios.delete(`${API_URL}/study-groups/${id}`, authHeaders());
export const updateSkillsNeeded  = (id, data) => axios.patch(`${API_URL}/study-groups/${id}/skills-needed`, data, authHeaders());

// ── Study Groups: Requests ──
export const sendJoinRequest   = (id, data)           => axios.post(`${API_URL}/study-groups/${id}/request`, data, authHeaders());
export const sendGroupInvite   = (id, studentId, data) => axios.post(`${API_URL}/study-groups/${id}/invite/${studentId}`, data, authHeaders());
export const getMyStudyRequests = ()                   => axios.get(`${API_URL}/study-groups/requests/my`, authHeaders());
export const getGroupRequests  = (id)                  => axios.get(`${API_URL}/study-groups/${id}/requests`, authHeaders());
export const updateJoinRequest = (requestId, data)    => axios.patch(`${API_URL}/study-groups/requests/${requestId}`, data, authHeaders());

// ── Study Groups: AI Match ──
export const getStudySuggestions = () => axios.get(`${API_URL}/study-groups/match/suggestions`, authHeaders());

// ── Study Groups: Pool ──
export const getGrouplessPool = () => axios.get(`${API_URL}/study-groups/pool`, authHeaders());

// ── Study Groups: Announcements ──
export const getAnnouncements    = (groupId)       => axios.get(`${API_URL}/study-groups/${groupId}/announcements`, authHeaders());
export const createAnnouncement  = (groupId, data) => axios.post(`${API_URL}/study-groups/${groupId}/announcements`, data, authHeaders());
export const deleteAnnouncement  = (groupId, annId) => axios.delete(`${API_URL}/study-groups/${groupId}/announcements/${annId}`, authHeaders());

// ── Study Groups: Ratings ──
export const submitRating    = (groupId, data) => axios.post(`${API_URL}/study-groups/${groupId}/ratings`, data, authHeaders());
export const getGroupRatings = (groupId)       => axios.get(`${API_URL}/study-groups/${groupId}/ratings`, authHeaders());
export const getMyRatings    = ()              => axios.get(`${API_URL}/study-groups/ratings/me`, authHeaders());

// Feedback
export const submitFeedback = (data) => axios.post(`${API_URL}/auth/feedback`, data, authHeaders());
export const getPublicFeedbacks = () => axios.get(`${API_URL}/auth/feedback/public`);
export const getFeedbackReport = () => axios.get(`${API_URL}/auth/feedback/report`, authHeaders());
