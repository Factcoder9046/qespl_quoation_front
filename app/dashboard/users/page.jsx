'use client';
import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Users as UsersIcon, 
  Pencil, 
  Trash2,
  Crown,
  User,
  Mail,
  Calendar,
  Shield
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [currentUser, router]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const { data } = await userAPI.getAll();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (searchTerm) {
      const filtered = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  };

  const handleDelete = (id) => {
  toast.custom(
    (t) => (
      <div
        className={`
          ${t.visible ? 'animate-enter' : 'animate-leave'}
          backdrop-blur-xl bg-white/70
          shadow-2xl border border-white/30
          rounded-2xl p-5 w-[340px]
        `}
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>

          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900">
              Delete user?
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    await userAPI.delete(id);
                    toast.success('User deleted successfully');
                    fetchUsers();
                  } catch (error) {
                    toast.error(
                      error.response?.data?.message || 'Failed to delete user'
                    );
                  }
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
    { position: 'top-center' }
  );
};


  const toggleStatus = async (id, isActive) => {
    try {
      await userAPI.update(id, { isActive: !isActive });
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <UsersIcon className="w-7 h-7 text-[#007d58]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 text-sm mt-1">Manage user accounts and permissions</p>
          </div>
        </div>
        <Link
          href="/dashboard/users/create"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add User
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Admins</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}
                `}>
                  {user.role === 'admin' ? (
                    <Crown className="w-6 h-6 text-purple-600" />
                  ) : (
                    <User className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <span className={`
                    text-xs px-2 py-1 rounded-lg mt-1 inline-block
                    ${user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                    }
                  `}>
                    {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </span>
                </div>
              </div>
              
              <span className={`
                px-2.5 py-1 text-xs font-semibold rounded-lg
                ${user.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
                }
              `}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => toggleStatus(user._id, user.isActive)}
                disabled={user._id === currentUser._id}
                className={`
                  flex-1 px-3 py-2 text-sm font-medium rounded-xl transition-colors
                  ${user._id === currentUser._id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : user.isActive
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }
                `}
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>
              
              <Link
                href={`/dashboard/users/${user._id}`}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </Link>

              <button
                onClick={() => handleDelete(user._id)}
                disabled={user._id === currentUser._id}
                className={`
                  p-2 rounded-xl transition-colors
                  ${user._id === currentUser._id
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-red-600 hover:bg-red-50'
                  }
                `}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}