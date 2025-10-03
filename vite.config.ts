import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/types': resolve(__dirname, './src/types'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/contexts': resolve(__dirname, './src/contexts'),
      '@/services': resolve(__dirname, './src/services'),
      '@/utils': resolve(__dirname, './src/utils'),
      // React Native Web aliases
      'react-native$': 'react-native-web',
      'react-native/Libraries/ReactNative/AppRegistry': 'react-native-web/dist/exports/AppRegistry',
      'react-native/Libraries/Image/AssetRegistry': 'react-native-web/dist/modules/AssetRegistry',
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter': 'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter': 'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
      'react-native/Libraries/EventEmitter/NativeEventEmitter': 'react-native-web/dist/vendor/react-native/NativeEventEmitter'
    },
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js']
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}']
  }
})