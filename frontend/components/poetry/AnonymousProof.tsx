// "use client"
// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Shield, CheckCircle, Lock, Eye, EyeOff, Copy } from 'lucide-react';
// import { usePoetryStore } from '@/lib/store/poetry-store';
// import { Card } from '@/components/ui/Card';
// import { Button } from '@/components/ui/Button';
// import { AnonymousPoemTester } from '@/components/dev/AnonymousPoemTester';

// export const AnonymousProof: React.FC = () => {
//   const [poemContent, setPoemContent] = useState('');
//   const [copiedField, setCopiedField] = useState<string | null>(null);
//   const { zkProof, isLoading, createAnonymousPoem } = usePoetryStore();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!poemContent.trim()) return;
//     await createAnonymousPoem(poemContent);
//   };

//   const copyToClipboard = (text: string, field: string) => {
//     navigator.clipboard.writeText(text);
//     setCopiedField(field);
//     setTimeout(() => setCopiedField(null), 2000);
//   };

//   return (
//     <div className="space-y-6">
//       <Card glow className="p-6">
//         <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
//           <Shield className="text-secondary" />
//           Post Anonymously with Ownership Proof
//         </h2>
        
//         <p className="text-text-secondary mb-6">
//           Publish controversial or personal poetry without revealing your identity,
//           while maintaining cryptographic proof of authorship for royalty collection.
//         </p>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium mb-2">Anonymous Poem</label>
//             <textarea
//               value={poemContent}
//               onChange={(e) => setPoemContent(e.target.value)}
//               placeholder="Your words remain yours, your identity remains hidden..."
//               className="input-field"
//               rows={8}
//             />
//           </div>
          
//           <PrivacyFeatures />
          
//           <Button
//             type="submit"
//             loading={isLoading}
//             disabled={!poemContent.trim()}
//             className="w-full"
//             icon={Shield}
//           >
//             Post Anonymously
//           </Button>
//         </form>
        
//         <AnimatePresence>
//           {zkProof && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               className="mt-6"
//             >
//               <ProofDisplay 
//                 proof={zkProof} 
//                 copiedField={copiedField}
//                 onCopy={copyToClipboard}
//               />
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </Card>
      
//       <HowItWorks />
//       {process.env.NODE_ENV === 'development' && (
//         <AnonymousPoemTester />
//       )}
//     </div>
//   );
// };

// const PrivacyFeatures: React.FC = () => {
//   return (
//     <Card className="p-4 border border-accent/30 bg-accent/5">
//       <h4 className="font-semibold mb-3 flex items-center gap-2 text-accent">
//         <Lock size={18} />
//         Zero-Knowledge Privacy Guarantees
//       </h4>
//       <ul className="text-sm space-y-2">
//         {[
//           "Your identity is never revealed on-chain",
//           "Cryptographic proof allows royalty collection",
//           "Nullifiers prevent double-claiming",
//           "You can prove ownership anytime without exposing who you are",
//           "Even the platform cannot determine authorship"
//         ].map((feature, index) => (
//           <motion.li
//             key={feature}
//             initial={{ opacity: 0, x: -10 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: index * 0.1 }}
//             className="flex items-center gap-2 text-text-secondary"
//           >
//             <CheckCircle size={16} className="text-accent flex-shrink-0" />
//             {feature}
//           </motion.li>
//         ))}
//       </ul>
//     </Card>
//   );
// };

// interface ProofDisplayProps {
//   proof: NonNullable<ReturnType<typeof usePoetryStore>['zkProof']>;
//   copiedField: string | null;
//   onCopy: (text: string, field: string) => void;
// }

// const ProofDisplay: React.FC<ProofDisplayProps> = ({ proof, copiedField, onCopy }) => {
//   const [showSensitive, setShowSensitive] = useState(false);

//   const sensitiveData = [
//     { label: 'Public Commitment', value: proof.commitment, field: 'commitment' },
//     { label: 'Nullifier Hash', value: proof.nullifier, field: 'nullifier' },
//   ];

//   return (
//     <Card className="p-6 border border-accent/30 bg-accent/5">
//       <h3 className="text-lg font-semibold text-accent mb-4 flex items-center gap-2">
//         <CheckCircle size={20} />
//         ✓ Posted Successfully
//       </h3>
      
//       <div className="space-y-4">
//         {sensitiveData.map(({ label, value, field }) => (
//           <div key={field}>
//             <div className="flex items-center justify-between mb-2">
//               <div className="text-text-muted text-sm">{label}:</div>
//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setShowSensitive(!showSensitive)}
//                   className="!p-1"
//                 >
//                   {showSensitive ? <EyeOff size={14} /> : <Eye size={14} />}
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => onCopy(value, field)}
//                   className="!p-1"
//                 >
//                   <Copy size={14} />
//                 </Button>
//               </div>
//             </div>
//             <code className="block bg-white/10 p-3 rounded text-xs break-all font-mono">
//               {showSensitive ? value : '•'.repeat(64)}
//             </code>
//             {copiedField === field && (
//               <motion.span
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="text-accent text-xs mt-1 flex items-center gap-1"
//               >
//                 <CheckCircle size={12} />
//                 Copied to clipboard
//               </motion.span>
//             )}
//           </div>
//         ))}
        
//         <Card className="p-4 border border-accent/20 bg-accent/10">
//           <p className="text-accent text-sm flex items-start gap-2">
//             <Shield size={16} className="mt-0.5 flex-shrink-0" />
//             <span>
//               <strong>Save your proof securely!</strong> You'll need both the commitment and nullifier 
//               to claim royalties later. Your identity remains completely hidden while your ownership 
//               is cryptographically verifiable.
//             </span>
//           </p>
//         </Card>
        
//         <div className="flex items-center justify-between text-xs text-text-muted">
//           <span>Poem ID: {proof.poemId}</span>
//           <span className="text-accent">✓ Proof Verified</span>
//         </div>
//       </div>
//     </Card>
//   );
// };

// const HowItWorks: React.FC = () => {
//   const steps = [
//     {
//       emoji: '1️⃣',
//       title: 'Create Commitment',
//       description: 'Generate a cryptographic commitment that links your identity to the poem without revealing it.'
//     },
//     {
//       emoji: '2️⃣',
//       title: 'Post Anonymously',
//       description: 'Publish with only the commitment visible. No connection to your account.'
//     },
//     {
//       emoji: '3️⃣',
//       title: 'Prove & Claim',
//       description: 'Later, prove ownership mathematically to claim royalties without revealing identity.'
//     }
//   ];

//   return (
//     <Card className="p-6">
//       <h3 className="text-lg font-semibold mb-4">How Zero-Knowledge Proofs Work</h3>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {steps.map((step, index) => (
//           <motion.div
//             key={step.title}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.2 }}
//           >
//             <Card className="p-4 h-full bg-white/5 hover:bg-white/10 transition-colors duration-200">
//               <div className="text-2xl mb-3">{step.emoji}</div>
//               <h4 className="font-semibold mb-2 text-text-primary">{step.title}</h4>
//               <p className="text-sm text-text-secondary">{step.description}</p>
//             </Card>
//           </motion.div>
//         ))}
//       </div>
      
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.6 }}
//         className="mt-6 p-4 bg-white/5 rounded-lg border border-border-muted"
//       >
//         <h4 className="font-semibold mb-2 text-text-primary">Technical Foundation</h4>
//         <p className="text-sm text-text-secondary">
//           Built on zk-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge), 
//           allowing you to prove poem ownership without revealing any identifying information. 
//           The nullifier prevents double-claiming while maintaining complete anonymity.
//         </p>
//       </motion.div>
//     </Card>
//   );
// };