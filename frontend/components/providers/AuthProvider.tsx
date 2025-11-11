"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = [
    { text: "Initializing security protocols...", icon: "🔒" },
    { text: "Loading your personalized experience...", icon: "✨" },
    { text: "Almost ready to begin...", icon: "🚀" },
    { text: "Welcome to your journey!", icon: "🎉" }
  ];

  useEffect(() => {
    if (!isInitialized) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
      }, 1800);
      return () => clearInterval(interval);
    }
  }, [isInitialized, loadingSteps.length]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-135 from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          {/* Animated Sparkles Icon */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="w-20 h-20 bg-gradient-135 from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Sparkles size={36} className="text-white" />
          </motion.div>
          
          {/* Title */}
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent"
          >
            Preparing Your Journey
          </motion.h3>
          
          {/* Animated Text */}
          <div className="min-h-[4rem] flex items-center justify-center mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <span className="text-2xl">{loadingSteps[currentStep].icon}</span>
                <p className="text-white text-lg font-medium">
                  {loadingSteps[currentStep].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Steps */}
          <div className="space-y-3 text-sm text-blue-200 max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Securing your connection</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Loading preferences</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span>Finalizing setup</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}