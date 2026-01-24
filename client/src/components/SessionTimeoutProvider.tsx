"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { usePathname } from 'next/navigation';

interface SessionTimeoutContextType {
  resetTimer: () => void;
  logout: () => void;
  lastActivity: number;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

export const useSessionTimeoutContext = () => {
  const context = useContext(SessionTimeoutContext);
  if (!context) {
    throw new Error('useSessionTimeoutContext must be used within SessionTimeoutProvider');
  }
  return context;
};

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
}

export const SessionTimeoutProvider: React.FC<SessionTimeoutProviderProps> = ({ children }) => {
  const pathname = usePathname();
  // قائمة الصفحات العامة التي لا تتطلب مؤقت جلسة
  const publicRoutes = ['/login', '/', '/forgot-password', '/reset-password'];
  const isPublicPage = pathname ? publicRoutes.some(route => pathname === route || pathname.startsWith(route)) : false;

  const { resetTimer, logout, lastActivity } = useSessionTimeout({
    timeout: 5 * 60 * 1000, // 5 دقائق
    warningTime: 1 * 60 * 1000, // تحذير قبل دقيقة
  });

  // عدم تفعيل مؤقت الجلسة في الصفحات العامة
  useEffect(() => {
    if (isPublicPage) {
      return;
    }
  }, [isPublicPage]);

  // عدم تقديم السياق في الصفحات العامة
  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <SessionTimeoutContext.Provider value={{ resetTimer, logout, lastActivity }}>
      {children}
    </SessionTimeoutContext.Provider>
  );
};
