"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Copy, Check, Download, Shield } from 'lucide-react';
import { useAnonymousStore } from '@/lib/store/anonymous-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function ZKProofDisplay() {
  const [showSensitive, setShowSensitive] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const { generatedProof, verifyProof } = useAnonymousStore();

  if (!generatedProof) return null;

  const isVerified = verifyProof(generatedProof);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadProof = () => {
    const proofData = {
      ...generatedProof,
      warning: "SAVE THIS SECURELY! You need this proof to claim royalties later. Do not lose it!",
      instructions: "To claim royalties: 1) Use this proof with the claim interface 2) Provide the commitment and nullifier 3) Receive earnings to your wallet",
    };
    
    const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zk-proof-${generatedProof.poemId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sensitiveFields = [
    { label: 'Commitment Hash', value: generatedProof.commitment, field: 'commitment' },
    { label: 'Nullifier Hash', value: generatedProof.nullifier, field: 'nullifier' },
    { label: 'Content Hash', value: generatedProof.contentHash, field: 'contentHash' },
  ];

  return (
    <Card className="p-6 border border-accent/30 bg-accent/5">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="text-accent" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-accent">Zero-Knowledge Proof Generated</h3>
          <p className="text-text-secondary text-sm">
            Your anonymous identity is now cryptographically secured
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isVerified 
              ? 'bg-accent/20 text-accent border border-accent/30' 
              : 'bg-error/20 text-error border border-error/30'
          }`}>
            {isVerified ? '✓ Verified' : 'Unverified'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Proof ID */}
        <div>
          <label className="block text-sm text-text-muted mb-2">Proof ID</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white/10 p-3 rounded text-sm break-all font-mono">
              {generatedProof.poemId}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(generatedProof.poemId, 'poemId')}
              className="!p-2"
            >
              {copiedField === 'poemId' ? <Check size={14} /> : <Copy size={14} />}
            </Button>
          </div>
        </div>

        {/* Sensitive Data */}
        {sensitiveFields.map(({ label, value, field }) => (
          <div key={field}>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-text-muted">{label}</label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSensitive(!showSensitive)}
                  className="!p-1"
                >
                  {showSensitive ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(value, field)}
                  className="!p-1"
                >
                  {copiedField === field ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
            </div>
            <code className="block bg-white/10 p-3 rounded text-sm break-all font-mono">
              {showSensitive ? value : '•'.repeat(64)}
            </code>
            {copiedField === field && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-accent text-xs mt-1 flex items-center gap-1"
              >
                <Check size={12} />
                Copied to clipboard
              </motion.span>
            )}
          </div>
        ))}

        {/* Timestamp */}
        <div>
          <label className="block text-sm text-text-muted mb-2">Generated</label>
          <div className="bg-white/10 p-3 rounded text-sm">
            {new Date(generatedProof.timestamp).toLocaleString()}
          </div>
        </div>

        {/* Download Proof */}
        <div className="pt-4 border-t border-white/10">
          <Button
            variant="primary"
            icon={Download}
            onClick={downloadProof}
            className="w-full"
          >
            Download Proof File
          </Button>
          <p className="text-xs text-text-muted mt-2 text-center">
            Save this file securely! You'll need it to claim royalties.
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
          <p className="text-sm text-accent flex items-start gap-2">
            <Shield size={16} className="mt-0.5 flex-shrink-0" />
            <span>
              <strong>Critical:</strong> Your identity is protected by these cryptographic proofs. 
              Anyone with this proof can claim ownership. Store it securely and privately.
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
}