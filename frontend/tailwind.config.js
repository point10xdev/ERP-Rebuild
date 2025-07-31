/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       animation: {
        "meteor-effect": "meteor 5s linear infinite",
      },
      keyframes: {
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
      },
      // custom colors here
      colors: {
        // Student Colors
        'stu-pri': '#2563EB',           // student-primary-main (blue-600)
        'stu-pri-hover': '#1D4ED8',     // student-primary-main-hover (blue-700)
        'stu-pri-hover-light': '#3B82F6', // student-primary-hover-light (blue-500) DARK Mode
        'stu-sec': '#6366F1',           // student-secondary-indigo (indigo-500)
        'stu-sec-light': '#A5B4FC',     // student-secondary-indigo-light (indigo-300) 
        'stu-acc': '#F43F5E',           // student-accent-rose (rose-500)

        // Faculty Colors
        'fac-pri': '#7C3AED',           // faculty-primary-main (violet-600)
        'fac-pri-hover': '#6D28D9',     // faculty-primary-main-hover (violet-700)
        'fac-pri-hover-light': '#8B5CF6', // faculty-primary-hover-light (violet-500) DARK Mode
        'fac-sec': '#0EA5E9',           // faculty-secondary-sky-main (sky-500)
        'fac-sec-light': '#7DD3FC',     // faculty-secondary-sky-light (sky-300) 
        'fac-acc': '#E299DD',           // faculty-accent-cyan-light (cyan-400)
      },
    },
  },
  plugins: [],
}

// Colors used for Light and Dark Mode 
// Headings text-gray-900 dark:text-gray-100
// Text
// Subtle 