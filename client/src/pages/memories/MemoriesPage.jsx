import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Plus, Sparkles, Calendar, Heart, Trash2, Upload, X, CheckCircle2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import ConfirmModal from '../../components/ui/ConfirmModal';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 5 MB Max

const MemoriesPage = () => {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB Max Limit to save Cloudinary free storage space)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller photo to save Cloudinary space.`);
      e.target.value = '';
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!caption.trim()) {
      toast.error('Please enter a caption.');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select an image file to upload.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('caption', caption);
      if (date) {
        formData.append('date', new Date(date).toISOString());
      }

      const res = await api.post('/memories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.success) {
        toast.success('Photo memory uploaded to album!');
        closeModal();
        fetchMemories();
      }
    } catch (err) {
      toast.error(err.message || 'Could not upload photo memory.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setCaption('');
    setDate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmDeleteMemory = (memory) => {
    setMemoryToDelete(memory);
    setDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!memoryToDelete) return;
    setIsDeleting(true);

    try {
      await api.delete(`/memories/${memoryToDelete._id}`);
      toast.success('Memory deleted.');
      fetchMemories();
    } catch (err) {
      toast.error('Failed to delete memory.');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setMemoryToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SEO
        title="Shared Memory Book — Pairly"
        description="Upload photo memories to your shared couple album with automatic Cloudinary storage optimization."
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-rose-400" /> Shared Memory Book
          </h2>
          <p className="text-xs text-rose-200/60 mt-1">
            Photo album celebrating your joint moments (Max {MAX_FILE_SIZE_MB}MB per photo to conserve storage).
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
          <p className="text-xs text-rose-200/60">Upload photo files of your dates, trips, and happy moments!</p>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="mt-2 font-bold">
            Upload First Photo Memory
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
                  className="w-full rounded-xl object-cover hover:scale-105 transition-transform duration-300 cursor-pointer shadow-md"
                />
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-white">{mem.caption}</p>
                    <button
                      onClick={() => confirmDeleteMemory(mem)}
                      className="p-1 text-white/40 hover:text-red-400 rounded-md transition-colors cursor-pointer"
                      title="Delete Memory"
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

      {/* Upload Photo Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Upload Photo Memory">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          {/* Direct Photo File Input (No Image URL Link) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rose-200/80 uppercase">
              Photo File (Max {MAX_FILE_SIZE_MB}MB)
            </label>

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 rounded-2xl border-2 border-dashed border-rose-500/40 bg-rose-950/20 hover:bg-rose-950/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer p-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white">Click to select photo file</span>
                <span className="text-[10px] text-rose-200/50">Supports JPEG, PNG, WebP (Max {MAX_FILE_SIZE_MB}MB)</span>
              </div>
            ) : (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-rose-500 glass-card">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-rose-300 hover:text-white hover:bg-rose-600 transition-all cursor-pointer shadow-lg"
                  title="Remove Photo"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-slate-950/80 text-rose-300 text-[10px] font-bold flex items-center gap-1 border border-white/10">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB (Optimized)
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <Input
            label="Caption"
            placeholder="e.g. Sunset beach walk in Bali"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            required
          />

          <CustomDatePicker
            label="Memory Date (Optional)"
            value={date}
            onChange={(dateVal) => setDate(dateVal)}
          />

          <Button type="submit" isLoading={isSubmitting} disabled={!selectedFile} className="w-full mt-2 font-bold py-3">
            Upload Photo Memory
          </Button>
        </form>
      </Modal>

      {/* Confirmation Modal for Memory Deletion */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleExecuteDelete}
        isLoading={isDeleting}
        title="Delete Photo Memory?"
        message={`Are you sure you want to delete "${memoryToDelete?.caption || 'this photo'}" from your memory book?`}
        confirmText="Delete Memory"
      />
    </div>
  );
};

export default MemoriesPage;
