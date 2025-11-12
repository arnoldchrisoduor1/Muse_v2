// components/profile/UpdateProfileModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, User, Mail, Globe, Twitter, Instagram, FileText } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';
import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateProfileModal({ isOpen, onClose }: UpdateProfileModalProps) {
  const { user } = useAuth();
  const { viewedProfile, updateProfile, isUpdatingProfile } = useUserStore();
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    website: '',
    twitter: '',
    instagram: '',
    allowRemixes: true,
    defaultLicenseType: 'CC BY-NC',
  });

  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');

  // Load current profile data when modal opens
  useEffect(() => {
    if (isOpen && viewedProfile) {
      setFormData({
        username: viewedProfile.username || '',
        bio: viewedProfile.bio || '',
        website: viewedProfile.website || '',
        twitter: viewedProfile.twitter || '',
        instagram: viewedProfile.instagram || '',
        allowRemixes: viewedProfile.allowRemixes ?? true,
        defaultLicenseType: viewedProfile.defaultLicenseType || 'CC BY-NC',
      });
      setAvatarPreview(viewedProfile.avatarUrl || '');
      setCoverPreview(viewedProfile.coverImageUrl || '');
    }
  }, [isOpen, viewedProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implement actual image upload
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      console.log('Avatar file selected:', file.name);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implement actual image upload
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
      console.log('Cover file selected:', file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        ...formData,
        avatarUrl: avatarPreview, // This would be the uploaded URL
        coverImageUrl: coverPreview, // This would be the uploaded URL
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Card className="glass-card p-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold gradient-text">Edit Profile</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-text-secondary">
                    Cover Image
                  </label>
                  <div className="relative aspect-[3/1] rounded-lg overflow-hidden border-2 border-dashed border-white/20 hover:border-primary transition-colors">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <FileText size={32} className="text-text-muted" />
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload size={24} className="text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <label className="block text-sm font-medium mb-3 text-text-secondary">
                      Avatar
                    </label>
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-primary transition-colors">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <User size={20} className="text-text-muted" />
                        </div>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload size={16} className="text-white" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-muted">
                      Click on the avatar to upload a new image. Recommended size: 400x400px
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-2 text-text-secondary">
                      <User size={16} className="inline mr-2" />
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter your username"
                    />
                  </div>

                  {/* <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-text-secondary">
                      <Mail size={16} className="inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter your email"
                    />
                  </div> */}
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-2 text-text-secondary">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium mb-2 text-text-secondary">
                      <Globe size={16} className="inline mr-2" />
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium mb-2 text-text-secondary">
                      <Twitter size={16} className="inline mr-2" />
                      Twitter
                    </label>
                    <input
                      type="text"
                      id="twitter"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="yourusername"
                    />
                  </div>

                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium mb-2 text-text-secondary">
                      <Instagram size={16} className="inline mr-2" />
                      Instagram
                    </label>
                    <input
                      type="text"
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="yourusername"
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="defaultLicenseType" className="block text-sm font-medium mb-2 text-text-secondary">
                      Default License
                    </label>
                    <select
                      id="defaultLicenseType"
                      name="defaultLicenseType"
                      value={formData.defaultLicenseType}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="CC BY-NC">CC BY-NC</option>
                      <option value="CC BY">CC BY</option>
                      <option value="CC BY-SA">CC BY-SA</option>
                      <option value="All Rights Reserved">All Rights Reserved</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="allowRemixes"
                    name="allowRemixes"
                    checked={formData.allowRemixes}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <label htmlFor="allowRemixes" className="text-sm text-text-secondary">
                    Allow other users to create remixes of my poems
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isUpdatingProfile}
                    className="flex-1"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}