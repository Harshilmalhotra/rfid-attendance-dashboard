'use client'

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Generate nonce for Google ID token sign-in
const generateNonce = async () => {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return [nonce, hashedNonce];
};

export default function GoogleOneTap({ disabled = false }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeGoogleOneTap = async () => {
    // Don't initialize if user is already logged in or if disabled
    if (user || disabled || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      return;
    }

    try {
      console.log('Initializing Google One Tap');
      const [nonce, hashedNonce] = await generateNonce();

      // Check if there's already an existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
        return;
      }

      // Initialize Google One Tap
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              // Send ID token to Supabase
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
                nonce,
              });

              if (error) throw error;

              console.log('Successfully logged in with Google One Tap');
              // Navigation handled by auth context
            } catch (error) {
              console.error('Error logging in with Google One Tap:', error);
            }
          },
          nonce: hashedNonce,
          // Chrome third-party cookie phase-out support
          use_fedcm_for_prompt: true,
          // Auto select if user has only one Google account
          auto_select: true,
          // Cancel if user clicks outside
          cancel_on_tap_outside: true,
          // Context
          context: 'signin',
          // Exponential cooldown
          itp_support: true,
        });

        // Display One Tap prompt
        window.google.accounts.id.prompt((notification) => {
          console.log('One Tap notification:', notification.getMomentType());
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One Tap not displayed or skipped
            console.log('Google One Tap not displayed:', notification.getNotDisplayedReason() || notification.getSkippedReason());
          }
        });

        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error initializing Google One Tap:', error);
    }
  };

  useEffect(() => {
    // Cancel One Tap if user logs in through other means
    if (user && isInitialized && window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
      setIsInitialized(false);
    }
  }, [user, isInitialized]);

  // Only render if Google Client ID is configured
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onReady={initializeGoogleOneTap}
    />
  );
}