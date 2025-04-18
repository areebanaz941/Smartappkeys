// src/lib/auth.js
import { jwtDecode } from 'jwt-decode';

export const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) return JSON.parse(storedUser);

    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      return {
        id: decoded.userId,
        email: decoded.email,
        userType: decoded.userType
      };
    }

    return null;
  } catch (err) {
    console.error('Error getting user:', err);
    return null;
  }
};

export const getUserId = () => {
  const user = getCurrentUser();
  return user?.id || null;
};
