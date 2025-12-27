import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';

const Auth = ({ type = 'login', onBack, onSuccess }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(type === 'login');
  
  // The user reference has a single form structure. 
  // We'll adapt the text content dynamically based on isLogin state 
  // while keeping the exact styling from the provided HTML.

  return (
    <div className="relative flex flex-col w-full max-w-md mx-auto min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark shadow-xl transition-colors duration-200">
      
      {/* Back Button */}
      <div className="absolute top-0 left-0 p-4 z-10">
        <button 
          onClick={onBack}
          className="flex items-center justify-center size-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-900 dark:text-white">arrow_back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pt-12 pb-6">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="size-20 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary rotate-3 transform transition-transform hover:rotate-6 shadow-lg shadow-blue-500/10">
            <span className="material-symbols-outlined text-4xl">location_on</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            {isLogin ? (t('auth_welcome_back') || '다시 오신 것을 환영해요!') : (t('auth_join_title') || '새 계정 만들기')}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
            {isLogin ? (t('auth_desc_login') || '친구들의 위치를 확인하고 대화를 나눠보세요.') : (t('auth_desc_signup') || '친구들과 위치를 공유하고 약속을 잡아보세요.')}
          </p>
        </div>

        {/* Form Section */}
        <form className="flex flex-col gap-5 w-full" onSubmit={(e) => { e.preventDefault(); onSuccess(); }}>
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
              {t('auth_email_label') || '이메일 또는 사용자 이름'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">person</span>
              </div>
              <input 
                className="w-full h-14 pl-12 pr-4 bg-card-light dark:bg-input-dark border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                placeholder={t('auth_email_placeholder') || '사용자 정보를 입력하세요'} 
                type="text"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
              {t('auth_password_label') || '비밀번호'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">lock</span>
              </div>
              <input 
                className="w-full h-14 pl-12 pr-12 bg-card-light dark:bg-input-dark border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                placeholder={t('auth_password_placeholder') || '비밀번호를 입력하세요'} 
                type="password"
              />
              <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer focus:outline-none" type="button">
                <span className="material-symbols-outlined text-xl">visibility_off</span>
              </button>
            </div>
            
            {isLogin && (
              <div className="flex justify-end pt-1">
                <a className="text-sm font-medium text-primary hover:text-blue-500 transition-colors" href="#">
                   {t('auth_forgot_password') || '비밀번호를 잊으셨나요?'}
                </a>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Footer / Actions */}
      <div className="px-6 pb-8">
        <button 
          onClick={onSuccess}
          className="w-full h-14 bg-primary hover:bg-blue-600 active:scale-[0.98] text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mb-6"
        >
          <span>{isLogin ? (t('auth_login_btn') || '로그인') : (t('auth_signup_btn') || '회원가입')}</span>
          <span className="material-symbols-outlined text-xl">login</span>
        </button>

        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {isLogin ? (t('auth_no_account') || '계정이 없으신가요?') : (t('auth_has_account') || '이미 계정이 있으신가요?')}
          </span>
          <button 
            className="font-bold text-primary hover:text-blue-500 transition-colors"
            onClick={() => setIsLogin(!isLogin)}
          >
             {isLogin ? (t('auth_signup_link') || '회원가입') : (t('auth_login_link') || '로그인')}
          </button>
        </div>

        <div className="mt-8 mb-4 border-t border-gray-100 dark:border-gray-800 w-full relative">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background-light dark:bg-background-dark px-2 text-xs text-gray-400">
            {t('auth_or') || '또는'}
          </span>
        </div>

        <div className="flex justify-center gap-6">
          <button className="size-12 rounded-full bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12s5.333 12 11.947 12c3.6 0 6.347-1.187 8.44-3.427 2.173-2.173 2.813-5.24 2.813-7.653 0-.68-.053-1.347-.147-2H12.48z"></path></svg>
          </button>
          <button className="size-12 rounded-full bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
             <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"></path></svg>
          </button>
          <button className="size-12 rounded-full bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
             <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.684.81-1.81 1.58-2.932 1.58-.028 0-.056 0-.084-.002-.12-1.28.36-2.52 1.055-3.33.684-.81 1.838-1.53 2.924-1.53.084 0 .163.004.214.004zM16.96 16.79c-1.21 1.76-2.07 3.01-3.69 3.01-.81 0-1.26-.48-2.34-.48-1.07 0-1.65.48-2.38.48-1.62 0-2.83-1.61-3.88-3.12-2.11-3.04-2.28-7.66 2.07-7.66 1.3 0 2.25.88 3.01.88.75 0 1.78-.88 3.32-.88 1.13 0 2.14.56 2.82 1.54-2.45 1.48-2.06 4.96.42 6.07-.15.48-.36.96-.54 1.34z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
