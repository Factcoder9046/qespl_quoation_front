'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    setLoading(true);
    
    try {
      await login(formData);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4 sm:p-6">
      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
        
        {/* Logo/Brand */}
        <div className="mb-8">
          {/* <h2 className="text-2xl font-bold text-gray-900">Quot</h2> */}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Sign in to continue to your workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button type="button" className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium text-base hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

      </div>
    </div>
  );
}