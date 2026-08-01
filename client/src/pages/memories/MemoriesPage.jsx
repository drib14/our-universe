import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Plus, Sparkles, Calendar, Heart, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const MemoriesPage = () => {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    caption: '',
    date: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/memories');
      if (res.success && res.data) {
        setMemories(res.data.memories || res.data);
      }
    } catch (err) {
      toast.error('Could not load memories.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.caption || !formData.imageUrl) {
      toast.error('Please enter image URL and caption.');
      return;
    }

    try {
      const res = await api.post('/memories', {
        caption: formData.caption,
        date: formData.date || new Date().toISOString(),
        media: [{ type: 'image', url: formData.imageUrl }],
      });

      if (res.success) {
        toast.success('📸 Memory added to album!');
        setIsModalOpen(false);
        setFormData({ caption: '', date: '', imageUrl: '' });
        fetchMemories();
      }
    } catch (err) {
      toast.error('Could not create memory.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/memories/${id}`);
      toast.success('Memory deleted.');
      fetchMemories();
    } catch (err) {
      toast.error('Failed to delete memory.');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-rose-400" /> Shared Memory Book
          </h2>
          <p className="text-xs text-rose-200/60 mt-1">
            Photo & video album celebrating your joint moments over time.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
          <Plus className="w-4 h-4" /> Upload Photo Memory
        </Button>
      </div>

      {/* On This Day Throwback Banner */}
      {memories.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-purple-900/60 via-pink-900/40 to-rose-900/60 border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-amber-300 flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-300">
                Memory Replay — Throwback
              </span>
              <h3 className="text-lg font-bold text-white">Relive your favorite moments</h3>
            </div>
          </div>
        </Card>
      )}

      {/* Memories Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-rose-200/50">Loading memories album...</div>
      ) : memories.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center gap-3">
          <ImageIcon className="w-12 h-12 text-rose-400" />
          <h3 className="text-lg font-bold text-white">Your memory book is empty</h3>
          <p className="text-xs text-rose-200/60">Upload photos of your dates, trips, and happy moments!</p>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="mt-2">
            Upload First Memory
          </Button>
        </Card>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {memories.map((mem) => {
            const imgUrl = mem.media?.[0]?.url || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600';
            return (
              <Card key={mem._id} className="break-inside-avoid p-3 group relative overflow-hidden">
                <img
                  src={imgUrl}
                  alt={mem.caption}
                  onClick={() => setSelectedImage(imgUrl)}
                  className="w-full rounded-xl object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-white">{mem.caption}</p>
                    <button
                      onClick={() => handleDelete(mem._id)}
                      className="p-1 text-white/40 hover:text-red-400 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[11px] text-rose-300/60 flex items-center gap-1 mt-2">
                    <Calendar className="w-3 h-3" /> {new Date(mem.date || mem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} title="Memory View">
          <img src={selectedImage} alt="Memory" className="w-full rounded-2xl max-h-[70vh] object-contain" />
        </Modal>
      )}

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Photo Memory">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Photo Image URL"
            placeholder="https://images.unsplash.com/photo-..."
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            required
          />

          <Input
            label="Caption"
            placeholder="e.g. Sunset beach walk in Bali 🌅"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            required
          />

          <Input
            label="Memory Date"
            type="date"
            icon={Calendar}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          <Button type="submit" className="w-full mt-2 font-bold">
            Add to Memory Album 📸
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default MemoriesPage;
