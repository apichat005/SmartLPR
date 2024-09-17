import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, 'src', 'assets', '.env') });


// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.xlsx'],
  plugins: [react()],
  base: '/lpr_manage/'
})
