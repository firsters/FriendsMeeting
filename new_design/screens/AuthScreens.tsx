
import React, { useState } from 'react';
import { ScreenType } from '../types';

interface AuthScreensProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onLogin: () => void;
}

const AuthScreens: React.FC<AuthScreensProps> = ({ currentScreen, onNavigate, onLogin }) => {
  const [showPass, setShowPass] = useState(false);

  const renderHeader = (title: string, desc: string, backTo?: ScreenType) => (
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

  const renderInput = (label: string, icon: string, placeholder: string, type: string = 'text', showToggle: boolean = false) => (
    <div className="space-y-2 group">
      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-4 text-gray-500 group-focus-within:text-primary transition-colors">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </span>
        <input 
          className="w-full h-14 bg-card-dark border border-white/5 rounded-2xl pl-12 pr-12 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base"
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
      {renderHeader("Welcome Back", "Sign in to see where your friends are and catch up.", ScreenType.ONBOARDING)}
      <div className="flex-1 px-6 space-y-6">
        {renderInput("Email or Username", "person", "Enter email or username")}
        <div className="space-y-2">
          {renderInput("Password", "lock", "Enter your password", "password", true)}
          <div className="flex justify-end px-1">
            <button onClick={() => onNavigate(ScreenType.FORGOT_PASSWORD)} className="text-sm font-bold text-primary hover:text-blue-400">Forgot Password?</button>
          </div>
        </div>
        <button 
          onClick={onLogin}
          className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
        >
          Sign In
          <span className="material-symbols-outlined">login</span>
        </button>
        <div className="flex items-center justify-center gap-2 pt-4">
          <span className="text-gray-500 font-medium">New here?</span>
          <button onClick={() => onNavigate(ScreenType.SIGNUP)} className="text-primary font-bold hover:underline">Create Account</button>
        </div>
      </div>
    </div>
  );

  const SignupScreen = () => (
    <div className="flex flex-col h-full animate-fade-in-up">
      {renderHeader("Join LocateMate", "Create an account to start sharing your world with friends.", ScreenType.LOGIN)}
      <div className="flex-1 px-6 space-y-5">
        {renderInput("Full Name", "person", "Alex Doe")}
        {renderInput("Email Address", "mail", "alex@example.com")}
        {renderInput("Password", "lock", "••••••••", "password", true)}
        {renderInput("Confirm Password", "verified_user", "••••••••", "password")}
        
        <div className="pt-4">
          <button 
            onClick={onLogin}
            className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
          >
            Create Account
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
        <h1 className="text-3xl font-extrabold text-white mb-4">Forgot Password?</h1>
        <p className="text-gray-400 font-medium mb-12">No worries! Enter your email and we'll send you a link to reset your password.</p>
        
        <div className="text-left mb-10">
          {renderInput("Email Address", "mail", "name@example.com")}
        </div>

        <button 
          onClick={() => onNavigate(ScreenType.CHECK_MAIL)}
          className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all"
        >
          Send Reset Link
        </button>
        
        <button onClick={() => onNavigate(ScreenType.LOGIN)} className="mt-8 text-gray-500 font-bold flex items-center justify-center gap-2 mx-auto">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Login
        </button>
      </div>
    </div>
  );

  const CheckMailScreen = () => (
    <div className="flex flex-col h-full animate-fade-in-up items-center justify-center text-center px-10">
      <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-10">
        <span className="material-symbols-outlined text-primary text-6xl">mark_email_read</span>
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-4">Check your mail</h1>
      <p className="text-gray-400 font-medium mb-10 leading-relaxed">We have sent password recovery instructions to your email. Please check your inbox and spam folder.</p>
      
      <button 
        onClick={() => onNavigate(ScreenType.RESET_PASSWORD)}
        className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg"
      >
        Go to Email App
      </button>

      <p className="mt-8 text-gray-500 font-medium">
        Didn't receive email? <button className="text-primary font-bold">Resend</button>
      </p>
    </div>
  );

  const ResetPasswordScreen = () => (
    <div className="flex flex-col h-full animate-fade-in-up">
      {renderHeader("Reset Password", "Your new password must be different from previously used passwords.")}
      <div className="px-6 space-y-8">
        <div className="space-y-4">
          {renderInput("New Password", "lock", "Enter at least 8 characters", "password", true)}
          <div className="px-1 pt-1 space-y-2">
            <div className="flex gap-1.5 h-1.5 w-full">
              <div className="h-full flex-1 rounded-full bg-yellow-500"></div>
              <div className="h-full flex-1 rounded-full bg-yellow-500"></div>
              <div className="h-full flex-1 rounded-full bg-gray-800"></div>
              <div className="h-full flex-1 rounded-full bg-gray-800"></div>
            </div>
            <p className="text-xs font-bold text-yellow-500">Medium strength</p>
          </div>
        </div>
        {renderInput("Confirm Password", "lock_reset", "Re-enter your password", "password")}
        <button 
          onClick={() => onNavigate(ScreenType.PASSWORD_UPDATED)}
          className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all"
        >
          Reset Password
        </button>
      </div>
    </div>
  );

  const PasswordUpdatedScreen = () => (
    <div className="flex flex-col h-full animate-fade-in-up items-center justify-center text-center px-10">
      <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mb-10 animate-pulse">
        <span className="material-symbols-outlined text-green-500 text-6xl">check_circle</span>
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-4">Password Updated</h1>
      <p className="text-gray-400 font-medium mb-10 leading-relaxed">Your password has been changed successfully. You can now log in with your new credentials.</p>
      
      <button 
        onClick={() => onNavigate(ScreenType.LOGIN)}
        className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg"
      >
        Back to Login
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

export default AuthScreens;
