'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function SessionRefresh() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Set up interval to refresh session every 30 minutes
    const refreshInterval = setInterval(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        return;
      }

      if (session) {
        // Session is still valid
        console.log('Session refreshed');
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Also refresh on window focus
    const handleFocus = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session refresh error on focus:', error);
        return;
      }

      if (session) {
        console.log('Session refreshed on focus');
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  return null; // This component doesn't render anything
}