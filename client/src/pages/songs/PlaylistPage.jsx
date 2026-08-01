import React, { useState } from 'react';
import { Music, Plus, Play, Heart, Disc, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import SEO from '../../components/ui/SEO';
import toast from 'react-hot-toast';

const initialSongs = [
  {
    id: 's1',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
    note: 'Our first dance song',
  },
  {
    id: 's2',
    title: 'Lover',
    artist: 'Taylor Swift',
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
    note: 'Played on our beach trip',
  },
];

const PlaylistPage = () => {
  const [songs, setSongs] = useState(initialSongs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', artist: '', note: '' });

  const handleAddSong = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.artist) {
      toast.error('Please enter song title and artist.');
      return;
    }

    const newSong = {
      id: Date.now().toString(),
      title: formData.title,
      artist: formData.artist,
      albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
      note: formData.note || 'Special song in our universe',
    };

    setSongs([newSong, ...songs]);
    toast.success('Song added to Our Playlist!');
    setIsModalOpen(false);
    setFormData({ title: '', artist: '', note: '' });
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SEO
        title="Shared Playlist — Pairly"
        description="Track songs that define your relationship memories."
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Music className="w-8 h-8 text-rose-400" /> Shared Songs & Playlist
          </h2>
          <p className="text-xs text-rose-200/60 mt-1">
            Track list of songs that define your relationship memories.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
          <Plus className="w-4 h-4" /> Add Special Song
        </Button>
      </div>

      {/* Featured Song Vinyl Card */}
      <Card className="p-6 bg-gradient-to-r from-purple-900/60 to-rose-900/60 border-rose-500/30 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-slate-950 border-4 border-rose-500/40 flex items-center justify-center shadow-2xl animate-spin-slow shrink-0">
          <Disc className="w-12 h-12 text-rose-400" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">Featured Track</span>
          <h3 className="text-2xl font-extrabold text-white mt-1">Our Official Anthem</h3>
          <p className="text-sm text-rose-200/70">Listen to the soundtrack of your love story together.</p>
        </div>
      </Card>

      {/* Songs List */}
      <div className="flex flex-col gap-3">
        {songs.map((song) => (
          <Card key={song.id} className="p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <img src={song.albumArt} alt={song.title} className="w-14 h-14 rounded-xl object-cover" />
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                  {song.title}
                </h4>
                <p className="text-xs text-rose-200/60">{song.artist}</p>
                {song.note && (
                  <span className="text-[11px] text-rose-300 font-semibold mt-1 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> {song.note}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Song to Playlist">
        <form onSubmit={handleAddSong} className="flex flex-col gap-4">
          <Input
            label="Song Title"
            placeholder="e.g. Can't Help Falling in Love"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Artist Name"
            placeholder="e.g. Elvis Presley"
            value={formData.artist}
            onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
            required
          />
          <Input
            label="Why is this song special?"
            placeholder="e.g. Played on our first road trip"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
          <Button type="submit" className="w-full mt-2 font-bold">
            <Music className="w-4 h-4" /> Add Song
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default PlaylistPage;
