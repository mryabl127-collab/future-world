import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.futureworld.app',
  appName: 'Future World',
  webDir: 'dist/client',
  server: {
    url: 'https://green-map-smart-clean.lovable.app',
    cleartext: true,
    androidScheme: 'https'
  }
};

export default config;
