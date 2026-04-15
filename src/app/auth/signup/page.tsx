'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { signUp, signInWithGoogle, getErrorMessage } from '@/lib/services/authService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser, setRole } = useAuthStore();

  const afterAuth = (user: any) => {
    setUser(user);
    setRole(user.role ?? 'user');
    document.cookie = `auth-token=${user.uid}; path=/; max-age=604800`;
    document.cookie = `auth-role=${user.role ?? 'user'}; path=/; max-age=604800`;
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await signUp(email, password, name);
      toast.success('Account created! Welcome to Zest & Partners 🎉');
      afterAuth(user);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      toast.success('Welcome! Account ready 🎉');
      afterAuth(user);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 border border-[var(--border-default)] shadow-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center leading-none group mb-6">
            <span className="text-2xl font-bold text-black uppercase tracking-[0.2em]">ZEST</span>
            <span className="text-[10px] font-medium text-[var(--neutral-500)] uppercase tracking-[0.3em] mt-0.5">&amp; PARTNERS</span>
          </Link>
          <h1 className="text-2xl font-bold text-black">Create an account</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Join and start shopping today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          {[
            { id: 'name', label: 'Full Name', type: 'text', value: name, set: setName, icon: User, placeholder: 'Your name', autocomplete: 'name' },
            { id: 'email', label: 'Email', type: 'email', value: email, set: setEmail, icon: Mail, placeholder: 'your@email.com', autocomplete: 'email' },
          ].map(({ id, label, type, value, set, icon: Icon, placeholder, autocomplete }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-[12px] font-bold uppercase tracking-widest text-black mb-2">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
                <input
                  id={id}
                  type={type}
                  required
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[var(--border-default)] focus:outline-none focus:border-black transition-colors text-sm"
                  placeholder={placeholder}
                  autoComplete={autocomplete}
                />
              </div>
            </div>
          ))}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-[12px] font-bold uppercase tracking-widest text-black mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-[var(--border-default)] focus:outline-none focus:border-black transition-colors text-sm"
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neutral-400)] hover:text-black">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" required className="mt-0.5 w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[13px] text-[var(--text-secondary)]">
              I agree to the{' '}
              <Link href="/terms" className="font-bold text-black hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="font-bold text-black hover:underline">Privacy Policy</Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-black/90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-[var(--border-default)]" />
          <span className="text-[12px] text-[var(--neutral-400)] font-medium">OR</span>
          <div className="flex-1 h-px bg-[var(--border-default)]" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full h-12 border border-[var(--border-default)] flex items-center justify-center gap-3 text-[13px] font-medium text-black hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-[13px] text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-bold text-black hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
