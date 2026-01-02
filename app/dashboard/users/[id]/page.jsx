'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { userAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, User, Mail, Shield } from 'lucide-react';
import Link from 'next/link';

export default function EditUserPage() {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user'
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await userAPI.getOne(id);
                setUser(data.user);
                setFormData({
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role
                });
            } catch (err) {
                toast.error('Failed to fetch user');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await userAPI.update(id, formData);
            toast.success('User updated successfully!');
            router.push('/dashboard/users');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 p-6 lg:p-8">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/users"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Users
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <User className="w-7 h-7 text-gray-700" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
                        <p className="text-gray-600 text-sm mt-1">Update user information</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 space-y-6">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
                            required
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
                            required
                        />
                    </div>
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role *
                    </label>
                    <div className="relative">
                        <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
                            required
                        >
                            <option value="user">User - Regular access</option>
                            <option value="admin">Admin - Full access</option>
                        </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {formData.role === 'admin' 
                            ? '⚠️ Admin users have full access to all features' 
                            : 'Regular users can manage their own quotations'
                        }
                    </p>
                </div>

                {/* Role Description */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Role Permissions:</h4>
                    <ul className="text-xs text-gray-700 space-y-1.5">
                        <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span><strong>User:</strong> Create and manage own quotations</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span><strong>Admin:</strong> Manage all quotations + user management</span>
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Update User
                            </>
                        )}
                    </button>
                    
                    <Link
                        href="/dashboard/users"
                        className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}