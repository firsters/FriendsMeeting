import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, MapPin, ArrowRight, ChevronLeft, Github, Chrome } from 'lucide-react';
import { Button, Input } from '../components/UI';
import ForgotPassword from './ForgotPassword';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-900 text-white overflow-hidden max-w-md mx-auto shadow-2xl">
      {/* Top App Bar from Stitch Registration */}
      <div className="flex items-center px-4 py-4 justify-between bg-transparent sticky top-0 z-10 backdrop-blur-md">
        <button 
          onClick={() => setIsLogin(true)} 
          className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="size-10"></div>
      </div>

      <main className="flex-1 flex flex-col px-8 pb-8 w-full">
        {/* Header Section with Stitch Aesthetic */}
        <div className="mb-10 relative">
          <div className="absolute -right-12 -top-12 w-40 h-40 opacity-10 pointer-events-none rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-transparent"></div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {isLogin ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-primary-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary-900/40 mb-6 ring-4 ring-slate-800 backdrop-blur-sm">
                    <MapPin size={36} className="text-white" />
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tighter mb-2 leading-none">Locate & Chat</h1>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">Sign in to see where your friends are.</p>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-extrabold tracking-tighter mb-3 leading-none">Create Account</h1>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">Start sharing your location with friends.</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Form Section */}
        <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); onAuthSuccess(); }}>
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nickname</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                  <User size={20} />
                </div>
                <input 
                  className="w-full h-16 bg-slate-800/50 border-white/5 rounded-3xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/30 focus:bg-slate-800 transition-all placeholder:text-slate-600 shadow-inner"
                  placeholder="e.g. TravelerTom"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                <Mail size={20} />
              </div>
              <input 
                type="email"
                className="w-full h-16 bg-slate-800/50 border-white/5 rounded-3xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/30 focus:bg-slate-800 transition-all placeholder:text-slate-600 shadow-inner"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
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
                  Forgot Password?
              </button>
            </div>
          )}

          <div className="h-2"></div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-16 bg-primary-600 hover:bg-primary-500 text-white rounded-[1.5rem] font-bold text-sm tracking-widest uppercase shadow-2xl shadow-primary-900/40 flex items-center justify-center gap-3 transition-all"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
            <ArrowRight size={20} />
          </motion.button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-900 px-4">Or continue with</div>
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
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-400 ml-2 hover:text-primary-300 transition-colors"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </footer>
    </div>
  );
};

export default Auth;
