import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

export const GOOGLE_WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID?.trim();
export const GOOGLE_IOS_CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_IOS_CLIENT_ID?.trim();

let nativeInitialization: Promise<void> | null = null;

export function googleNativeConfigurationError() {
  if (!GOOGLE_WEB_CLIENT_ID) {
    return new Error('Google is not configured. Set VITE_GOOGLE_DRIVE_CLIENT_ID, then rebuild the app.');
  }
  if (Capacitor.getPlatform() === 'ios' && !GOOGLE_IOS_CLIENT_ID) {
    return new Error('Google for iOS is not configured. Set VITE_GOOGLE_DRIVE_IOS_CLIENT_ID, then sync the app again.');
  }
  return null;
}

export function prepareNativeGoogle() {
  const configurationError = googleNativeConfigurationError();
  if (configurationError) return Promise.reject(configurationError);
  if (!nativeInitialization) {
    nativeInitialization = SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_WEB_CLIENT_ID,
        iOSClientId: GOOGLE_IOS_CLIENT_ID,
        iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
        mode: 'online',
      },
    }).catch((error) => {
      nativeInitialization = null;
      throw error;
    });
  }
  return nativeInitialization;
}
