import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)',
  				50: 'var(--primary-50)',
  				100: 'var(--primary-100)',
  				200: 'var(--primary-200)',
  				300: 'var(--primary-300)',
  				400: 'var(--primary-400)',
  				500: 'var(--primary-500)',
  				600: 'var(--primary-600)',
  				700: 'var(--primary-700)',
  				800: 'var(--primary-800)',
  				900: 'var(--primary-900)',
  				950: 'var(--primary-950)',
  				1000: 'var(--primary-1000)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			success: {
  				DEFAULT: 'var(--success)',
  				foreground: 'var(--success-foreground)'
  			},
  			warning: {
  				DEFAULT: 'var(--warning)',
  				foreground: 'var(--warning-foreground)'
  			},
  			sidebar: {
  				DEFAULT: 'var(--sidebar-background)',
  				foreground: 'var(--sidebar-foreground)',
  				primary: 'var(--sidebar-primary)',
  				'primary-foreground': 'var(--sidebar-primary-foreground)',
  				accent: 'var(--sidebar-accent)',
  				'accent-foreground': 'var(--sidebar-accent-foreground)',
  				border: 'var(--sidebar-border)',
  				ring: 'var(--sidebar-ring)'
  			},
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
  			base: {
  				50: 'var(--base-50)',
  				100: 'var(--base-100)',
  				200: 'var(--base-200)',
  				300: 'var(--base-300)',
  				400: 'var(--base-400)',
  				500: 'var(--base-500)',
  				600: 'var(--base-600)',
  				700: 'var(--base-700)',
  				800: 'var(--base-800)',
  				900: 'var(--base-900)',
  				950: 'var(--base-950)',
  				1000: 'var(--base-1000)'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'calc(var(--radius) + 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--text-family)',
  				'Funnel Sans',
  				'sans-serif'
  			],
  			display: [
  				'var(--display-family)',
  				'Lexend',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'monospace'
  			],
  			serif: [
  				'Merriweather',
  				'serif'
  			]
  		},
  		boxShadow: {
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			DEFAULT: 'var(--shadow)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'fade-out': {
  				from: {
  					opacity: '1'
  				},
  				to: {
  					opacity: '0'
  				}
  			},
  			'slide-in-from-top': {
  				from: {
  					transform: 'translateY(-100%)'
  				},
  				to: {
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-from-bottom': {
  				from: {
  					transform: 'translateY(100%)'
  				},
  				to: {
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-from-left': {
  				from: {
  					transform: 'translateX(-100%)'
  				},
  				to: {
  					transform: 'translateX(0)'
  				}
  			},
  			'slide-in-from-right': {
  				from: {
  					transform: 'translateX(100%)'
  				},
  				to: {
  					transform: 'translateX(0)'
  				}
  			},
			'cell-ripple': {
				'0%': {
					opacity: '0.4',
					transform: 'scale(1)'
				},
				'50%': {
					opacity: '1',
					transform: 'scale(1.05)'
				},
				'100%': {
					opacity: '0.4',
					transform: 'scale(1)'
				}
			},
			shimmer: {
				'0%': { backgroundPosition: '200% 0' },
				'100%': { backgroundPosition: '-200% 0' },
			},
			marquee: {
				'0%': { transform: 'translateX(0)' },
				'100%': { transform: 'translateX(calc(-100% - var(--gap)))' },
			},
			'border-spin': {
				'0%': { rotate: '0deg' },
				'100%': { rotate: '360deg' },
			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.2s ease-out',
  			'fade-out': 'fade-out 0.2s ease-out',
  			'slide-in-from-top': 'slide-in-from-top 0.2s ease-out',
  			'slide-in-from-bottom': 'slide-in-from-bottom 0.2s ease-out',
  			'slide-in-from-left': 'slide-in-from-left 0.2s ease-out',
  			'slide-in-from-right': 'slide-in-from-right 0.2s ease-out',
			'cell-ripple': 'cell-ripple var(--duration) ease-out var(--delay)',
			shimmer: 'shimmer 3s ease-in-out infinite',
			marquee: 'marquee var(--duration, 40s) linear infinite',
			'border-spin': 'border-spin 7s linear infinite',
  		}
  	}
  },
  plugins: [tailwindcssAnimate, require("tailwindcss-animate")],
};

export default config;
