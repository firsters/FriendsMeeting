/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. 색상 팔레트 (Color Palette)
      colors: {
        primary: {
          DEFAULT: '#4285F4', // 기본 브랜드 색상 (Google Blue 계열)
          light: '#61A3F8',
          dark: '#356ACF',
        },
        accent: {
          DEFAULT: '#34A853', // 보조 강조 색상 (Google Green 계열)
        },
        background: {
          DEFAULT: '#FFFFFF', // 주 배경
          secondary: '#F5F5F5', // 보조 배경/구분
        },
        text: {
          DEFAULT: '#212121', // 기본 텍스트
          secondary: '#757575', // 보조 텍스트/캡션
          placeholder: '#BDBDBD', // 플레이스홀더/비활성
        },
        border: {
          DEFAULT: '#E0E0E0', // 경계선/구분선
        },
        status: {
          success: '#34A853',
          warning: '#F9AB00',
          error: '#EA4335',
        },
      },
      // 2. 타이포그래피 (Typography)
      fontFamily: {
        sans: ['Roboto', 'Noto Sans KR', 'sans-serif'],
        display: ['Roboto', 'Noto Sans KR', 'sans-serif'],
      },
      fontSize: {
        'h1': ['24px', { lineHeight: '36px' }],
        'h2': ['18px', { lineHeight: '27px' }],
        'body': ['14px', { lineHeight: '21px' }],
        'caption': ['12px', { lineHeight: '18px' }],
        'button': ['16px', { lineHeight: '24px' }],
        'nickname': ['12px', { lineHeight: '18px' }],
      },
      fontWeight: {
        regular: '400',
        'semi-bold': '600',
        bold: '700',
      },
      // 3. 간격 (Spacing) - 기본 8px 단위
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '48px',
      },
      // 4. 모서리 반경 (Corner Radii)
      borderRadius: {
        'DEFAULT': '8px',
        'card': '12px',
        'chat-bubble': '16px',
      },
      // 5. 그림자 (Shadows)
      boxShadow: {
        'button': '0px 2px 4px rgba(0, 0, 0, 0.2)',
        'chat-image': '0px 1px 3px rgba(0, 0, 0, 0.1)',
        'fab': '0px 4px 8px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
