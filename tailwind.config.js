
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        'brand-red': '#E50914',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #E50914, 0 0 10px #E50914' },
          '50%': { boxShadow: '0 0 20px #E50914, 0 0 30px #E50914' },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

// Add custom CSS to the document head
const style = document.createElement('style');
style.textContent = `
  .control-btn {
    @apply flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200;
  }
  .action-btn {
    @apply flex items-center justify-center gap-2 w-full px-4 py-3 bg-brand-red text-white font-bold rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg hover:brightness-110;
  }
  .download-btn:hover {
     animation: glow 1.5s infinite alternate;
  }
`;
document.head.appendChild(style);
