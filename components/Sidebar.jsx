'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Building2,
  Package,
  UserCircle,
  ShieldUser,
  TrendingUp,
  Briefcase,
  Trash2
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menu when route changes
  useEffect(() => setMobileOpen(false), [pathname]);

  // Shortcut Ctrl+B
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get avatar URL
  const getAvatarUrl = () => {
    if (user?.avatar) {
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      }
      return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.avatar}`;
    }
    return null;
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', adminOnly: false },
    { icon: FileText, label: 'Quotations', href: '/dashboard/quotations', adminOnly: false },
    { icon: Package, label: 'Products', href: '/dashboard/products', adminOnly: false },
    { icon: UserCircle, label: 'Customers', href: '/dashboard/customers', adminOnly: false },
    { icon: Building2, label: 'Business Info', href: '/dashboard/business-info', adminOnly: true },
    { icon: Users, label: 'Users', href: '/dashboard/users', adminOnly: true },
    { icon: Trash2, label: 'Recycle Bin', href: '/dashboard/recyclebin', adminOnly: false },
  ];

  const projects = [
    { icon: Briefcase, label: 'BizConnect', count: 7 },
    { icon: TrendingUp, label: 'Growth Hub', count: null },
  ];

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const avatarUrl = getAvatarUrl();

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg text-gray-900"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        className={`fixed md:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}
      >
        {/* Header / Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-gray-200">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-black" />
          </div>

          {!collapsed && (
            <div className="leading-tight">
              <h1 className="text-base font-bold text-gray-900">
                Quotation
              </h1>
              <p className="text-xs text-gray-500">
                Management
              </p>
            </div>
          )}
        </div>


        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${active
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'}
                  ${collapsed ? 'justify-center' : 'justify-start'}`}
                title={collapsed ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

    
        {/* User Profile Link at bottom */}
        {user && (
          <div className="px-3 pb-3 mt-auto">
            <Link
              href="/dashboard/profile"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all
        ${pathname === '/dashboard/profile' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}
        ${collapsed ? 'justify-center' : 'justify-start'}
      `}
            >
              {/* Avatar with Profile Picture */}
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full bg-gray-900 flex items-center justify-center">
                          <span class="text-white font-semibold text-sm">
                            ${user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + Role */}
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                </div>
              )}
            </Link>
          </div>
        )}




        {/* Logout Button */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all ${collapsed ? 'justify-center' : 'justify-start'}`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}