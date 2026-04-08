'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Loader2, ShieldCheck, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

type View = 'login' | 'forgot' | 'forgot-step2' | 'success';

export function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const [view, setView] = useState<View>('login');

  // Login state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Forgot password state
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter the admin password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem('bhq-admin-auth', 'true');
        onSuccess();
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        if (nextAttempts >= 3) {
          setError('Too many failed attempts. Use "Forgot Password?" to reset.');
        } else {
          setError('Incorrect password. Please try again.');
        }
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!newPassword.trim()) {
      setResetError('Please enter a new password');
      return;
    }
    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetCode, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setView('success');
        // Reset all fields
        setPassword('');
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
        setAttempts(0);
        setError('');
      } else {
        setResetError(data.error || 'Failed to reset password.');
      }
    } catch {
      setResetError('Connection error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4">
      {/* Back to Store button — top right */}
      <button
        onClick={onBack}
        className="absolute top-5 right-5 flex items-center gap-2 rounded-xl border border-border bg-card/80 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <X className="h-4 w-4" />
        Back to Store
      </button>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <AnimatePresence mode="wait">
          {/* ─── LOGIN VIEW ─── */}
          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="rounded-2xl border border-border bg-card p-8 shadow-xl"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d79c4a]/10 mb-4">
                  <ShieldCheck className="h-7 w-7 text-[#d79c4a]" />
                </div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                  Admin Access
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your admin password to continue
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="Enter admin password"
                      className="pl-9 pr-10 border-border bg-background"
                      autoFocus
                      disabled={attempts >= 3}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  disabled={loading || attempts >= 3}
                  className="w-full gap-2 bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#d79c4a]/90 h-11"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-5 flex items-center justify-center">
                <button
                  onClick={() => { setView('forgot'); setError(''); }}
                  className="text-sm text-muted-foreground hover:text-[#d79c4a] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground/50">
                This area is restricted to authorized personnel only.
              </p>
            </motion.div>
          )}

          {/* ─── FORGOT PASSWORD — STEP 1: Enter reset code ─── */}
          {view === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-border bg-card p-8 shadow-xl"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d79c4a]/10 mb-4">
                  <KeyRound className="h-7 w-7 text-[#d79c4a]" />
                </div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                  Reset Password
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your recovery code to set a new password
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setResetError(''); if (resetCode.trim()) setView('forgot-step2'); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetCode" className="text-foreground">
                    Recovery Code
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="resetCode"
                      type="text"
                      value={resetCode}
                      onChange={(e) => { setResetCode(e.target.value); setResetError(''); }}
                      placeholder="Enter your recovery code"
                      className="pl-9 border-border bg-background"
                      autoFocus
                    />
                  </div>
                </div>

                {resetError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    {resetError}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  disabled={!resetCode.trim()}
                  className="w-full gap-2 bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#d79c4a]/90 h-11"
                >
                  Continue
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </form>

              <div className="mt-5 flex items-center justify-center">
                <button
                  onClick={() => { setView('login'); setResetError(''); }}
                  className="text-sm text-muted-foreground hover:text-[#d79c4a] transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Login
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── FORGOT PASSWORD — STEP 2: Enter new password ─── */}
          {view === 'forgot-step2' && (
            <motion.div
              key="forgot-step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-border bg-card p-8 shadow-xl"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d79c4a]/10 mb-4">
                  <KeyRound className="h-7 w-7 text-[#d79c4a]" />
                </div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                  Set New Password
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a strong password (minimum 8 characters)
                </p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setResetError(''); }}
                      placeholder="Enter new password"
                      className="pl-9 pr-10 border-border bg-background"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setResetError(''); }}
                      placeholder="Confirm new password"
                      className="pl-9 border-border bg-background"
                    />
                  </div>
                </div>

                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                      <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                      <div className={`h-1 flex-1 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                      <div className={`h-1 flex-1 rounded-full ${/[^A-Za-z0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      8+ chars, uppercase, number, special char
                    </p>
                  </div>
                )}

                {resetError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    {resetError}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  disabled={resetLoading || !newPassword || !confirmPassword}
                  className="w-full gap-2 bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#d79c4a]/90 h-11"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-5 flex items-center justify-center">
                <button
                  onClick={() => { setView('forgot'); setResetError(''); }}
                  className="text-sm text-muted-foreground hover:text-[#d79c4a] transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── SUCCESS VIEW ─── */}
          {view === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-border bg-card p-8 shadow-xl text-center"
            >
              <div className="flex flex-col items-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4"
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </motion.div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                  Password Reset!
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your admin password has been changed successfully.
                </p>
              </div>

              <Button
                onClick={() => setView('login')}
                className="w-full gap-2 bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#d79c4a]/90 h-11"
              >
                <Lock className="h-4 w-4" />
                Sign In with New Password
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
