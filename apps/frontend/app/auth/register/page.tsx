'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  User,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { register } from '@/src/services/authService';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isFocused, setIsFocused] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('Password must contain at least one special character');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    setLoading(true);
    try {
      // Register handler
      await register(email, password, fullName);
      router.push('/auth/login');
    } catch (err: any) {
      let data = err?.response?.data;

      // Handle stringified JSON arrays
      if (typeof data === 'string' && data.trim().startsWith('[')) {
        try { data = JSON.parse(data); } catch {}
      } else if (data?.message && typeof data.message === 'string' && data.message.trim().startsWith('[')) {
        try { data.message = JSON.parse(data.message); } catch {}
      }

      if (Array.isArray(data)) {
        setError(data.map((e: any) => e.message || e).join(', '));
      } else if (data?.message) {
        if (Array.isArray(data.message)) {
          setError(data.message.map((e: any) => e.message || e).join(', '));
        } else {
          setError(data.message);
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest hover:text-sky-400 transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Home
      </Link>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* Register Card */}
      <div className="w-full max-w-[400px] relative z-10">
        
        <div className="flex flex-col items-center mb-12">
          <img 
            src="/icon_no_bg.png" 
            alt="PRESS Logo" 
            className="h-6 w-auto object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]"
          />
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.4em]">
              Create Profile
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          
          {/* Scanning Effect */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent animate-[scan_4s_linear_infinite]" />

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Full Name Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">
                Full Name
              </label>
              <div className={`relative transition-all duration-300 ${isFocused === 'fullName' ? 'scale-[1.01]' : ''}`}>
                <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors ${isFocused === 'fullName' ? 'text-sky-400' : 'text-slate-700'}`}>
                  <User size={16} />
                </div>
                <input 
                  type="text"
                  placeholder="John Doe"
                  onFocus={() => setIsFocused('fullName')}
                  onBlur={() => setIsFocused('')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-950/50 border border-slate-900 rounded-2xl py-4 pl-12 pr-4 text-sm font-mono text-white outline-none focus:border-sky-500/30 transition-all placeholder:text-slate-800"
                />
              </div>
            </div>
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">
                Email Address
              </label>
              <div className={`relative transition-all duration-300 ${isFocused === 'email' ? 'scale-[1.01]' : ''}`}>
                <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors ${isFocused === 'email' ? 'text-sky-400' : 'text-slate-700'}`}>
                  <Mail size={16} />
                </div>
                <input 
                  type="email"
                  placeholder="name@email.com"
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused('')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950/50 border border-slate-900 rounded-2xl py-4 pl-12 pr-4 text-sm font-mono text-white outline-none focus:border-sky-500/30 transition-all placeholder:text-slate-800"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">
                Password
              </label>
              <div className={`relative transition-all duration-300 ${isFocused === 'password' ? 'scale-[1.01]' : ''}`}>
                <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors ${isFocused === 'password' ? 'text-sky-400' : 'text-slate-700'}`}>
                  <Lock size={16} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused('')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950/50 border border-slate-900 rounded-2xl py-4 pl-12 pr-12 text-sm font-mono text-white outline-none focus:border-sky-500/30 transition-all placeholder:text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors hover:text-sky-400 ${isFocused === 'password' ? 'text-sky-400' : 'text-slate-600'}`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">
                Confirm Password
              </label>
              <div className={`relative transition-all duration-300 ${isFocused === 'confirmPassword' ? 'scale-[1.01]' : ''}`}>
                <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors ${isFocused === 'confirmPassword' ? 'text-sky-400' : 'text-slate-700'}`}>
                  <Lock size={16} />
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  onFocus={() => setIsFocused('confirmPassword')}
                  onBlur={() => setIsFocused('')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950/50 border border-slate-900 rounded-2xl py-4 pl-12 pr-12 text-sm font-mono text-white outline-none focus:border-sky-500/30 transition-all placeholder:text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors hover:text-sky-400 ${isFocused === 'confirmPassword' ? 'text-sky-400' : 'text-slate-600'}`}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-mono text-center">{error}</p>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full group relative py-4 bg-sky-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all overflow-hidden mt-4 disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <span className="relative z-10 flex items-center justify-center gap-2 italic">
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" /> Verifying...</>
                ) : (
                  <>Register </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            <Link href="/auth/login" className="text-[9px] font-mono text-slate-600 hover:text-sky-400 uppercase tracking-[0.2em] transition-colors italic">
              Existing User? <span className="text-sky-500/50">Login</span>
            </Link>

          </div>
        </div>
      </div>

      <footer className="mt-12 text-[10px] font-mono text-slate-800 uppercase tracking-[0.4em]">
        PRESS.SYS // VER_1.0.4
      </footer>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100px); opacity: 0; }
          20% { opacity: 0.5; }
          80% { opacity: 0.5; }
          100% { transform: translateY(400px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
