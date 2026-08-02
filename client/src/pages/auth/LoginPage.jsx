import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Logo from '../../components/ui/Logo';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import useAuthStore from '../../stores/useAuthStore';
import useCoupleStore from '../../stores/useCoupleStore';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const fetchCouple = useCoupleStore((state) => state.fetchCouple);

  const inviteCodeFromUrl = searchParams.get('code');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Send OTP email, 2: Enter 6-digit OTP code & New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        const { user, accessToken, refreshToken } = res.data;
        setAuth(user, accessToken, refreshToken);
        await fetchCouple();

        if (res.data.deletionCancelledNotice) {
          toast.success('Account deletion request automatically cancelled because you logged back in!');
        } else {
          toast.success('Welcome back to Pairly!');
        }

        if (inviteCodeFromUrl) {
          navigate(`/pair?code=${inviteCodeFromUrl}`);
        } else {
          navigate('/');
        }
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Step 1: Send 6-digit OTP code to email
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your account email address.');
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (res.success) {
        toast.success('6-digit reset code sent to your email!');
        setForgotStep(2);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send reset code.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Forgot Password Step 2: Verify 6-digit OTP code & reset password
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    if (!otpCode || !newPassword) {
      toast.error('Please enter the 6-digit code and your new password.');
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        code: otpCode,
        newPassword,
      });

      if (res.success) {
        toast.success('Password reset successfully! Please log in.');
        setIsForgotModalOpen(false);
        setForgotStep(1);
        setForgotEmail('');
        setOtpCode('');
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid verification code.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <SEO
        title="Log In — Pairly Private Sanctuary"
        description="Log in to access your shared relationship sanctuary, letters, memory timeline, and chat."
      />
      <div className="absolute w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="lg" className="mb-4" />
          <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-sm text-rose-200/60 mt-1">Enter your details to access your shared universe</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full py-3 text-base font-bold mt-2">
            Log In
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-rose-200/60">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-rose-400 font-semibold hover:underline">
            Register together
          </Link>
        </div>
      </motion.div>

      {/* Forgot Password Modal (OTP Verification Flow) */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => {
          setIsForgotModalOpen(false);
          setForgotStep(1);
        }}
        title="Reset Account Password"
      >
        {forgotStep === 1 ? (
          /* Step 1: Send OTP email */
          <form onSubmit={handleSendResetCode} className="flex flex-col gap-4">
            <p className="text-xs text-rose-200/70">
              Enter your account email. We will send a 6-digit verification code to reset your password.
            </p>
            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              icon={Mail}
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <Button type="submit" isLoading={isForgotLoading} className="w-full font-bold mt-2">
              Send 6-Digit Reset Code
            </Button>
          </form>
        ) : (
          /* Step 2: Verify 6-digit OTP & Set New Password */
          <form onSubmit={handleVerifyOtpAndReset} className="flex flex-col gap-4">
            <p className="text-xs text-rose-200/70">
              We sent a 6-digit code to <strong className="text-white">{forgotEmail}</strong>. Enter the code and your new password below.
            </p>
            <Input
              label="6-Digit Verification Code"
              placeholder="e.g. 123456"
              icon={KeyRound}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              required
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Button type="submit" isLoading={isForgotLoading} className="w-full font-bold mt-2">
              Verify Code & Reset Password
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LoginPage;
