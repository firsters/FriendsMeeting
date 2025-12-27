import React, { useState } from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';

const Auth = ({ currentScreen, onNavigate, onLogin }) => {
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);

  const renderHeader = (title, desc, backTo) => (
    <header className="px-6 pt-10 pb-8">
      {backTo && (
        <button onClick={() => onNavigate(backTo)} className="mb-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
      )}
      <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight font-display mb-4">{title}</h1>
      <p className="text-gray-400 font-medium leading-relaxed">{desc}</p>
    </header>
  );

  const renderInput = (label, icon, placeholder, type = 'text', showToggle = false) => (
    <div className="space-y-2 group">
      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-4 text-gray-500 group-focus-within:text-primary transition-colors">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </span>
        <input 
          className="w-full h-14 bg-card-dark border border-white/5 rounded-2xl pl-12 pr-12 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base outline-none"
          type={showToggle && showPass ? 'text' : type}
          placeholder={placeholder}
        />
        {showToggle && (
          <button 
            type="button" 
            onClick={() => setShowPass(!showPass)}
            className="absolute right-4 text-gray-500 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPass ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        )}
      </div>
    </div>
  );

  const LoginScreen = () => (
    <div className="flex flex-col h-full animate-fade-in-up">
      {renderHeader(t('auth_login_title') || "Welcome Back", t('auth_login_desc') || "Sign in to see where your friends are and catch up.", ScreenType.ONBOARDING)}
      <div className="flex-1 px-6 space-y-6">
        {renderInput(t('auth_email_label') || "Email or Username", "person", t('auth_email_placeholder') || "Enter email or username")}
        <div className="space-y-2">
          {renderInput(t('auth_password_label') || "Password", "lock", t('auth_password_placeholder') || "Enter your password", "password", true)}
          <div className="flex justify-end px-1">
            <button onClick={() => onNavigate(ScreenType.FORGOT_PASSWORD)} className="text-sm font-bold text-primary hover:text-blue-400 transition-colors">
              {t('auth_forgot_password') || "Forgot Password?"}
            </button>
          </div>
        </div>
        <button 
          onClick={onLogin}
          className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {t('auth_login') || "Sign In"}
          <span className="material-symbols-outlined">login</span>
        </button>
        <div className="flex items-center justify-center gap-2 pt-4">
          <span className="text-gray-500 font-medium">{t('auth_no_account') || "New here?"}</span>
          <button onClick={() => onNavigate(ScreenType.SIGNUP)} className="text-primary font-bold hover:underline transition-all">
            {t('auth_signup') || "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );

  const SignupScreen = () => (
    <div className="flex flex-col h-full animate-fade-in-up">
      {renderHeader(t('auth_signup_title') || "Join Us", t('auth_signup_desc') || "Create an account to start sharing your world with friends.", ScreenType.LOGIN)}
      <div className="flex-1 px-6 space-y-5">
        {renderInput(t('auth_nickname') || "Full Name", "person", "Alex Doe")}
        {renderInput(t('auth_email') || "Email Address", "mail", "alex@example.com")}
        {renderInput(t('auth_password') || "Password", "lock", "••••••••", "password", true)}
        {renderInput(t('auth_confirm_password') || "Confirm Password", "verified_user", "••••••••", "password")}
        
        <div className="pt-4">
          <button 
            onClick={onLogin}
            className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {t('auth_create_account') || "Create Account"}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );

  const ForgotPasswordScreen = () => (
    <div className="flex flex-col h-full animate-fade-in-up text-center">
      <div className="pt-20 px-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-10">
          <span className="material-symbols-outlined text-primary text-5xl">lock_reset</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-4">{t('auth_forgot_password_title') || "Forgot Password?"}</h1>
        <p className="text-gray-400 font-medium mb-12">{t('auth_forgot_password_desc') || "No worries! Enter your email and we'll send you a link to reset your password."}</p>
        
        <div className="text-left mb-10">
          {renderInput(t('auth_email') || "Email Address", "mail", "name@example.com")}
        </div>

        <button 
          onClick={() => onNavigate(ScreenType.CHECK_MAIL)}
          className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98]"
        >
          {t('auth_send_reset_link') || "Send Reset Link"}
        </button>
        
        <button onClick={() => onNavigate(ScreenType.LOGIN)} className="mt-8 text-gray-500 font-bold flex items-center justify-center gap-2 mx-auto hover:text-white transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {t('auth_back_to_login') || "Back to Login"}
        </button>
      </div>
    </div>
  );

  const CheckMailScreen = () => (
    <div className="flex flex-col h-full animate-fade-in-up items-center justify-center text-center px-10">
      <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-10">
        <span className="material-symbols-outlined text-primary text-6xl">mark_email_read</span>
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-4">{t('auth_check_mail_title') || "Check your mail"}</h1>
      <p className="text-gray-400 font-medium mb-10 leading-relaxed">{t('auth_check_mail_desc') || "We have sent password recovery instructions to your email."}</p>
      
      <button 
        onClick={() => onNavigate(ScreenType.RESET_PASSWORD)}
        className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
      >
        {t('auth_go_to_email') || "Go to Email App"}
      </button>

      <p className="mt-8 text-gray-500 font-medium">
        {t('auth_no_receive_mail') || "Didn't receive email?"} <button className="text-primary font-bold hover:underline transition-all">{t('auth_resend') || "Resend"}</button>
      </p>
    </div>
  );

  const ResetPasswordScreen = () => (
    <div className="flex flex-col h-full animate-fade-in-up">
      {renderHeader(t('auth_reset_password_title') || "Reset Password", t('auth_reset_password_desc') || "Your new password must be different from previously used passwords.")}
      <div className="px-6 space-y-8">
        <div className="space-y-4">
          {renderInput(t('auth_new_password_label') || "New Password", "lock", t('auth_new_password_placeholder') || "Enter at least 8 characters", "password", true)}
          <div className="px-1 pt-1 space-y-2">
            <div className="flex gap-1.5 h-1.5 w-full">
              <div className="h-full flex-1 rounded-full bg-yellow-500"></div>
              <div className="h-full flex-1 rounded-full bg-yellow-500"></div>
              <div className="h-full flex-1 rounded-full bg-gray-800"></div>
              <div className="h-full flex-1 rounded-full bg-gray-800"></div>
            </div>
            <p className="text-xs font-bold text-yellow-500">{t('auth_password_strength_medium') || "Medium strength"}</p>
          </div>
        </div>
        {renderInput(t('auth_confirm_password_label') || "Confirm Password", "lock_reset", t('auth_confirm_password_placeholder') || "Re-enter your password", "password")}
        <button 
          onClick={() => onNavigate(ScreenType.PASSWORD_UPDATED)}
          className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98]"
        >
          {t('auth_reset_password_btn') || "Reset Password"}
        </button>
      </div>
    </div>
  );

  const PasswordUpdatedScreen = () => (
    <div className="flex flex-col h-full animate-fade-in-up items-center justify-center text-center px-10">
      <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mb-10 animate-pulse">
        <span className="material-symbols-outlined text-green-500 text-6xl">check_circle</span>
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-4">{t('auth_password_updated_title') || "Password Updated"}</h1>
      <p className="text-gray-400 font-medium mb-10 leading-relaxed">{t('auth_password_updated_desc') || "Your password has been changed successfully. You can now log in with your new credentials."}</p>
      
      <button 
        onClick={() => onNavigate(ScreenType.LOGIN)}
        className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
      >
        {t('auth_back_to_login') || "Back to Login"}
      </button>
    </div>
  );

  switch (currentScreen) {
    case ScreenType.LOGIN: return <LoginScreen />;
    case ScreenType.SIGNUP: return <SignupScreen />;
    case ScreenType.FORGOT_PASSWORD: return <ForgotPasswordScreen />;
    case ScreenType.CHECK_MAIL: return <CheckMailScreen />;
    case ScreenType.RESET_PASSWORD: return <ResetPasswordScreen />;
    case ScreenType.PASSWORD_UPDATED: return <PasswordUpdatedScreen />;
    default: return <LoginScreen />;
  }
};

export default Auth;
