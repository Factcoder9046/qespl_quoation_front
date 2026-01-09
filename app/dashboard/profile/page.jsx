'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api, { authAPI } from '@/lib/api';
import { Mail, Shield, Calendar, Phone, Lock, Camera, Edit2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatarPreview(null);
    }
  }, [user]);

  if (!user) return null;

  // Get the proper avatar URL to display
  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user.avatar) {
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      }
      return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.avatar}`;
    }
    return '/default-avatar.png';
  };

  // Avatar upload handler
  const handleAvatarUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload an image file');
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image size should be less than 5MB');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setLoading(true);
      const { data } = await api.put('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser({ ...user, avatar: data.avatar });
      toast.success('Avatar updated successfully');
      setAvatarPreview(null);
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error(err.response?.data?.message || 'Avatar upload failed');
      setAvatarPreview(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      handleAvatarUpload(file);
    }
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Save profile
  const handleSave = async () => {
    try {
      setLoading(true);
      const { data } = await api.put('/auth/me', { name, phone });
      updateUser(data.user);
      toast.success('Profile updated successfully');
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('All fields are required');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setPasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cream-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header with Glassmorphism */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-sm text-gray-600 mt-1">Manage your personal information and settings</p>
        </div>

        {/* Main Profile Card - Glassmorphism */}
        <div className="backdrop-blur-xl bg-white/60 border border-white/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-200/30 to-transparent rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cream-200/30 to-transparent rounded-full blur-3xl -z-10" />
          
          <div className="flex justify-center items-center relative z-10">
            {/* Avatar with advanced styling */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-white/50 shadow-xl">
                <img
                  src={getAvatarUrl()}
                  alt="Avatar"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  <Camera className="w-8 h-8 text-white" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid - Glassmorphism Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileCard icon={Mail} label="Email Address" value={user.email} gradient="from-blue-50/80 to-cyan-50/80" />
          <ProfileCard icon={Shield} label="Account Role" value={user.role} gradient="from-purple-50/80 to-pink-50/80" />
          <ProfileCard icon={Phone} label="Phone Number" value={user.phone || 'Not added'} gradient="from-green-50/80 to-emerald-50/80" />
          <ProfileCard 
            icon={Calendar} 
            label="Member Since" 
            value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'} 
            gradient="from-orange-50/80 to-amber-50/80" 
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setOpen(true)} 
            className="group relative flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2">
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </span>
          </button>
          <button
            onClick={() => setPasswordOpen(true)}
            className="group flex-1 px-6 py-4 rounded-2xl backdrop-blur-xl bg-white/70 border border-gray-300/50 text-gray-900 font-medium shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </span>
          </button>
        </div>

        {/* Modals */}
        {open && (
          <GlassModal title="Edit Profile" onClose={() => setOpen(false)}>
            <GlassInput label="Full Name" value={name} onChange={setName} placeholder="Enter your name" />
            <GlassInput label="Phone Number" value={phone} onChange={setPhone} placeholder="+91 Phone Number" />
            <ModalActions onCancel={() => setOpen(false)} onConfirm={handleSave} loading={loading} />
          </GlassModal>
        )}

        {passwordOpen && (
          <GlassModal title="Change Password" onClose={() => setPasswordOpen(false)}>
            <GlassInput label="Current Password" type="password" value={currentPassword} onChange={setCurrentPassword} placeholder="Enter current password" />
            <GlassInput label="New Password" type="password" value={newPassword} onChange={setNewPassword} placeholder="Enter new password" />
            <GlassInput label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" />
            <ModalActions onCancel={() => setPasswordOpen(false)} onConfirm={handleChangePassword} loading={loading} />
          </GlassModal>
        )}
      </div>
    </div>
  );
}

// Glassmorphism Profile Card
function ProfileCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className={`relative group backdrop-blur-xl bg-gradient-to-br ${gradient} border border-white/60 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-start gap-4">
        <div className="p-3 rounded-xl bg-white/60 shadow-md">
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-base font-semibold text-gray-900 truncate">{value || '-'}</p>
        </div>
      </div>
    </div>
  );
}

// Glassmorphism Modal
function GlassModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
      <div className="relative backdrop-blur-2xl bg-white/80 border border-white/60 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gray-200/40 to-transparent rounded-full blur-2xl -z-10" />
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-gray-200/50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// Glassmorphism Input
function GlassInput({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/60 border border-gray-300/50 focus:border-gray-500 focus:bg-white/80 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400"
      />
    </div>
  );
}

// Modal Action Buttons
function ModalActions({ onCancel, onConfirm, loading }) {
  return (
    <div className="flex gap-3 mt-8">
      <button 
        onClick={onCancel} 
        className="flex-1 px-5 py-3 rounded-xl backdrop-blur-xl bg-white/60 border border-gray-300/50 text-gray-700 font-medium hover:bg-white/80 transition-all duration-200"
      >
        Cancel
      </button>
      <button 
        onClick={onConfirm} 
        disabled={loading} 
        className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            Save Changes
          </>
        )}
      </button>
    </div>
  );
}