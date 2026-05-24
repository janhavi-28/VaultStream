# VideoVault Landing Page

This is a responsive, modern SaaS landing page built with React, Tailwind CSS, and `lucide-react`.

## Quick Setup Guide

If you want to use this component in a fresh project from scratch, follow these steps:

1. **Create a new Vite project with React:**
   ```bash
   npm create vite@latest videovault-landing -- --template react
   cd videovault-landing
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm install lucide-react
   npm install -D tailwindcss postcss autoprefixer
   ```

3. **Initialize Tailwind CSS:**
   ```bash
   npx tailwindcss init -p
   ```

4. **Configure Tailwind:**
   Update your `tailwind.config.js` to include the standard paths:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

5. **Update global CSS:**
   Add the Tailwind directives to your `src/index.css` (or `App.css`):
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

6. **Add the component:**
   Copy the provided `LandingPage.jsx` into your `src/components/` or `src/pages/` folder, and import it into your `App.jsx` to render it:

   ```jsx
   import LandingPage from './pages/LandingPage'

   function App() {
     return <LandingPage />
   }

   export default App
   ```

7. **Run the dev server:**
   ```bash
   npm run dev
   ```
