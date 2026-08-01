import React, { useState } from 'react';
import { Settings, User, Heart, Shield, LogOut, Unlink, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useAuthStore from '../../stores/useAuthStore';
import useCoupleStore from '../../stores/useCoupleStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, logout, updateUser } = useAuthStore();
  const { couple, partner, unpair } = useCoupleStore();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [anniversaryDate, setAnniversaryDate] = useState(
    user?.relationshipStartDate?.substring(0, 10) || ''
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        name,
        avatar,
        relationshipStartDate: anniversaryDate,
      });
      if (res.success) {
        toast.success('Settings updated!');
        updateUser({ name, avatar, relationshipStartDate: anniversaryDate });
      }
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnpair = async () => {
    if (window.confirm('Are you sure you want to unpair from your partner?')) {
      try {
        await unpair();
        toast.success('Unpaired partner account.');
      } catch (err) {
        toast.error('Could not unpair.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-3xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-rose-400" /> Settings & Relationship Profile
        </h2>
        <p className="text-xs text-rose-200/60 mt-1">
          Manage your personal profile, partner pairing, and relationship start date.
        </p>
      </div>

      {/* Partner Connection Box */}
      <Card className="p-6 border-rose-500/30 bg-gradient-to-r from-purple-900/40 to-rose-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-lg">
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Paired with {partner ? partner.name : 'Partner'}
              </h3>
              <p className="text-xs text-rose-200/60">Invite Code: {user?.pairCode}</p>
            </div>
          </div>
          <Button onClick={handleUnpair} variant="danger" size="sm">
            <Unlink className="w-4 h-4" /> Unpair
          </Button>
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
          <Input
            label="Full Name"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Avatar Image URL"
            placeholder="https://..."
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />

          <Input
            label="Relationship Anniversary / Start Date"
            type="date"
            icon={Calendar}
            value={anniversaryDate}
            onChange={(e) => setAnniversaryDate(e.target.value)}
          />

          <Button type="submit" isLoading={isSaving} className="w-full font-bold mt-2">
            Save Profile Settings
          </Button>
        </form>
      </Card>

      {/* Logout Action */}
      <Card className="p-6 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-white">Log Out of Account</h4>
          <p className="text-xs text-rose-200/60">Sign out of Pairly on this web browser</p>
        </div>
        <Button onClick={logout} variant="outline" size="sm">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </Card>
    </div>
  );
};

export default SettingsPage;
