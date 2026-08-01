import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Plus, Star, List, Map as MapIcon, Trash2, Search } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import CustomSelect from '../../components/ui/CustomSelect';
import ConfirmModal from '../../components/ui/ConfirmModal';
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

// Component to dynamically re-center map view
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
};

const PlacesPage = () => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('map');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // LocationIQ Search state
  const [locationQuery, setLocationQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    category: 'first_date',
    lat: 37.7749,
    lng: -122.4194,
    rating: 5,
  });

  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/places');
      if (res.success && res.data) {
        const fetchedPlaces = res.data.places || res.data;
        setPlaces(fetchedPlaces);
        if (fetchedPlaces.length > 0 && fetchedPlaces[0].location?.coordinates) {
          const [lng, lat] = fetchedPlaces[0].location.coordinates;
          setMapCenter([lat, lng]);
        }
      }
    } catch (err) {
      toast.error('Could not load relationship places.');
    } finally {
      setIsLoading(false);
    }
  };

  // LocationIQ / Nominatim Interactive Geocoding Search
  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;

    setIsSearchingLocation(true);
    try {
      const res = await api.get(`/places/search-location?q=${encodeURIComponent(locationQuery)}`);
      if (res.success && res.data?.results) {
        setSearchResults(res.data.results);
      }
    } catch (err) {
      toast.error('Location search unavailable.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectLocation = (loc) => {
    setFormData((prev) => ({
      ...prev,
      name: prev.name || loc.name,
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
    }));
    setMapCenter([loc.lat, loc.lng]);
    setSearchResults([]);
    setLocationQuery('');
    toast.success(`Location selected: ${loc.name}`);
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
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        location: {
          type: 'Point',
          coordinates: [Number(formData.lng), Number(formData.lat)],
        },
      });

      if (res.success) {
        toast.success('Place pinned to relationship map!');
        setIsModalOpen(false);
        setMapCenter([Number(formData.lat), Number(formData.lng)]);
        setFormData({ name: '', address: '', description: '', category: 'first_date', lat: 37.7749, lng: -122.4194, rating: 5 });
        fetchPlaces();
      }
    } catch (err) {
      toast.error('Failed to add place.');
    }
  };

  // Confirmation modal trigger
  const confirmDeletePlace = (place) => {
    setPlaceToDelete(place);
    setDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!placeToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/places/${placeToDelete._id}`);
      toast.success('Place deleted.');
      fetchPlaces();
    } catch (err) {
      toast.error('Could not delete place.');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setPlaceToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SEO
        title="Interactive Relationship Map — Pairly"
        description="Search locations and map out date spots on an interactive map."
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <MapPin className="w-8 h-8 text-rose-400" /> Relationship Map
          </h2>
          <p className="text-xs text-rose-200/60 mt-1">
            Search locations interactively and pin special date spots.
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
          <MapContainer center={mapCenter} zoom={11} className="w-full h-full">
            <MapController center={mapCenter} />
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
          {places.length === 0 ? (
            <div className="col-span-full py-8 text-center text-rose-200/50">
              No places pinned yet. Click "Pin New Spot" above to search location and pin your first spot!
            </div>
          ) : (
            places.map((place) => (
              <Card key={place._id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1 uppercase">
                      <MapPin className="w-3.5 h-3.5" /> {place.category}
                    </span>
                    <button
                      onClick={() => confirmDeletePlace(place)}
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
            ))
          )}
        </div>
      )}

      {/* Modal: Pin New Place */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Pin New Place">
        <div className="flex flex-col gap-4">
          {/* Geocoding Search Bar */}
          <form onSubmit={handleLocationSearch} className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rose-200/80 uppercase">Search Location</label>
            <div className="flex gap-2">
              <Input
                placeholder="Type city, restaurant, or address (e.g. Eiffel Tower)..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                icon={Search}
              />
              <Button type="submit" isLoading={isSearchingLocation} className="shrink-0 font-bold">
                Search
              </Button>
            </div>
          </form>

          {/* Location Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="max-h-40 overflow-y-auto glass-card rounded-xl p-2 border border-rose-500/40 flex flex-col gap-1">
              {searchResults.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectLocation(loc)}
                  className="p-2 text-left hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-white block truncate">{loc.name}</span>
                  <span className="text-[10px] text-rose-200/60 block truncate">{loc.address}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              label="Place Name"
              placeholder="e.g. Bella Italia Restaurant"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Address"
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

            <CustomSelect
              label="Category"
              options={[
                { label: 'First Date', value: 'first_date' },
                { label: 'Restaurant / Cafe', value: 'restaurant' },
                { label: 'Sunset Spot', value: 'sunset' },
                { label: 'Vacation', value: 'vacation' },
              ]}
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val })}
            />

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
        </div>
      </Modal>

      {/* Confirmation Modal for Place Deletion */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleExecuteDelete}
        isLoading={isDeleting}
        title="Delete Pinned Spot?"
        message={`Are you sure you want to delete "${placeToDelete?.name || 'this spot'}" from your relationship map?`}
        confirmText="Delete Spot"
      />
    </div>
  );
};

export default PlacesPage;
