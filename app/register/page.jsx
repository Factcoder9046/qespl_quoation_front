'use client';
import { useState } from 'react';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
    }

    if (!formData.termsAccepted) {
      toast.error('Please accept terms & conditions');
      return;
    }

    setLoading(true);

    try {
      const { data } = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      toast.success(`Registration successful! Welcome ${data.user.name} 🎉`);

      setTimeout(() => {
        router.push('/company-setup');
      }, 1000);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4 sm:p-6">
      {/* REGISTER CARD */}
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
  

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">
            Create account
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Start your journey with us today
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
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
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Create a password"
                required
                minLength={6}
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Password hint */}
          <p className="text-xs text-gray-500">
            Password must be at least 6 characters long
          </p>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              className="w-4 h-4 mt-0.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <label className="text-sm text-gray-600 leading-relaxed">
              I agree to the{' '}
              <button type="button" className="text-gray-900 font-medium hover:underline">
                Terms & Conditions
              </button>
              {' '}and{' '}
              <button type="button" className="text-gray-900 font-medium hover:underline">
                Privacy Policy
              </button>
            </label>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading || formData.password !== formData.confirmPassword}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium text-base hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-gray-900 hover:text-gray-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}