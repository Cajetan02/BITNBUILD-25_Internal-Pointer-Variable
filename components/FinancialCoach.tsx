import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
import supabaseBackend from '../services/supabase-backend';
import { 
  MessageCircle, Send, Mic, Paperclip, Bot, User, 
  BarChart3, TrendingUp, DollarSign, PieChart, FileText,
  Lightbulb, Target, CreditCard, Home, Car, Brain,
  ThumbsUp, ThumbsDown, Copy, Download, Maximize2, Upload, X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-1 p-3"
  >
    <div className="flex gap-1">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        className="w-2 h-2 bg-blue-500 rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        className="w-2 h-2 bg-blue-500 rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        className="w-2 h-2 bg-blue-500 rounded-full"
      />
    </div>
    <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
  </motion.div>
);

const ChatMessage = ({ message, isBot, timestamp, onFeedback, onCopy }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 p-4 ${isBot ? 'bg-muted/30' : ''}`}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={isBot ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}>
          {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{isBot ? 'Caramel' : 'You'}</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {message.type === 'text' ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : message.type === 'chart' ? (
            <div className="my-4">
              {message.chartComponent}
            </div>
          ) : message.type === 'suggestions' ? (
            <div className="space-y-2">
              <p className="text-sm leading-relaxed">{message.content}</p>
              <div className="flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, index) => (
                  <Button key={index} variant="outline" size="sm">
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        
        {isBot && (
          <div className="flex items-center gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => onFeedback('like')}>
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFeedback('dislike')}>
              <ThumbsDown className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onCopy(message.content)}>
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const QuickQuery = ({ query, icon: Icon, onSelect }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(query)}
    className="flex items-center gap-3 p-3 border border-border rounded-lg text-left hover:bg-muted transition-colors"
  >
    <div className="p-2 bg-blue-500 rounded-lg">
      <Icon className="w-4 h-4 text-white" />
    </div>
    <span className="text-sm font-medium">{query}</span>
  </motion.button>
);

const ExpenseChart = ({ data }) => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="text-sm">Monthly Expense Breakdown</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={200}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={60}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const SavingsProjection = ({ data }) => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="text-sm">Savings Projection</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
          <Line type="monotone" dataKey="savings" stroke="#2ECC71" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default function FinancialCoach() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hi! I'm Caramel, your AI finance assistant. I can help you with taxes, credit scores, personal finance, investments, and budgeting. I only answer finance-related questions. What would you like to know today?",
      isBot: true,
      timestamp: "2:30 PM",
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const quickQueries = [
    { text: "How can I save more taxes?", icon: FileText },
    { text: "What's my spending pattern?", icon: PieChart },
    { text: "Should I invest in ELSS?", icon: TrendingUp },
    { text: "How to improve CIBIL score?", icon: CreditCard },
    { text: "Create a budget plan", icon: Target },
    { text: "Emergency fund advice", icon: DollarSign }
  ];

  const mockExpenseData = [
    { name: 'Housing', value: 25000, color: '#0E6FFF' },
    { name: 'Food', value: 8000, color: '#2ECC71' },
    { name: 'Transport', value: 12000, color: '#F1C40F' },
    { name: 'Entertainment', value: 5000, color: '#E74C3C' },
    { name: 'Others', value: 7000, color: '#9B59B6' }
  ];

  const mockSavingsData = [
    { month: 'Jan', savings: 25000 },
    { month: 'Feb', savings: 28000 },
    { month: 'Mar', savings: 32000 },
    { month: 'Apr', savings: 35000 },
    { month: 'May', savings: 38000 },
    { month: 'Jun', savings: 42000 }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Check for out-of-scope questions
    const outOfScopeKeywords = ['weather', 'sports', 'recipe', 'music', 'movie', 'game', 'news', 'politics', 'entertainment'];
    const isOutOfScope = outOfScopeKeywords.some(keyword => message.includes(keyword));
    
    if (isOutOfScope) {
      return {
        content: "I can only help with taxes, credit scores, and personal finance topics. I'm not able to answer questions about other subjects. Let me know how I can assist you with your financial goals instead!",
        type: 'suggestions',
        suggestions: ['Tax planning', 'Investment advice', 'Budget analysis', 'Credit score help']
      };
    }
    
    if (message.includes('tax') || message.includes('save')) {
      return {
        content: "Based on your income of ₹12L, here are some tax-saving opportunities:\n\n• Invest ₹1,50,000 in 80C (PPF, ELSS, Life Insurance)\n• Claim ₹50,000 under 80D for health insurance\n• Consider NPS for additional ₹50,000 deduction\n\nThis could save you approximately ₹77,500 in taxes! Would you like me to create a detailed investment plan?",
        type: 'suggestions',
        suggestions: ['Create investment plan', 'Show tax calculator', 'Compare tax regimes']
      };
    }
    
    if (message.includes('spending') || message.includes('expense') || message.includes('budget')) {
      return {
        content: "Here's your spending pattern analysis for this month. I notice your housing costs are 44% of your income, which is slightly high. The ideal ratio should be 30-35%.",
        type: 'chart',
        chartComponent: <ExpenseChart data={mockExpenseData} />
      };
    }
    
    if (message.includes('elss') || message.includes('invest')) {
      return {
        content: "ELSS (Equity Linked Savings Scheme) is excellent for you right now! Benefits:\n\n✅ Tax deduction up to ₹1.5L under 80C\n✅ Potential 12-15% annual returns\n✅ Only 3-year lock-in period\n✅ Equity exposure for wealth creation\n\nBased on your profile, I recommend investing ₹12,500 monthly in a diversified ELSS fund. This will maximize your tax savings and build wealth long-term.",
        type: 'suggestions',
        suggestions: ['Show ELSS funds', 'Start SIP', 'Calculate returns']
      };
    }
    
    if (message.includes('cibil') || message.includes('credit') || message.includes('score')) {
      return {
        content: "Your current CIBIL score is 720 (Good). To improve it to 750+ (Excellent):\n\n🎯 Reduce credit utilization from 45% to below 30%\n🎯 Pay all EMIs 2-3 days before due date\n🎯 Avoid applying for new credit for 6 months\n🎯 Keep old credit cards active\n\nThese changes can boost your score by 30-40 points in 6 months!",
        type: 'suggestions',
        suggestions: ['Credit score simulator', 'Improvement plan', 'Track progress']
      };
    }
    
    if (message.includes('emergency') || message.includes('fund')) {
      return {
        content: "Your emergency fund currently covers 4 months of expenses (₹2,28,000). For better financial security, aim for 6 months (₹3,42,000).\n\nRecommended approach:\n• Add ₹19,000 monthly for 6 months\n• Keep in liquid funds or high-yield savings\n• Don't touch unless it's a real emergency\n\nThis will give you peace of mind and financial stability!",
        type: 'suggestions',
        suggestions: ['Emergency fund calculator', 'Best liquid funds', 'Auto-transfer setup']
      };
    }

    if (message.includes('savings') || message.includes('projection')) {
      return {
        content: "Great question! Here's your savings projection based on current trends. You're doing well with a 30% savings rate. If you continue this pattern, you'll have ₹5.04L saved by year-end!",
        type: 'chart',
        chartComponent: <SavingsProjection data={mockSavingsData} />
      };
    }
    
    // Default response
    return {
      content: "I understand you're asking about your finances. I can help with tax planning, budgeting, investments, credit score improvement, and general financial advice. Could you be more specific about what you'd like to know?",
      type: 'suggestions',
      suggestions: ['Tax planning', 'Investment advice', 'Budget analysis', 'Credit score help']
    };
  };

  const handleFileAttachment = async (file) => {
    try {
      const userId = 'user_demo_123';
      const response = await supabaseBackend.uploadFile(file, userId, 'caramel_chat');
      
      toast.success('Attachment saved to PostgreSQL', {
        description: `File "${file.name}" uploaded and ready for analysis`
      });
      
      setAttachedFile({
        id: response.fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        extractedData: response.extractedData
      });
      
      return response;
    } catch (error) {
      toast.error('File upload failed', {
        description: 'Please try again or contact support'
      });
      return null;
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
  };

  const generateBotResponseWithAttachment = (messageText, attachment) => {
    if (attachment) {
      if (attachment.type.includes('csv') || attachment.name.toLowerCase().includes('transaction')) {
        return {
          content: `I've analyzed your uploaded file "${attachment.name}". Based on the transaction data, I can see:\\n\\n• Total transactions: 45\\n• Monthly average spending: ₹34,500\\n• Top spending category: Food & Dining (28%)\\n• Potential savings opportunity: ₹8,200/month\\n\\nWould you like me to create a personalized budget plan based on this data?`,
          type: 'suggestions',
          suggestions: ['Create budget plan', 'Analyze spending patterns', 'Find saving opportunities']
        };
      } else if (attachment.type.includes('pdf')) {
        return {
          content: `I've reviewed your PDF document "${attachment.name}". This appears to be a financial statement. Key insights:\\n\\n• Investment portfolio value: ₹8.5L\\n• Asset allocation needs rebalancing\\n• Tax-saving potential: ₹45,000\\n• Risk profile: Moderate\\n\\nShould I provide specific recommendations for portfolio optimization?`,
          type: 'suggestions',
          suggestions: ['Portfolio rebalancing', 'Tax optimization', 'Risk assessment']
        };
      }
    }
    return generateBotResponse(messageText);
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() && !attachedFile) return;

    const userMessage = {
      id: Date.now(),
      content: messageText || 'Shared a file',
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      attachment: attachedFile
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const botResponse = generateBotResponseWithAttachment(messageText, attachedFile);
      const botMessage = {
        id: Date.now() + 1,
        ...botResponse,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      setAttachedFile(null); // Clear attachment after sending
    }, 1500 + Math.random() * 1000);
  };

  const handleQuickQuery = (query) => {
    handleSendMessage(query);
  };

  const handleFeedback = (type) => {
    console.log('Feedback:', type);
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-500 rounded-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Caramel - Your AI Financial Coach</h1>
            <p className="text-muted-foreground">Get personalized financial advice and insights from Caramel</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </motion.div>

      <div className={`grid gap-6 transition-all duration-300 ${
        isExpanded ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'
      }`}>
        {/* Quick Queries Sidebar */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Questions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Get instant answers to common financial questions
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickQueries.map((query, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <QuickQuery
                      query={query.text}
                      icon={query.icon}
                      onSelect={handleQuickQuery}
                    />
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* AI Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Caramel Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Questions Answered</span>
                  <Badge variant="secondary">247</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Money Saved</span>
                  <Badge variant="default">₹1,25,000</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Accuracy Rate</span>
                  <Badge variant="secondary">98.5%</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={isExpanded ? 'col-span-1' : 'lg:col-span-3'}
        >
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-500 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">TaxWise AI Coach</CardTitle>
                    <p className="text-sm text-muted-foreground">Always here to help with your finances</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="space-y-0">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isBot={message.isBot}
                    timestamp={message.timestamp}
                    onFeedback={handleFeedback}
                    onCopy={handleCopy}
                  />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your finances..."
                    className="pr-10"
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Mic className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Press Enter to send, Shift + Enter for new line
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>AI Coach Capabilities</CardTitle>
            <p className="text-sm text-muted-foreground">
              What our AI financial coach can help you with
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-border rounded-lg">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Goal Planning</h4>
                <p className="text-xs text-muted-foreground">Set and track financial goals</p>
              </div>
              
              <div className="text-center p-4 border border-border rounded-lg">
                <PieChart className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Expense Analysis</h4>
                <p className="text-xs text-muted-foreground">Understand spending patterns</p>
              </div>
              
              <div className="text-center p-4 border border-border rounded-lg">
                <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Investment Advice</h4>
                <p className="text-xs text-muted-foreground">Personalized investment tips</p>
              </div>
              
              <div className="text-center p-4 border border-border rounded-lg">
                <FileText className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Tax Optimization</h4>
                <p className="text-xs text-muted-foreground">Maximize tax savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}