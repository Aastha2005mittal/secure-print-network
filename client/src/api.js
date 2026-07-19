import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Request interceptor to add tokens
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Shop / Room
export const createShop = (data) => api.post('/shop/create', data);
export const getRoomByCode = (code) => api.get(`/shop/upload/${code}`);

// Sessions
export const createSession = (roomId, customerName) => api.post(`/session/create/${roomId}`, { customerName });
export const getMe = () => api.get('/session/me');
export const getShopSessions = (shopId) => api.get(`/session/owner/list/${shopId}`);

// Messages
export const getMyMessages = () => api.get('/messages/me');
export const sendMessage = (content) => api.post('/messages/me', { content });
export const getSessionMessages = (sessionId) => api.get(`/messages/session/${sessionId}`);
export const sendOwnerMessage = (sessionId, content) => api.post(`/messages/session/${sessionId}`, { content });

// Files
export const uploadFiles = (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post('/files/upload/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const getMyFiles = () => api.get('/files/me');
export const getSessionFiles = (sessionId) => api.get(`/files/session/${sessionId}`);
export const markPrinted = (fileId) => api.patch(`/files/${fileId}/printed`);
export const downloadFile = (fileId) => api.get(`/files/${fileId}/download`, { responseType: 'blob' });
export const downloadMyFile = (fileId) => api.get(`/files/me/${fileId}/download`, { responseType: 'blob' });

// Auth
export const loginOwner = (email, password) => api.post('/auth/owner/login', { email, password });

export default api;
export const markAsReadOwner = (sessionId) => api.post(`/messages/read/${sessionId}`);
console.log("Mark as read owner called for sessionId:", markAsReadOwner);
export const markAsReadCustomer = () => api.post('/messages/read-me');