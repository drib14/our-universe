import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Check, Send, Sparkles, Link2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Logo from '../../components/ui/Logo';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import useAuthStore from '../../stores/useAuthStore';
import useCoupleStore from '../../stores/useCoupleStore';

const PairingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { isPaired, fetchCouple } = useCoupleStore();

  const [pairCode, setPairCode] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    const hasToken = localStorage.getItem('pairly_token');

    if (!user && !hasToken) {
      if (codeFromUrl) {
        toast('Please create an account or log in to accept your invitation!', { icon: '💕' });
        navigate(`/register?code=${codeFromUrl}`);
      } else {
        navigate('/login');
      }
      return;
    }

    if (isPaired) {
      navigate('/');
    }
  }, [user, isPaired, searchParams, navigate]);

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setPairCode(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);

  const copyCode = () => {
    if (user?.pairCode) {
      navigator.clipboard.writeText(user.pairCode);
      setCopied(true);
      toast.success('Pairing code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePair = async (e) => {
    e.preventDefault();
    if (!pairCode || pairCode.trim().length < 4) {
      toast.error('Please enter a valid pair code.');
      return;
    }

    setIsPairing(true);
    try {
      const res = await api.post('/couple/pair', {
        code: pairCode.trim().toUpperCase(),
        pairCode: pairCode.trim().toUpperCase(),
      });

      if (res.success) {
        toast.success('Paired successfully! Welcome to your shared universe.');
        await fetchCouple();
        navigate('/');
      } else {
        toast.error(res.message || 'Failed to pair. Double-check the code.');
      }
    } catch (err) {
      toast.error(err.message || 'Pairing error. Please try again.');
    } finally {
      setIsPairing(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!partnerEmail) {
      toast.error('Please enter your partner email.');
      return;
    }

    setIsInviting(true);
    try {
      const res = await api.post('/couple/invite', { email: partnerEmail });
      if (res.success) {
        toast.success('Invitation email sent successfully!');
        setPartnerEmail('');
      } else {
        toast.error(res.message || 'Failed to send invitation.');
      }
    } catch (err) {
      console.error('Send invite error:', err);
      if (err?.code === 'UNAUTHORIZED' || err?.message?.includes('token') || err?.message?.includes('Access denied')) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('Failed to send invitation.');
      }
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <SEO
        title="Pairing — Connect With Your Partner | Pairly"
        description="Connect with your partner using your unique invite code or email invite."
      />
      <div className="absolute w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg glass-card rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="lg" className="mb-4" />
          <h2 className="text-3xl font-extrabold text-white">Connect With Partner</h2>
          <p className="text-sm text-rose-200/60 mt-1">Share your code or enter your partner's code to link accounts</p>
        </div>

        {/* Section 1: Your Invite Code */}
        <div className="glass-card p-5 rounded-2xl border border-rose-500/30 mb-6 bg-rose-500/10 text-center">
          <span className="text-xs uppercase tracking-wider text-rose-300 font-bold">Your Unique Invite Code</span>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-3xl font-mono font-extrabold tracking-widest text-white">
              {user?.pairCode || '──────'}
            </span>
            <button
              onClick={copyCode}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-200 transition-colors cursor-pointer"
              title="Copy Code"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Section 2: Enter Partner's Code */}
        <form onSubmit={handlePair} className="flex flex-col gap-4 mb-6">
          <Input
            label="Enter Partner's Code"
            placeholder="e.g. AB12CD"
            icon={Link2}
            value={pairCode}
            onChange={(e) => setPairCode(e.target.value.toUpperCase())}
            maxLength={8}
          />
          <Button type="submit" isLoading={isPairing} className="w-full py-3 font-bold">
            <Heart className="w-4 h-4 fill-white" /> Connect & Pair Now
          </Button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-xs uppercase tracking-widest text-rose-300/40 font-semibold">
            Or Send Email Invite
          </span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Section 3: Email Invite */}
        <form onSubmit={handleSendInvite} className="flex gap-2 mt-4">
          <Input
            type="email"
            placeholder="partner@example.com"
            value={partnerEmail}
            onChange={(e) => setPartnerEmail(e.target.value)}
            containerClassName="flex-1"
          />
          <Button type="submit" variant="secondary" isLoading={isInviting} className="shrink-0 font-bold">
            <Send className="w-4 h-4" /> Send Invite
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default PairingPage;
