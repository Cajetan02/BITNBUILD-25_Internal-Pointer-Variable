import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, 
  PieChart, Download, Share, RefreshCw, AlertTriangle,
  Lightbulb, CreditCard, Home, Car, Utensils, ShoppingBag,
  Brain, Target, Calendar, Eye
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const AnimatedKPI = ({ title, value, change, icon: Icon, color, prefix = '₹', suffix = '' }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const duration = 1500;
      const increment = value / (duration / 16);
      
      const animate = () => {
        start += increment;
        if (start < value) {
          setAnimatedValue(Math.floor(start));
          requestAnimationFrame(animate);
        } else {
          setAnimatedValue(value);
        }
      };
      animate();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              change >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(change)}%
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">
              {prefix}{animatedValue.toLocaleString()}{suffix}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const InsightCard = ({ insight, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`border-l-4 ${insight.borderColor} ${insight.bgColor}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <insight.icon className={`w-5 h-5 mt-0.5 ${insight.iconColor}`} />
            <div className="flex-1">
              <h4 className="font-semibold mb-1">{insight.title}</h4>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}>
                  {insight.priority} priority
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {insight.category}
                </Badge>
              </div>
            </div>
            {insight.action && (
              <Button size="sm" variant="outline">
                {insight.action}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  const kpiData = [
    {
      title: 'Total Income',
      value: 1020000,
      change: 5.2,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Total Expenses',
      value: 668000,
      change: -2.1,
      icon: TrendingDown,
      color: 'bg-red-500'
    },
    {
      title: 'Net Savings',
      value: 352000,
      change: 12.8,
      icon: DollarSign,
      color: 'bg-blue-500'
    },
    {
      title: 'CIBIL Score',
      value: 720,
      change: 3.5,
      icon: CreditCard,
      color: 'bg-purple-500',
      prefix: '',
      suffix: ''
    }
  ];

  const monthlyTrend = [
    { month: 'Jul', income: 85000, expenses: 55000, savings: 30000 },
    { month: 'Aug', income: 85000, expenses: 48000, savings: 37000 },
    { month: 'Sep', income: 95000, expenses: 52000, savings: 43000 },
    { month: 'Oct', income: 85000, expenses: 58000, savings: 27000 },
    { month: 'Nov', income: 85000, expenses: 50000, savings: 35000 },
    { month: 'Dec', income: 85000, expenses: 55000, savings: 30000 },
  ];

  const expenseBreakdown = [
    { name: 'Housing', value: 300000, color: '#0E6FFF', percentage: 45 },
    { name: 'Transport', value: 120000, color: '#2ECC71', percentage: 18 },
    { name: 'Food', value: 80000, color: '#F1C40F', percentage: 12 },
    { name: 'Investment', value: 100000, color: '#9B59B6', percentage: 15 },
    { name: 'Others', value: 68000, color: '#E74C3C', percentage: 10 },
  ];

  const investmentAllocation = [
    { name: 'Mutual Funds', value: 150000, color: '#3498DB' },
    { name: 'PPF', value: 80000, color: '#2ECC71' },
    { name: 'EPF', value: 120000, color: '#F39C12' },
    { name: 'FD', value: 50000, color: '#E74C3C' },
    { name: 'Stocks', value: 75000, color: '#9B59B6' },
  ];

  const insights = [
    {
      title: 'Dining expenses increased by ₹5,000',
      description: 'You spent 25% more on dining this month. Consider setting a budget.',
      priority: 'medium',
      category: 'Spending',
      icon: Utensils,
      iconColor: 'text-amber-500',
      borderColor: 'border-l-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      action: 'Set Budget'
    },
    {
      title: 'Great job on your SIP investments!',
      description: 'Your mutual fund SIPs are on track. Consider increasing by ₹2,000.',
      priority: 'low',
      category: 'Investment',
      icon: TrendingUp,
      iconColor: 'text-green-500',
      borderColor: 'border-l-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      action: 'Increase SIP'
    },
    {
      title: 'Credit utilization is high',
      description: 'Your credit card usage is at 68%. Try to keep it below 30% for better credit score.',
      priority: 'high',
      category: 'Credit',
      icon: CreditCard,
      iconColor: 'text-red-500',
      borderColor: 'border-l-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      action: 'Pay Now'
    },
    {
      title: 'Tax-saving opportunity',
      description: 'You can still invest ₹1,00,000 in ELSS to save ₹31,200 in taxes.',
      priority: 'high',
      category: 'Tax',
      icon: Target,
      iconColor: 'text-blue-500',
      borderColor: 'border-l-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      action: 'Invest Now'
    }
  ];

  const netWorthData = [
    { month: 'Jan', assets: 850000, liabilities: 320000, netWorth: 530000 },
    { month: 'Feb', assets: 870000, liabilities: 315000, netWorth: 555000 },
    { month: 'Mar', assets: 890000, liabilities: 310000, netWorth: 580000 },
    { month: 'Apr', assets: 920000, liabilities: 305000, netWorth: 615000 },
    { month: 'May', assets: 950000, liabilities: 300000, netWorth: 650000 },
    { month: 'Jun', assets: 980000, liabilities: 295000, netWorth: 685000 },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500 rounded-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive overview of your financial health</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
            >
              <AnimatedKPI {...kpi} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Income vs Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses Trend</CardTitle>
                <p className="text-sm text-muted-foreground">Monthly financial flow analysis</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#2ECC71" fill="#2ECC71" fillOpacity={0.6} name="Income" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#E74C3C" fill="#E74C3C" fillOpacity={0.6} name="Expenses" />
                    <Line type="monotone" dataKey="savings" stroke="#3498DB" strokeWidth={3} name="Savings" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Net Worth Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Net Worth Progress</CardTitle>
                <p className="text-sm text-muted-foreground">Track your wealth accumulation</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={netWorthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="assets" stroke="#2ECC71" strokeWidth={2} name="Assets" />
                    <Line type="monotone" dataKey="liabilities" stroke="#E74C3C" strokeWidth={2} name="Liabilities" />
                    <Line type="monotone" dataKey="netWorth" stroke="#3498DB" strokeWidth={3} name="Net Worth" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Expense Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <p className="text-sm text-muted-foreground">Where your money goes</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Category Analysis</CardTitle>
                  <p className="text-sm text-muted-foreground">Detailed breakdown by category</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenseBreakdown.map((category, index) => (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center gap-4 p-3 border border-border rounded-lg"
                      >
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{category.name}</h4>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-muted rounded-full h-2">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${category.percentage}%`,
                                  backgroundColor: category.color 
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{category.value.toLocaleString()}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Investment Allocation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Investment Portfolio</CardTitle>
                  <p className="text-sm text-muted-foreground">Asset allocation breakdown</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={investmentAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {investmentAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Investment Performance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Investment Summary</CardTitle>
                  <p className="text-sm text-muted-foreground">Total portfolio value: ₹4,75,000</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investmentAllocation.map((investment, index) => (
                      <motion.div
                        key={investment.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: investment.color }}
                          />
                          <span className="font-medium">{investment.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{investment.value.toLocaleString()}</div>
                          <div className={`text-sm ${
                            Math.random() > 0.5 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 10).toFixed(1)}%
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Total Returns</h4>
                        <p className="text-sm text-muted-foreground">Last 12 months</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">+8.5%</div>
                        <div className="text-sm text-green-500">₹37,250</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  AI-Powered Financial Insights
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Personalized recommendations based on your financial behavior
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <InsightCard key={index} insight={insight} index={index} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Financial Health Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Financial Health Score</CardTitle>
                <p className="text-sm text-muted-foreground">Overall assessment of your financial wellness</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-500 mb-2">78</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                    <Badge variant="default" className="mt-2">Good</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Emergency Fund</span>
                        <span>85/100</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Debt Management</span>
                        <span>72/100</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Investment Diversity</span>
                        <span>68/100</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Key Recommendations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Increase ELSS investments
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Reduce credit utilization
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Great savings rate!
                      </li>
                    </ul>
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