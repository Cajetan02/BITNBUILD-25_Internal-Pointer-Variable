import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon,
  BarChart3, LineChart as LineChartIcon, Activity, Target
} from 'lucide-react';

const ChartCard = ({ title, description, children, icon: Icon, className = "" }: {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ComponentType<any>;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className={className}
  >
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          <CardTitle>{title}</CardTitle>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

const AnimatedNumber = ({ value, prefix = '', suffix = '', className = '' }: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const duration = 1500;
      const increment = value / (duration / 16);
      
      const animate = () => {
        start += increment;
        if (start < value) {
          setDisplayValue(Math.floor(start));
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };
      animate();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

export const FinancialOverviewCharts = () => {
  const monthlyData = [
    { month: 'Jan', income: 85000, expenses: 55000, savings: 30000, investments: 15000 },
    { month: 'Feb', income: 85000, expenses: 48000, savings: 37000, investments: 18000 },
    { month: 'Mar', income: 95000, expenses: 52000, savings: 43000, investments: 20000 },
    { month: 'Apr', income: 85000, expenses: 58000, savings: 27000, investments: 12000 },
    { month: 'May', income: 85000, expenses: 50000, savings: 35000, investments: 16000 },
    { month: 'Jun', income: 85000, expenses: 55000, savings: 30000, investments: 15000 },
  ];

  const categoryData = [
    { name: 'Housing', amount: 300000, percentage: 45, color: '#0E6FFF' },
    { name: 'Transport', amount: 120000, percentage: 18, color: '#2ECC71' },
    { name: 'Food', amount: 80000, percentage: 12, color: '#F1C40F' },
    { name: 'Investment', amount: 100000, percentage: 15, color: '#9B59B6' },
    { name: 'Others', amount: 68000, percentage: 10, color: '#E74C3C' },
  ];

  const investmentData = [
    { name: 'Mutual Funds', value: 150000, return: 12.5, color: '#3498DB' },
    { name: 'PPF', value: 80000, return: 7.1, color: '#2ECC71' },
    { name: 'EPF', value: 120000, return: 8.2, color: '#F39C12' },
    { name: 'FD', value: 50000, return: 6.5, color: '#E74C3C' },
    { name: 'Stocks', value: 75000, return: 15.3, color: '#9B59B6' },
  ];

  const creditScoreData = [
    { month: 'Jan', score: 720, payments: 95, utilization: 65 },
    { month: 'Feb', score: 725, payments: 98, utilization: 62 },
    { month: 'Mar', score: 730, payments: 100, utilization: 58 },
    { month: 'Apr', score: 735, payments: 100, utilization: 55 },
    { month: 'May', score: 740, payments: 100, utilization: 52 },
    { month: 'Jun', score: 745, payments: 100, utilization: 48 },
  ];

  const netWorthData = [
    { month: 'Jan', assets: 850000, liabilities: 320000, netWorth: 530000 },
    { month: 'Feb', assets: 870000, liabilities: 315000, netWorth: 555000 },
    { month: 'Mar', assets: 890000, liabilities: 310000, netWorth: 580000 },
    { month: 'Apr', assets: 920000, liabilities: 305000, netWorth: 615000 },
    { month: 'May', assets: 950000, liabilities: 300000, netWorth: 650000 },
    { month: 'Jun', assets: 980000, liabilities: 295000, netWorth: 685000 },
  ];

  const radarData = [
    { subject: 'Savings Rate', A: 35, B: 30, fullMark: 50 },
    { subject: 'Investment', A: 20, B: 15, fullMark: 30 },
    { subject: 'Debt Management', A: 28, B: 25, fullMark: 40 },
    { subject: 'Emergency Fund', A: 40, B: 35, fullMark: 50 },
    { subject: 'Credit Score', A: 37, B: 32, fullMark: 50 },
    { subject: 'Tax Efficiency', A: 25, B: 20, fullMark: 40 },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <ChartCard
          title="Total Income"
          description="Monthly average"
          icon={TrendingUp}
        >
          <div className="text-center">
            <AnimatedNumber 
              value={1020000} 
              prefix="₹" 
              className="text-3xl font-bold text-green-500" 
            />
            <p className="text-sm text-muted-foreground mt-1">+5.2% vs last year</p>
          </div>
        </ChartCard>

        <ChartCard
          title="Total Expenses"
          description="Monthly average"
          icon={TrendingDown}
        >
          <div className="text-center">
            <AnimatedNumber 
              value={668000} 
              prefix="₹" 
              className="text-3xl font-bold text-red-500" 
            />
            <p className="text-sm text-muted-foreground mt-1">-2.1% vs last year</p>
          </div>
        </ChartCard>

        <ChartCard
          title="Net Savings"
          description="Monthly average"
          icon={DollarSign}
        >
          <div className="text-center">
            <AnimatedNumber 
              value={352000} 
              prefix="₹" 
              className="text-3xl font-bold text-blue-500" 
            />
            <p className="text-sm text-muted-foreground mt-1">+12.8% vs last year</p>
          </div>
        </ChartCard>

        <ChartCard
          title="CIBIL Score"
          description="Current score"
          icon={Target}
        >
          <div className="text-center">
            <AnimatedNumber 
              value={745} 
              className="text-3xl font-bold text-purple-500" 
            />
            <p className="text-sm text-muted-foreground mt-1">+15 points this year</p>
          </div>
        </ChartCard>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <ChartCard
          title="Income vs Expenses Trend"
          description="Monthly financial flow analysis"
          icon={BarChart3}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
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
        </ChartCard>

        {/* Net Worth Progress */}
        <ChartCard
          title="Net Worth Progress"
          description="Track your wealth accumulation"
          icon={LineChartIcon}
        >
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
        </ChartCard>
      </div>

      {/* Expense and Investment Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <ChartCard
          title="Expense Breakdown"
          description="Where your money goes"
          icon={PieChartIcon}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Investment Portfolio */}
        <ChartCard
          title="Investment Portfolio"
          description="Asset allocation and returns"
          icon={Activity}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={investmentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {investmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Credit Score and Financial Health */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Credit Score Trend */}
        <ChartCard
          title="Credit Score Progress"
          description="CIBIL score improvement over time"
          icon={Target}
        >
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={creditScoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="score" fill="#3498DB" name="Credit Score" />
              <Line yAxisId="right" type="monotone" dataKey="utilization" stroke="#E74C3C" name="Credit Utilization %" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Financial Health Radar */}
        <ChartCard
          title="Financial Health Score"
          description="Comprehensive financial wellness assessment"
          icon={Activity}
        >
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 50]} />
              <Radar name="Your Score" dataKey="A" stroke="#3498DB" fill="#3498DB" fillOpacity={0.6} />
              <Radar name="Average" dataKey="B" stroke="#E74C3C" fill="#E74C3C" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Investment Performance Table */}
      <ChartCard
        title="Investment Performance"
        description="Detailed breakdown of your investment portfolio"
        icon={BarChart3}
      >
        <div className="space-y-4">
          {investmentData.map((investment, index) => (
            <motion.div
              key={investment.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: investment.color }}
                />
                <span className="font-medium">{investment.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-semibold">₹{investment.value.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Invested</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${investment.return > 10 ? 'text-green-500' : 'text-blue-500'}`}>
                    +{investment.return}%
                  </div>
                  <div className="text-sm text-muted-foreground">Returns</div>
                </div>
                <Badge variant={investment.return > 10 ? 'default' : 'secondary'}>
                  {investment.return > 10 ? 'Excellent' : 'Good'}
                </Badge>
              </div>
            </motion.div>
          ))}
          
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Total Portfolio Value</h4>
                <p className="text-sm text-muted-foreground">Last 12 months performance</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-500">+8.5%</div>
                <div className="text-sm text-green-500">₹37,250 returns</div>
              </div>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default FinancialOverviewCharts;
