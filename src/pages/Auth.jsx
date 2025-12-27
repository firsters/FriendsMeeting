import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForgotPassword from './ForgotPassword';
import { useTranslation } from '../context/LanguageContext';

const Auth = ({ type = 'login', onBack, onSuccess }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(type === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  const mapBgUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDnDxG3dSGWecuREn3JtejWbiUFuaJeiVw3X4BH85kzNAZ5Mg-FEfdF8uFNNsdw3iic2KT9jPugu8psUu2n8ogAHZZptyRvXezcAvfSfXWG5-vWGwZ6Bbvau6EwzccSqHZpu9fvFX6C3EFnJhOHXX2_lgMQa4hdDTbKtNnBOW4Ot56zGHvDo0TQFgRT9QVpRqHmzqMDRpJ5CJbtV0pMtdy2vP5cazIHcdqZw8vCqLVM9JH5X-swoK2Q8IIbfKxfVpHaTdtTORJhr74";

  return (
    <div className="relative flex min-h-full w-full flex-col justify-between overflow-x-hidden max-w-md mx-auto bg-background text-text font-sans antialiased">
      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1">
        {/* Header Section */}
        <div className="pt-xl pb-sm relative px-xs text-center">
          <div 
            className="absolute inset-x-0 top-0 h-[300px] opacity-10 pointer-events-none"
            style={{ 
              backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%), url("${mapBgUrl}")`,
              backgroundSize: '100% auto',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          
          {/* Logo Icon */}
          <div className="flex justify-center mb-sm relative z-10">
            <div className="w-16 h-16 bg-primary rounded-card flex items-center justify-center shadow-button transition-transform active:scale-95">
              <span className="material-symbols-outlined text-white text-3xl">location_on</span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-xxs">
            <h1 className="text-text tracking-tight text-h1 font-bold">
              {isLogin ? (t('auth_locate_connect') || 'Locate & Chat') : (t('auth_join_network') || 'Join Network')}
            </h1>
            <p className="text-text-secondary text-body font-regular">
              {isLogin ? (t('auth_locate_desc') || 'Sign in to see where your friends are.') : (t('auth_join_desc') || 'Join to share your journey.')}
            </p>
          </div>
        </div>

        {/* Login Form Area */}
        <div className="px-sm py-xs flex flex-col gap-sm relative z-10">
          <form className="flex flex-col gap-xs" onSubmit={(e) => { e.preventDefault(); onSuccess(); }}>
            {!isLogin && (
              <div className="flex flex-col gap-xxs">
                <label className="text-text text-caption font-semi-bold">{t('auth_nickname')}</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-text-secondary">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </span>
                  <input 
                    className="flex w-full rounded-DEFAULT text-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary border border-border bg-background h-12 pl-11 pr-4 text-body font-regular placeholder-text-placeholder transition-all"
                    placeholder={t('auth_nickname_placeholder')}
                    type="text"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-xxs">
              <label className="text-text text-caption font-semi-bold">{t('auth_email') || 'Email or Username'}</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-text-secondary">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </span>
                <input 
                  className="flex w-full rounded-DEFAULT text-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary border border-border bg-background h-12 pl-11 pr-4 text-body font-regular placeholder-text-placeholder transition-all"
                  placeholder={t('auth_email_placeholder') || 'Enter your email or username'}
                  type="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-xxs">
              <label className="text-text text-caption font-semi-bold">{t('auth_password') || 'Password'}</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-text-secondary">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <input 
                  className="flex w-full rounded-DEFAULT text-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary border border-border bg-background h-12 pl-11 pr-12 text-body font-regular transition-all placeholder-text-placeholder"
                  placeholder={t('auth_password_placeholder') || 'Enter your password'}
                  type={showPassword ? 'text' : 'password'}
                />
                <button 
                  className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center text-text-secondary hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end mt-[-4px]">
                <button 
                  className="text-primary text-caption font-semi-bold hover:underline transition-all"
                  onClick={() => setShowForgotPassword(true)}
                  type="button"
                >
                  {t('auth_forgot_password') || 'Forgot Password?'}
                </button>
              </div>
            )}

            <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-DEFAULT h-12 bg-primary text-white text-button font-bold leading-normal tracking-[0.015em] hover:bg-primary-dark active:scale-[0.98] transition-all shadow-button mt-2">
              <span className="truncate">{isLogin ? (t('auth_login') || 'Log In') : (t('auth_signup') || 'Sign Up')}</span>
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="relative flex py-xs items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-text-placeholder text-[10px] font-bold uppercase tracking-[0.1em]">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Social Buttons Grid */}
          <div className="grid grid-cols-2 gap-xs">
            <button className="flex items-center justify-center gap-2 h-12 rounded-DEFAULT border border-border bg-background-secondary hover:bg-border transition-colors group">
              <svg className="w-5 h-5 fill-text" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16.96 15.14C17.06 15.68 17.07 15.7 17.5 16.34C17.9 16.91 18.27 17.65 18.27 17.65C18.73 18.3 18.91 18.5 19.38 18.49C19.82 18.49 20.02 18.36 20.48 18.37C20.97 18.38 21.13 18.49 21.57 18.49C22.07 18.49 22.25 18.25 22.78 17.51C23.59 16.37 24 15.17 24 13.9C24 11.53 22.18 10.3 20.9 10.3C19.46 10.3 18.59 11.13 18.59 12.28C18.59 13.56 19.67 14.43 21.05 14.43C21.13 14.43 21.2 14.43 21.26 14.43C21.08 15.93 20.45 17.47 19.5 18.67C19.46 18.72 19.42 18.77 19.38 18.82C18.8 19.57 18.27 20.24 17.56 20.24C16.88 20.24 16.63 19.8 15.84 19.8C15.02 19.8 14.74 20.22 14.1 20.22C13.43 20.22 12.87 19.59 12.27 18.71C11.66 17.84 10.74 16.14 10.74 14.4C10.74 11.49 12.59 10 14.28 10C15.39 10 16.27 10.75 16.96 10.75C17.59 10.75 18.57 10 19.78 10C20.26 10 21.94 10.15 22.78 11.4C22.68 11.45 20.98 12.44 20.98 14.46C20.98 16.18 22.38 16.98 22.45 17.02C22.42 17.11 22.18 17.96 21.6 18.81C21.11 19.53 20.55 20.25 19.95 20.25C19.34 20.25 19.14 19.87 18.39 19.87C17.61 19.87 17.39 20.25 16.82 20.25C16.2 20.25 15.68 19.59 15.18 18.85C14.15 17.36 13.38 14.63 13.38 14.4C13.38 14.17 13.42 11.59 15.82 10.19C15.54 10.05 14.93 9.8 14.28 9.8C11.96 9.8 9.42 11.83 9.42 15.08C9.42 17.89 11.9 21.5 14.86 21.5C15.82 21.5 16.58 20.85 16.96 15.14ZM16.34 7.96C16.99 7.15 17.44 6.03 17.3 4.9C16.36 4.94 15.22 5.53 14.54 6.34C13.93 7.04 13.4 8.19 13.56 9.27C14.58 9.35 15.68 8.77 16.34 7.96Z"></path></svg>
            </button>
            <button className="flex items-center justify-center gap-2 h-12 rounded-DEFAULT border border-border bg-background-secondary hover:bg-border transition-colors group">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-sm py-lg flex flex-col items-center gap-xs relative z-10 border-t border-background-secondary">
        <p className="text-text-secondary text-body font-regular text-center">
          {isLogin ? (t('auth_no_account') || "Don't have an account?") : (t('auth_has_account') || "Already have an account?") } 
          <button 
            className="text-primary font-semi-bold hover:underline ml-1"
            onClick={() => setIsLogin(!isLogin)}
            type="button"
          >
            {isLogin ? (t('auth_signup') || 'Sign Up') : (t('auth_login') || 'Log In')}
          </button>
        </p>
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="material-symbols-outlined text-[16px] text-text-secondary">lock</span>
          <span className="text-text-secondary text-caption font-semi-bold uppercase tracking-wider">Secured connection</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
