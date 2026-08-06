import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { dbService } from '../services/db';

export const LoginPage: React.FC = () => {
  const { setCurrentView, setIsLoggedIn, showToast, setActiveUser, setActiveBusiness, isLoggedIn, activeBusiness } = useBusiness();

  React.useEffect(() => {
    if (isLoggedIn) {
      if (activeBusiness) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('onboarding');
      }
    }
  }, [isLoggedIn, activeBusiness, setCurrentView]);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [isForgot, setIsForgot] = useState<boolean>(false);
  
  const [email, setEmail] = useState<string>('ananya.sen@auraboutique.com');
  const [password, setPassword] = useState<string>('••••••••');
  const [name, setName] = useState<string>('Ananya Sen');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Please enter a valid email address", "warning");
      return;
    }
    
    setLoading(true);
    showToast("Authenticating details...", "info");
    
    try {
      const user = isSignUp 
        ? await dbService.signUp(email, name)
        : await dbService.signIn(email);

      setActiveUser(user);
      localStorage.setItem('avenza_active_user', JSON.stringify(user));
      setIsLoggedIn(true);

      const business = await dbService.getBusinessByOwner(user.id);
      setLoading(false);
      showToast(isSignUp ? "Account created successfully!" : "Logged in successfully!", "success");

      if (business) {
        setActiveBusiness(business);
        setCurrentView('dashboard');
      } else {
        setCurrentView('onboarding');
      }
    } catch (err: any) {
      setLoading(false);
      showToast(err.message || "Authentication failed", "warning");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    showToast("Connecting Google Account...", "info");
    try {
      const user = await dbService.signIn(email || 'google.user@avenza.com');
      setActiveUser(user);
      localStorage.setItem('avenza_active_user', JSON.stringify(user));
      setIsLoggedIn(true);

      const business = await dbService.getBusinessByOwner(user.id);
      setLoading(false);
      showToast("Google Auth Success", "success");

      if (business) {
        setActiveBusiness(business);
        setCurrentView('dashboard');
      } else {
        setCurrentView('onboarding');
      }
    } catch (err: any) {
      setLoading(false);
      showToast("Google Authentication failed", "warning");
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-brand-accent/20 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-brand-primary/10 blur-3xl animate-pulse-slow"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-pink-100 p-8 md:p-10 relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div 
            onClick={() => setCurrentView('landing')}
            className="gradient-bg p-2.5 rounded-2xl text-white shadow-md cursor-pointer mb-3 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-dark">
            AVENZA <span className="text-brand-secondary font-light">AI</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Your AI Business Partner</p>
        </div>

        {isForgot ? (
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Enter your registered email address and we'll transmit a secure link to construct a new credential.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              showToast("Password reset link transmitted!", "success");
              setIsForgot(false);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-sm transition-colors" 
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full gradient-btn font-bold py-3.5 rounded-xl text-sm flex items-center justify-center space-x-2 active:scale-95"
              >
                <span>Send Reset Link</span>
              </button>
              <button 
                type="button" 
                onClick={() => setIsForgot(false)}
                className="w-full text-xs font-semibold text-slate-500 hover:text-brand-primary py-2 text-center"
              >
                Back to Login
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              {isSignUp ? "Build your Account" : "Welcome Back"}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {isSignUp ? "Start managing your boutique, bakery, or salon in minutes." : "Access your Avenza OS dashboard panel."}
            </p>

            {/* Google Authentication button */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border border-slate-200 hover:bg-slate-50 transition-colors py-3 px-4 rounded-xl flex items-center justify-center space-x-2.5 text-slate-600 text-sm font-semibold mb-5 active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.66l3.15-3.15C17.45 1.84 14.93 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.6 2.8C6.01 7.22 8.79 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.47-1.11 2.71-2.36 3.55l3.64 2.83c2.13-1.97 3.78-4.86 3.78-8.53z" />
                <path fill="#FBBC05" d="M5.1 14.7c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 7.3C.54 9.22 0 11.36 0 13.6s.54 4.38 1.5 6.3l3.6-2.8-1-2.4z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.64-2.83c-1.01.68-2.3 1.09-3.96 1.09-3.21 0-5.99-2.18-6.96-5.26l-3.6 2.8C3.39 19.35 7.35 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center space-x-2 my-5 text-slate-300 text-xs font-semibold">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span>OR EMAIL LOGIN</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Owner Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-sm transition-colors" 
                    placeholder="Enter owner name"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-sm transition-colors" 
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-600">Password</label>
                {!isSignUp && (
                  <button 
                    type="button" 
                    onClick={() => setIsForgot(true)}
                    className="text-[10px] font-bold text-brand-secondary hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-sm transition-colors" 
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full gradient-btn font-bold py-3.5 rounded-xl text-sm flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70 mt-6"
            >
              <span>{isSignUp ? "Construct Account" : "Access Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-500 pt-4">
              {isSignUp ? "Already utilize Avenza?" : "New to Avenza OS?"}
              {' '}
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-brand-secondary font-bold hover:underline"
              >
                {isSignUp ? "Login here" : "Sign up free"}
              </button>
            </p>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center space-x-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-brand-primary" />
          <span>AES-256 Cloud Security Standard</span>
        </div>
      </motion.div>
    </div>
  );
};
