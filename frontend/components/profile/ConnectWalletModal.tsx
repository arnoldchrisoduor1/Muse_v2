"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Copy, Check, AlertCircle } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';
import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { user } = useAuth();
  const { viewedProfile, connectWallet, isConnectingWallet } = useUserStore();
  
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic wallet address validation
    if (!walletAddress.trim()) {
      setError('Wallet address is required');
      return;
    }

    if (!user?.id) {
      setError('User not found');
      return;
    }

    try {
      await connectWallet(user.id, walletAddress.trim());
      setWalletAddress('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const copyCurrentWallet = () => {
    if (viewedProfile?.walletAddress) {
      navigator.clipboard.writeText(viewedProfile.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
            className="w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Card className="glass-card p-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Wallet size={24} className="text-primary" />
                  <h2 className="text-xl font-bold gradient-text">
                    {viewedProfile?.walletAddress ? 'Update Wallet' : 'Connect Wallet'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Current Wallet Display */}
                {viewedProfile?.walletAddress && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-secondary">Current Wallet</span>
                      <button
                        type="button"
                        onClick={copyCurrentWallet}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-text-primary break-all">
                      {viewedProfile.walletAddress}
                    </p>
                  </div>
                )}

                {/* Wallet Address Input */}
                <div>
                  <label htmlFor="walletAddress" className="block text-sm font-medium mb-3 text-text-secondary">
                    {viewedProfile?.walletAddress ? 'New Wallet Address' : 'Wallet Address'}
                  </label>
                  <input
                    type="text"
                    id="walletAddress"
                    value={walletAddress}
                    onChange={(e) => {
                      setWalletAddress(e.target.value);
                      setError('');
                    }}
                    className="input-field"
                    placeholder="Enter your wallet address (0x...)"
                    disabled={isConnectingWallet}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-error/20 border border-error/30 rounded-lg">
                    <AlertCircle size={16} className="text-error" />
                    <span className="text-sm text-error">{error}</span>
                  </div>
                )}

                {/* Info Text */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Connect your wallet to receive payments and manage your digital assets. 
                    This address will be used for all transactions.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isConnectingWallet}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isConnectingWallet || !walletAddress.trim()}
                    className="flex-1"
                  >
                    {isConnectingWallet ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : viewedProfile?.walletAddress ? (
                      'Update Wallet'
                    ) : (
                      'Connect Wallet'
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