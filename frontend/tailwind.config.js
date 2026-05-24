/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "tertiary-fixed-dim": "#c2c6d3",
        "on-error-container": "#93000a",
        "on-primary": "#ffffff",
        "on-tertiary": "#ffffff",
        "on-error": "#ffffff",
        "inverse-primary": "#c3c0ff",
        "inverse-surface": "#213145",
        "on-primary-fixed": "#0f0069",
        "outline-variant": "#c7c4d8",
        "on-surface-variant": "#464555",
        "tertiary": "#434853",
        "error-container": "#ffdad6",
        "outline": "#777587",
        "surface-container-lowest": "#ffffff",
        "tertiary-fixed": "#dee2ef",
        "on-secondary": "#ffffff",
        "primary-fixed": "#e2dfff",
        "inverse-on-surface": "#eaf1ff",
        "secondary-fixed-dim": "#c0c1ff",
        "secondary-container": "#6063ee",
        "surface-container-highest": "#d3e4fe",
        "surface-variant": "#d3e4fe",
        "on-surface": "#0b1c30",
        "on-secondary-container": "#fffbff",
        "surface": "#f8f9ff",
        "on-tertiary-fixed-variant": "#424751",
        "on-secondary-fixed": "#07006c",
        "surface-container-low": "#eff4ff",
        "primary-fixed-dim": "#c3c0ff",
        "secondary": "#4648d4",
        "on-tertiary-container": "#d7dbe8",
        "surface-bright": "#f8f9ff",
        "background": "#f8f9ff",
        "on-tertiary-fixed": "#171c25",
        "on-primary-container": "#dad7ff",
        "error": "#ba1a1a",
        "surface-tint": "#4d44e3",
        "tertiary-container": "#5b606b",
        "on-primary-fixed-variant": "#3323cc",
        "primary-container": "#4f46e5",
        "surface-container-high": "#dce9ff",
        "on-background": "#0b1c30",
        "surface-container": "#e5eeff",
        "on-secondary-fixed-variant": "#2f2ebe",
        "primary": "#3525cd",
        "secondary-fixed": "#e1e0ff",
        "surface-dim": "#cbdbf5"
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'fade-in': 'fade-in 0.3s ease-out'
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "sm": "8px",
        "margin-desktop": "32px",
        "gutter": "24px",
        "xl": "32px",
        "md": "16px",
        "margin-mobile": "16px",
        "lg": "24px",
        "2xl": "48px",
        "base": "4px",
        "xs": "4px"
      },
      fontFamily: {
        "body-md": ["Inter"],
        "code": ["JetBrains Mono"],
        "body-lg": ["Inter"],
        "label-md": ["Inter"],
        "headline-md": ["Inter"],
        "display": ["Inter"],
        "title-lg": ["Inter"],
        "title-md": ["Inter"],
        "headline-lg-mobile": ["Inter"],
        "headline-lg": ["Inter"]
      },
      fontSize: {
        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "code": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "display": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "title-lg": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
        "title-md": ["16px", {"lineHeight": "24px", "fontWeight": "600"}],
        "headline-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ]
}
