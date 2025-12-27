import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, LockKeyhole, CheckCircle, ArrowRight, ShieldCheck, MailCheck } from 'lucide-react';
import { Input, Button } from '../components/UI';
import { useTranslation } from '../context/LanguageContext';

const ForgotPassword = ({ onBack }) => {
  const { t } = useTranslation();
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
              <h1 className="text-4xl font-black tracking-tighter uppercase italic tracking-tighter">{t('forgot_title')}</h1>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.15em] leading-relaxed max-w-[280px] mx-auto opacity-70">
                {t('forgot_desc')}
              </p>
            </div>

            <form onSubmit={handleSendLink} className="space-y-8 w-full">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('auth_email')}</label>
                <Input 
                  placeholder={t('auth_email_placeholder')}
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full h-16 py-0 rounded-[1.5rem] text-sm tracking-[0.2em]">
                  {t('forgot_send_link')}
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </div>
            </form>

            <div className="mt-auto pt-10 text-center">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-loose">
                이메일에 접근할 수 없나요? <br/>
                <button className="text-primary-400 hover:text-primary-300 transition-colors mt-2">{t('settings_help')}</button>
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
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">{t('forgot_check_mail')}</h1>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.15em] leading-relaxed max-w-[280px] opacity-70">
                  {t('forgot_check_desc')}
                </p>
              </div>

              <div className="w-full space-y-4 pt-6">
                <Button onClick={() => setStep('reset')} className="w-full h-16 rounded-[1.5rem] text-sm tracking-[0.2em]">
                  {t('forgot_new_password')}
                </Button>
                <div className="text-center pt-4">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    메일을 받지 못하셨나요? <button onClick={() => setStep('email')} className="text-primary-400 hover:text-primary-300">다시 보내기</button>
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
              <h1 className="text-[42px] font-black tracking-tighter leading-tight mb-4 uppercase italic">{t('forgot_new_password')}</h1>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.15em] leading-relaxed max-w-[260px] opacity-70">
                이전에 사용하지 않은 새로운 비밀번호를 설정해주세요.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-8 w-full">
              <div className="space-y-3 group/input">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('auth_password')}</label>
                <Input 
                  placeholder="최소 8자 이상 입력"
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
                    <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">보안 수준: 보통</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">비밀번호 확인</label>
                <Input 
                  placeholder="비밀번호를 다시 입력하세요"
                  type={showPassword ? "text" : "password"}
                  icon={ShieldCheck}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pt-8">
                <Button type="submit" className="w-full h-18 py-0 rounded-[1.5rem] text-[15px] font-black tracking-[0.2em] shadow-primary-900/40">
                  확인
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
                </pattern>
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
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">{t('forgot_reset_success')}</h1>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.15em] leading-relaxed max-w-[280px] mx-auto opacity-70">
                비밀번호가 성공적으로 업데이트되었습니다. 이제 새로운 비밀번호로 로그인하여 서비스를 이용하실 수 있습니다.
              </p>
            </div>

            <div className="w-full mt-24">
              <Button onClick={onBack} className="w-full h-18 py-0 rounded-[1.75rem] text-[15px] font-black tracking-[0.2em] shadow-primary-900/60">
                {t('forgot_back_to_login')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;
