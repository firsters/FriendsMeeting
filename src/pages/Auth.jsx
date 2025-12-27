import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, MapPin, ArrowRight, ChevronLeft, Github, Chrome } from 'lucide-react';
import { Button, Input } from '../components/UI';
import ForgotPassword from './ForgotPassword';
import { useTranslation } from '../context/LanguageContext';

const Auth = ({ onAuthSuccess }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-900 text-white overflow-hidden max-w-md mx-auto shadow-2xl">
      <div className="relative h-72 w-full overflow-hidden shrink-0">
        <img 
          src="/assets/auth_hero.png" 
          alt="Friends Meeting"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        {/* Top App Bar Overlaid */}
        <div className="absolute top-0 left-0 right-0 flex items-center px-4 py-4 justify-between bg-transparent z-10">
          <button 
            onClick={() => setIsLogin(true)} 
            className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        {/* Floating Icon from Stitch */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] ring-4 ring-slate-900 mb-2">
            <MapPin size={32} className="text-white" />
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col px-8 pb-8 w-full -mt-2 relative z-10">
        {/* Header Section with Stitch Aesthetic */}
        <div className="mb-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {isLogin ? (
                <>
                  <h1 className="text-3xl font-black tracking-tighter mb-1 uppercase italic italic tracking-tighter">{t('auth_locate_connect')}</h1>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">{t('auth_locate_desc')}</p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-black tracking-tighter mb-1 uppercase italic italic tracking-tighter">{t('auth_join_network')}</h1>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">{t('auth_join_desc')}</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Form Section */}
        <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); onAuthSuccess(); }}>
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('auth_nickname')}</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                  <User size={20} />
                </div>
                <input 
                  className="w-full h-16 bg-slate-800/50 border-white/5 rounded-3xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/30 focus:bg-slate-800 transition-all placeholder:text-slate-600 shadow-inner"
                  placeholder={t('auth_nickname_placeholder')}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('auth_email')}</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                <Mail size={20} />
              </div>
              <input 
                type="email"
                className="w-full h-16 bg-slate-800/50 border-white/5 rounded-3xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/30 focus:bg-slate-800 transition-all placeholder:text-slate-600 shadow-inner"
                placeholder={t('auth_email_placeholder')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">비밀번호</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                <Lock size={20} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'}
                className="w-full h-16 bg-slate-800/50 border-white/5 rounded-3xl pl-12 pr-14 text-sm font-bold focus:ring-2 focus:ring-primary-500/30 focus:bg-slate-800 transition-all placeholder:text-slate-600 shadow-inner"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 inset-y-0 px-4 flex items-center text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="flex justify-end pr-1">
              <button 
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[10px] font-bold text-primary-400 uppercase tracking-widest hover:text-primary-300 transition-colors"
                >
                  {t('auth_forgot_password')}
              </button>
            </div>
          )}

          <div className="h-2"></div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-16 bg-primary-600 hover:bg-primary-500 text-white rounded-[1.5rem] font-bold text-sm tracking-widest uppercase shadow-2xl shadow-primary-900/40 flex items-center justify-center gap-3 transition-all"
          >
            {isLogin ? t('auth_login') : t('auth_signup')}
            <ArrowRight size={20} />
          </motion.button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-900 px-4">{t('auth_or_continue_with')}</div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 h-14 rounded-2xl bg-white text-slate-900 flex items-center justify-center hover:bg-slate-100 transition-all font-bold group">
              <Chrome size={20} className="mr-2" />
            </button>
            <button className="flex-1 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center border border-white/5 hover:bg-slate-700 transition-all group">
              <Github size={20} className="mr-2" />
            </button>
          </div>
        </form>
      </main>

      <footer className="p-8 text-center pt-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {isLogin ? t('auth_no_account') : t('auth_has_account')}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-400 ml-2 hover:text-primary-300 transition-colors"
          >
            {isLogin ? t('auth_signup') : t('auth_login')}
          </button>
        </p>
      </footer>
    </div>
  );
};

export default Auth;
