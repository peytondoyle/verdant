import { useEffect } from 'react';
import { useAuthStore } from '../state/authStore';

export const useAuth = () => {
  const { session, status, init, loginWithEmail, loginWithPhone, verifyPhoneOtp, logout } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  const isAuthenticated = status === 'signedIn';

  return {
    session,
    status,
    isAuthenticated,
    loginWithEmail,
    loginWithPhone,
    verifyPhoneOtp,
    logout,
  };
};
