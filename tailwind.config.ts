import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Pathfinder Brand Colors
        sage: {
          DEFAULT: "var(--sage)",
          dark: "var(--sage-dark)", 
          light: "var(--sage-light)",
        },
        golden: "var(--golden)",
        charcoal: "var(--charcoal)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
        inter: ["Inter", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideIn: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
        bounce: {
          "0%, 20%, 53%, 80%, 100%": {
            animationTimingFunction: "cubic-bezier(0.215, 0.61, 0.355, 1)",
            transform: "translate3d(0, 0, 0)",
          },
          "40%, 43%": {
            animationTimingFunction: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
            transform: "translate3d(0, -30px, 0)",
          },
          "70%": {
            animationTimingFunction: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
            transform: "translate3d(0, -15px, 0)",
          },
          "90%": {
            transform: "translate3d(0, -4px, 0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "bounce-gentle": "bounce 2s infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-sage": "linear-gradient(135deg, var(--sage-light), var(--sage))",
        "gradient-golden": "linear-gradient(135deg, var(--golden), #f39c12)",
      },
      boxShadow: {
        sage: "0 4px 6px -1px rgba(155, 188, 139, 0.1), 0 2px 4px -1px rgba(155, 188, 139, 0.06)",
        "sage-lg": "0 10px 15px -3px rgba(155, 188, 139, 0.1), 0 4px 6px -2px rgba(155, 188, 139, 0.05)",
        "sage-xl": "0 20px 25px -5px rgba(155, 188, 139, 0.1), 0 10px 10px -5px rgba(155, 188, 139, 0.04)",
        "inner-sage": "inset 0 2px 4px 0 rgba(155, 188, 139, 0.06)",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
      },
      scale: {
        "102": "1.02",
        "103": "1.03",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
    // Custom plugin for Pathfinder utilities
    function({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.text-shadow-sm': {
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
        },
        '.backdrop-sage': {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(155, 188, 139, 0.1)',
        },
        '.gradient-text-sage': {
          background: 'linear-gradient(135deg, var(--sage), var(--sage-dark))',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          backgroundClip: 'text',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-sage': {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--sage-light)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'var(--sage)',
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
} satisfies Config;
