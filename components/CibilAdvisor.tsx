import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CreditCard, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, Target, Zap, Brain, Calendar,
  DollarSign, Percent, Clock, Award, Lightbulb
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const CircularScore = ({ score, size = 160 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 70;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 900) * circumference;
  
  const getScoreColor = (score) => {
    if (score >= 750) return '#2ECC71';
    if (score >= 650) return '#F1C40F';
    if (score >= 550) return '#E67E22';
    return '#E74C3C';
  };

  const getScoreGrade = (score) => {
    if (score >= 750) return 'Excellent';
    if (score >= 650) return 'Good';
    if (score >= 550) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size/2}
          cy={size/2}
          r="70"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-muted"
        />
        <motion.circle
          cx={size/2}
          cy={size/2}
          r="70"
          stroke={getScoreColor(animatedScore)}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            className="text-4xl font-bold"
            style={{ color: getScoreColor(animatedScore) }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {animatedScore}
          </motion.div>
          <div className="text-sm text-muted-foreground">{getScoreGrade(animatedScore)}</div>
        </div>
      </div>
    </div>
  );
};

const ScoreBreakdown = ({ breakdown }) => {
  return (
    <div className="space-y-4">
      {breakdown.map((item, index) => (
        <motion.div
          key={item.factor}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-4 border border-border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.color}`}>
              <item.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium">{item.factor}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{item.percentage}%</div>
            <div className="w-20">
              <Progress value={item.score} className="h-2" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const ActionableInsights = ({ insights }) => {
  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className={`p-4 rounded-lg border-l-4 ${insight.borderColor} ${insight.bgColor}`}
        >
          <div className="flex items-start gap-3">
            <insight.icon className={`w-5 h-5 mt-0.5 ${insight.iconColor}`} />
            <div className="flex-1">
              <h4 className="font-semibold mb-1">{insight.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Impact: {insight.impact}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {insight.timeframe}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${insight.impactColor}`}>
                +{insight.pointsIncrease}
              </div>
              <div className="text-xs text-muted-foreground">points</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const ScenarioSimulator = ({ currentScore, onScoreChange }) => {
  const [creditUtilization, setCreditUtilization] = useState([25]);
  const [newLoans, setNewLoans] = useState([0]);
  const [missedPayments, setMissedPayments] = useState([0]);
  const [result, setResult] = useState({ projectedScore: currentScore, impact: 0, breakdown: [] });
  
  const calculateScoreImpact = useCallback(() => {
    let impact = 0;
    
    // Credit utilization impact
    const utilization = creditUtilization[0];
    if (utilization < 30) impact += 20;
    else if (utilization < 50) impact += 10;
    else if (utilization > 70) impact -= 30;
    
    // New loans impact
    const loans = newLoans[0];
    impact -= loans * 15;
    
    // Missed payments impact
    const missed = missedPayments[0];
    impact -= missed * 25;
    
    const projectedScore = Math.max(300, Math.min(900, currentScore + impact));
    
    return {
      projectedScore,
      impact,
      breakdown: [
        { factor: 'Credit Utilization', impact: utilization < 30 ? 20 : utilization < 50 ? 10 : -30 },
        { factor: 'New Loans', impact: -loans * 15 },
        { factor: 'Missed Payments', impact: -missed * 25 }
      ]
    };
  }, [creditUtilization, newLoans, missedPayments, currentScore]);

  useEffect(() => {
    const newResult = calculateScoreImpact();
    setResult(newResult);
    onScoreChange(newResult.projectedScore);
  }, [calculateScoreImpact, onScoreChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Credit Score Scenario Simulator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Adjust parameters to see projected score changes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {/* Credit Utilization */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="font-medium">Credit Utilization</label>
              <span className="text-sm text-muted-foreground">{creditUtilization[0]}%</span>
            </div>
            <Slider
              value={creditUtilization}
              onValueChange={setCreditUtilization}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span className="text-green-500">Ideal: &lt;30%</span>
              <span>100%</span>
            </div>
          </div>

          {/* New Loans */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="font-medium">New Loans/Credit Cards</label>
              <span className="text-sm text-muted-foreground">{newLoans[0]}</span>
            </div>
            <Slider
              value={newLoans}
              onValueChange={setNewLoans}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span>5</span>
            </div>
          </div>

          {/* Missed Payments */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="font-medium">Missed Payments (6 months)</label>
              <span className="text-sm text-muted-foreground">{missedPayments[0]}</span>
            </div>
            <Slider
              value={missedPayments}
              onValueChange={setMissedPayments}
              max={6}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span>6</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{currentScore}</div>
              <div className="text-sm text-muted-foreground">Current Score</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className={`text-2xl font-bold ${result.impact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {result.projectedScore}
              </div>
              <div className="text-sm text-muted-foreground">Projected Score</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg">
            <div className="text-center">
              <div className={`text-lg font-bold ${result.impact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {result.impact >= 0 ? '+' : ''}{result.impact} points
              </div>
              <div className="text-sm text-muted-foreground">Projected Change</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CibilAdvisor() {
  const [currentScore, setCurrentScore] = useState(720);
  const [projectedScore, setProjectedScore] = useState(720);

  const scoreHistory = [
    { month: 'Jul', score: 680 },
    { month: 'Aug', score: 690 },
    { month: 'Sep', score: 705 },
    { month: 'Oct', score: 715 },
    { month: 'Nov', score: 720 },
    { month: 'Dec', score: 720 },
  ];

  const scoreBreakdown = [
    {
      factor: 'Payment History',
      percentage: 35,
      score: 85,
      description: 'Your track record of making payments on time',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      factor: 'Credit Utilization',
      percentage: 30,
      score: 70,
      description: 'How much credit you use vs. your limits',
      icon: Percent,
      color: 'bg-blue-500'
    },
    {
      factor: 'Credit History Length',
      percentage: 15,
      score: 80,
      description: 'How long you have been using credit',
      icon: Clock,
      color: 'bg-purple-500'
    },
    {
      factor: 'Credit Mix',
      percentage: 10,
      score: 75,
      description: 'Variety of credit accounts you have',
      icon: CreditCard,
      color: 'bg-amber-500'
    },
    {
      factor: 'New Credit',
      percentage: 10,
      score: 60,
      description: 'Recent credit inquiries and new accounts',
      icon: TrendingUp,
      color: 'bg-red-500'
    }
  ];

  const actionableInsights = [
    {
      title: 'Reduce Credit Utilization',
      description: 'Your current utilization is 45%. Reducing it to 30% could improve your score.',
      impact: 'High',
      timeframe: '1-2 months',
      pointsIncrease: 25,
      icon: TrendingDown,
      iconColor: 'text-green-500',
      impactColor: 'text-green-500',
      borderColor: 'border-l-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      title: 'Pay EMI Before Due Date',
      description: 'Consistent early payments can boost your payment history score.',
      impact: 'Medium',
      timeframe: '3-6 months',
      pointsIncrease: 15,
      icon: Calendar,
      iconColor: 'text-blue-500',
      impactColor: 'text-blue-500',
      borderColor: 'border-l-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      title: 'Avoid New Credit Applications',
      description: 'Wait before applying for new loans or credit cards.',
      impact: 'Medium',
      timeframe: '6-12 months',
      pointsIncrease: 10,
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      impactColor: 'text-amber-500',
      borderColor: 'border-l-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20'
    }
  ];

  const gamificationActions = [
    {
      action: 'Pay all EMIs on time this month',
      points: 10,
      status: 'pending',
      difficulty: 'Easy',
      icon: CheckCircle
    },
    {
      action: 'Reduce credit utilization below 30%',
      points: 25,
      status: 'pending',
      difficulty: 'Medium',
      icon: Target
    },
    {
      action: 'No new credit applications for 6 months',
      points: 15,
      status: 'in-progress',
      difficulty: 'Hard',
      icon: Award
    }
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="p-3 bg-purple-500 rounded-lg">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">CIBIL Score Advisor</h1>
          <p className="text-muted-foreground">Monitor, analyze and improve your credit score with AI insights</p>
        </div>
      </motion.div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Credit Score Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Your Credit Score</CardTitle>
              <p className="text-sm text-muted-foreground">Last updated: Dec 2024</p>
            </CardHeader>
            <CardContent>
              <CircularScore score={currentScore} />
              <div className="mt-6 space-y-2">
                <Badge variant={currentScore >= 750 ? 'default' : currentScore >= 650 ? 'secondary' : 'destructive'}>
                  {currentScore >= 750 ? 'Excellent' : currentScore >= 650 ? 'Good' : 'Needs Improvement'}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {currentScore >= 750 
                    ? 'Great job! You qualify for the best rates.'
                    : currentScore >= 650
                    ? 'Good score. Room for improvement.'
                    : 'Focus on improving your credit habits.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Score Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="xl:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Score Trend (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[600, 800]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">+40 points improvement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">6 months tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="breakdown" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="gamification">Action Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Credit Score Factors</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Understanding what affects your credit score
                </p>
              </CardHeader>
              <CardContent>
                <ScoreBreakdown breakdown={scoreBreakdown} />
              </CardContent>
            </Card>
          </motion.div>
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
                  AI-Powered Improvement Recommendations
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Personalized actions to boost your credit score
                </p>
              </CardHeader>
              <CardContent>
                <ActionableInsights insights={actionableInsights} />
                
                <Alert className="mt-6">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Pro Tip:</strong> Focus on reducing credit utilization first - it has the highest impact and shows results fastest.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <ScenarioSimulator 
                currentScore={currentScore}
                onScoreChange={setProjectedScore}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Score Improvement Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium">Month 1-2</h4>
                        <p className="text-sm text-muted-foreground">Reduce credit utilization</p>
                      </div>
                      <div className="ml-auto text-green-500 font-bold">+25 pts</div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium">Month 3-6</h4>
                        <p className="text-sm text-muted-foreground">Consistent on-time payments</p>
                      </div>
                      <div className="ml-auto text-blue-500 font-bold">+15 pts</div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium">Month 6-12</h4>
                        <p className="text-sm text-muted-foreground">No new credit applications</p>
                      </div>
                      <div className="ml-auto text-purple-500 font-bold">+10 pts</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg text-center">
                    <h3 className="font-semibold mb-2">Projected Score in 12 months</h3>
                    <div className="text-3xl font-bold text-green-500">770</div>
                    <div className="text-sm text-muted-foreground">+50 points improvement</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="gamification" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Credit Score Action Challenges
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete these actions to improve your score and earn points
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gamificationActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${
                          action.status === 'completed' ? 'bg-green-500' :
                          action.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium">{action.action}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {action.difficulty}
                            </Badge>
                            <Badge variant={
                              action.status === 'completed' ? 'default' :
                              action.status === 'in-progress' ? 'secondary' : 'outline'
                            } className="text-xs">
                              {action.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-500">+{action.points}</div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Total Points Available</h3>
                      <p className="text-sm text-muted-foreground">Complete all actions for maximum score boost</p>
                    </div>
                    <div className="text-3xl font-bold text-amber-500">50</div>
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