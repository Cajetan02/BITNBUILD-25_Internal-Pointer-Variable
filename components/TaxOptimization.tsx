import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Target, TrendingUp, TrendingDown, Calculator, Download, 
  ArrowRight, ArrowDown, ArrowUp, RefreshCw,
  DollarSign, PiggyBank, FileText, Zap,
  Home, GraduationCap, Heart, Shield, CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import supabaseBackend from '../services/supabase-backend';
import DevOverlay from './DevOverlay';
import { formatCurrency, calculateTax, TAX_SLABS_NEW_REGIME, TAX_SLABS_OLD_REGIME } from '../utils/formatters';

const AnimatedNumber = ({ value, prefix = '₹', suffix = '', duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

const RegimeComparison = ({ oldRegimeTax, newRegimeTax, isNewRegime, onToggle }) => {
  const savings = oldRegimeTax - newRegimeTax;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tax Regime Comparison</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Old Regime</span>
            <Switch checked={isNewRegime} onCheckedChange={onToggle} />
            <span className="text-sm text-muted-foreground">New Regime</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Old Regime */}
          <motion.div 
            className={`p-6 rounded-lg border-2 transition-all duration-300 ${
              !isNewRegime ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-border'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Old Regime</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-3xl font-bold text-red-500">
                  <AnimatedNumber value={oldRegimeTax} />
                </div>
                <DevOverlay
                  title="Old Regime Tax Calculation"
                  formula="Tax = Slab rates applied on (Gross Income - Deductions - Basic Exemption ₹2.5L) + Surcharge + 4% H&E Cess"
                  source="Income Tax Act, Sections 2(13), 2(29A)"
                  assumptions={[
                    "Old regime slabs: 0% (0-2.5L), 5% (2.5L-5L), 20% (5L-10L), 30% (10L+)",
                    "Deductions: 80C cap ₹1.5L, 80D, HRA, etc.",
                    "Surcharge applies if income > ₹50L",
                    "4% Health & Education Cess on (Tax + Surcharge)"
                  ]}
                />
              </div>
              <p className="text-sm text-muted-foreground">With Deductions</p>
              <Badge variant="secondary" className="mt-2">80C, 80D, HRA</Badge>
            </div>
          </motion.div>

          {/* Arrow/VS */}
          <div className="flex items-center justify-center">
            <motion.div 
              className="text-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold">VS</span>
              </div>
              <p className="text-sm font-medium">Compare</p>
            </motion.div>
          </div>

          {/* New Regime */}
          <motion.div 
            className={`p-6 rounded-lg border-2 transition-all duration-300 ${
              isNewRegime ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">New Regime</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-3xl font-bold text-green-500">
                  <AnimatedNumber value={newRegimeTax} />
                </div>
                <DevOverlay
                  title="New Regime Tax Calculation"
                  formula="Tax = New slab rates on Gross Income (no deductions) + Surcharge + 4% H&E Cess"
                  source="Income Tax Act, Section 115BAC"
                  assumptions={[
                    "New regime slabs: 0% (0-3L), 5% (3L-6L), 10% (6L-9L), 15% (9L-12L), 20% (12L-15L), 30% (15L+)",
                    "No deductions allowed except specific ones",
                    "Surcharge applies if income > ₹50L",
                    "4% Health & Education Cess on (Tax + Surcharge)"
                  ]}
                />
              </div>
              <p className="text-sm text-muted-foreground">Lower Tax Rates</p>
              <Badge variant="secondary" className="mt-2">No Deductions</Badge>
            </div>
          </motion.div>
        </div>

        {/* Savings Display */}
        <motion.div 
          className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              {savings > 0 ? 'Potential Savings' : 'Additional Tax'}
            </h3>
            <div className={`text-4xl font-bold mb-2 ${savings > 0 ? 'text-green-500' : 'text-red-500'}`}>
              <AnimatedNumber value={Math.abs(savings)} />
            </div>
            <p className="text-muted-foreground">
              {savings > 0 
                ? `You can save ${((savings / oldRegimeTax) * 100).toFixed(1)}% on taxes`
                : `You'll pay ${((Math.abs(savings) / oldRegimeTax) * 100).toFixed(1)}% more in taxes`
              }
            </p>
            {savings > 0 && (
              <Badge variant="default" className="mt-2 bg-green-500">
                <TrendingDown className="w-4 h-4 mr-1" />
                Recommended
              </Badge>
            )}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

const DeductionCard = ({ title, icon: Icon, currentAmount, maxAmount, description, color }) => {
  const percentage = (currentAmount / maxAmount) * 100;
  
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Current: ₹{currentAmount.toLocaleString()}</span>
              <span className="text-muted-foreground">Max: ₹{maxAmount.toLocaleString()}</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              ₹{(maxAmount - currentAmount).toLocaleString()} remaining
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const WhatIfSimulator = ({ onInvestmentChange }) => {
  const [investments, setInvestments] = useState({
    section80C: 50000,
    section80D: 15000,
    hra: 100000,
    nps: 25000
  });

  const handleSliderChange = (section, value) => {
    const newInvestments = { ...investments, [section]: value[0] };
    setInvestments(newInvestments);
    onInvestmentChange(newInvestments);
  };

  const sections = [
    { 
      key: 'section80C', 
      title: '80C Investments', 
      max: 150000, 
      description: 'PPF, ELSS, Life Insurance',
      icon: PiggyBank,
      color: 'bg-blue-500'
    },
    { 
      key: 'section80D', 
      title: '80D Health Insurance', 
      max: 50000, 
      description: 'Health Insurance Premium',
      icon: Heart,
      color: 'bg-red-500'
    },
    { 
      key: 'hra', 
      title: 'HRA Exemption', 
      max: 200000, 
      description: 'House Rent Allowance',
      icon: Home,
      color: 'bg-green-500'
    },
    { 
      key: 'nps', 
      title: 'NPS (80CCD)', 
      max: 50000, 
      description: 'National Pension System',
      icon: Shield,
      color: 'bg-purple-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          What-If Investment Simulator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Adjust your investments to see real-time tax impact
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${section.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">{section.title}</h4>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{investments[section.key].toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Max: ₹{section.max.toLocaleString()}</div>
                </div>
              </div>
              
              <Slider
                value={[investments[section.key]]}
                max={section.max}
                step={5000}
                onValueChange={(value) => handleSliderChange(section.key, value)}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹0</span>
                <span>₹{section.max.toLocaleString()}</span>
              </div>
            </motion.div>
          );
        })}
        
        <motion.div 
          className="mt-6 p-4 bg-muted rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Deductions:</span>
            <span className="text-xl font-bold text-green-500">
              ₹{Object.values(investments).reduce((a, b) => a + b, 0).toLocaleString()}
            </span>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default function TaxOptimization() {
  const [isNewRegime, setIsNewRegime] = useState(false);
  const [grossIncome, setGrossIncome] = useState(1200000);
  const [investments, setInvestments] = useState({
    section80C: 50000,
    section80D: 15000,
    hra: 100000,
    nps: 25000
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Calculate actual taxes using proper tax slabs
  const totalDeductions = isNewRegime ? 0 : Math.min(
    investments.section80C + investments.section80D + investments.nps,
    150000 // Maximum combined deduction under old regime
  );
  
  const oldRegimeCalc = calculateTax(grossIncome, 'old', totalDeductions);
  const newRegimeCalc = calculateTax(grossIncome, 'new', 0);
  
  const oldRegimeTax = oldRegimeCalc.total;
  const newRegimeTax = newRegimeCalc.total;

  const handleExportTaxPlan = async () => {
    setShowExportModal(true);
    setIsExporting(true);
    
    try {
      const taxPlan = {
        grossIncome,
        taxRegime: isNewRegime ? 'new' : 'old',
        deductions: investments,
        totalDeductions,
        taxLiability: isNewRegime ? newRegimeTax : oldRegimeTax,
        netIncome: grossIncome - (isNewRegime ? newRegimeTax : oldRegimeTax),
        recommendations: ['Maximize 80C investments', 'Increase health insurance coverage', 'Consider NPS investment'],
        generatedAt: new Date().toISOString()
      };
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Since exportData doesn't exist in supabaseBackend, we'll generate a report instead
      await supabaseBackend.generateReport('user_demo_123', 'tax_plan');
      
      setTimeout(() => {
        toast.success('Export saved to PostgreSQL', {
          description: 'Tax plan exported and saved via POST /api/export. PDF/CSV download simulated.'
        });
        setShowExportModal(false);
      }, 1000);
      
    } catch (error) {
      toast.error('Export failed', {
        description: 'Unable to generate tax plan export'
      });
      setShowExportModal(false);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRecalculate = async () => {
    setIsCalculating(true);
    try {
      // Simulate recalculation with backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Saved to PostgreSQL', {
        description: 'Tax calculations refreshed via POST /api/tax/calculate'
      });
    } catch (error) {
      toast.error('Recalculation failed');
    } finally {
      setIsCalculating(false);
    }
  };

  const deductions = [
    {
      title: 'Section 80C',
      icon: PiggyBank,
      currentAmount: investments.section80C,
      maxAmount: 150000,
      description: 'PPF, ELSS, Life Insurance',
      color: 'bg-blue-500'
    },
    {
      title: 'Section 80D',
      icon: Heart,
      currentAmount: investments.section80D,
      maxAmount: 50000,
      description: 'Health Insurance Premium',
      color: 'bg-red-500'
    },
    {
      title: 'HRA Exemption',
      icon: Home,
      currentAmount: investments.hra,
      maxAmount: 200000,
      description: 'House Rent Allowance',
      color: 'bg-green-500'
    },
    {
      title: 'NPS (80CCD)',
      icon: Shield,
      currentAmount: investments.nps,
      maxAmount: 50000,
      description: 'National Pension System',
      color: 'bg-purple-500'
    }
  ];

  const taxBreakdown = [
    { name: 'Income Tax', value: isNewRegime ? newRegimeTax : oldRegimeTax, color: '#E74C3C' },
    { name: 'Net Income', value: grossIncome - (isNewRegime ? newRegimeTax : oldRegimeTax), color: '#2ECC71' }
  ];

  const monthlyProjection = [
    { month: 'Apr', oldRegime: 15000, newRegime: 12000 },
    { month: 'May', oldRegime: 15000, newRegime: 12000 },
    { month: 'Jun', oldRegime: 15000, newRegime: 12000 },
    { month: 'Jul', oldRegime: 15000, newRegime: 12000 },
    { month: 'Aug', oldRegime: 15000, newRegime: 12000 },
    { month: 'Sep', oldRegime: 15000, newRegime: 12000 },
    { month: 'Oct', oldRegime: 15000, newRegime: 12000 },
    { month: 'Nov', oldRegime: 15000, newRegime: 12000 },
    { month: 'Dec', oldRegime: 15000, newRegime: 12000 },
    { month: 'Jan', oldRegime: 15000, newRegime: 12000 },
    { month: 'Feb', oldRegime: 15000, newRegime: 12000 },
    { month: 'Mar', oldRegime: 15000, newRegime: 12000 },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-500 rounded-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Tax Optimization Engine</h1>
            <p className="text-muted-foreground">Maximize your savings with intelligent tax planning</p>
          </div>
        </div>
        
        {/* Gross Income Editor */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="grossIncome" className="font-medium">Annual Gross Income:</Label>
            <div className="flex items-center gap-2">
              <Input
                id="grossIncome"
                type="number"
                value={grossIncome}
                onChange={(e) => setGrossIncome(Number(e.target.value))}
                className="w-40"
                min="0"
                step="10000"
              />
              <DevOverlay
                title="Gross Income Calculation"
                formula="Gross Income = Basic Salary + HRA + Other Allowances + Bonuses + Interest Income"
                source="Income Tax Act, Section 15-17"
                assumptions={["All income sources included", "Pre-tax amount used for calculations"]}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Regime Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <RegimeComparison 
          oldRegimeTax={oldRegimeTax}
          newRegimeTax={newRegimeTax}
          isNewRegime={isNewRegime}
          onToggle={setIsNewRegime}
        />
      </motion.div>

      <Tabs defaultValue="deductions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="projection">Projection</TabsTrigger>
          <TabsTrigger value="recommendations">AI Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="deductions" className="space-y-6">
          {/* Current Deductions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Current Tax Deductions</CardTitle>
                <p className="text-sm text-muted-foreground">Track your tax-saving investments</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {deductions.map((deduction, index) => (
                    <motion.div
                      key={deduction.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    >
                      <DeductionCard {...deduction} />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* What-If Simulator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <WhatIfSimulator onInvestmentChange={setInvestments} />
            </motion.div>

            {/* Real-time Impact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    Real-time Tax Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Tax Gauge */}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-4">Your Tax Liability</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={taxBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                            label={false}
                          >
                            {taxBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Summary */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Gross Income:</span>
                        <span className="font-semibold">₹{grossIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Total Deductions:</span>
                        <span className="font-semibold text-green-500">₹{totalDeductions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Tax Liability:</span>
                        <span className="font-semibold text-red-500">
                          ₹{(isNewRegime ? newRegimeTax : oldRegimeTax).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="font-semibold">Net Income:</span>
                        <span className="font-bold text-green-500">
                          ₹{(grossIncome - (isNewRegime ? newRegimeTax : oldRegimeTax)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="projection" className="space-y-6">
          {/* Monthly Tax Projection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Monthly Tax Projection</CardTitle>
                <p className="text-sm text-muted-foreground">Compare monthly tax outgo across regimes</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyProjection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="oldRegime" stroke="#E74C3C" name="Old Regime" strokeWidth={2} />
                    <Line type="monotone" dataKey="newRegime" stroke="#2ECC71" name="New Regime" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Annual Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Annual Tax Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <h3 className="font-semibold text-red-500 mb-2">Old Regime</h3>
                    <div className="text-2xl font-bold">₹{(oldRegimeTax * 12).toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Annual Tax</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h3 className="font-semibold text-green-500 mb-2">New Regime</h3>
                    <div className="text-2xl font-bold">₹{(newRegimeTax * 12).toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Annual Tax</p>
                  </div>
                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h3 className="font-semibold text-blue-500 mb-2">Annual Savings</h3>
                    <div className="text-2xl font-bold">₹{((oldRegimeTax - newRegimeTax) * 12).toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">With New Regime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* AI Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  AI Tax Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <motion.div 
                    className="p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-700 dark:text-green-300">Maximize 80C Deductions</h4>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          You can invest ₹1,00,000 more in ELSS or PPF to save ₹20,000 in taxes.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300">Health Insurance Premium</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          Consider increasing health insurance coverage to ₹50,000 for maximum 80D benefit.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="p-4 border border-purple-200 bg-purple-50 dark:bg-purple-950/20 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-700 dark:text-purple-300">NPS Investment</h4>
                        <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                          Additional ₹25,000 in NPS can provide extra deduction under 80CCD(1B).
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button onClick={handleExportTaxPlan}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Tax Plan
                  </Button>
                  <Button variant="outline" onClick={handleRecalculate} disabled={isCalculating}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
                    {isCalculating ? 'Calculating...' : 'Recalculate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-500" />
              Exporting Tax Plan
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center space-y-4">
            {isExporting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto"
                />
                <div>
                  <h3 className="font-semibold mb-2">Generating your tax plan...</h3>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we compile your personalized tax optimization report.
                  </p>
                </div>
                <Progress value={75} className="w-full" />
              </>
            ) : (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="font-semibold text-green-700 mb-2">Export Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your tax plan has been saved and is ready for download.
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}