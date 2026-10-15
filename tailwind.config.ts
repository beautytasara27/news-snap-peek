import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1.5rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: [
					'Inter',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'system-ui',
					'sans-serif'
				],
				serif: ['Newsreader', 'Iowan Old Style', 'Georgia', 'serif'],
				display: ['Newsreader', 'Georgia', 'serif']
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				news: {
					header: 'hsl(var(--news-header))',
					text: 'hsl(var(--news-text))',
					subtle: 'hsl(var(--news-subtle))',
					hover: 'hsl(var(--news-hover))',
					shadow: 'hsl(var(--news-shadow))',
					like: 'hsl(var(--news-like))'
				},
				like: {
					DEFAULT: 'hsl(var(--news-like))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 4px)',
				sm: 'calc(var(--radius) - 8px)'
			},
			boxShadow: {
				glow: '0 0 0 1px hsl(var(--primary) / 0.35), 0 12px 32px -12px hsl(var(--primary) / 0.45)',
				'glow-like': '0 0 0 1px hsl(var(--news-like) / 0.4), 0 12px 28px -14px hsl(var(--news-like) / 0.55)'
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
				'fade-up': {
					from: {
						opacity: '0',
						transform: 'translateY(12px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					from: {
						opacity: '0',
						transform: 'scale(0.96)'
					},
					to: {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'heart-pop': {
					'0%': {
						transform: 'scale(1)'
					},
					'40%': {
						transform: 'scale(1.35)'
					},
					'70%': {
						transform: 'scale(0.94)'
					},
					'100%': {
						transform: 'scale(1)'
					}
				},
				shimmer: {
					'100%': {
						transform: 'translateX(100%)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
				'scale-in': 'scale-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) both',
				'heart-pop': 'heart-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
				shimmer: 'shimmer 1.8s infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
