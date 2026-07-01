import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Calendar, Activity, Edit2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import api from '../../services/api';

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const ProfileTab = ({ stats }) => {
  const { user, refreshUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [address, setAddress] = useState(user?.address || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!user) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) {
      toast.error("Please configure Cloudinary in your .env file!");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setPhotoURL(data.secure_url);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Image upload failed: " + data.error?.message);
      }
    } catch (err) {
      toast.error("Error uploading image: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.patch('/auth/profile', { displayName, address, photoURL });
      await refreshUser();
      toast.success('Profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative p-0">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-orange-500/20 via-rose-500/20 to-violet-500/20"></div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-16 mb-6 gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-800 rounded-full border-4 border-slate-900 flex items-center justify-center text-4xl sm:text-5xl font-black text-white shadow-xl relative z-10 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                user.displayName?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="text-center sm:text-left flex-grow">
              <h2 className="text-3xl font-bold text-white mb-1">{user.displayName}</h2>
              <p className="text-slate-400 flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
              {user.role === 'Organizer' && user.address && (
                <p className="text-slate-500 text-sm flex items-center justify-center sm:justify-start gap-2">
                  📍 {user.address}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-3">
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-rose-400 flex items-center gap-2">
                <Shield className="w-4 h-4" /> {user.role}
              </span>
              <Button 
                onClick={() => {
                  setDisplayName(user.displayName || '');
                  setAddress(user.address || '');
                  setPhotoURL(user.photoURL || '');
                  setIsEditModalOpen(true);
                }}
                variant="secondary" 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-full flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-lg font-bold text-white">2026</p>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Account Status</p>
                <p className="text-lg font-bold text-white">Active</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Optional Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</h3>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        footer={
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-teal-500 hover:bg-teal-600 text-white border-none min-w-[120px]">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Profile Image</label>
            <div className="flex items-center gap-4">
              {photoURL && <img src={photoURL} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-white/20" />}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-500/10 file:text-teal-400 hover:file:bg-teal-500/20 transition-colors"
              />
              {isUploading && <Loader2 className="w-5 h-5 animate-spin text-teal-400" />}
            </div>
          </div>
          
          {user.role === 'Organizer' && (
            <Input
              label="Company / Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your physical address or company location"
              required
            />
          )}

          <Input
            label="Email"
            value={user.email}
            disabled
            className="opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500">Email addresses are tied to your primary authentication provider and cannot be changed here.</p>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileTab;
