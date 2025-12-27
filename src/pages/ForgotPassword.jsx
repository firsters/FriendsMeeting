import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, LockKeyhole, CheckCircle, ArrowRight, ShieldCheck, MailCheck } from 'lucide-react';
import { Input, Button } from '../components/UI';

const ForgotPassword = ({ onBack }) => {
  // States: 'email' | 'confirmation' | 'reset' | 'success'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSendLink = (e) => {
    e.preventDefault();
    setStep('confirmation');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setStep('success');
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-slate-900 text-white font-sans overflow-hidden">
      {/* Top Navigation */}
      <div className="flex items-center p-6 justify-between sticky top-0 z-10 bg-slate-900/90 backdrop-blur-xl border-b border-white/5">
        <button 
          onClick={step === 'success' ? onBack : (step === 'email' ? onBack : () => setStep('email'))}
          className="flex size-12 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="w-12"></div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'email' && (
          <motion.div 
            key="email"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex flex-1 flex-col px-8 pt-10 pb-12 max-w-md mx-auto w-full"
          >
            <div className="flex justify-center mb-10">
              <div className="flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-primary-600/10 border border-primary-500/20 shadow-2xl relative group">
                <LockKeyhole size={48} className="text-primary-400 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-primary-500/5 blur-2xl rounded-full"></div>
              </div>
            </div>
            
            <div className="text-center mb-10 space-y-4">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic italic tracking-tighter">Forgot?</h1>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.15em] leading-relaxed max-w-[280px] mx-auto opacity-70">
                Don't worry! It happens. Enter your email below to receive a secure recovery link.
              </p>
            </div>

            <form onSubmit={handleSendLink} className="space-y-8 w-full">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <Input 
                  placeholder="name@example.com"
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full h-16 py-0 rounded-[1.5rem] text-sm tracking-[0.2em]">
                  Send Reset Link
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </div>
            </form>

            <div className="mt-auto pt-10 text-center">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-loose">
                Can't access email? <br/>
                <button className="text-primary-400 hover:text-primary-300 transition-colors mt-2">Contact Support</button>
              </p>
            </div>
          </motion.div>
        )}

        {step === 'confirmation' && (
          <motion.div 
            key="confirmation"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex flex-1 flex-col items-center justify-center px-8 py-12 w-full max-w-md mx-auto"
          >
            <div className="flex flex-col items-center gap-10 w-full">
              <div className="size-56 rounded-[3rem] bg-primary-600/10 border border-primary-500/20 flex items-center justify-center relative shadow-3xl group">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }} 
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute inset-8 rounded-full border border-primary-500/20 blur-sm"
                ></motion.div>
                <MailCheck size={96} className="text-primary-400 drop-shadow-2xl group-hover:rotate-6 transition-transform" />
              </div>

              <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic italic">Check Mail</h1>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.15em] leading-relaxed max-w-[280px] opacity-70">
                  Instructions for password recovery have been sent to your primary inbox.
                </p>
              </div>

              <div className="w-full space-y-4 pt-6">
                <Button onClick={() => setStep('reset')} className="w-full h-16 rounded-[1.5rem] text-sm tracking-[0.2em]">
                  Next to Reset
                </Button>
                <div className="text-center pt-4">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    No email? <button onClick={() => setStep('email')} className="text-primary-400 hover:text-primary-300">Resend Link</button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'reset' && (
          <motion.div 
            key="reset"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex flex-1 flex-col px-8 pt-6 pb-12 max-w-md mx-auto w-full"
          >
            <div className="mb-12">
              <h1 className="text-[42px] font-black tracking-tighter leading-tight mb-4 uppercase italic">New Secret</h1>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.15em] leading-relaxed max-w-[260px] opacity-70">
                Your new password must be unique and different from previous ones.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-8 w-full">
              <div className="space-y-3 group/input">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                <Input 
                  placeholder="At least 8 characters"
                  type={showPassword ? "text" : "password"}
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                {password.length > 0 && (
                  <div className="px-1 pt-2 flex flex-col gap-2">
                    <div className="flex gap-2 h-1.5 w-full">
                      <div className="h-full flex-1 rounded-full bg-yellow-500"></div>
                      <div className="h-full flex-1 rounded-full bg-yellow-500"></div>
                      <div className="h-full flex-1 rounded-full bg-slate-800"></div>
                      <div className="h-full flex-1 rounded-full bg-slate-800"></div>
                    </div>
                    <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">Medium Strength</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Secret</label>
                <Input 
                  placeholder="Re-enter password"
                  type={showPassword ? "text" : "password"}
                  icon={ShieldCheck}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pt-8">
                <Button type="submit" className="w-full h-18 py-0 rounded-[1.5rem] text-[15px] font-black tracking-[0.2em] shadow-primary-900/40">
                  Update Now
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex flex-1 flex-col items-center justify-center px-8 relative z-10 w-full max-w-md mx-auto"
          >
            {/* Background Grid Pattern from Stitch */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none scale-150">
              <svg height="100%" width="100%">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                 pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="mb-12">
              <div className="relative flex items-center justify-center w-40 h-40 rounded-[3rem] bg-primary-600/20 border border-primary-500/20 shadow-2xl group">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-[3.5rem] border border-primary-500/30"
                ></motion.div>
                <CheckCircle size={72} className="text-primary-400 font-bold group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <div className="text-center space-y-4 relative z-10">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic italic">Unlocked!</h1>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.15em] leading-relaxed max-w-[280px] mx-auto opacity-70">
                Your credentials have been successfully updated. You can now access your location networks with the new secret.
              </p>
            </div>

            <div className="w-full mt-24">
              <Button onClick={onBack} className="w-full h-18 py-0 rounded-[1.75rem] text-[15px] font-black tracking-[0.2em] shadow-primary-900/60">
                Back to Login
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;
