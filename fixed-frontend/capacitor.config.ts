import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'set-frontend',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
