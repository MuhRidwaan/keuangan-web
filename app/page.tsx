'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated()) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );
}
