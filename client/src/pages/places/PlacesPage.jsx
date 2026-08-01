import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Plus, Heart, Star, List, Map as MapIcon, Trash2, Utensils, Sunset, Plane } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import toast from 'react-hot-toast';

// Custom Leaflet Heart Pin SVG
const heartIcon = new L.DivIcon({
  className: 'custom-heart-pin',
  html: `<div style="background: linear-gradient(135deg, #f43f5e, #e11d48); width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 15px rgba(244,63,94,0.6); border: 2px solid white;"><svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const PlacesPage = () => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('map');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    category: 'first_date',
    lat: 37.7749,
    lng: -122.4194,
    rating: 5,
  });

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/places');
      if (res.success && res.data) {
        setPlaces(res.data.places || res.data);
      }
    } catch (err) {
      toast.error('Could not load relationship places.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.lat || !formData.lng) {
      toast.error('Please enter place name and coordinates.');
      return;
    }

    try {
      const res = await api.post('/places', {
        name: formData.name,
        address: formData.address,
        description: formData.description,
        category: formData.category,
        rating: Number(formData.rating),
        location: {
          type: 'Point',
          coordinates: [Number(formData.lng), Number(formData.lat)],
        },
      });

      if (res.success) {
        toast.success('Place pinned to relationship map!');
        setIsModalOpen(false);
        setFormData({ name: '', address: '', description: '', category: 'first_date', lat: 37.7749, lng: -122.4194, rating: 5 });
        fetchPlaces();
      }
    } catch (err) {
      toast.error('Failed to add place.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/places/${id}`);
      toast.success('Place deleted.');
      fetchPlaces();
    } catch (err) {
      toast.error('Could not delete place.');
    }
  };

  const defaultCenter = places.length > 0 && places[0].location?.coordinates
    ? [places[0].location.coordinates[1], places[0].location.coordinates[0]]
    : [37.7749, -122.4194];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SEO
        title="Relationship Map — Pairly"
        description="Map out special date spots, trips, and romantic milestones on an interactive map."
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <MapPin className="w-8 h-8 text-rose-400" /> Relationship Map
          </h2>
          <p className="text-xs text-rose-200/60 mt-1">
            Map out your special date spots, trips, and romantic milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 rounded-xl glass-card border border-white/10">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'map' ? 'bg-rose-500 text-white' : 'text-rose-200/60'
              }`}
            >
              <MapIcon className="w-4 h-4" /> Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-rose-500 text-white' : 'text-rose-200/60'
              }`}
            >
              <List className="w-4 h-4" /> List
            </button>
          </div>

          <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
            <Plus className="w-4 h-4" /> Pin New Spot
          </Button>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' ? (
        <div className="w-full h-[550px] rounded-3xl overflow-hidden glass-card border border-rose-500/30 shadow-2xl relative z-10">
          <MapContainer center={defaultCenter} zoom={11} className="w-full h-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {places.map((place) => {
              const coords = place.location?.coordinates;
              if (!coords || coords.length < 2) return null;
              const [lng, lat] = coords;
              return (
                <Marker key={place._id} position={[lat, lng]} icon={heartIcon}>
                  <Popup>
                    <div className="p-1 text-slate-900">
                      <strong className="text-base text-rose-600 block">{place.name}</strong>
                      <p className="text-xs text-slate-600 mt-1">{place.description}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">{place.address}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {places.map((place) => (
            <Card key={place._id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1 uppercase">
                    <MapPin className="w-3.5 h-3.5" /> {place.category}
                  </span>
                  <button
                    onClick={() => handleDelete(place._id)}
                    className="p-1 text-white/30 hover:text-red-400 rounded cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{place.name}</h3>
                <p className="text-xs text-rose-200/60 mt-1">{place.address}</p>
                {place.description && (
                  <p className="text-sm text-rose-100/80 mt-2">{place.description}</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-amber-400 text-xs flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Rating: {place.rating}/5
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Pin New Place">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Place Name"
            placeholder="e.g. Rooftop Restaurant where we first met"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Address / Location"
            placeholder="e.g. 123 Romantic Street, Paris"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={formData.lat}
              onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
              required
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={formData.lng}
              onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rose-200/80 uppercase">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="glass-input w-full rounded-xl p-2.5 text-sm text-white bg-rose-950 focus:outline-none"
            >
              <option value="first_date">First Date</option>
              <option value="restaurant">Restaurant / Cafe</option>
              <option value="sunset">Sunset Spot</option>
              <option value="vacation">Vacation</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rose-200/80 uppercase">Story / Notes</label>
            <textarea
              rows={3}
              placeholder="What made this place special?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input w-full rounded-xl p-3 text-sm text-white placeholder-white/30 resize-none"
            />
          </div>

          <Button type="submit" className="w-full mt-2 font-bold">
            <MapPin className="w-4 h-4" /> Pin Spot to Map
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default PlacesPage;
