import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Database, Target, CreditCard, BarChart3, 
  FileText, Bell, MessageCircle, Newspaper, Moon, Sun, 
  IndianRupee, User, LogOut, Settings
} from 'lucide-react';
import { Button } from './components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

// Import page components
import Login from './components/Login';
import HomePage from './components/HomePage';
import DataIngestion from './components/DataIngestion';
import TaxOptimization from './components/TaxOptimization';
import CibilAdvisor from './components/CibilAdvisor';
import Dashboard from './components/Dashboard';
import AutoFiling from './components/AutoFiling';
import Alerts from './components/Alerts';
import FinancialCoach from './components/FinancialCoach';
import FinanceNews from './components/FinanceNews';
import Profile from './components/Profile';
import Settings from './components/Settings';

import supabaseBackend from './services/supabase-backend';

const navigation = [
  { id: 'home', name: 'Home', icon: Home },
  { id: 'data-ingestion', name: 'Data Ingestion', icon: Database },
  { id: 'tax-optimization', name: 'Tax Optimization', icon: Target },
  { id: 'cibil-advisor', name: 'CIBIL Advisor', icon: CreditCard },
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'filing', name: 'Filing', icon: FileText },
  { id: 'alerts', name: 'Alerts', icon: Bell },
  { id: 'financial-coach', name: 'Caramel', icon: MessageCircle },
  { id: 'finance-news', name: 'Finance News', icon: Newspaper },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First check if server is healthy
        const health = await supabaseBackend.healthCheck();
        console.log('🏥 Server health check:', health);
        
        const session = await supabaseBackend.checkSession();
        if (session.success && session.user) {
          setUser(session.user);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        toast.error('Failed to connect to server', {
          description: 'Please check your internet connection and try again'
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const getCurrentTime = () => {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date());
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
    toast.success(`Welcome back, ${userData.name}!`, {
      description: 'You have successfully logged in to TaxWise'
    });
  };

  const handleLogout = async () => {
    try {
      await supabaseBackend.logout(user?.id);
      setUser(null);
      setIsLoggedIn(false);
      setCurrentPage('home');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  const renderCurrentPage = () => {
    if (!isLoggedIn) {
      return <Login onLogin={handleLogin} />;
    }

    const pageComponents = {
      'home': HomePage,
      'data-ingestion': DataIngestion,
      'tax-optimization': TaxOptimization,
      'cibil-advisor': CibilAdvisor,
      'dashboard': Dashboard,
      'filing': AutoFiling,
      'alerts': Alerts,
      'financial-coach': FinancialCoach,
      'finance-news': FinanceNews,
      'profile': Profile,
      'settings': Settings,
    };

    const Component = pageComponents[currentPage] || HomePage;
    return <Component />;
  };

  // Show loading spinner while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <IndianRupee className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Initializing TaxWise...</p>
        </div>
        <Toaster />
      </div>
    );
  }

  // Don't render sidebar if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen">
        {renderCurrentPage()}
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <motion.div 
        className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col"
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">TaxWise</h1>
              <p className="text-xs text-sidebar-foreground/70">AI Finance Platform</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </motion.button>
            );
          })}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <motion.header 
          className="bg-card border-b border-border px-6 py-4"
          initial={{ y: -64 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-foreground">
                {navigation.find(nav => nav.id === currentPage)?.name || 'Home'}
              </h2>
              <div className="text-sm text-muted-foreground">
                Last updated: {getCurrentTime()}
              </div>
              {user && (
                <div className="text-sm text-muted-foreground">
                  Logged in as: <span className="font-medium text-foreground">{user.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Currency Display */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                <IndianRupee className="w-4 h-4" />
                <span className="text-sm font-medium">INR</span>
              </div>

              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="relative overflow-hidden"
              >
                <motion.div
                  animate={{ rotate: isDarkMode ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.div>
              </Button>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCurrentPage('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentPage('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderCurrentPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toaster />
    </div>
  );
}