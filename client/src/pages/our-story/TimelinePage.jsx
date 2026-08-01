import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Plus, Calendar, MapPin, Heart, Sparkles, Trash2, MessageSquare, Ring, Plane, Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const categories = [
  { id: 'all', label: 'All Milestones', icon: Star },
  { id: 'first_chat', label: 'First Chat', icon: MessageSquare },
  { id: 'first_date', label: 'First Date', icon: Heart },
  { id: 'anniversary', label: 'Anniversary', icon: Sparkles },
  { id: 'vacation', label: 'Vacation', icon: Plane },
  { id: 'milestone', label: 'Milestone', icon: Star },
];

const TimelinePage = () => {
  const [events, setEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: 'first_date',
  });

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/timeline');
      if (res.success && res.data) {
        setEvents(res.data.events || res.data);
      }
    } catch (err) {
      toast.error('Could not load timeline events.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      toast.error('Please enter title and date.');
      return;
    }

    try {
      const res = await api.post('/timeline', formData);
      if (res.success) {
        toast.success('Milestone added to Our Story!');
        setIsModalOpen(false);
        setFormData({ title: '', description: '', date: '', category: 'first_date' });
        fetchTimeline();
      }
    } catch (err) {
      toast.error('Failed to create timeline event.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/timeline/${id}`);
      toast.success('Event deleted.');
      fetchTimeline();
    } catch (err) {
      toast.error('Could not delete event.');
    }
  };

  const filteredEvents = activeCategory === 'all'
    ? events
    : events.filter((e) => e.category === activeCategory);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SEO
        title="Our Story Timeline — Pairly"
        description="Chronological relationship timeline of milestones, first date, anniversaries, and trips."
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <History className="w-8 h-8 text-rose-400" /> Our Story Timeline
          </h2>
          <p className="text-xs text-rose-200/60 mt-1">
            Chronological memory timeline of your relationship highlights.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
          <Plus className="w-4 h-4" /> Add Memory Event
        </Button>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'glass-card text-rose-200/70 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Vertical Timeline */}
      {isLoading ? (
        <div className="py-12 text-center text-rose-200/50">Loading timeline...</div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center gap-3">
          <Sparkles className="w-10 h-10 text-rose-400" />
          <h3 className="text-lg font-bold text-white">No story events yet</h3>
          <p className="text-xs text-rose-200/60">Add your first date, proposal, or favorite trip!</p>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="mt-2">
            Add Milestone
          </Button>
        </Card>
      ) : (
        <div className="relative pl-6 border-l-2 border-rose-500/30 flex flex-col gap-6 my-4">
          {filteredEvents.map((evt, idx) => (
            <motion.div
              key={evt._id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="relative"
            >
              {/* Timeline Marker Dot */}
              <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/50 border-2 border-rose-950">
                <Heart className="w-3.5 h-3.5 fill-white text-white" />
              </div>

              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(evt.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">{evt.title}</h3>
                    {evt.description && (
                      <p className="text-sm text-rose-100/70 mt-2 whitespace-pre-wrap">
                        {evt.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(evt._id)}
                    className="p-1.5 text-white/30 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Story Milestone">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Milestone Title"
            placeholder="e.g. First Kiss at Sunset Beach"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Date"
            type="date"
            icon={Calendar}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rose-200/80 uppercase">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="glass-input w-full rounded-xl p-2.5 text-sm text-white bg-rose-950 focus:outline-none"
            >
              <option value="first_chat">First Chat</option>
              <option value="first_date">First Date</option>
              <option value="anniversary">Anniversary</option>
              <option value="vacation">Vacation</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rose-200/80 uppercase">Description / Story</label>
            <textarea
              rows={3}
              placeholder="What made this moment unforgettable?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input w-full rounded-xl p-3 text-sm text-white placeholder-white/30 resize-none"
            />
          </div>

          <Button type="submit" className="w-full mt-2 font-bold">
            Save Milestone
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default TimelinePage;
