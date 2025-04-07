/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
      },
  		colors: {
        // 仕様書に基づいたカラーパレット
        primary: {
          DEFAULT: '#00CBB3', // ティール
          light: '#4FDECB',
          dark: '#00A08E',
          '50': '#e6f9f7',
          '100': '#ccf3ef',
          '200': '#99e8df',
          '300': '#66dcce',
          '400': '#33d0be',
          '500': '#00CBB3',
          '600': '#00a28f',
          '700': '#00796b',
          '800': '#005148',
          '900': '#002824',
        },
        secondary: {
          DEFAULT: '#FFA500', // オレンジ
          light: '#FFB733',
          dark: '#CC8400',
          '50': '#fff8e6',
          '100': '#fff1cc',
          '200': '#ffe299',
          '300': '#ffd466',
          '400': '#ffc533',
          '500': '#FFA500',
          '600': '#cc8400',
          '700': '#996300',
          '800': '#664200',
          '900': '#332100',
        },
        accent: {
          DEFAULT: '#E64DFF', // パープル
          light: '#EC7AFF',
          dark: '#C41ED9',
          '50': '#fce6ff',
          '100': '#f9ccff',
          '200': '#f399ff',
          '300': '#ed66ff',
          '400': '#e733ff',
          '500': '#E64DFF',
          '600': '#b83ecc',
          '700': '#8a2e99',
          '800': '#5c1f66',
          '900': '#2e0f33',
        },
        background: '#F8F8F8', // ライトグレー
        text: '#002233', // ダークグレー
        
        // UIコンポーネント用
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: ['media', "class"],
};
