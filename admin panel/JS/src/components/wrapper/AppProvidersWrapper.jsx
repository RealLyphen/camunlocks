'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastContainer } from 'react-toastify';
import dynamic from 'next/dynamic';
const LayoutProvider = dynamic(() => import('@/context/useLayoutContext').then(mod => mod.LayoutProvider), {
  ssr: false
});
import { NotificationProvider } from '@/context/useNotificationContext';
const AppProvidersWrapper = ({
  children
}) => {
  return <SessionProvider>
      <LayoutProvider>
        <NotificationProvider>
          {children}
          <ToastContainer theme="colored" />
        </NotificationProvider>
      </LayoutProvider>
    </SessionProvider>;
};
export default AppProvidersWrapper;