import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Heart, Sparkles, Cake, Wine, CalendarDays, Edit3, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import CustomSelect from '../../components/ui/CustomSelect';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import ConfirmModal from '../../components/ui/ConfirmModal';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import useAuthStore from '../../stores/useAuthStore';
import useCoupleStore from '../../stores/useCoupleStore';
import toast from 'react-hot-toast';

const CalendarPage = () => {
  const { user, updateUser } = useAuthStore();
  const { couple, partner, fetchCouple } = useCoupleStore();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateModalType, setDateModalType] = useState('anniversary');
  const [dateInputValue, setDateInputValue] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'date_night',
  });

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/events');
      if (res.success && res.data) {
        setEvents(res.data.events || res.data);
      }
    } catch (err) {
      toast.error('Could not load events.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDaysRemaining = (targetDateString) => {
    if (!targetDateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDateString);
    let nextOccurrence = new Date(today.getFullYear(), target.getMonth(), target.getDate());

    if (nextOccurrence < today) {
      nextOccurrence.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = nextOccurrence - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const anniversaryDays = calculateDaysRemaining(couple?.anniversaryDate || user?.relationshipStartDate);
  const partnerBirthdayDays = calculateDaysRemaining(partner?.birthday || user?.birthday);

  const upcomingDateNight = events
    .filter((e) => e.type === 'date_night' && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const dateNightDays = upcomingDateNight ? calculateDaysRemaining(upcomingDateNight.date) : null;

  const handleSaveDate = async (e) => {
    e.preventDefault();
    if (!dateInputValue) return;

    try {
      if (dateModalType === 'anniversary') {
        await api.put('/couple', { anniversaryDate: dateInputValue });
        await api.put('/auth/profile', { relationshipStartDate: dateInputValue });
        updateUser({ relationshipStartDate: dateInputValue });
        await fetchCouple();
        toast.success('Anniversary date saved!');
      } else {
        await api.put('/auth/profile', { birthday: dateInputValue });
        updateUser({ birthday: dateInputValue });
        toast.success('Birthday saved!');
      }
      setIsDateModalOpen(false);
      setDateInputValue('');
    } catch (err) {
      toast.error('Failed to save date.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      toast.error('Please enter title and date.');
      return;
    }

    try {
      const res = await api.post('/events', formData);
      if (res.success) {
        toast.success('Event saved to calendar!');
        setIsModalOpen(false);
        setFormData({ title: '', date: '', type: 'date_night' });
        fetchEvents();
      }
    } catch (err) {
      toast.error('Failed to create event.');
    }
  };

  const confirmDeleteEvent = (evt) => {
    setEventToDelete(evt);
    setDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/events/${eventToDelete._id}`);
      toast.success('Event removed.');
      fetchEvents();
    } catch (err) {
      toast.error('Could not delete event.');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SEO
        title="Calendar & Countdowns — Pairly"
        description="Track relationship anniversaries, birthdays, and date night countdowns."
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-rose-400" /> Couple Calendar & Countdowns
          </h2>
          <p className="text-xs text-rose-200/60 mt-1">
            Track anniversaries, birthdays, and planned date night countdowns dynamically.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
          <Plus className="w-4 h-4" /> Add Calendar Event
        </Button>
      </div>

      {/* Dynamic Countdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Next Anniversary Countdown */}
        <Card className="p-6 text-center flex flex-col items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-300">
            <Sparkles className="w-4 h-4 text-amber-400" /> Next Anniversary
          </div>

          <div className="my-4">
            {anniversaryDays !== null ? (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex flex-col items-center justify-center text-white shadow-lg shadow-rose-500/30">
                <span className="text-3xl font-extrabold">{anniversaryDays}</span>
                <span className="text-[10px] font-semibold uppercase">Days</span>
              </div>
            ) : (
              <div className="text-xs text-rose-200/50 py-2">No anniversary set</div>
            )}
          </div>

          {anniversaryDays !== null ? (
            <span className="text-xs text-rose-200/60 font-medium">
              {new Date(couple?.anniversaryDate || user?.relationshipStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          ) : (
            <Button
              onClick={() => {
                setDateModalType('anniversary');
                setIsDateModalOpen(true);
              }}
              size="sm"
              variant="outline"
            >
              <Edit3 className="w-3.5 h-3.5" /> Set Date
            </Button>
          )}
        </Card>

        {/* 2. Birthday Countdown */}
        <Card className="p-6 text-center flex flex-col items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Cake className="w-4 h-4 text-purple-400" /> Birthday Countdown
          </div>

          <div className="my-4">
            {partnerBirthdayDays !== null ? (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex flex-col items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <span className="text-3xl font-extrabold">{partnerBirthdayDays}</span>
                <span className="text-[10px] font-semibold uppercase">Days</span>
              </div>
            ) : (
              <div className="text-xs text-rose-200/50 py-2">No birthday set</div>
            )}
          </div>

          {partnerBirthdayDays !== null ? (
            <span className="text-xs text-rose-200/60 font-medium">
              {partner ? `${partner.name}'s Birthday` : 'Your Birthday'}
            </span>
          ) : (
            <Button
              onClick={() => {
                setDateModalType('birthday');
                setIsDateModalOpen(true);
              }}
              size="sm"
              variant="outline"
            >
              <Edit3 className="w-3.5 h-3.5" /> Set Birthday
            </Button>
          )}
        </Card>

        {/* 3. Next Date Night Countdown */}
        <Card className="p-6 text-center flex flex-col items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Wine className="w-4 h-4 text-amber-400" /> Planned Date Night
          </div>

          <div className="my-4">
            {dateNightDays !== null ? (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex flex-col items-center justify-center text-white shadow-lg shadow-amber-500/30">
                <span className="text-3xl font-extrabold">{dateNightDays}</span>
                <span className="text-[10px] font-semibold uppercase">Days</span>
              </div>
            ) : (
              <div className="text-xs text-rose-200/50 py-2">No date night planned</div>
            )}
          </div>

          {upcomingDateNight ? (
            <span className="text-xs text-rose-200/60 font-medium truncate max-w-[150px]">
              {upcomingDateNight.title}
            </span>
          ) : (
            <Button onClick={() => setIsModalOpen(true)} size="sm" variant="outline">
              <Plus className="w-3.5 h-3.5" /> Plan Date
            </Button>
          )}
        </Card>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-bold text-white mt-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-rose-400" /> Upcoming Calendar Events
        </h3>
        {isLoading ? (
          <div className="py-8 text-center text-rose-200/50">Loading calendar events...</div>
        ) : events.length === 0 ? (
          <Card className="p-8 text-center text-xs text-rose-200/60">
            No upcoming events saved yet. Click "Add Calendar Event" above to schedule date nights!
          </Card>
        ) : (
          events.map((evt) => (
            <Card key={evt._id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
                  {evt.type === 'anniversary' ? (
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  ) : evt.type === 'birthday' ? (
                    <Cake className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Wine className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{evt.title}</h4>
                  <span className="text-xs text-rose-300/60">
                    {new Date(evt.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => confirmDeleteEvent(evt)}
                className="p-2 text-white/30 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                title="Delete Event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))
        )}
      </div>

      {/* Modal: Set Optional Date (Anniversary or Birthday) */}
      <Modal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        title={dateModalType === 'anniversary' ? 'Set Relationship Anniversary Date' : 'Set Birthday'}
      >
        <form onSubmit={handleSaveDate} className="flex flex-col gap-4">
          <CustomDatePicker
            label="Select Date"
            value={dateInputValue}
            onChange={(dateVal) => setDateInputValue(dateVal)}
            required
          />
          <Button type="submit" className="w-full font-bold mt-2">
            Save & Calculate Countdown
          </Button>
        </form>
      </Modal>

      {/* Modal: Add New Event */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Calendar Event">
        <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
          <Input
            label="Event Title"
            placeholder="e.g. Candlelight Dinner at Bella Italia"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <CustomDatePicker
            label="Date"
            value={formData.date}
            onChange={(dateVal) => setFormData({ ...formData, date: dateVal })}
            required
          />
          <CustomSelect
            label="Event Type"
            options={[
              { label: 'Anniversary', value: 'anniversary' },
              { label: 'Birthday', value: 'birthday' },
              { label: 'Date Night', value: 'date_night' },
            ]}
            value={formData.type}
            onChange={(typeVal) => setFormData({ ...formData, type: typeVal })}
          />
          <Button type="submit" className="w-full mt-2 font-bold">
            Save Calendar Event
          </Button>
        </form>
      </Modal>

      {/* Confirmation Modal for Event Deletion */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleExecuteDelete}
        isLoading={isDeleting}
        title="Delete Calendar Event?"
        message={`Are you sure you want to delete "${eventToDelete?.title || 'this event'}" from your couple calendar?`}
        confirmText="Delete Event"
      />
    </div>
  );
};

export default CalendarPage;
