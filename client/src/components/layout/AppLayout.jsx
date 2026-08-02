import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../ui/Navbar';
import Sidebar from '../ui/Sidebar';
import MobileNav from '../ui/MobileNav';
import Logo from '../ui/Logo';
import useAuthStore from '../../stores/useAuthStore';
import useCoupleStore from '../../stores/useCoupleStore';

const AppLayout = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { isPaired, fetchCouple, isLoading: coupleLoading } = useCoupleStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCouple();
    }
  }, [isAuthenticated, fetchCouple]);

  if (authLoading || coupleLoading) {
    return (
      <div className="min-h-screen bg-rose-950 flex flex-col items-center justify-center gap-4 text-white">
        <Logo size="xl" showText={false} className="animate-pulse" />
        <p className="text-sm font-medium text-rose-200/80 animate-bounce">Opening Pairly...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  if (!isPaired) {
    return <Navigate to="/pair" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-950 via-purple-950 to-slate-950 text-white flex flex-col w-full pb-20 lg:pb-0">
      <Navbar />
      <div className="flex flex-1 w-full">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default AppLayout;
