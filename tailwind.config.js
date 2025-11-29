/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
            'primary': '#7F56D9',
            'primary-light': '#F3EFFF', // A lighter purple for backgrounds
            'brand-purple': '#8A2BE2',   // Start of the gradient
            'brand-magenta': '#D43790', // End of the gradient (more accurate to mockup)
            'neutral-100': '#F9FAFB',
            'neutral-400': '#6B7280',
            'neutral-700': '#374151',
            'neutral-800': '#1F2937',
            'neutral-900': '#111827',
          },
          fontFamily: {
            'sans': ['Poppins', 'sans-serif'],
          }
      },
    },
    plugins: [],
  }