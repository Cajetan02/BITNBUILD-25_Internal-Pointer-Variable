import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { 
  TrendingUp, Users, DollarSign, Award, 
  ArrowRight, Star, Shield, Zap,
  PieChart, FileText, CreditCard, Target,
  CheckCircle, Loader2, Calculator
} from 'lucide-react';
import { toast } from 'sonner';
import { showSuccessToast, showErrorToast } from '../utils/toast-helpers';
import supabaseBackend from '../services/supabase-backend';
import { DevOverlay } from './DevOverlay';
import { formatCurrency, formatPercentage } from '../utils/formatters';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Floating Animation Component
const FloatingIcon = ({ children, delay = 0 }) => (
  <motion.div
    animate={{ 
      y: [-10, 10, -10],
      rotate: [-5, 5, -5]
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut"
    }}
    className="absolute opacity-10"
  >
    {children}
  </motion.div>
);

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false);
  const [answers, setAnswers] = useState({
    annualIncome: '',
    hasInvestments: '',
    monthlyExpenses: ''
  });

  const kpiData = [
    {
      title: 'Users Helped',
      value: 50000,
      prefix: '',
      suffix: '+',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Tax Saved',
      value: 2500000,
      prefix: '₹',
      suffix: '',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Avg. Credit Score Improved',
      value: 75,
      prefix: '+',
      suffix: ' pts',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Satisfaction Rate',
      value: 98,
      prefix: '',
      suffix: '%',
      icon: Award,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950'
    }
  ];

  const features = [
    {
      title: 'Smart Data Upload',
      description: 'AI-powered document analysis',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Tax Optimizer',
      description: 'Maximize your savings',
      icon: Target,
      color: 'bg-green-500'
    },
    {
      title: 'CIBIL Advisor',
      description: 'Improve your credit score',
      icon: CreditCard,
      color: 'bg-purple-500'
    },
    {
      title: 'Auto Filing',
      description: 'Hassle-free tax filing',
      icon: PieChart,
      color: 'bg-amber-500'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Software Engineer',
      content: 'Saved ₹45,000 in taxes and improved my CIBIL score by 80 points!',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Business Owner',
      content: 'The AI suggestions helped me optimize my investments perfectly.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Consultant',
      content: 'Filing taxes has never been this easy. Highly recommended!',
      rating: 5
    }
  ];

  const quickQuestions = [
    {
      question: 'What is your annual income range?',
      type: 'radio',
      field: 'annualIncome',
      options: [
        { value: '0-3L', label: '₹0 - ₹3 Lakhs' },
        { value: '3-5L', label: '₹3 - ₹5 Lakhs' },
        { value: '5-10L', label: '₹5 - ₹10 Lakhs' },
        { value: '10L+', label: '₹10 Lakhs+' }
      ]
    },
    {
      question: 'Do you have any investments?',
      type: 'radio',
      field: 'hasInvestments',
      options: [
        { value: 'yes-sip', label: 'Yes, I have SIPs/Mutual Funds' },
        { value: 'yes-other', label: 'Yes, other investments' },
        { value: 'no', label: 'No investments yet' },
        { value: 'planning', label: 'Planning to start soon' }
      ]
    },
    {
      question: 'What are your monthly expenses?',
      type: 'radio',
      field: 'monthlyExpenses',
      options: [
        { value: '0-20K', label: '₹0 - ₹20,000' },
        { value: '20-40K', label: '₹20,000 - ₹40,000' },
        { value: '40-60K', label: '₹40,000 - ₹60,000' },
        { value: '60K+', label: '₹60,000+' }
      ]
    }
  ];

  const handleAnswerChange = (value: string) => {
    const currentQuestion = quickQuestions[currentStep];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < quickQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmitQuestionnaire();
    }
  };

  const handleSubmitQuestionnaire = async () => {
    setIsSubmitting(true);
    try {
      const userId = 'user_demo_123'; // In real app, get from auth
      const onboardingData = {
        ...answers,
        completedAt: new Date().toISOString(),
        potentialSavings: calculatePotentialSavings(answers)
      };
      
      let response;
      if (supabaseBackend.isOfflineMode()) {
        // Simulate save in offline mode
        response = { success: true };
      } else {
        response = await supabaseBackend.saveQuestionnaireResponse(userId, onboardingData);
      }

      if (response.success) {
        showSuccessToast(
          'Questionnaire Complete',
          'Questionnaire responses saved via Supabase API. Dashboard will be updated with your personalized insights.',
          'Questionnaire data simulated locally. Dashboard will show mock insights.'
        );
      }

      if (response.success) {
        setQuestionnaireComplete(true);
        
        // Simulate updating dashboard with new data
        setTimeout(() => {
          toast.success('Dashboard Updated', {
            description: 'Your KPI cards and charts have been refreshed with your profile data.'
          });
        }, 1500);
      }
    } catch (error) {
      showErrorToast(
        'Failed to Save Questionnaire',
        'Error with Supabase API onboarding endpoint. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseIncomeRange = (range: string) => {
    switch (range) {
      case '0-3L': return { min: 0, max: 300000 };
      case '3-5L': return { min: 300000, max: 500000 };
      case '5-10L': return { min: 500000, max: 1000000 };
      case '10L+': return { min: 1000000, max: 1500000 }; // Assume max for calculation
      default: return { min: 0, max: 0 };
    }
  };

  const parseExpenseRange = (range: string) => {
    switch (range) {
      case '0-20K': return { min: 0, max: 20000 };
      case '20-40K': return { min: 20000, max: 40000 };
      case '40-60K': return { min: 40000, max: 60000 };
      case '60K+': return { min: 60000, max: 80000 }; // Assume max for calculation
      default: return { min: 0, max: 0 };
    }
  };

  const calculateDetailedTaxEstimate = (answers: any) => {
    const incomeRange = parseIncomeRange(answers.annualIncome);
    const expenseRange = parseExpenseRange(answers.monthlyExpenses);
    
    // Conservative estimate (upper bounds)
    const conservativeIncome = incomeRange.max;
    const conservativeMonthlyExpenses = expenseRange.max;
    const conservativeAnnualExpenses = conservativeMonthlyExpenses * 12;
    const conservativePotentialSavings = Math.max(0, conservativeIncome - conservativeAnnualExpenses);
    
    // Optimistic estimate (lower bounds)  
    const optimisticIncome = incomeRange.min;
    const optimisticMonthlyExpenses = expenseRange.min;
    const optimisticAnnualExpenses = optimisticMonthlyExpenses * 12;
    const optimisticPotentialSavings = Math.max(0, optimisticIncome - optimisticAnnualExpenses);
    
    // Tax calculations for both scenarios (using Old Regime for example)
    const basicExemption = 250000;
    const standardDeduction = 50000; // Standard deduction for salary income
    const section80CLimit = 150000;
    
    const calculateTaxForIncome = (grossIncome: number, potentialDeductions: number) => {
      // Determine 80C deduction based on investment answers
      let section80CDeduction = 0;
      if (answers.hasInvestments === 'yes-sip') {
        section80CDeduction = Math.min(section80CLimit, potentialDeductions); // Assume SIP utilizes 80C
      }
      
      const taxableIncomeBeforeDeductions = Math.max(0, grossIncome - basicExemption - standardDeduction);
      const taxableIncomeAfterDeductions = Math.max(0, taxableIncomeBeforeDeductions - section80CDeduction);
      
      // Calculate tax based on slabs (Old Regime)
      let taxBeforeCess = 0;
      if (taxableIncomeAfterDeductions > 250000) {
        if (taxableIncomeAfterDeductions <= 500000) {
          taxBeforeCess = (taxableIncomeAfterDeductions - 250000) * 0.05;
        } else if (taxableIncomeAfterDeductions <= 1000000) {
          taxBeforeCess = 250000 * 0.05 + (taxableIncomeAfterDeductions - 500000) * 0.20;
        } else {
          taxBeforeCess = 250000 * 0.05 + 500000 * 0.20 + (taxableIncomeAfterDeductions - 1000000) * 0.30;
        }
      }
      
      const healthEducationCess = taxBeforeCess * 0.04;
      const totalTax = taxBeforeCess + healthEducationCess;
      
      return {
        grossIncome,
        standardDeduction,
        section80CDeduction,
        taxableIncomeBeforeDeductions: grossIncome - basicExemption - standardDeduction,
        taxableIncomeAfterDeductions,
        taxBeforeCess: Math.round(taxBeforeCess),
        healthEducationCess: Math.round(healthEducationCess),
        totalTax: Math.round(totalTax),
        potentialSavings: potentialDeductions
      };
    };
    
    const conservative = calculateTaxForIncome(conservativeIncome, conservativePotentialSavings);
    const optimistic = calculateTaxForIncome(optimisticIncome, optimisticPotentialSavings);
    
    return {
      conservative: {
        ...conservative,
        annualExpenses: conservativeAnnualExpenses,
        monthlyExpenses: conservativeMonthlyExpenses
      },
      optimistic: {
        ...optimistic,
        annualExpenses: optimisticAnnualExpenses,
        monthlyExpenses: optimisticMonthlyExpenses
      }
    };
  };

  const calculatePotentialSavings = (answers: any) => {
    const estimates = calculateDetailedTaxEstimate(answers);
    return Math.max(estimates.conservative.totalTax, 5000);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Floating Background Icons */}
      <FloatingIcon delay={0}>
        <DollarSign className="w-16 h-16 text-green-500" />
      </FloatingIcon>
      <FloatingIcon delay={1}>
        <TrendingUp className="w-12 h-12 text-blue-500" />
      </FloatingIcon>
      <FloatingIcon delay={2}>
        <PieChart className="w-14 h-14 text-purple-500" />
      </FloatingIcon>

      <div className="relative z-10 p-6 space-y-12">
        {/* Hero Section */}
        <motion.section 
          className="text-center py-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Finance Platform
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Your AI-powered finance companion
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Taxes, Credit, Planning — All in One Place. 
            Smart insights, automated filing, and personalized recommendations.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Upload Financial Data
            </Button>
          </motion.div>
        </motion.section>

        {/* KPI Cards */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                          <Icon className={`w-6 h-6 ${kpi.color}`} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{kpi.title}</p>
                        <p className="text-3xl font-bold">
                          <AnimatedCounter 
                            end={kpi.value} 
                            prefix={kpi.prefix} 
                            suffix={kpi.suffix}
                            duration={2000 + index * 200}
                          />
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Features Carousel */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground">Everything you need to manage your finances</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6 + index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                    <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Gamified Onboarding */}
        <motion.section
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-2xl p-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">See Your Potential Savings</h2>
            <p className="text-muted-foreground">Answer 3 quick questions to get personalized insights</p>
          </div>

          <div className="max-w-2xl mx-auto">
            {!questionnaireComplete ? (
              <>
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Question {currentStep + 1} of {quickQuestions.length}</span>
                    <span>{Math.round(((currentStep + 1) / quickQuestions.length) * 100)}%</span>
                  </div>
                  <Progress value={((currentStep + 1) / quickQuestions.length) * 100} className="h-2" />
                </div>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6 text-center">{quickQuestions[currentStep].question}</h3>
                  
                  <div className="space-y-4 mb-6">
                    <RadioGroup 
                      value={answers[quickQuestions[currentStep].field]} 
                      onValueChange={handleAnswerChange}
                    >
                      {quickQuestions[currentStep].options.map((option, index) => (
                        <motion.div
                          key={option.value}
                          className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label 
                            htmlFor={option.value} 
                            className="flex-1 cursor-pointer font-medium"
                          >
                            {option.label}
                          </Label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={handleNext}
                      disabled={!answers[quickQuestions[currentStep].field] || isSubmitting}
                      className="px-8"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : currentStep === quickQuestions.length - 1 ? (
                        'Get My Savings Estimate'
                      ) : (
                        'Continue'
                      )}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    {currentStep > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
                        disabled={isSubmitting}
                      >
                        Back
                      </Button>
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {(() => {
                  const estimates = calculateDetailedTaxEstimate(answers);
                  return (
                    <>
                      <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="text-xl font-bold mb-4 text-green-700 dark:text-green-400">
                          Your Tax Estimates Ready!
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Here are your Conservative and Optimistic scenarios based on your selections:
                        </p>
                      </Card>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Conservative Estimate */}
                        <Card className="p-6 border-red-200 dark:border-red-800">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-red-700 dark:text-red-400">
                              Conservative Estimate
                            </h4>
                            <DevOverlay
                              title="Conservative Calculation"
                              formula="Using upper bounds of selected ranges for worst-case scenario"
                              assumptions={[
                                "Annual income: ₹" + estimates.conservative.grossIncome.toLocaleString(),
                                "Monthly expenses: ₹" + estimates.conservative.monthlyExpenses.toLocaleString(),
                                "Basic exemption: ₹2,50,000 (Old Regime)",
                                "Standard deduction: ₹50,000",
                                "80C limit: ₹1,50,000"
                              ]}
                              source="Income Tax Act 1961, Section 80C"
                            />
                          </div>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span>Annual Income:</span>
                              <span className="font-medium">{formatCurrency(estimates.conservative.grossIncome)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Annual Expenses (monthly × 12):</span>
                              <span className="font-medium">{formatCurrency(estimates.conservative.annualExpenses)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Potential Savings (income − expenses):</span>
                              <span className="font-medium">{formatCurrency(estimates.conservative.potentialSavings)}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between items-center">
                                <span>Taxable Income (before deductions):</span>
                                <span className="font-medium">{formatCurrency(estimates.conservative.taxableIncomeBeforeDeductions)}</span>
                                <DevOverlay
                                  title="Taxable Income Calculation"
                                  formula="Gross Income - Basic Exemption (₹2,50,000) - Standard Deduction (₹50,000)"
                                  assumptions={["Old Regime basic exemption applied"]}
                                  source="Section 87A, Income Tax Act"
                                />
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Tax before cess:</span>
                                <span className="font-medium">{formatCurrency(estimates.conservative.taxBeforeCess)}</span>
                                <DevOverlay
                                  title="Tax Slab Calculation"
                                  formula="5% on income between ₹2.5L-5L; 20% on 5L-10L; 30% above 10L"
                                  assumptions={["Old Regime tax slabs applied", "SIP investments claimed under 80C if applicable"]}
                                  source="Section 2(13), Income Tax Act"
                                />
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Health & Education Cess (4%):</span>
                                <span className="font-medium">{formatCurrency(estimates.conservative.healthEducationCess)}</span>
                                <DevOverlay
                                  title="Cess Calculation"
                                  formula="4% on (Tax + Surcharge)"
                                  assumptions={["Health & Education Cess as per Section 136"]}
                                  source="Section 136, Income Tax Act"
                                />
                              </div>
                              <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total Tax Payable:</span>
                                <span className="text-red-600">{formatCurrency(estimates.conservative.totalTax)}</span>
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* Optimistic Estimate */}
                        <Card className="p-6 border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-green-700 dark:text-green-400">
                              Optimistic Estimate  
                            </h4>
                            <DevOverlay
                              title="Optimistic Calculation"
                              formula="Using lower bounds of selected ranges for best-case scenario"
                              assumptions={[
                                "Annual income: ₹" + estimates.optimistic.grossIncome.toLocaleString(),
                                "Monthly expenses: ₹" + estimates.optimistic.monthlyExpenses.toLocaleString(),
                                "Basic exemption: ₹2,50,000 (Old Regime)",
                                "Standard deduction: ₹50,000",
                                "80C limit: ₹1,50,000"
                              ]}
                              source="Income Tax Act 1961, Section 80C"
                            />
                          </div>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span>Annual Income:</span>
                              <span className="font-medium">{formatCurrency(estimates.optimistic.grossIncome)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Annual Expenses (monthly × 12):</span>
                              <span className="font-medium">{formatCurrency(estimates.optimistic.annualExpenses)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Potential Savings (income − expenses):</span>
                              <span className="font-medium">{formatCurrency(estimates.optimistic.potentialSavings)}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between">
                                <span>Taxable Income (before deductions):</span>
                                <span className="font-medium">{formatCurrency(estimates.optimistic.taxableIncomeBeforeDeductions)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tax before cess:</span>
                                <span className="font-medium">{formatCurrency(estimates.optimistic.taxBeforeCess)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Health & Education Cess (4%):</span>
                                <span className="font-medium">{formatCurrency(estimates.optimistic.healthEducationCess)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total Tax Payable:</span>
                                <span className="text-green-600">{formatCurrency(estimates.optimistic.totalTax)}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>

                      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <div className="text-center">
                          <Calculator className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <h4 className="font-semibold mb-2">Sample Calculation (Demo Mode)</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Using upper bound example: Annual income ₹3,00,000, Monthly expenses ₹20,000, SIPs under 80C
                          </p>
                          <div className="text-left bg-white dark:bg-gray-800 p-4 rounded-lg text-xs space-y-1">
                            <div>Annual expenses = 20,000 × 12 = ₹2,40,000</div>
                            <div>Potential savings = 3,00,000 − 2,40,000 = ₹60,000</div>
                            <div>Taxable income before deductions = 3,00,000 − 2,50,000 (exemption) = ₹50,000</div>
                            <div>Tax before cess (5% slab) = 5% × 50,000 = ₹2,500</div>
                            <div>Health & Education Cess (4%) = 4% × 2,500 = ₹100</div>
                            <div className="font-bold">Total tax payable = ₹2,600</div>
                            <div className="text-green-600">With SIPs under 80C: Tax saved = ₹2,600 (below exemption)</div>
                          </div>
                        </div>
                      </Card>

                      <div className="flex gap-4 justify-center">
                        <Button size="lg" className="px-8">
                          Start Tax Planning
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button variant="outline" size="lg">
                          Upload Documents
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground">Join thousands of satisfied customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Security Badges */}
        <motion.section
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm">RBI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">256-bit Encryption</span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}