'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-gray-900 mx-auto mb-4" />
        <p className="text-base font-medium text-gray-600">Loading your workspace...</p>
      </div>
    </div>
  );
}