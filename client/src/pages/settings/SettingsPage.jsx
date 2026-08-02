import React, { useState, useRef } from 'react';
import { Settings, User, Heart, LogOut, Unlink, Calendar, Upload, ShieldAlert, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import ConfirmModal from '../../components/ui/ConfirmModal';
import SEO from '../../components/ui/SEO';
import useAuthStore from '../../stores/useAuthStore';
import useCoupleStore from '../../stores/useCoupleStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const SettingsPage = () => {
  const { user, logout, updateUser } = useAuthStore();
  const { couple, partner: storePartner, unpair } = useCoupleStore();

  // Resolve partner data from couple store or user.partnerId object
  const partner = storePartner || (typeof user?.partnerId === 'object' ? user?.partnerId : null);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'account'

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [anniversaryDate, setAnniversaryDate] = useState(
    user?.relationshipStartDate?.substring(0, 10) || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Unpair Confirmation State
  const [unpairModalOpen, setUnpairModalOpen] = useState(false);
  const [isUnpairing, setIsUnpairing] = useState(false);

  // Delete Account Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error('Avatar image must be smaller than 5MB.');
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('relationshipStartDate', anniversaryDate);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && res.data?.user) {
        const updated = res.data.user;
        toast.success('Profile updated!');
        updateUser(updated);
        setAvatar(updated.avatar);
        setAvatarFile(null);
      }
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteUnpair = async () => {
    setIsUnpairing(true);
    try {
      await unpair();
      toast.success('Unpaired partner account.');
    } catch (err) {
      toast.error('Could not unpair.');
    } finally {
      setIsUnpairing(false);
      setUnpairModalOpen(false);
    }
  };

  const handleToggleAccountDeletion = async (action) => {
    setIsDeletingAccount(true);
    try {
      const res = await api.post('/auth/delete-account', { action });
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        toast.success(res.message);
      }
    } catch (err) {
      toast.error('Could not process account deletion request.');
    } finally {
      setIsDeletingAccount(false);
      setDeleteModalOpen(false);
    }
  };

  // Scheduled Deletion Information
  const isDeletionScheduled = !!user?.deletionScheduledAt;
  const deletionScheduledForDate = user?.deletionScheduledFor
    ? new Date(user.deletionScheduledFor).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="flex flex-col gap-6 pb-12 w-full">
      <SEO
        title="Account Settings — Pairly"
        description="Manage your profile, partner pairing connection, and account security settings."
      />
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-rose-400" /> App Settings & Controls
        </h2>
        <p className="text-xs text-rose-200/60 mt-1">
          Manage your personal profile, partner connection, and account security.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 p-1.5 glass-card border border-white/10 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'text-rose-200/60 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" /> Profile & Relationship
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'account'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'text-rose-200/60 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Account & Security
        </button>
      </div>

      {/* TAB 1: Profile & Relationship */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-6 w-full">
          {/* Partner Connection Banner with Paired Partner's Name */}
          <Card className="p-6 border-rose-500/30 bg-gradient-to-r from-purple-900/40 via-rose-900/30 to-slate-900/40 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar src={partner?.avatar} name={partner?.name || 'Partner'} size="xl" className="border-purple-500 shadow-md" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300/80 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" /> Currently Paired Partner
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-0.5">
                    {partner ? partner.name : 'No Partner Paired'}
                  </h3>
                  <p className="text-xs text-rose-200/60 mt-1">
                    Pairing Code: <strong className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">{user?.pairCode}</strong>
                  </p>
                </div>
              </div>

              {partner && (
                <Button onClick={() => setUnpairModalOpen(true)} variant="danger" size="sm" className="font-bold shrink-0">
                  <Unlink className="w-4 h-4" /> Unpair Partner
                </Button>
              )}
            </div>
          </Card>

          {/* Edit Profile Details */}
          <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              <Avatar src={avatarPreview || avatar} name={name} size="xl" className="border-rose-500 shadow-lg" />
              <div>
                <h3 className="text-xl font-bold text-white">{name || 'Your Name'}</h3>
                <p className="text-xs text-rose-200/60 mt-0.5">Update your display name and profile picture.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <Input
                label="Your Full Name"
                icon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {/* Upload Profile Avatar File */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-rose-200/80 uppercase tracking-wider">
                  Profile Photo File (Max 5MB)
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-bold flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Select Avatar File
                  </Button>
                  {avatarFile ? (
                    <span className="text-xs text-rose-300 font-medium truncate max-w-[200px]">
                      {avatarFile.name}
                    </span>
                  ) : (
                    <span className="text-xs text-rose-200/40">No new file chosen</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>

              <CustomDatePicker
                label="Relationship Anniversary / Start Date"
                value={anniversaryDate}
                onChange={(dateVal) => setAnniversaryDate(dateVal)}
              />

              <Button type="submit" isLoading={isSaving} className="w-full font-bold mt-2 py-3">
                Save Profile Settings
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 2: Account & Security */}
      {activeTab === 'account' && (
        <div className="flex flex-col gap-6 w-full">
          {/* Active Deletion Alert Banner (If Deletion Scheduled) */}
          {isDeletionScheduled && (
            <Card className="p-6 border-amber-500/50 bg-gradient-to-r from-amber-950/70 via-rose-950/60 to-slate-950/70 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Account Deletion Scheduled
                    </span>
                    <h4 className="text-lg font-extrabold text-white mt-0.5">
                      Scheduled for {deletionScheduledForDate}
                    </h4>
                    <p className="text-xs text-amber-200/80 mt-1 leading-relaxed max-w-xl">
                      Your account will be permanently deleted after 1 month of inactivity. Logging back in automatically cancels deletion before the deadline.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleToggleAccountDeletion('cancel')}
                  isLoading={isDeletingAccount}
                  variant="primary"
                  size="md"
                  className="font-bold shrink-0"
                >
                  <RefreshCw className="w-4 h-4" /> Cancel Deletion Schedule
                </Button>
              </div>
            </Card>
          )}

          {/* Account Overview & Session */}
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white">Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl glass-card border border-white/10">
                <span className="text-rose-200/60 block">Registered Email</span>
                <strong className="text-white text-sm block mt-0.5">{user?.email}</strong>
              </div>
              <div className="p-3 rounded-xl glass-card border border-white/10">
                <span className="text-rose-200/60 block">Partner Connection</span>
                <strong className="text-white text-sm block mt-0.5">
                  {partner ? `Paired with ${partner.name}` : 'Not Paired'}
                </strong>
              </div>
            </div>
          </Card>

          {/* Session Logout Action */}
          <Card className="p-6 flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white">Log Out of Account</h4>
              <p className="text-xs text-rose-200/60">Sign out of Pairly on this web browser</p>
            </div>
            <Button onClick={logout} variant="outline" size="sm" className="font-bold">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </Card>

          {/* Danger Zone: Account Deletion */}
          <Card className="p-6 border-red-500/30 bg-gradient-to-b from-red-950/20 to-slate-950/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" /> Danger Zone: Delete Pairly Account
                </h4>
                <p className="text-xs text-rose-200/60 mt-1 max-w-xl leading-relaxed">
                  Requires a <strong>minimum of 1 month of inactivity</strong> before permanent deletion. If you log back into this account at any time before the 30-day period expires, deletion is automatically cancelled.
                </p>
              </div>

              {!isDeletionScheduled ? (
                <Button
                  onClick={() => setDeleteModalOpen(true)}
                  variant="danger"
                  size="md"
                  className="font-bold shrink-0"
                >
                  Schedule Account Deletion
                </Button>
              ) : (
                <Button
                  onClick={() => handleToggleAccountDeletion('cancel')}
                  isLoading={isDeletingAccount}
                  variant="outline"
                  size="md"
                  className="font-bold shrink-0 text-amber-300 border-amber-500/50 hover:bg-amber-500/10"
                >
                  Cancel Deletion Schedule
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Modal for Unpairing Partner */}
      <ConfirmModal
        isOpen={unpairModalOpen}
        onClose={() => setUnpairModalOpen(false)}
        onConfirm={handleExecuteUnpair}
        isLoading={isUnpairing}
        title="Unpair Partner Account?"
        message={`Are you sure you want to unpair from ${partner?.name || 'your partner'}? You will no longer share live mood status, timeline, or letters until paired again.`}
        confirmText="Unpair Partner"
      />

      {/* Confirmation Modal for Account Deletion Schedule */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => handleToggleAccountDeletion('schedule')}
        isLoading={isDeletingAccount}
        title="Schedule Account Deletion?"
        message="Your account will enter a 1-month (30 days) inactivity countdown. If you log back into Pairly anytime during the next 30 days, your deletion request will be automatically cancelled."
        confirmText="Schedule 30-Day Deletion"
      />
    </div>
  );
};

export default SettingsPage;
