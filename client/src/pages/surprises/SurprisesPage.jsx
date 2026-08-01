import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Plus, Sparkles, Ticket, CloudRain, HeartHandshake, Cake, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const SurpriseCategories = [
  { id: 'sad', title: "Open when you're sad", icon: CloudRain, color: 'from-blue-600 to-indigo-600' },
  { id: 'missing_me', title: 'Open when missing me', icon: HeartHandshake, color: 'from-purple-600 to-pink-600' },
  { id: 'birthday', title: 'Open on your birthday', icon: Cake, color: 'from-amber-500 to-rose-500' },
  { id: 'coupon', title: 'Love Ticket Coupon', icon: Ticket, color: 'from-rose-500 to-red-600' },
];

const SurprisesPage = () => {
  const [surprises, setSurprises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSurprise, setSelectedSurprise] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'sad',
    couponTitle: '',
  });

  useEffect(() => {
    fetchSurprises();
  }, []);

  const fetchSurprises = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/surprises');
      if (res.success && res.data) {
        setSurprises(res.data.surprises || res.data);
      }
    } catch (err) {
      toast.error('Could not load surprises.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Please enter title and secret surprise message.');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
      };

      if (formData.couponTitle) {
        payload.coupon = { title: formData.couponTitle, description: formData.content };
      }

      const res = await api.post('/surprises', payload);
      if (res.success) {
        toast.success('Surprise box created!');
        setIsModalOpen(false);
        setFormData({ title: '', content: '', category: 'sad', couponTitle: '' });
        fetchSurprises();
      }
    } catch (err) {
      toast.error('Could not create surprise.');
    }
  };

  const handleOpenGift = (surprise) => {
    setSelectedSurprise(surprise);
    setIsOpening(true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
    });
    setTimeout(() => {
      setIsOpening(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SEO
        title="Surprise Generator — Pairly"
        description="Create Open When surprise boxes and love tickets for your partner."
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Gift className="w-8 h-8 text-rose-400" /> Surprise Generator
          </h2>
          <p className="text-xs text-rose-200/60 mt-1">
            Create secret "Open When..." gifts and redeemable love coupon tickets.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
          <Plus className="w-4 h-4" /> Create Surprise Gift
        </Button>
      </div>

      {/* Surprises Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-rose-200/50">Unwrapping gifts...</div>
      ) : surprises.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center gap-3">
          <Gift className="w-12 h-12 text-rose-400" />
          <h3 className="text-lg font-bold text-white">No surprises created yet</h3>
          <p className="text-xs text-rose-200/60">Create an "Open When You Miss Me" surprise box for your partner!</p>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="mt-2">
            Create Surprise Box
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {surprises.map((item) => (
            <Card key={item._id} className="p-6 flex flex-col justify-between h-full group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  {item.coupon ? <Ticket className="w-6 h-6 text-white" /> : <Gift className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-xs text-rose-200/60 mt-1 uppercase tracking-wider font-semibold">
                  Category: {item.category}
                </p>
              </div>

              <Button
                onClick={() => handleOpenGift(item)}
                size="sm"
                className="mt-6 font-bold"
              >
                <Gift className="w-4 h-4" /> Unwrap Gift
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Reveal Gift Modal */}
      {selectedSurprise && (
        <Modal
          isOpen={!!selectedSurprise}
          onClose={() => setSelectedSurprise(null)}
          title="Surprise Revealed!"
        >
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6 }}
              className="w-20 h-20 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center border-2 border-rose-500/40"
            >
              <Gift className="w-10 h-10" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white">{selectedSurprise.title}</h3>
            <p className="text-base text-rose-100 font-romantic text-2xl leading-relaxed">
              {selectedSurprise.content}
            </p>

            {selectedSurprise.coupon && (
              <div className="w-full p-4 rounded-2xl border-2 border-dashed border-rose-400 bg-rose-500/10 text-rose-200 text-center mt-2">
                <Ticket className="w-6 h-6 mx-auto mb-1 text-amber-300" />
                <strong className="text-white text-base block">{selectedSurprise.coupon.title}</strong>
                <span className="text-xs text-rose-300">Valid for 1 Redemption</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Surprise">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Surprise Box Title"
            placeholder="e.g. Open when you feel stressed"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rose-200/80 uppercase">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="glass-input w-full rounded-xl p-2.5 text-sm text-white bg-rose-950 focus:outline-none"
            >
              {SurpriseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rose-200/80 uppercase">Secret Message / Content</label>
            <textarea
              rows={4}
              placeholder="Write your secret words or instructions..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="glass-input w-full rounded-xl p-3 text-sm text-white placeholder-white/30 resize-none font-romantic text-lg"
              required
            />
          </div>

          <Input
            label="Optional Love Coupon Ticket (Title)"
            placeholder="e.g. 1 Free Back Massage coupon"
            value={formData.couponTitle}
            onChange={(e) => setFormData({ ...formData, couponTitle: e.target.value })}
          />

          <Button type="submit" className="w-full mt-2 font-bold">
            <Gift className="w-4 h-4" /> Save Surprise Box
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default SurprisesPage;
