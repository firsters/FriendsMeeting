import React, { useState } from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  updateProfile,
  signInWithEmailAndPassword
} from 'firebase/auth';

const Auth = ({ currentScreen, onNavigate, onLogin }) => {
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);
  
  // State for form fields
  const [signupData, setSignupData] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleSignup = async () => {
    const { nickname, email, password, confirmPassword } = signupData;
    setError('');
    
    if (!nickname || !email || !password || !confirmPassword) {
      setError(t('auth_error_required') || 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth_error_password_mismatch') || 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update nickname
      await updateProfile(user, {
        displayName: nickname
      });

      // Send verification email
      await sendEmailVerification(user);

      onNavigate(ScreenType.VERIFY_EMAIL);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async () => {
    const { email, password } = loginData;
    setError('');
    
    if (!email || !password) {
      setError(t('auth_error_required') || 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Please verify your email first.");
        // Optional: show resend email button or automatically send one
        // await sendEmailVerification(user); 
        // return; 
      }

      onLogin(); // Proceed to app
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setError('');
    if (resendCooldown > 0) return;

    if (auth.currentUser) {
      setLoading(true);
      try {
        await sendEmailVerification(auth.currentUser);
        alert(t('verify_email_sent_to') + auth.currentUser.email);
        setResendCooldown(60); // 60 seconds cooldown
      } catch (err) {
        console.error("Resend error:", err);
        if (err.code === 'auth/too-many-requests') {
          setError(t('auth_error_too_many_requests') || "Too many requests. Please wait a moment before trying again.");
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError("No user found. Please try signing up again.");
    }
  };

  const handleCheckVerification = async () => {
    if (auth.currentUser) {
      setLoading(true);
      try {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          onLogin();
        } else {
          setError("Email not verified yet. Please check your inbox.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

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

  const renderInput = (label, icon, placeholder, type = 'text', showToggle = false, value, onChange) => (
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
          value={value}
          onChange={onChange}
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

  const updateSignupField = (field, value) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const updateLoginField = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  switch (currentScreen) {
    case ScreenType.LOGIN: 
      return (
        <div className="flex flex-col h-full animate-fade-in-up">
          {renderHeader(t('welcome_title'), t('auth_locate_desc'), ScreenType.ONBOARDING)}
          <div className="flex-1 px-6 space-y-6 overflow-y-auto pb-10">
            {error && <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 p-3 rounded-xl">{error}</p>}
            {renderInput(t('auth_email'), "person", t('auth_email_placeholder'), 'email', false, loginData.email, (e) => updateLoginField('email', e.target.value))}
            <div className="space-y-2">
              {renderInput(t('auth_password'), "lock", "••••••••", "password", true, loginData.password, (e) => updateLoginField('password', e.target.value))}
              <div className="flex justify-end px-1">
                <button onClick={() => onNavigate(ScreenType.FORGOT_PASSWORD)} className="text-sm font-bold text-primary hover:text-blue-400 transition-colors">
                  {t('auth_forgot_password')}
                </button>
              </div>
            </div>
            <button 
              onClick={handleLoginSubmit}
              disabled={loading}
              className={`w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? 'Logging in...' : t('auth_login')}
              {!loading && <span className="material-symbols-outlined">login</span>}
            </button>
            <div className="flex items-center justify-center gap-2 pt-4">
              <span className="text-gray-500 font-medium">{t('auth_no_account')}</span>
              <button onClick={() => onNavigate(ScreenType.SIGNUP)} className="text-primary font-bold hover:underline transition-all">
                {t('auth_signup')}
              </button>
            </div>
          </div>
        </div>
      );

    case ScreenType.SIGNUP: 
      return (
        <div className="flex flex-col h-full animate-fade-in-up">
          {renderHeader(t('auth_join_network'), t('auth_join_desc'), ScreenType.ONBOARDING)}
          <div className="flex-1 px-6 space-y-5 overflow-y-auto pb-10">
            {error && <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 p-3 rounded-xl">{error}</p>}
            {renderInput(t('auth_nickname'), "person", t('auth_nickname_placeholder'), 'text', false, signupData.nickname, (e) => updateSignupField('nickname', e.target.value))}
            {renderInput(t('auth_email'), "mail", t('auth_email_placeholder'), 'email', false, signupData.email, (e) => updateSignupField('email', e.target.value))}
            {renderInput(t('auth_password'), "lock", "••••••••", "password", true, signupData.password, (e) => updateSignupField('password', e.target.value))}
            {renderInput(t('confirm'), "verified_user", "••••••••", "password", false, signupData.confirmPassword, (e) => updateSignupField('confirmPassword', e.target.value))}
            
            <div className="pt-4">
              <button 
                onClick={handleSignup}
                disabled={loading}
                className={`w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : t('auth_signup')}
                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </div>
          </div>
        </div>
      );

    case ScreenType.VERIFY_EMAIL:
      return (
        <div className="flex flex-col h-full animate-fade-in-up items-center justify-center text-center px-10">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-10 shadow-2xl">
            <span className="material-symbols-outlined text-primary text-6xl">outgoing_mail</span>
          </div>
          {error && <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 p-3 rounded-xl mb-6">{error}</p>}
          <h1 className="text-4xl font-extrabold text-white mb-4">{t('verify_email_title')}</h1>
          <p className="text-gray-400 font-medium mb-10 leading-relaxed">
            {t('verify_email_sent_to')} <span className="text-white font-bold">{signupData.email || 'your email'}</span>.<br/>{t('verify_email_check_inbox')}
          </p>
          
          <button 
            onClick={handleCheckVerification}
            disabled={loading}
            className={`w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98] ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Checking...' : t('verify_email_verified_btn')}
          </button>

          <p className="mt-8 text-gray-500 font-medium">
            {t('verify_email_no_receive')} <button 
              onClick={handleResendEmail} 
              disabled={loading || resendCooldown > 0}
              className={`text-primary font-bold hover:underline transition-all ${loading || resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? '...' : (resendCooldown > 0 ? `${resendCooldown}s` : t('verify_email_resend'))}
            </button>
          </p>
          
          <button onClick={() => onNavigate(ScreenType.SIGNUP)} className="mt-8 text-gray-500 font-bold flex items-center justify-center gap-2 mx-auto hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t('verify_email_back_to_signup')}
          </button>
        </div>
      );

    case ScreenType.FORGOT_PASSWORD: 
      return (
        <div className="flex flex-col h-full animate-fade-in-up text-center">
          <div className="pt-20 px-6 overflow-y-auto pb-10">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-10">
              <span className="material-symbols-outlined text-primary text-5xl">lock_reset</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-4">{t('forgot_title')}</h1>
            <p className="text-gray-400 font-medium mb-12">{t('forgot_desc')}</p>
            
            <div className="text-left mb-10">
              {renderInput(t('auth_email'), "mail", t('auth_email_placeholder'))}
            </div>

            <button 
              onClick={() => onNavigate(ScreenType.CHECK_MAIL)}
              className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98]"
            >
              {t('forgot_send_link')}
            </button>
            
            <button onClick={() => onNavigate(ScreenType.LOGIN)} className="mt-8 text-gray-500 font-bold flex items-center justify-center gap-2 mx-auto hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              {t('forgot_back_to_login')}
            </button>
          </div>
        </div>
      );

    case ScreenType.CHECK_MAIL: 
      return (
        <div className="flex flex-col h-full animate-fade-in-up items-center justify-center text-center px-10">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-10">
            <span className="material-symbols-outlined text-primary text-6xl">mark_email_read</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">{t('forgot_check_mail')}</h1>
          <p className="text-gray-400 font-medium mb-10 leading-relaxed">{t('forgot_check_desc')}</p>
          
          <button 
            onClick={() => onNavigate(ScreenType.RESET_PASSWORD)}
            className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
          >
            {t('continue')}
          </button>

          <p className="mt-8 text-gray-500 font-medium">
            Didn't receive email? <button className="text-primary font-bold hover:underline transition-all">Resend</button>
          </p>
        </div>
      );

    case ScreenType.RESET_PASSWORD: 
      return (
        <div className="flex flex-col h-full animate-fade-in-up">
          {renderHeader(t('forgot_title'), t('forgot_desc'))}
          <div className="px-6 space-y-8 overflow-y-auto pb-10">
            <div className="space-y-4">
              {renderInput(t('forgot_new_password'), "lock", t('forgot_new_password_placeholder'), "password", true)}
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
            {renderInput(t('confirm'), "lock_reset", t('forgot_confirm_password_placeholder'), "password")}
            <button 
              onClick={() => onNavigate(ScreenType.PASSWORD_UPDATED)}
              className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98]"
            >
              {t('confirm')}
            </button>
          </div>
        </div>
      );

    case ScreenType.PASSWORD_UPDATED: 
      return (
        <div className="flex flex-col h-full animate-fade-in-up items-center justify-center text-center px-10">
          <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mb-10 animate-pulse">
            <span className="material-symbols-outlined text-green-500 text-6xl">check_circle</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">{t('forgot_reset_success')}</h1>
          <p className="text-gray-400 font-medium mb-10 leading-relaxed">{t('forgot_reset_success_desc')}</p>
          
          <button 
            onClick={() => onNavigate(ScreenType.LOGIN)}
            className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
          >
            {t('forgot_back_to_login')}
          </button>
        </div>
      );

    default: 
      return (
        <div className="flex flex-col h-full animate-fade-in-up">
          {renderHeader(t('welcome_title'), t('auth_locate_desc'), ScreenType.ONBOARDING)}
          <div className="flex-1 px-6 space-y-6 overflow-y-auto pb-10">
            {renderInput(t('auth_email'), "person", t('auth_email_placeholder'))}
            <div className="space-y-2">
              {renderInput(t('auth_password'), "lock", "••••••••", "password", true)}
              <div className="flex justify-end px-1">
                <button onClick={() => onNavigate(ScreenType.FORGOT_PASSWORD)} className="text-sm font-bold text-primary hover:text-blue-400 transition-colors">
                  {t('auth_forgot_password')}
                </button>
              </div>
            </div>
            <button 
              onClick={onLogin}
              className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {t('auth_login')}
              <span className="material-symbols-outlined">login</span>
            </button>
          </div>
        </div>
      );
  }
};

export default Auth;
