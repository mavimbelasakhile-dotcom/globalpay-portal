import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const logEvent = async (action, userId, userName, details = '') => {
  try {
    await axios.post(`${API_URL}/auditLog`, {
      action,
      userId,
      userName,
      details,
      timestamp: new Date().toISOString(),
      ip: 'client',
    });
  } catch (e) {}
};

export const ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PAYMENT_SUBMITTED: 'PAYMENT_SUBMITTED',
  PAYMENT_APPROVED: 'PAYMENT_APPROVED',
  PAYMENT_DECLINED: 'PAYMENT_DECLINED',
  USER_CREATED: 'USER_CREATED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  SESSION_TIMEOUT: 'SESSION_TIMEOUT',
};
