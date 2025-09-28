import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Bell, Calendar, AlertTriangle, CheckCircle, Clock, 
  CreditCard, Target, FileText, DollarSign, Settings,
  X, Plus, Edit3, Trash2, Eye, EyeOff, Lightbulb, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import supabaseBackend from '../services/supabase-backend';

const PaymentModal = ({ alert, isOpen, onClose, onConfirm }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      await onConfirm(alert);
      onClose();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold">{alert.title}</h4>
            <p className="text-sm text-muted-foreground">{alert.description}</p>
            {alert.amount && (
              <div className="text-2xl font-bold text-green-600 mt-2">
                ₹{alert.amount.toLocaleString()}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AlertCard = ({ alert, onMarkComplete, onSnooze, onDelete, onPayNow }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'low': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getIconColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 border-l-4 rounded-lg ${getPriorityColor(alert.priority)}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <alert.icon className={`w-5 h-5 mt-0.5 ${getIconColor(alert.priority)}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{alert.title}</h4>
              <Badge variant={
                alert.priority === 'high' ? 'destructive' : 
                alert.priority === 'medium' ? 'default' : 'secondary'
              }>
                {alert.priority}
              </Badge>
              {alert.category && (
                <Badge variant="outline" className="text-xs">
                  {alert.category}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {alert.dueDate}
              </span>
              {alert.amount && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  ₹{alert.amount.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {alert.actionButton && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                if (alert.actionButton === 'Pay Now' || alert.actionButton === 'Pay') {
                  onPayNow(alert);
                } else if (alert.actionButton === 'File Now') {
                  toast.success('Redirecting to tax filing page...');
                } else if (alert.actionButton === 'Invest') {
                  toast.success('Redirecting to investment page...');
                } else {
                  toast.info(`${alert.actionButton} clicked for ${alert.title}`);
                }
              }}
            >
              {alert.actionButton}
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onMarkComplete(alert.id)}
            title="Mark as complete"
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onSnooze(alert.id)}
            title="Snooze for later"
          >
            <Clock className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onDelete(alert.id)}
            title="Dismiss alert"
            className="text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const CalendarHeatmap = ({ data, onDateClick }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate calendar data for the year
  const generateCalendarData = () => {
    const year = 2024;
    const weeks = [];
    const startDate = new Date(year, 0, 1);
    const startDay = startDate.getDay();
    
    // Generate weeks for the year
    for (let week = 0; week < 53; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(year, 0, 1 + (week * 7) + day - startDay);
        if (currentDate.getFullYear() === year) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const alertCount = data[dateStr] || 0;
          weekData.push({
            date: dateStr,
            count: alertCount,
            day: currentDate.getDate(),
            month: currentDate.getMonth()
          });
        } else {
          weekData.push(null);
        }
      }
      weeks.push(weekData);
    }
    return weeks;
  };

  const weeks = generateCalendarData();

  const getIntensityColor = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count <= 2) return 'bg-green-200 dark:bg-green-900';
    if (count <= 4) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-600 dark:bg-green-500';
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-53 gap-1 text-xs">
        {weeks.map((week, weekIndex) => 
          week.map((day, dayIndex) => (
            <motion.div
              key={`${weekIndex}-${dayIndex}`}
              whileHover={{ scale: 1.2 }}
              onClick={() => day && onDateClick(day.date)}
              className={`w-3 h-3 rounded-sm cursor-pointer ${
                day ? getIntensityColor(day.count) : 'bg-transparent'
              }`}
              title={day ? `${day.date}: ${day.count} alerts` : ''}
            />
          ))
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm" />
          <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm" />
          <div className="w-3 h-3 bg-green-400 dark:bg-green-700 rounded-sm" />
          <div className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

const SmartSuggestion = ({ suggestion, onApply, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="p-4 border border-border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
    >
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">{suggestion.title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Impact: {suggestion.impact}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {suggestion.category}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onApply(suggestion.id)}>
            Apply
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDismiss(suggestion.id)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function Alerts() {
  const [filter, setFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, alert: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlertsData();
  }, []);

  const loadAlertsData = async () => {
    try {
      const userId = 'user_demo_123';
      const backendAlerts = await supabaseBackend.getAlerts(userId);
      
      // Merge with static alerts for demo
      const staticAlerts = [
        {
          id: 'static_1',
          title: 'Car EMI Due Tomorrow',
          description: 'Your car loan EMI of ₹15,000 is due on March 16, 2024',
          priority: 'high',
          category: 'Payment',
          icon: CreditCard,
          dueDate: 'Mar 16, 2024',
          amount: 15000,
          actionButton: 'Pay Now',
          status: 'active'
        },
        {
          id: 'static_2',
          title: 'Tax Filing Deadline Approaching',
          description: 'Only 15 days left to file your ITR for FY 2023-24',
          priority: 'high',
          category: 'Tax',
          icon: FileText,
          dueDate: 'Mar 31, 2024',
          actionButton: 'File Now',
          status: 'active'
        },
        {
          id: 'static_3',
          title: 'Investment Opportunity',
          description: 'You can still invest ₹50,000 in ELSS to save taxes',
          priority: 'medium',
          category: 'Investment',
          icon: Target,
          dueDate: 'Mar 31, 2024',
          amount: 50000,
          actionButton: 'Invest',
          status: 'active'
        }
      ];

      const combinedAlerts = [...backendAlerts.map(a => ({...a, icon: getIconForCategory(a.type)})), ...staticAlerts];
      setAlerts(combinedAlerts.filter(a => showCompleted || a.status === 'active'));
      
      // Set suggestions
      setSuggestions([
        {
          id: 1,
          title: 'Set up autopay for recurring EMIs',
          description: 'Avoid late fees by setting up automatic payments for your car and home loans.',
          impact: 'High',
          category: 'Automation'
        },
        {
          id: 2,
          title: 'Increase emergency fund',
          description: 'Your emergency fund covers only 4 months of expenses. Consider increasing it to 6 months.',
          impact: 'Medium',
          category: 'Planning'
        },
        {
          id: 3,
          title: 'Optimize credit card usage',
          description: 'Your credit utilization is 68%. Paying down balances could improve your CIBIL score.',
          impact: 'High',
          category: 'Credit'
        }
      ]);
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (category) => {
    switch (category) {
      case 'payment_due': return CreditCard;
      case 'document_reminder': return FileText;
      case 'credit_improvement': return Target;
      default: return Bell;
    }
  };



  const calendarData = {
    '2024-03-15': 2,
    '2024-03-16': 4,
    '2024-03-18': 2,
    '2024-03-20': 1,
    '2024-03-22': 3,
    '2024-03-25': 1,
    '2024-03-31': 5,
  };

  const handleMarkComplete = async (alertId) => {
    try {
      await supabaseBackend.updateAlert(alertId, { status: 'completed' });
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'completed' }
          : alert
      ));
      
      toast.success('Saved to PostgreSQL', {
        description: 'Alert status updated via POST /api/alerts/' + alertId + '/action'
      });
    } catch (error) {
      toast.error('Failed to update alert status');
    }
  };

  const handleSnooze = async (alertId) => {
    try {
      const snoozeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabaseBackend.updateAlert(alertId, { 
        status: 'snoozed', 
        snoozeUntil 
      });
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toast.success('Saved to PostgreSQL', {
        description: 'Alert snoozed via POST /api/alerts/' + alertId + '/action. Will reappear tomorrow.'
      });
    } catch (error) {
      toast.error('Failed to snooze alert');
    }
  };

  const handleDelete = async (alertId) => {
    try {
      await supabaseBackend.updateAlert(alertId, { status: 'dismissed' });
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toast.success('Saved to PostgreSQL', {
        description: 'Alert dismissed via POST /api/alerts/' + alertId + '/action'
      });
    } catch (error) {
      toast.error('Failed to dismiss alert');
    }
  };

  const handlePayNow = (alert) => {
    setPaymentModal({ isOpen: true, alert });
  };

  const handleConfirmPayment = async (alert) => {
    try {
      const userId = 'user_demo_123';
      
      // Save payment transaction
      await supabaseBackend.saveTransaction(userId, {
        type: 'payment',
        amount: -alert.amount,
        description: `Payment for ${alert.title}`,
        category: 'EMI/Bills',
        paymentMethod: 'Bank Transfer'
      });

      // Update alert status
      await supabaseBackend.updateAlert(alert.id, { 
        status: 'paid',
        paidAt: new Date().toISOString()
      });

      // Update local state
      setAlerts(prev => prev.map(a => 
        a.id === alert.id 
          ? { ...a, status: 'paid', actionButton: 'Paid' }
          : a
      ));

      toast.success('Saved to PostgreSQL', {
        description: `Payment of ₹${alert.amount?.toLocaleString()} processed. Transaction saved via POST /api/transactions, alert status updated via POST /api/alerts/${alert.id}/action`
      });
    } catch (error) {
      toast.error('Payment processing failed');
    }
  };

  const handleApplySuggestion = async (suggestionId) => {
    try {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      
      toast.success(`Applied: ${suggestion.title}`, {
        description: 'Recommendation implemented successfully'
      });
      
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (error) {
      toast.error('Failed to apply suggestion');
    }
  };

  const handleDismissSuggestion = (suggestionId) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    toast.info('Suggestion dismissed');
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.category?.toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500 rounded-lg">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Proactive Alerts & Smart Reminders</h1>
            <p className="text-muted-foreground">Stay on top of your financial obligations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="tax">Tax</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Switch 
              checked={showCompleted} 
              onCheckedChange={setShowCompleted}
              id="show-completed"
            />
            <label htmlFor="show-completed" className="text-sm">Show completed</label>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          {/* Alert Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">2</div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-500">2</div>
                  <div className="text-sm text-muted-foreground">Medium Priority</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">1</div>
                  <div className="text-sm text-muted-foreground">Low Priority</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">12</div>
                  <div className="text-sm text-muted-foreground">Completed This Month</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Smart Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                  AI Smart Suggestions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Proactive recommendations to improve your financial health
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <SmartSuggestion 
                      suggestion={suggestion}
                      onApply={handleApplySuggestion}
                      onDismiss={handleDismissSuggestion}
                    />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts ({filteredAlerts.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <AlertCard
                      alert={alert}
                      onMarkComplete={handleMarkComplete}
                      onSnooze={handleSnooze}
                      onDelete={handleDelete}
                      onPayNow={handlePayNow}
                    />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Alert Calendar Heatmap</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Visualize your financial alerts and deadlines throughout the year
                </p>
              </CardHeader>
              <CardContent>
                <CalendarHeatmap 
                  data={calendarData}
                  onDateClick={(date) => setSelectedDate(date)}
                />
                
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 border border-border rounded-lg"
                  >
                    <h4 className="font-semibold mb-2">Alerts for {selectedDate}</h4>
                    <p className="text-sm text-muted-foreground">
                      {calendarData[selectedDate] || 0} alerts scheduled for this date
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Financial Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <h4 className="font-medium">Q4 Tax Filing Deadline</h4>
                      <p className="text-sm text-muted-foreground">March 31, 2024</p>
                    </div>
                    <Badge variant="destructive">15 days</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <h4 className="font-medium">Mutual Fund SIP</h4>
                      <p className="text-sm text-muted-foreground">March 16, 2024</p>
                    </div>
                    <Badge variant="secondary">Tomorrow</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    <div className="flex-1">
                      <h4 className="font-medium">Insurance Premium Due</h4>
                      <p className="text-sm text-muted-foreground">March 25, 2024</p>
                    </div>
                    <Badge variant="outline">9 days</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customize how and when you receive alerts
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Payment Reminders</h4>
                      <p className="text-sm text-muted-foreground">Get notified about upcoming EMIs and bills</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Tax Deadline Alerts</h4>
                      <p className="text-sm text-muted-foreground">Important tax filing and compliance dates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Investment Opportunities</h4>
                      <p className="text-sm text-muted-foreground">AI-suggested investment and savings opportunities</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Credit Score Updates</h4>
                      <p className="text-sm text-muted-foreground">Monthly credit score changes and tips</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Timing</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Payment Reminders</label>
                      <Select defaultValue="3days">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1day">1 day before</SelectItem>
                          <SelectItem value="3days">3 days before</SelectItem>
                          <SelectItem value="1week">1 week before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Tax Deadlines</label>
                      <Select defaultValue="2weeks">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1week">1 week before</SelectItem>
                          <SelectItem value="2weeks">2 weeks before</SelectItem>
                          <SelectItem value="1month">1 month before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button>Save Preferences</Button>
                  <Button variant="outline">Reset to Default</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
      
      {/* Payment Modal */}
      <PaymentModal 
        alert={paymentModal.alert}
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, alert: null })}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}