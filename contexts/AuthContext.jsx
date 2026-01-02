'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
          try {
            const { data } = await authAPI.getMe();
            setUser(data.user);
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

  const login = async (credentials) => {
    try {
      const { data } = await authAPI.login(credentials);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      setUser(data.user);
      toast.success('Login successful! 🎉');
      
      // Check if company details exist for admin
      if (data.user.role === 'admin') {
        try {
          const companyCheck = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/check`, {
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          const companyData = await companyCheck.json();
          
          setTimeout(() => {
            if (!companyData.exists) {
              router.push('/company-setup');
            } else {
              router.push('/dashboard');
            }
            router.refresh();
          }, 100);
        } catch (error) {
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
      toast.error(error.response?.data?.message || 'Login failed!');
      throw error;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setUser(null);
    toast.success('Logged out successfully!');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
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