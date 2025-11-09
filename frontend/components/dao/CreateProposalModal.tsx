"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Vote, Users, Sparkles, Settings, Zap, Shield, DollarSign, FileText } from 'lucide-react';
import { useDAOStore } from '@/lib/store/dao-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface CreateProposalModalProps {
  onClose: () => void;
}

interface ProposalFormData {
  title: string;
  description: string;
  proposalType: 'grant' | 'treasury_allocation' | 'platform_feature' | 'collective_training' | 'moderation' | 'partnership';
  requestedAmount: number | null;
  recipients: string[];
  featureDescription: string;
  trainingDetails: {
    poemsCount: number;
    trainingTime: string;
    modelSize: string;
    newFeatures: string[];
  };
  tags: string[];
  discussionUrl: string;
  votingDuration: number; // days
}

const proposalTypes = [
  {
    id: 'grant' as const,
    label: 'Grant Proposal',
    description: 'Request funding for individual poets or projects',
    icon: Users,
    color: 'from-primary to-secondary',
    requiresAmount: true,
    requiresRecipients: true,
  },
  {
    id: 'treasury_allocation' as const,
    label: 'Treasury Allocation',
    description: 'Allocate treasury funds for specific initiatives',
    icon: DollarSign,
    color: 'from-accent to-warning',
    requiresAmount: true,
    requiresRecipients: false,
  },
  {
    id: 'platform_feature' as const,
    label: 'Platform Feature',
    description: 'Propose new features or improvements to the platform',
    icon: Settings,
    color: 'from-warning to-secondary',
    requiresAmount: false,
    requiresRecipients: false,
  },
  {
    id: 'collective_training' as const,
    label: 'Collective Training',
    description: 'Train new versions of the Collective Consciousness',
    icon: Zap,
    color: 'from-secondary to-primary',
    requiresAmount: true,
    requiresRecipients: false,
  },
  {
    id: 'moderation' as const,
    label: 'Moderation Policy',
    description: 'Update community guidelines or moderation rules',
    icon: Shield,
    color: 'from-purple-500 to-pink-500',
    requiresAmount: false,
    requiresRecipients: false,
  },
  {
    id: 'partnership' as const,
    label: 'Partnership',
    description: 'Propose collaborations with other organizations',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    requiresAmount: false,
    requiresRecipients: false,
  },
];

const defaultTrainingDetails = {
  poemsCount: 5000,
  trainingTime: '2 weeks',
  modelSize: '7B parameters',
  newFeatures: [''],
};

export function CreateProposalModal({ onClose }: CreateProposalModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProposalFormData>({
    title: '',
    description: '',
    proposalType: 'grant',
    requestedAmount: null,
    recipients: [''],
    featureDescription: '',
    trainingDetails: defaultTrainingDetails,
    tags: [],
    discussionUrl: '',
    votingDuration: 7,
  });
  const [newTag, setNewTag] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [newFeature, setNewFeature] = useState('');

  const { createProposal, isCreatingProposal } = useDAOStore();

  const updateFormData = (updates: Partial<ProposalFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData({ tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateFormData({ tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleAddRecipient = () => {
    if (newRecipient.trim() && !formData.recipients.includes(newRecipient.trim())) {
      updateFormData({ recipients: [...formData.recipients, newRecipient.trim()] });
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (recipientToRemove: string) => {
    updateFormData({ recipients: formData.recipients.filter(recipient => recipient !== recipientToRemove) });
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      updateFormData({
        trainingDetails: {
          ...formData.trainingDetails,
          newFeatures: [...formData.trainingDetails.newFeatures, newFeature.trim()]
        }
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    updateFormData({
      trainingDetails: {
        ...formData.trainingDetails,
        newFeatures: formData.trainingDetails.newFeatures.filter(feature => feature !== featureToRemove)
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    const proposalData = {
      title: formData.title,
      description: formData.description,
      proposalType: formData.proposalType,
      proposerId: 'current_user',
      proposer: {
        username: 'current_user',
        avatarUrl: '/avatars/current.jpg',
        reputation: 85,
      },
      votingStartsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Start tomorrow
      votingEndsAt: new Date(Date.now() + (formData.votingDuration + 1) * 24 * 60 * 60 * 1000),
      quorumRequired: formData.proposalType === 'grant' ? 40 : 30,
      approvalThreshold: formData.proposalType === 'grant' ? 60 : 50,
      requestedAmount: formData.requestedAmount,
      recipients: formData.recipients.filter(r => r.trim()),
      featureDescription: formData.featureDescription,
      trainingDetails: formData.proposalType === 'collective_training' ? formData.trainingDetails : null,
      discussionUrl: formData.discussionUrl || `https://forum.collectivepoetry.io/proposals/new`,
      tags: formData.tags,
    };

    await createProposal(proposalData);
    onClose();
  };

  const selectedProposalType = proposalTypes.find(type => type.id === formData.proposalType);

  const canProceedToStep2 = formData.title.trim().length > 0 && formData.description.trim().length > 0;
  const canProceedToStep3 = currentStep === 2 && (
    !selectedProposalType?.requiresAmount || formData.requestedAmount !== null
  );
  const canSubmit = currentStep === 3;

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Title and description' },
    { number: 2, title: 'Proposal Details', description: 'Type-specific details' },
    { number: 3, title: 'Review & Submit', description: 'Final review' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Vote className="text-primary" />
                Create New Proposal
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Submit a proposal to shape the future of Collective Poetry
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step.number
                      ? 'bg-primary border-primary text-white'
                      : 'border-white/20 text-text-muted'
                  }`}>
                    {step.number}
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-text-primary' : 'text-text-muted'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-text-muted">
                      {step.description}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-primary">
                    Proposal Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    placeholder="Clear, concise title that summarizes your proposal..."
                    className="input-field"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Example: "Fund 10 Emerging Poets with $1,000 Grants"
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-primary">
                    Proposal Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Detailed description of your proposal. Explain the problem, solution, and benefits to the community..."
                    className="input-field min-h-[200px] resize-none"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Be specific about what you want to achieve and how it benefits the Collective Poetry community.
                  </p>
                </div>

                {/* Proposal Type */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-text-primary">
                    Proposal Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {proposalTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = formData.proposalType === type.id;
                      
                      return (
                        <motion.button
                          key={type.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateFormData({ proposalType: type.id })}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-90 ${type.color} flex items-center justify-center`}>
                              <Icon size={20} className="text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-text-primary">
                                {type.label}
                              </div>
                              <div className="text-xs text-text-muted">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Amount Requested */}
                {selectedProposalType?.requiresAmount && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-primary">
                      Amount Requested (ETH) *
                    </label>
                    <input
                      type="number"
                      value={formData.requestedAmount || ''}
                      onChange={(e) => updateFormData({ requestedAmount: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="0.00"
                      className="input-field"
                      min="0"
                      step="0.1"
                    />
                    <p className="text-xs text-text-muted mt-1">
                      Current treasury: 34.2 ETH (${(34.2 * 3000).toLocaleString()})
                    </p>
                  </div>
                )}

                {/* Recipients */}
                {selectedProposalType?.requiresRecipients && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-primary">
                      Recipients *
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newRecipient}
                          onChange={(e) => setNewRecipient(e.target.value)}
                          placeholder="Enter username or wallet address..."
                          className="input-field flex-1"
                        />
                        <Button
                          variant="secondary"
                          onClick={handleAddRecipient}
                          disabled={!newRecipient.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      
                      {formData.recipients.filter(r => r.trim()).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.recipients.filter(r => r.trim()).map((recipient) => (
                            <div
                              key={recipient}
                              className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
                            >
                              {recipient}
                              <button
                                onClick={() => handleRemoveRecipient(recipient)}
                                className="hover:text-primary-dark"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Feature Description */}
                {formData.proposalType === 'platform_feature' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-primary">
                      Feature Description
                    </label>
                    <textarea
                      value={formData.featureDescription}
                      onChange={(e) => updateFormData({ featureDescription: e.target.value })}
                      placeholder="Describe the feature in detail, including user benefits and technical requirements..."
                      className="input-field min-h-[120px] resize-none"
                    />
                  </div>
                )}

                {/* Training Details */}
                {formData.proposalType === 'collective_training' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-primary">
                        Poems for Training
                      </label>
                      <input
                        type="number"
                        value={formData.trainingDetails.poemsCount}
                        onChange={(e) => updateFormData({
                          trainingDetails: {
                            ...formData.trainingDetails,
                            poemsCount: parseInt(e.target.value) || 0
                          }
                        })}
                        className="input-field"
                        min="1000"
                        step="1000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-primary">
                        Expected Training Time
                      </label>
                      <input
                        type="text"
                        value={formData.trainingDetails.trainingTime}
                        onChange={(e) => updateFormData({
                          trainingDetails: {
                            ...formData.trainingDetails,
                            trainingTime: e.target.value
                          }
                        })}
                        placeholder="e.g., 2 weeks"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-primary">
                        Model Size
                      </label>
                      <input
                        type="text"
                        value={formData.trainingDetails.modelSize}
                        onChange={(e) => updateFormData({
                          trainingDetails: {
                            ...formData.trainingDetails,
                            modelSize: e.target.value
                          }
                        })}
                        placeholder="e.g., 7B parameters"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-primary">
                        New Features
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Describe a new feature..."
                            className="input-field flex-1"
                          />
                          <Button
                            variant="secondary"
                            onClick={handleAddFeature}
                            disabled={!newFeature.trim()}
                          >
                            Add
                          </Button>
                        </div>
                        
                        {formData.trainingDetails.newFeatures.filter(f => f.trim()).length > 0 && (
                          <div className="space-y-1">
                            {formData.trainingDetails.newFeatures.filter(f => f.trim()).map((feature, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-secondary/20 text-secondary px-3 py-2 rounded text-sm"
                              >
                                <FileText size={14} />
                                <span className="flex-1">{feature}</span>
                                <button
                                  onClick={() => handleRemoveFeature(feature)}
                                  className="hover:text-secondary-dark"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Voting Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-primary">
                    Voting Duration (Days)
                  </label>
                  <select
                    value={formData.votingDuration}
                    onChange={(e) => updateFormData({ votingDuration: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    <option value={3}>3 Days (Quick Decision)</option>
                    <option value={7}>7 Days (Standard)</option>
                    <option value={14}>14 Days (Complex Proposals)</option>
                  </select>
                </div>

                {/* Discussion URL */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-primary">
                    Discussion URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.discussionUrl}
                    onChange={(e) => updateFormData({ discussionUrl: e.target.value })}
                    placeholder="https://forum.collectivepoetry.io/proposals/..."
                    className="input-field"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Link to forum discussion for this proposal
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-primary">
                    Tags
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tags to help categorize your proposal..."
                        className="input-field flex-1"
                      />
                      <Button
                        variant="secondary"
                        onClick={handleAddTag}
                        disabled={!newTag.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <div
                            key={tag}
                            className="flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-accent-dark"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Review Summary */}
                <Card className="p-6 border border-primary/20">
                  <h3 className="font-semibold mb-4 text-primary">Proposal Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-text-muted">Title</label>
                        <p className="font-medium">{formData.title}</p>
                      </div>
                      <div>
                        <label className="text-sm text-text-muted">Type</label>
                        <p className="font-medium capitalize">{formData.proposalType.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-text-muted">Description</label>
                      <p className="font-medium text-sm leading-relaxed">{formData.description}</p>
                    </div>

                    {formData.requestedAmount && (
                      <div>
                        <label className="text-sm text-text-muted">Amount Requested</label>
                        <p className="font-medium">
                          {formData.requestedAmount} ETH (${(formData.requestedAmount * 3000).toLocaleString()})
                        </p>
                      </div>
                    )}

                    {formData.recipients.filter(r => r.trim()).length > 0 && (
                      <div>
                        <label className="text-sm text-text-muted">Recipients</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.recipients.filter(r => r.trim()).map((recipient) => (
                            <span key={recipient} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                              {recipient}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-text-muted">Voting Duration</label>
                        <p className="font-medium">{formData.votingDuration} days</p>
                      </div>
                      <div>
                        <label className="text-sm text-text-muted">Tags</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Cost Estimate */}
                <Card className="p-6 border border-warning/20">
                  <h3 className="font-semibold mb-4 text-warning">Cost Estimate</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Proposal Creation Fee</span>
                      <span>0.01 ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Smart Contract Execution</span>
                      <span>~0.005 ETH</span>
                    </div>
                    {formData.requestedAmount && (
                      <div className="flex justify-between font-semibold border-t border-white/10 pt-2">
                        <span>Total Cost</span>
                        <span>{(formData.requestedAmount + 0.015).toFixed(3)} ETH</span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Warning */}
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm text-warning flex items-start gap-2">
                    <Shield size={16} className="mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Important:</strong> Proposals cannot be edited after submission. 
                      Ensure all details are correct. Spam or malicious proposals may result in 
                      reputation loss.
                    </span>
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onClose : () => setCurrentStep(currentStep - 1)}
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <div className="flex items-center gap-3">
              {currentStep < 3 && (
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && !canProceedToStep2) ||
                    (currentStep === 2 && !canProceedToStep3)
                  }
                >
                  Continue
                </Button>
              )}
              
              {currentStep === 3 && (
                <Button
                  variant="primary"
                  loading={isCreatingProposal}
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  icon={Vote}
                >
                  Submit Proposal
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}