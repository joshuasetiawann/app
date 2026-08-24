import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.joshuasetiawan.kisahkita',
  appName: 'KisahKita',
  webDir: 'dist',
  backgroundColor: '#FDFBF7',
  server: {
    hostname: 'localhost',
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#FDFBF7',
  },
  ios: {
    backgroundColor: '#FDFBF7',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false,
      },
      logLevel: 1,
    },
  },
}

export default config
