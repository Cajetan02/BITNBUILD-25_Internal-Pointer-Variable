import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  IndianRupee, Eye, EyeOff, Loader2, Shield, 
  Zap, Award, Mail, Lock, ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';
import supabaseBackend from '../services/supabase-backend';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'demo@taxwise.com',
    password: 'demo123',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!formData.email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      let result;
      
      if (isLogin) {
        try {
          // Attempt login
          result = await supabaseBackend.login({
            email: formData.email,
            password: formData.password
          });
        } catch (loginError) {
          // If login fails and it's the demo user, try to create them first
          if (formData.email === 'demo@taxwise.com' && loginError.message.includes('Invalid login credentials')) {
            toast.info('Creating demo user...', {
              description: 'Demo user not found, creating account automatically'
            });
            
            try {
              // Create demo user
              await supabaseBackend.signup({
                email: formData.email,
                password: formData.password,
                name: 'Demo User'
              });
              
              // Now try login again
              result = await supabaseBackend.login({
                email: formData.email,
                password: formData.password
              });
            } catch (signupError) {
              console.error('Demo user creation failed:', signupError);
              throw new Error('Failed to create demo user. Please try signing up instead.');
            }
          } else {
            throw loginError;
          }
        }
      } else {
        // Signup
        if (!formData.name) {
          toast.error('Name is required for signup');
          return;
        }
        
        await supabaseBackend.signup({
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
        
        // After successful signup, login
        result = await supabaseBackend.login({
          email: formData.email,
          password: formData.password
        });
      }

      if (result && result.success) {
        toast.success('Saved to Supabase', {
          description: `User session ${isLogin ? 'authenticated' : 'created'} via Supabase Auth. Welcome ${isLogin ? 'back' : 'to TaxWise'}, ${result.user.name}!`
        });
        onLogin(result.user);
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // If it's the demo user and all attempts failed, offer demo mode
      if (formData.email === 'demo@taxwise.com') {
        toast.error('Unable to connect to authentication server', {
          description: 'You can continue in demo mode or try again later'
        });
        
        // Add a demo mode button or continue anyway
        setTimeout(() => {
          if (confirm('Authentication failed. Continue in offline demo mode?')) {
            const demoUser = {
              id: 'demo_user_offline',
              name: 'Demo User (Offline)',
              email: 'demo@taxwise.com'
            };
            toast.success('Continuing in Demo Mode', {
              description: 'Data will not be saved to the database'
            });
            onLogin(demoUser);
          }
        }, 2000);
      } else {
        toast.error('Authentication failed', {
          description: error.message || 'Please check your credentials and try again'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@taxwise.com',
      password: 'demo123',
      name: 'Demo User'
    });
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/50 dark:via-background dark:to-purple-950/50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div>
            <motion.div 
              className="flex items-center space-x-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">TaxWise</h1>
                <p className="text-muted-foreground">AI Finance Platform</p>
              </div>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-4">
              Your Financial Future Starts Here
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands who've optimized their taxes, improved their credit scores, 
              and achieved financial clarity with our AI-powered platform.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: Shield, title: 'Bank-level Security', desc: 'Your data is protected with enterprise-grade encryption' },
              { icon: Zap, title: 'AI-Powered Insights', desc: 'Get personalized recommendations based on your financial profile' },
              { icon: Award, title: 'Proven Results', desc: 'Average tax savings of ₹45,000 per user annually' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                  <feature.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-6 pt-8 border-t"
          >
            {[
              { value: '50K+', label: 'Happy Users' },
              { value: '₹25Cr+', label: 'Tax Saved' },
              { value: '98%', label: 'Satisfaction' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="w-full max-w-md mx-auto shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <p className="text-muted-foreground">
                {isLogin 
                  ? 'Sign in to access your financial dashboard' 
                  : 'Join TaxWise and start saving on taxes'
                }
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Demo Login Buttons */}
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Try Demo Login (With Auth)
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    const demoUser = {
                      id: 'demo_user_offline',
                      name: 'Demo User',
                      email: 'demo@taxwise.com'
                    };
                    toast.success('Demo Mode Activated', {
                      description: 'Exploring TaxWise in offline demo mode'
                    });
                    onLogin(demoUser);
                  }}
                  disabled={isLoading}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Continue in Demo Mode
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 pt-4 border-t">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  Protected by 256-bit SSL encryption
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}