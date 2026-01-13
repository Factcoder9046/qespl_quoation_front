'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../lib/avatar.js';


const DEFAULT_PERMISSIONS = {
  quotation: {
    create: false,
    read: false,
    update: false,
    delete: false,
  },
  user: {
    create: false,
    read: false,
    update: false,
    delete: false,
  },
};


const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* ================= CHECK AUTH ================= */
  useEffect(() => {
    checkAuth();
  }, []);

  const normalizeUser = (userData) => {
  if (!userData) return null;

  return {
    ...userData,
    avatar: getAvatarUrl(userData.avatar),
    permissions: {
      ...DEFAULT_PERMISSIONS,
      ...(userData.permissions || {}),
      quotation: {
        ...DEFAULT_PERMISSIONS.quotation,
        ...(userData.permissions?.quotation || {}),
      },
      user: {
        ...DEFAULT_PERMISSIONS.user,
        ...(userData.permissions?.user || {}),
      },
    },
  };
};


  const checkAuth = async () => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
          try {
            const { data } = await authAPI.getMe();

            const normalizedUser = normalizeUser(data.user);

            setUser(normalizedUser);
            localStorage.setItem(
              'user',
              JSON.stringify(normalizedUser)
            );
          } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGIN ================= */
  const login = async (credentials) => {
    try {
      const { data } = await authAPI.login(credentials);

      const normalizedUser = normalizeUser(data.user);

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem(
          'user',
          JSON.stringify(normalizedUser)
        );
      }

      setUser(normalizedUser);
      toast.success('Login successful! 🎉');

      // Admin company check
      if (normalizedUser.role === 'admin') {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/company/check`,
            {
              headers: {
                Authorization: `Bearer ${data.token}`,
              },
            }
          );

          const companyData = await res.json();

          setTimeout(() => {
            if (!companyData.exists) {
              router.push('/company-setup');
            } else {
              router.push('/dashboard');
            }
            router.refresh();
          }, 100);
        } catch {
          router.push('/dashboard');
        }
      } else {
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 100);
      }

      return data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Login failed!'
      );
      throw error;
    }
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setUser(null);
    toast.success('Logged out successfully!');
    router.push('/login');
  };

  /* ================= UPDATE USER ================= */
  const updateUser = (updatedUser) => {
    const normalizedUser = normalizeUser(updatedUser);

    setUser(normalizedUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'user',
        JSON.stringify(normalizedUser)
      );
    }
  };

  const hasPermission = (module, action) => {
  if (!user) return false;

  // Admin = full access
  if (user.role === 'admin') return true;

  return Boolean(user.permissions?.[module]?.[action]);
};


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkAuth,
        updateUser, 
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
