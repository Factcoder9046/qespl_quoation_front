'use client';
import { useState } from 'react';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { Boxes } from "../../components/ui/background-boxes";

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
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4 sm:p-6">

      {/* Background Boxes */}
      <div className="absolute inset-0 z-0">
        <Boxes />
      </div>

      {/* REGISTER CARD */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Sign up</h1>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-5 py-4 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Name"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-5 py-4 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Email"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-5 py-4 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-5 py-4 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Confirm Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <p className="text-gray-500 text-sm pl-1">
            Password should include minimum 6 characters
          </p>
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-300"
            />
            <label className="text-gray-600 text-sm leading-tight">
              Accept our{' '}
              <span className="text-gray-900 font-semibold underline">terms & conditions</span>
              {' & '}
              <span className="text-gray-900 font-semibold underline">privacy policy</span>
              {' '}by selecting Continue
            </label>
          </div>
          <button
            type="submit"
            disabled={loading ||
              formData.password !== formData.confirmPassword }
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>

        {/* Already have account */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-gray-900 font-bold">
              Sign in here.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
