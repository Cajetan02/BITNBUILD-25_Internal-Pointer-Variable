import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Upload, FileText, Image, CheckCircle, AlertCircle, 
  Eye, Edit3, Download, Trash2, Zap, Brain,
  PieChart, TrendingUp, TrendingDown, DollarSign,
  Home, Car, Utensils, ShoppingBag, Gamepad2, Loader2
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { toast } from 'sonner';
import supabaseBackend from '../services/supabase-backend';
import DevOverlay from './DevOverlay';
import { formatCurrency } from '../utils/formatters';

const FileUploadZone = ({ onFileUpload, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    onFileUpload(files);
  }, [onFileUpload]);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    onFileUpload(files);
  }, [onFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <motion.div
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
          : 'border-border hover:border-blue-400'
      } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      whileHover={{ scale: 1.02 }}
      animate={isDragOver ? { scale: 1.05 } : { scale: 1 }}
    >
      <motion.div
        animate={{ 
          y: isDragOver ? -10 : 0,
          rotate: isDragOver ? [0, -5, 5, 0] : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-muted-foreground'}`} />
      </motion.div>
      
      <h3 className="text-xl font-semibold mb-2">
        {isDragOver ? 'Drop files here!' : 'Upload Your Financial Documents'}
      </h3>
      
      <p className="text-muted-foreground mb-6">
        Drag & drop CSV, PDF, or bank screenshots. Our AI will automatically detect and categorize your data.
      </p>
      
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <Badge variant="secondary">CSV Files</Badge>
        <Badge variant="secondary">PDF Statements</Badge>
        <Badge variant="secondary">Screenshots</Badge>
        <Badge variant="secondary">Excel Files</Badge>
      </div>
      
      <div className="relative">
        <input
          type="file"
          multiple
          accept=".csv,.pdf,.xlsx,.xls,.png,.jpg,.jpeg"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        <Button size="lg" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </>
          )}
        </Button>
      </div>
      
      {isProcessing && (
        <motion.div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Processing with AI...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const TransactionTable = ({ transactions, onEdit }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-3 font-medium">Date</th>
            <th className="text-left p-3 font-medium">Description</th>
            <th className="text-left p-3 font-medium">Category</th>
            <th className="text-right p-3 font-medium">Amount</th>
            <th className="text-center p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <motion.tr
              key={index}
              className="border-b border-border hover:bg-muted/50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <td className="p-3 text-sm">{transaction.date}</td>
              <td className="p-3 text-sm">{transaction.description}</td>
              <td className="p-3">
                <Badge variant={transaction.type === 'expense' ? 'destructive' : 'default'}>
                  {transaction.category}
                </Badge>
              </td>
              <td className={`p-3 text-sm text-right font-medium ${
                transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'
              }`}>
                {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
              </td>
              <td className="p-3 text-center">
                <Button variant="ghost" size="sm" onClick={() => onEdit(transaction)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function DataIngestion() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Mock data for demo
  const mockTransactions = [
    { date: '2024-01-15', description: 'Salary Credit', category: 'Income', amount: 85000, type: 'income' },
    { date: '2024-01-10', description: 'House Rent', category: 'Housing', amount: 25000, type: 'expense' },
    { date: '2024-01-08', description: 'Grocery Shopping', category: 'Food', amount: 3500, type: 'expense' },
    { date: '2024-01-05', description: 'Mutual Fund SIP', category: 'Investment', amount: 10000, type: 'expense' },
    { date: '2024-01-03', description: 'Car EMI', category: 'Transport', amount: 15000, type: 'expense' },
    { date: '2024-01-02', description: 'Electricity Bill', category: 'Utilities', amount: 2200, type: 'expense' },
  ];

  const expenseBreakdown = [
    { name: 'Housing', value: 25000, color: '#0E6FFF' },
    { name: 'Transport', value: 15000, color: '#2ECC71' },
    { name: 'Investment', value: 10000, color: '#9B59B6' },
    { name: 'Food', value: 3500, color: '#F1C40F' },
    { name: 'Utilities', value: 2200, color: '#E74C3C' },
  ];

  const monthlyTrend = [
    { month: 'Oct', income: 85000, expenses: 55000 },
    { month: 'Nov', income: 85000, expenses: 48000 },
    { month: 'Dec', income:95000, expenses: 52000 },
    { month: 'Jan', income: 85000, expenses: 55700 },
  ];

  const summaryCards = [
    {
      title: 'Total Income',
      amount: 85000,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Total Expenses',
      amount: 55700,
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950'
    },
    {
      title: 'Net Savings',
      amount: 29300,
      icon: DollarSign,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Tax Deductibles',
      amount: 12200,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    }
  ];

  const recurringPayments = [
    { name: 'House Rent', amount: 25000, frequency: 'Monthly', icon: Home },
    { name: 'Car EMI', amount: 15000, frequency: 'Monthly', icon: Car },
    { name: 'Mutual Fund SIP', amount: 10000, frequency: 'Monthly', icon: TrendingUp },
    { name: 'Gym Membership', amount: 2000, frequency: 'Monthly', icon: Gamepad2 },
  ];

  const handleFileUpload = useCallback(async (files) => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    const currentUser = supabaseBackend.getCurrentUser();
    const userId = currentUser?.id || 'user_demo_123';
    
    try {
      // Upload and process each file
      const uploadPromises = files.map(async (file) => {
        toast.info(`Uploading ${file.name}...`);
        const result = await supabaseBackend.uploadFile(file, userId, 'financial_data');
        return { file, result };
      });
      
      const uploadResults = await Promise.all(uploadPromises);
      
      // Update state with uploaded files
      const newFiles = uploadResults.map(({ file, result }) => ({
        id: result.fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        extractedData: result.extractedData
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // If we have extracted transaction data, add it to transactions
      const extractedTransactions = uploadResults
        .filter(({ result }) => result.extractedData?.transactions)
        .flatMap(({ result }) => result.extractedData.transactions);
      
      if (extractedTransactions.length > 0) {
        setTransactions(prev => [...prev, ...extractedTransactions]);
        setShowPreview(true);
        
        // Save transactions to backend
        await Promise.all(extractedTransactions.map(transaction => 
          supabaseBackend.saveTransaction(userId, transaction)
        ));
        
        toast.success('Uploaded & saved to PostgreSQL', {
          description: `${files.length} files processed via POST /api/files. ${extractedTransactions.length} transactions saved via POST /api/transactions.`
        });
      } else {
        toast.success('Uploaded & saved to PostgreSQL', {
          description: `${files.length} files uploaded successfully via POST /api/files.`
        });
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleEditTransaction = (transaction) => {
    // In a real app, this would open an edit modal
    toast.info('Edit functionality would open a modal here');
  };

  const handleSaveToBackend = async () => {
    const currentUser = supabaseBackend.getCurrentUser();
    const userId = currentUser?.id || 'user_demo_123';
    try {
      await supabaseBackend.saveFinancialData(userId, {
        transactions,
        uploadedFiles,
        extractedData,
        lastUpdated: new Date().toISOString()
      });
      toast.success('Saved to PostgreSQL', {
        description: 'All transaction data saved via POST /api/transactions. Dashboard KPIs will be updated automatically.'
      });
    } catch (error) {
      toast.error('Failed to save to PostgreSQL', {
        description: 'Error with POST /api/transactions endpoint.'
      });
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Smart Financial Data Ingestion</h1>
            <p className="text-muted-foreground">Upload and let AI categorize your financial data automatically</p>
          </div>
        </div>
      </motion.div>

      {!showPreview ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card>
            <CardContent className="p-6">
              <FileUploadZone onFileUpload={handleFileUpload} isProcessing={isProcessing} />
              
              {isProcessing && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="space-y-3">
                    <Progress value={33} className="w-full" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="w-4 h-4 text-blue-500" />
                      AI is analyzing your financial data...
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI-Powered Detection</h3>
                  <p className="text-muted-foreground">Automatically identifies income, expenses, and categories</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Smart Categorization</h3>
                  <p className="text-muted-foreground">Intelligently sorts transactions into relevant categories</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Instant Preview</h3>
                  <p className="text-muted-foreground">Review and edit detected data before finalizing</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Success Alert */}
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Successfully processed and analyzed your financial data! Review the categorized transactions below.
              </AlertDescription>
            </Alert>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {summaryCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg ${card.bgColor}`}>
                            <Icon className={`w-6 h-6 ${card.color}`} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">{card.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">{formatCurrency(card.amount)}</p>
                            <DevOverlay
                              title={card.title + ' Calculation'}
                              formula={card.title === 'Net Savings' ? 'Total Income - Total Expenses' : card.title === 'Tax Deductibles' ? '80C + 80D + Section 24(b) eligible amounts' : card.title + ' = sum of all ' + (card.title.includes('Income') ? 'credit' : 'debit') + ' transactions'}
                              source="Basic accounting: categorized transaction totals"
                              assumptions={["All uploaded transactions categorized by AI", "Real-time calculation based on latest data"]}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Expense Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

              {/* Monthly Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Income vs Expenses Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="income" fill="#2ECC71" name="Income" />
                        <Bar dataKey="expenses" fill="#E74C3C" name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recurring Payments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    Detected Recurring Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {recurringPayments.map((payment, index) => {
                      const Icon = payment.icon;
                      return (
                        <motion.div
                          key={payment.name}
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{payment.name}</span>
                          </div>
                          <div className="text-lg font-bold">₹{payment.amount.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{payment.frequency}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Transaction Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Categorized Transactions</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button size="sm" onClick={handleSaveToBackend}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save to Backend
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <TransactionTable 
                    transactions={transactions.length > 0 ? transactions : mockTransactions} 
                    onEdit={handleEditTransaction}
                  />
                  {transactions.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      <Button onClick={handleSaveToBackend} className="px-6">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save to Database
                      </Button>
                      <Button variant="outline" onClick={() => setTransactions([])}>
                        Clear Data
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}