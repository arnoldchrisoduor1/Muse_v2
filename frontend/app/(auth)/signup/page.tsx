"use client";
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react'; // Added useEffect
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added useRouter
import { useAuthStore } from '@/lib/store/auth-store';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  
  const { 
    signUp, 
    signInWithGoogle, 
    createAnonymousSession, 
    isSigningUp, 
    isSigningInWithGoogle, 
    isCreatingAnonymous,
    error,
    clearError,
    isAuthenticated,
    isInitialized
  } = useAuth();

  // Add useEffect to handle redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/explore');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      useAuthStore.getState().error = 'Passwords do not match';
      return;
    }
    
    if (formData.password.length < 6) {
      useAuthStore.getState().error = 'Password must be at least 6 characters';
      return;
    }

    console.log("Signing up user: ", formData);
    
    try {
      await signUp(formData.email, formData.password, formData.username);
      // The redirect will be handled by the auth store now
    } catch (error) {
      // Error is already handled by the store
      console.error('Sign up failed:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Redirect handled by auth store
    } catch (error) {
      console.error('Google sign in failed:', error);
    }
  };

  const handleAnonymousSession = async () => {
    try {
      await createAnonymousSession();
      // Redirect handled by auth store
    } catch (error) {
      console.error('Anonymous session creation failed:', error);
    }
  };

  // Update the auth options to use proper onClick handlers
  const authOptions = [
    {
      title: 'Full Account',
      description: 'Create a permanent account with email and password',
      icon: User,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
      onClick: () => {
        // This will show the form, so we don't trigger signup directly
        // The form submission handles the actual signup
      },
      loading: isSigningUp,
      type: 'form' as const
    },
    {
      title: 'Google Account',
      description: 'Sign up quickly with your Google account',
      icon: Mail,
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
      onClick: handleGoogleSignIn,
      loading: isSigningInWithGoogle,
      type: 'oauth' as const
    },
    {
      title: 'Anonymous Session',
      description: 'Start creating immediately without an account',
      icon: Shield,
      color: 'text-accent',
      bgColor: 'bg-accent/20',
      onClick: handleAnonymousSession,
      loading: isCreatingAnonymous,
      type: 'anonymous' as const
    }
  ];

  // If already authenticated, show loading state while redirecting
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-135 from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting to explore...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-135 from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-90 from-secondary to-primary rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold gradient-text">Collective Poetry</span>
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Join the Collective
          </h1>
          <p className="text-text-secondary text-lg">
            Choose how you want to start your poetic journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Auth Options */}
          <div className="space-y-4">
            {authOptions.map((option, index) => {
              const Icon = option.icon;
              
              return (
                <motion.div
                  key={option.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group border-2 ${
                      option.type === 'form' 
                        ? 'border-primary/30 hover:border-primary/50' 
                        : 'border-transparent hover:border-white/20'
                    }`}
                    // onClick={option.type !== 'form' ? option.onClick : undefined}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${option.bgColor} ${option.color} group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-text-primary mb-2">
                          {option.title}
                        </h3>
                        <p className="text-text-secondary text-sm">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    
                    {option.loading && (
                      <div className="mt-4 flex justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Email/Password Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 border-primary/20">
              <h3 className="font-semibold text-lg mb-6 text-text-primary">
                Create Full Account
              </h3>
              
              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-error/20 border border-error/30 rounded-lg mb-4"
                >
                  <p className="text-error text-sm">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="poetic_soul"
                      className="input-field pl-10"
                      required
                      minLength={3}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="input-field pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="input-field pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={isSigningUp}
                  disabled={isSigningUp}
                  className="w-full"
                >
                  Create Account
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-text-secondary text-sm text-center">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Anonymous Session Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <Card className="p-4 bg-white/5 border-white/10">
            <div className="flex items-center justify-center gap-3 text-sm text-text-secondary">
              <Shield size={16} className="text-accent" />
              <span>
                <strong>Anonymous sessions</strong> allow you to start creating immediately. 
                You can always convert to a full account later.
              </span>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}