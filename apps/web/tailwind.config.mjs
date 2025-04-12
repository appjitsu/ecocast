import sharedConfig from '@repo/ui/tailwind.config.mjs'; // Import shared config

/** @type {import('tailwindcss').Config} */
export default {
  presets: [sharedConfig], // Use the shared config as a preset
  content: [
    // Paths specific to this app
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    // Include path to shared UI components if needed for scanning
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  // Theme and plugins are inherited from the preset, no need to repeat
};
