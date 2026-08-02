import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Calendar, AlertCircle, Sparkles, Heart } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Logo from '../../components/ui/Logo';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import useAuthStore from '../../stores/useAuthStore';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const inviteCodeFromUrl = searchParams.get('code');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    relationshipStartDate: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [welcomeUser, setWelcomeUser] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', formData);
      if (res.success && res.data) {
        const { user, accessToken, refreshToken } = res.data;
        setAuth(user, accessToken, refreshToken);
        setWelcomeUser(user);
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Error creating account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedAfterRegister = () => {
    if (inviteCodeFromUrl) {
      navigate(`/pair?code=${inviteCodeFromUrl}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <SEO
        title="Create Account — Pairly Private Sanctuary"
        description="Join Pairly to build your private couples sanctuary, seal future capsule letters, track milestones, and share daily moods."
      />
      <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Registration Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="lg" className="mb-4" />
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
          <p className="text-sm text-rose-200/60 mt-1">Start your private relationship sanctuary today</p>
        </div>

        {inviteCodeFromUrl && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/40 text-center text-xs text-rose-100 flex flex-col items-center gap-1 shadow-lg">
            <span className="font-extrabold text-amber-300 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Partner Invitation Received!
            </span>
            <span>You were invited with code <strong className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">{inviteCodeFromUrl}</strong>. Register below to accept!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Your Full Name"
            name="name"
            placeholder="e.g. Alex"
            icon={User}
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="alex@example.com"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            required
          />

          <CustomDatePicker
            label="Relationship Anniversary / Start Date"
            value={formData.relationshipStartDate}
            onChange={(val) => setFormData({ ...formData, relationshipStartDate: val })}
            placeholder="Select your anniversary date"
          />

          <Button type="submit" isLoading={isLoading} className="w-full py-3 text-base font-bold mt-2">
            Create Free Account
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-rose-200/60">
          Already registered?{' '}
          <Link to="/login" className="text-rose-400 font-semibold hover:underline">
            Log in here
          </Link>
        </div>
      </motion.div>

      {/* Welcome Celebration Modal */}
      <AnimatePresence>
        {welcomeUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md glass-card border border-rose-500/40 rounded-3xl p-8 text-center bg-rose-950/95 shadow-2xl text-white flex flex-col items-center gap-5"
            >
              <Logo size="xl" showText={false} className="animate-bounce" />

              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-amber-300 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" /> Account Successfully Created!
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  Welcome to Pairly, {welcomeUser.name}!
                </h3>
                <p className="text-sm text-rose-200/70 mt-2 leading-relaxed">
                  Your private relationship sanctuary is ready. You can now pair with your partner using your unique invite code.
                </p>
              </div>

              <Button onClick={handleProceedAfterRegister} size="lg" className="w-full font-bold py-3">
                <Heart className="w-4 h-4 fill-white" /> {inviteCodeFromUrl ? 'Accept Invitation & Pair →' : 'Explore My Dashboard →'}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;
