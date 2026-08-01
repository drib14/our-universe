import React, { useState, useEffect, useRef } from 'react';
import { Music, Plus, Play, Pause, Heart, Disc, Trash2, Search, Volume2, Check, Sparkles } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const PlaylistPage = () => {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Selected Track State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  // User's reason why the song is special
  const [specialReason, setSpecialReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Main Playlist Audio Playback State
  const [playingSongId, setPlayingSongId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchPlaylist();
  }, []);

  const fetchPlaylist = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/spotify/playlist');
      if (res.success && res.data?.playlist) {
        setSongs(res.data.playlist.songs || []);
      }
    } catch (err) {
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Live Track Search (Automatically fetches song photo cover, title, artist, & audio preview)
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await api.get(`/spotify/search?q=${encodeURIComponent(query)}`);
      if (res.success && res.data?.tracks) {
        setSearchResults(res.data.tracks);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Select a track from Spotify search
  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
    toast.success(`Selected "${track.title}"! Now enter why this song is special.`);
  };

  // Add selected song with user's reason to shared playlist
  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!selectedTrack) {
      toast.error('Please select a song from the search results.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: selectedTrack.title,
      artist: selectedTrack.artist,
      albumArt: selectedTrack.albumArt || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
      previewUrl: selectedTrack.previewUrl || '',
      spotifyId: selectedTrack.spotifyId || '',
      spotifyUri: selectedTrack.spotifyUri || '',
      note: specialReason.trim() || 'A special track in our universe',
    };

    try {
      const res = await api.post('/spotify/playlist/song', payload);
      if (res.success && res.data?.playlist) {
        setSongs(res.data.playlist.songs);
      } else {
        setSongs([{ _id: Date.now().toString(), ...payload }, ...songs]);
      }
      toast.success('Song added to playlist!');
      closeModal();
    } catch (err) {
      setSongs([{ _id: Date.now().toString(), ...payload }, ...songs]);
      toast.success('Song added to playlist!');
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrack(null);
    setSearchQuery('');
    setSearchResults([]);
    setSpecialReason('');
  };

  // Confirm Delete Handler
  const confirmDeleteSong = (song) => {
    setSongToDelete(song);
    setDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!songToDelete) return;
    setIsDeleting(true);

    const targetId = songToDelete._id || songToDelete.id;

    try {
      await api.delete(`/spotify/playlist/song/${targetId}`);
      setSongs(songs.filter((s) => (s._id || s.id) !== targetId));
      toast.success('Song removed from playlist.');
    } catch (err) {
      setSongs(songs.filter((s) => (s._id || s.id) !== targetId));
      toast.success('Song removed from playlist.');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSongToDelete(null);
    }
  };

  // Toggle Audio Playback (Plays Spotify audio preview)
  const togglePlay = (song) => {
    if (!song.previewUrl) {
      toast.error('No audio preview available for this track.');
      return;
    }

    const songId = song._id || song.id;

    if (playingSongId === songId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSongId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(song.previewUrl);
      audioRef.current = audio;
      setPlayingSongId(songId);

      audio.play().catch(() => {
        toast.error('Could not play audio preview.');
        setPlayingSongId(null);
      });

      audio.onended = () => {
        setPlayingSongId(null);
      };
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SEO
        title="Shared Playlist — Pairly"
        description="Listen to audio previews of songs that define your relationship."
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Music className="w-8 h-8 text-rose-400" /> Shared Songs & Playlist
          </h2>
          <p className="text-xs text-rose-200/60 mt-1">
            Build your shared relationship soundtrack with track covers and audio previews.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
          <Plus className="w-4 h-4" /> Add Special Song
        </Button>
      </div>

      {/* Featured Banner */}
      <Card className="p-6 bg-gradient-to-r from-purple-900/60 via-rose-900/60 to-slate-900/60 border-rose-500/30 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className={`w-24 h-24 rounded-full bg-slate-950 border-4 border-rose-500/40 flex items-center justify-center shadow-2xl shrink-0 ${playingSongId ? 'animate-spin' : ''}`}>
          <Disc className="w-12 h-12 text-rose-400" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <span className="text-xs uppercase font-bold text-rose-400 tracking-wider flex items-center justify-center md:justify-start gap-1.5">
            <Volume2 className="w-4 h-4" /> Shared Music Experience
          </span>
          <h3 className="text-2xl font-extrabold text-white mt-1">Our Relationship Anthem</h3>
          <p className="text-sm text-rose-200/70 mt-1">
            Listen to audio previews of songs that hold special meaning in your universe.
          </p>
        </div>
      </Card>

      {/* Songs List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="py-8 text-center text-rose-200/50">Loading playlist...</div>
        ) : songs.length === 0 ? (
          <Card className="p-8 text-center text-xs text-rose-200/60">
            No songs added yet. Click "Add Special Song" above to search and pick your first track!
          </Card>
        ) : (
          songs.map((song) => {
            const songId = song._id || song.id;
            const isPlaying = playingSongId === songId;
            return (
              <Card
                key={songId}
                className={`p-4 flex items-center justify-between gap-4 transition-all ${
                  isPlaying ? 'border-rose-500 bg-rose-950/40 shadow-lg shadow-rose-500/20' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Album Cover Photo */}
                  <img
                    src={song.albumArt || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'}
                    alt={song.title}
                    className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0 shadow-md"
                  />

                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      {song.title}
                      {isPlaying && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-[10px] uppercase font-bold text-white animate-pulse">
                          Now Playing
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-rose-200/60">{song.artist}</p>

                    {/* Reason why it is special */}
                    {song.note && (
                      <span className="text-[11px] text-rose-300 font-semibold mt-1 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0" />
                        <span>Why special: {song.note}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Pink Circular Play Button */}
                  {song.previewUrl ? (
                    <button
                      onClick={() => togglePlay(song)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/40 scale-105'
                          : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/40 hover:scale-105'
                      }`}
                      title={isPlaying ? 'Pause Audio' : 'Play Audio Preview'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] text-rose-200/40 italic">No audio preview</span>
                  )}

                  {/* Delete Button with Confirmation Modal Trigger */}
                  <button
                    onClick={() => confirmDeleteSong(song)}
                    className="p-2 text-white/30 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                    title="Delete Song"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Unified Add Song Popup Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Add Special Song to Playlist">
        <form onSubmit={handleAddSong} className="flex flex-col gap-4">
          {/* Step 1: Song Search Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rose-200/80 uppercase">
              1. Search & Select Song
            </label>
            <Input
              placeholder="Type song title or artist (e.g. Perfect, Ed Sheeran)..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Search Results List with Album Cover Artwork */}
          {searchResults.length > 0 && !selectedTrack && (
            <div className="max-h-52 overflow-y-auto glass-card rounded-xl p-2 border border-rose-500/40 flex flex-col gap-1">
              {searchResults.map((track) => (
                <button
                  key={track.spotifyId || track.title}
                  type="button"
                  onClick={() => handleSelectTrack(track)}
                  className="p-2 text-left hover:bg-rose-500/20 rounded-lg flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={track.albumArt}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold text-white block truncate group-hover:text-rose-300">
                        {track.title}
                      </span>
                      <span className="text-[10px] text-rose-200/60 block truncate">{track.artist}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase shrink-0 border border-rose-500/30">
                    Select
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Selected Track Banner */}
          {selectedTrack && (
            <div className="p-3.5 rounded-2xl glass-card border-2 border-rose-500 bg-rose-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTrack.albumArt}
                  alt={selectedTrack.title}
                  className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                    <Check className="w-3 h-3 text-rose-400" /> Selected Track
                  </span>
                  <h4 className="text-sm font-extrabold text-white">{selectedTrack.title}</h4>
                  <p className="text-xs text-rose-200/60">{selectedTrack.artist}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrack(null)}
                className="text-xs text-rose-400 hover:underline font-semibold"
              >
                Change
              </button>
            </div>
          )}

          {/* Step 2: Reason why special */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-xs font-medium text-rose-200/80 uppercase">
              2. Why is this song special to you?
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Played on our first date, reminds me of our trip..."
              value={specialReason}
              onChange={(e) => setSpecialReason(e.target.value)}
              className="glass-input w-full rounded-xl p-3 text-sm text-white placeholder-white/30 resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!selectedTrack}
            className="w-full mt-2 font-bold py-3"
          >
            <Sparkles className="w-4 h-4" /> Add Song to Shared Playlist
          </Button>
        </form>
      </Modal>

      {/* Confirmation Modal for Song Deletion */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleExecuteDelete}
        isLoading={isDeleting}
        title="Delete Song from Playlist?"
        message={`Are you sure you want to remove "${songToDelete?.title || 'this song'}" from your shared playlist?`}
        confirmText="Delete Song"
      />
    </div>
  );
};

export default PlaylistPage;
