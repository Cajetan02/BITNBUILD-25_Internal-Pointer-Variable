import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { 
  Settings as SettingsIcon, Moon, Sun, Bell, 
  Shield, CreditCard, Database, Download,
  Palette, Volume2, Globe, Lock, Eye,
  Smartphone, Mail, Calendar, IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';
import supabaseBackend from '../services/supabase-backend';
import { supabase } from '../utils/supabase/client';

const SettingItem = ({ icon: Icon, title, description, children, action }) => (
  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
    <div className="flex items-center gap-3 flex-1">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {children}
      {action}
    </div>
  </div>
);

interface SettingsProps {
  isDarkMode?: boolean;
  onThemeChange?: (isDark: boolean) => void;
}

export default function Settings({ isDarkMode = false, onThemeChange }: SettingsProps) {
  const [settings, setSettings] = useState({
    // Appearance
    theme: 'system',
    language: 'en-IN',
    currency: 'INR',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    
    // Privacy
    dataSharing: false,
    analyticsTracking: true,
    publicProfile: false,
    
    // Financial
    autoSync: true,
    reminderFrequency: 'weekly',
    budgetAlerts: true,
    taxReminders: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
    autoLogout: true,
    
    // Advanced
    dataRetention: 365,
    backupFrequency: 'daily',
    exportFormat: 'pdf'
  });

  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    // Set theme based on prop
    setSettings(prev => ({ 
      ...prev, 
      theme: isDarkMode ? 'dark' : 'light' 
    }));
    
    // Load user preferences
    loadUserPreferences();
  }, [isDarkMode]);

  const loadUserPreferences = async () => {
    try {
      const user = supabaseBackend.getCurrentUser();
      if (user) {
        const preferences = await supabaseBackend.getUserPreferences(user.id);
        if (preferences) {
          setSettings(prev => ({ ...prev, ...preferences }));
        }
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  const handleThemeChange = (theme) => {
    setSettings(prev => ({ ...prev, theme }));
    
    let newIsDarkMode = isDarkMode;
    
    if (theme === 'dark') {
      newIsDarkMode = true;
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      newIsDarkMode = false;
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      newIsDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', newIsDarkMode);
    }
    
    // Notify parent component about theme change
    if (onThemeChange) {
      onThemeChange(newIsDarkMode);
    }
    
    toast.success('Theme updated successfully');
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const user = supabaseBackend.getCurrentUser();
      
      if (user) {
        await supabaseBackend.saveUserPreferences(user.id, settings);
        
        toast.success('Saved to Supabase', {
          description: 'Settings saved successfully via POST /api/user/preferences'
        });
      }
      
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    toast.success('Data export initiated', {
      description: 'You will receive an email with your data export shortly'
    });
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      const user = supabaseBackend.getCurrentUser();
      if (user) {
        // Update password using Supabase auth
        const { error } = await supabase.auth.updateUser({
          password: passwordData.newPassword
        });

        if (error) {
          throw new Error(error.message);
        }

        toast.success('Password updated successfully', {
          description: 'Your password has been changed via Supabase Auth'
        });

        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Password update failed:', error);
      toast.error('Failed to update password', {
        description: error.message || 'Please try again'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requested', {
      description: 'Please contact support to complete account deletion'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary rounded-lg">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Settings & Preferences</h1>
            <p className="text-muted-foreground">Customize your TaxWise experience</p>
          </div>
        </div>
        
        <Button onClick={handleSaveSettings} disabled={loading} className="gap-2">
          <Database className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </motion.div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Theme & Display</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customize the look and feel of your application
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingItem
                  icon={isDarkMode ? Moon : Sun}
                  title="Theme"
                  description="Choose your preferred theme"
                >
                  <Select value={settings.theme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  icon={Globe}
                  title="Language"
                  description="Select your preferred language"
                >
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-IN">English (India)</SelectItem>
                      <SelectItem value="hi-IN">हिन्दी</SelectItem>
                      <SelectItem value="ta-IN">தமிழ்</SelectItem>
                      <SelectItem value="te-IN">తెలుగు</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  icon={IndianRupee}
                  title="Currency"
                  description="Display currency preference"
                >
                  <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ Rupee</SelectItem>
                      <SelectItem value="USD">$ Dollar</SelectItem>
                      <SelectItem value="EUR">€ Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Control how and when you receive notifications
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingItem
                  icon={Mail}
                  title="Email Notifications"
                  description="Receive important updates via email"
                >
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Smartphone}
                  title="Push Notifications"
                  description="Get instant notifications on your device"
                >
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Bell}
                  title="SMS Notifications"
                  description="Receive critical alerts via SMS"
                >
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Volume2}
                  title="Marketing Emails"
                  description="Product updates and promotional content"
                >
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                  />
                </SettingItem>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Control your data privacy and sharing preferences
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingItem
                  icon={Shield}
                  title="Data Sharing"
                  description="Allow anonymized data to improve our services"
                >
                  <Switch
                    checked={settings.dataSharing}
                    onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Eye}
                  title="Analytics Tracking"
                  description="Help us improve by sharing usage analytics"
                >
                  <Switch
                    checked={settings.analyticsTracking}
                    onCheckedChange={(checked) => handleSettingChange('analyticsTracking', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Globe}
                  title="Public Profile"
                  description="Make your profile visible to other users"
                >
                  <Switch
                    checked={settings.publicProfile}
                    onCheckedChange={(checked) => handleSettingChange('publicProfile', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Download}
                  title="Data Retention"
                  description="How long to keep your data (days)"
                >
                  <div className="w-32">
                    <Slider
                      value={[settings.dataRetention]}
                      onValueChange={([value]) => handleSettingChange('dataRetention', value)}
                      max={1095}
                      min={30}
                      step={30}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {settings.dataRetention} days
                    </p>
                  </div>
                </SettingItem>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Financial Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure financial data and reminder preferences
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingItem
                  icon={Database}
                  title="Auto Sync"
                  description="Automatically sync financial data"
                >
                  <Switch
                    checked={settings.autoSync}
                    onCheckedChange={(checked) => handleSettingChange('autoSync', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Calendar}
                  title="Reminder Frequency"
                  description="How often to send financial reminders"
                >
                  <Select value={settings.reminderFrequency} onValueChange={(value) => handleSettingChange('reminderFrequency', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  icon={Bell}
                  title="Budget Alerts"
                  description="Get notified when approaching budget limits"
                >
                  <Switch
                    checked={settings.budgetAlerts}
                    onCheckedChange={(checked) => handleSettingChange('budgetAlerts', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={CreditCard}
                  title="Tax Reminders"
                  description="Important tax deadlines and filing reminders"
                >
                  <Switch
                    checked={settings.taxReminders}
                    onCheckedChange={(checked) => handleSettingChange('taxReminders', checked)}
                  />
                </SettingItem>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your account security and access controls
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingItem
                  icon={Shield}
                  title="Two-Factor Authentication"
                  description="Add an extra layer of security to your account"
                  action={
                    <Button variant="outline" size="sm">
                      {settings.twoFactorAuth ? 'Disable' : 'Enable'}
                    </Button>
                  }
                >
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Lock}
                  title="Session Timeout"
                  description="Automatically log out after inactivity (minutes)"
                >
                  <div className="w-32">
                    <Slider
                      value={[settings.sessionTimeout]}
                      onValueChange={([value]) => handleSettingChange('sessionTimeout', value)}
                      max={120}
                      min={5}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {settings.sessionTimeout} minutes
                    </p>
                  </div>
                </SettingItem>

                <SettingItem
                  icon={Lock}
                  title="Auto Logout"
                  description="Automatically log out when browser closes"
                >
                  <Switch
                    checked={settings.autoLogout}
                    onCheckedChange={(checked) => handleSettingChange('autoLogout', checked)}
                  />
                </SettingItem>

                {/* Password Change Section */}
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-4">Change Password</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        disabled={passwordLoading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        disabled={passwordLoading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={passwordLoading}
                      />
                    </div>
                    
                    <Button 
                      onClick={handlePasswordChange} 
                      disabled={passwordLoading}
                      className="w-full"
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-destructive">Danger Zone</h4>
                      <p className="text-sm text-muted-foreground">
                        These actions cannot be undone
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleExportData}>
                        Export Data
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}