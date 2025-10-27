/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    colors: {
      primary: '#343c84',
      secondary: '#0045bdff',
      // ...
    },
    extend: {
      colors: {
        primary: '#343c84',
        secondary: '#ecc94b',
        tahiti: {
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        'gray-light': '#d3dce6',
        partner: {
          100: '#FFE5F0',
          200: '#FFCCE1',
          300: '#FF99C2',
          400: '#FF66A3',
          500: '#FF3384',
          600: '#CC296A',
          700: '#991F50',
          800: '#661436',
          900: '#330A1C',
        },
        // vendor: {
        //   100: '#E6F4FF',
        //   200: '#B3DAFF',
        //   300: '#80C1FF',
        //   400: '#4DA7FF',
        //   500: '#1A8EFF',
        //   600: '#0066CC',
        //   700: '#004C99',
        //   800: '#003366',
        //   900: '#001933',
        // },
      },
      fontFamily: {
        display: 'Oswald, ui-serif', // Adds a new `font-display` class
      },
      borderRadius: {
      'none': '0',
      'sm': '.125rem',
      DEFAULT: '.25rem',
      'lg': '.5rem',
      'full': '9999px',
    },
    spacing: {
         px: '1px',
      0: '0',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem',
      },
      boxShadow: {
        'outline': '0 0 0 3px rgba(66, 153, 225, 0.5)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },
      transitionProperty: {
        'width': 'width',
        'spacing': 'margin, padding',
        'colors': 'background-color, border-color, color, fill, stroke',
        'opacity': 'opacity',
        'transform': 'transform',
      },
      transitionDuration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
       extend: {
      maxWidth: {
        '3xl': '48rem',
        '4xl': '56rem',
      },
    },

    },
    spacing: {
      px: '1px',
      0: '0',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem',
    },
    borderWidth: {
      DEFAULT: '1px',
    },
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
  },
  // extend:{
  //   width: {
  //       '1': '1%',
  //       '2': '2%',
  //       '3': '3%',
  //       // ... and so on up to '50': '50%'
  //     },
  // }
    theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          accent: "hsl(var(--primary-accent))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          accent: "hsl(var(--secondary-accent))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          accent: "hsl(var(--error-accent))",
          foreground: "hsl(var(--error-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          accent: "hsl(var(--info-accent))",
          foreground: "hsl(var(--info-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          accent: "hsl(var(--success-accent))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          accent: "hsl(var(--warning-accent))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
   plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/container-queries"),
  ],
};


// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       colors: {
//         primary: 'var(--color-primary)',
//         secondary: 'var(--color-secondary)',
//         bg: 'var(--color-bg)',
//         text: 'var(--color-text)',
//       },
//     },
//   },
// };

// const widthPercentages = {};
// for (let i = 1; i <= 50; i++) {
//   widthPercentages[`width-${i}`] = `${i}%`;
// }

// module.exports = {
//   theme: {
//     extend: {
//       width: widthPercentages,
//     },
//   },
// };
