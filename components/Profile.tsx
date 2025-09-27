import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  FileText, Upload, Download, Eye, 
  CreditCard, Target, IndianRupee, 
  Edit3, Save, X, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import supabaseBackend from '../services/supabase-backend';

const ProfileInfoCard = ({ title, value, icon: Icon, editable = false, onEdit }) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="font-semibold">{value}</p>
        </div>
        {editable && (
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

const FileCard = ({ file, onView, onDownload, onDelete }) => {
  const getFileTypeColor = (category) => {
    switch (category) {
      case 'tax_documents': return 'bg-red-50 text-red-700 border-red-200';
      case 'bank_statements': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'investment_docs': return 'bg-green-50 text-green-700 border-green-200';
      case 'identity_docs': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <FileText className="w-8 h-8 text-blue-500" />
          <div className="flex-1">
            <h4 className="font-medium truncate">{file.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`text-xs ${getFileTypeColor(file.category)}`}>
                {file.category?.replace('_', ' ') || 'General'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(file.uploadedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(file)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDownload(file)}>
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onDelete(file)}
            className="text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const FinancialSummaryCard = ({ title, value, change, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    green: "text-green-600 bg-green-50 border-green-200",
    red: "text-red-600 bg-red-50 border-red-200",
    amber: "text-amber-600 bg-amber-50 border-amber-200"
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <p className={`text-sm mt-1 ${change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = supabaseBackend.getCurrentUser();
      setUser(currentUser);
      setEditData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: '',
        location: ''
      });

      // Load uploaded files
      const filesResponse = await supabaseBackend.getUploadedFiles(currentUser?.id);
      setUploadedFiles(filesResponse.files || []);

      // Load financial data
      const financialResponse = await supabaseBackend.getFinancialData(currentUser?.id);
      setFinancialData(financialResponse.data || null);

    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await supabaseBackend.updateProfile(user.id, editData);
      setUser({ ...user, ...editData });
      setIsEditing(false);
      
      toast.success('Saved to Supabase', {
        description: 'Profile updated successfully via POST /api/profile'
      });
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleViewFile = (file) => {
    if (file.url) {
      window.open(file.url, '_blank');
    } else {
      toast.info('File preview not available');
    }
  };

  const handleDownloadFile = (file) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    } else {
      toast.info('File download not available');
    }
  };

  const handleDeleteFile = async (file) => {
    try {
      await supabaseBackend.deleteFile(file.id);
      setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
      
      toast.success('Saved to Supabase', {
        description: `File "${file.name}" deleted via DELETE /api/files/${file.id}`
      });
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
            <User className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-2xl">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user?.name || 'User Profile'}</h1>
            <p className="text-muted-foreground">Manage your profile and uploaded documents</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button onClick={handleSaveProfile} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="financial">Financial Summary</TabsTrigger>
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editData.location}
                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileInfoCard 
                      title="Full Name" 
                      value={user?.name || 'Not set'} 
                      icon={User}
                    />
                    <ProfileInfoCard 
                      title="Email" 
                      value={user?.email || 'Not set'} 
                      icon={Mail}
                    />
                    <ProfileInfoCard 
                      title="Phone" 
                      value={editData.phone || 'Not set'} 
                      icon={Phone}
                    />
                    <ProfileInfoCard 
                      title="Location" 
                      value={editData.location || 'Not set'} 
                      icon={MapPin}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-700">Email Verified</p>
                      <p className="text-sm text-green-600">Account is active</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-700">{uploadedFiles.length} Documents</p>
                      <p className="text-sm text-blue-600">Uploaded</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border border-purple-200 bg-purple-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-700">Member Since</p>
                      <p className="text-sm text-purple-600">March 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Uploaded Documents</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {uploadedFiles.length} documents uploaded
                    </p>
                  </div>
                  <Button className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedFiles.length > 0 ? (
                  uploadedFiles.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <FileCard
                        file={file}
                        onView={handleViewFile}
                        onDownload={handleDownloadFile}
                        onDelete={handleDeleteFile}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                    <Button className="mt-4 gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Your First Document
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <FinancialSummaryCard
                title="Total Income"
                value="₹8,50,000"
                change="+12% vs last year"
                icon={IndianRupee}
                color="green"
              />
              <FinancialSummaryCard
                title="Tax Savings"
                value="₹1,50,000"
                change="+₹25,000 vs last year"
                icon={Target}
                color="blue"
              />
              <FinancialSummaryCard
                title="Investments"
                value="₹3,20,000"
                change="+18% returns"
                icon={CreditCard}
                color="amber"
              />
              <FinancialSummaryCard
                title="CIBIL Score"
                value="750"
                change="+15 points"
                icon={User}
                color="green"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Financial Breakdown</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Based on your uploaded documents and financial data
                </p>
              </CardHeader>
              <CardContent>
                {financialData ? (
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h4 className="font-medium mb-2">Income Sources</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Salary Income</span>
                          <span className="font-medium">₹{financialData.salaryIncome?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Other Income</span>
                          <span className="font-medium">₹{financialData.otherIncome?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-border rounded-lg">
                      <h4 className="font-medium mb-2">Tax Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tax Regime</span>
                          <span className="font-medium">{financialData.taxRegime || 'Old Regime'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax Payable</span>
                          <span className="font-medium">₹{financialData.taxPayable?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No financial data available</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload your financial documents to see detailed insights
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your account preferences and security settings
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" placeholder="Enter current password" />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" placeholder="Enter new password" />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button>Update Password</Button>
                  <Button variant="outline">Reset</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}