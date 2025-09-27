import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, Filter, Bookmark, BookmarkX, Share2, 
  Clock, TrendingUp, AlertTriangle, Calendar, 
  ChevronRight, Star, Eye, MessageSquare 
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: 'Tax' | 'Credit' | 'Investments' | 'Economy';
  source: string;
  publishedAt: string;
  readTime: number;
  views: number;
  comments: number;
  isBookmarked: boolean;
  isTrending: boolean;
  urgency?: 'high' | 'medium' | 'low';
  tags: string[];
}

const mockNewsData: NewsArticle[] = [
  {
    id: '1',
    title: 'New Tax Deductions Under Section 80C: What You Need to Know for FY 2024-25',
    summary: 'The government has introduced new investment options under Section 80C. Learn how these changes can help you save up to ₹46,800 in taxes this financial year.',
    category: 'Tax',
    source: 'Economic Times',
    publishedAt: '2024-01-15T10:30:00Z',
    readTime: 5,
    views: 12400,
    comments: 89,
    isBookmarked: false,
    isTrending: true,
    urgency: 'high',
    tags: ['Section 80C', 'Tax Deductions', 'FY 2024-25']
  },
  {
    id: '2',
    title: 'CIBIL Score Changes: New Algorithm Updates Affecting Credit Ratings',
    summary: 'CIBIL has updated its scoring algorithm. Find out how the new changes might impact your credit score and what steps you can take to improve it.',
    category: 'Credit',
    source: 'Mint',
    publishedAt: '2024-01-14T14:20:00Z',
    readTime: 4,
    views: 8750,
    comments: 45,
    isBookmarked: true,
    isTrending: false,
    tags: ['CIBIL Score', 'Credit Rating', 'Algorithm Update']
  },
  {
    id: '3',
    title: 'Mutual Fund SIP: Top 10 Equity Funds for Long-term Wealth Creation',
    summary: 'Discover the best-performing equity mutual funds for SIP investments. Our analysis covers 5-year returns, expense ratios, and fund manager track records.',
    category: 'Investments',
    source: 'MoneyControl',
    publishedAt: '2024-01-14T09:15:00Z',
    readTime: 8,
    views: 15600,
    comments: 127,
    isBookmarked: false,
    isTrending: true,
    tags: ['SIP', 'Mutual Funds', 'Equity', 'Long-term Investment']
  },
  {
    id: '4',
    title: 'RBI Policy Impact: How Interest Rate Changes Affect Your EMIs and Investments',
    summary: 'The latest RBI monetary policy decisions and their direct impact on home loans, personal loans, fixed deposits, and investment strategies.',
    category: 'Economy',
    source: 'Business Standard',
    publishedAt: '2024-01-13T16:45:00Z',
    readTime: 6,
    views: 9830,
    comments: 67,
    isBookmarked: false,
    isTrending: false,
    urgency: 'medium',
    tags: ['RBI Policy', 'Interest Rates', 'EMI', 'Investment Impact']
  },
  {
    id: '5',
    title: 'ITR Filing Deadline Extended: Key Documents and Common Mistakes to Avoid',
    summary: 'Income Tax Return filing deadline has been extended. Get a comprehensive checklist of required documents and learn about the most common filing errors.',
    category: 'Tax',
    source: 'Hindu BusinessLine',
    publishedAt: '2024-01-13T11:00:00Z',
    readTime: 7,
    views: 22100,
    comments: 156,
    isBookmarked: true,
    isTrending: true,
    urgency: 'high',
    tags: ['ITR Filing', 'Tax Deadline', 'Required Documents']
  },
  {
    id: '6',
    title: 'Credit Card Rewards: Maximizing Cashback and Points in 2024',
    summary: 'A comprehensive guide to getting the most out of your credit card rewards programs. Compare top cards and optimization strategies.',
    category: 'Credit',
    source: 'Forbes India',
    publishedAt: '2024-01-12T13:30:00Z',
    readTime: 5,
    views: 7250,
    comments: 34,
    isBookmarked: false,
    isTrending: false,
    tags: ['Credit Cards', 'Rewards', 'Cashback', 'Points']
  }
];

export default function FinanceNews() {
  const [articles, setArticles] = useState<NewsArticle[]>(mockNewsData);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set(['2', '5']));

  const categories = ['All', 'Tax', 'Credit', 'Investments', 'Economy'];

  const urgentAlerts = [
    {
      id: 'alert-1',
      message: 'ITR Filing Deadline: Only 7 days left to file your Income Tax Return',
      type: 'high' as const,
      action: 'File Now'
    },
    {
      id: 'alert-2', 
      message: 'Credit Card Bill Due: ₹15,847 payment due in 3 days',
      type: 'medium' as const,
      action: 'Pay Now'
    }
  ];

  const filteredArticles = selectedCategory === 'All' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const toggleBookmark = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, isBookmarked: !article.isBookmarked }
        : article
    ));

    const newSavedArticles = new Set(savedArticles);
    if (savedArticles.has(articleId)) {
      newSavedArticles.delete(articleId);
      toast.success('Article removed from saved');
    } else {
      newSavedArticles.add(articleId);
      toast.success('Article saved to dashboard');
    }
    setSavedArticles(newSavedArticles);
  };

  const shareArticle = (article: NewsArticle) => {
    navigator.clipboard.writeText(`${article.title} - ${window.location.origin}`);
    toast.success('Article link copied to clipboard');
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Tax: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Credit: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Investments: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Economy: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getUrgencyColor = (urgency?: string) => {
    const colors = {
      high: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
      medium: 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20',
      low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
    };
    return colors[urgency] || '';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Finance News & Insights</h1>
              <p className="text-muted-foreground">Stay updated with the latest financial trends and regulations</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live Updates
            </Badge>
          </div>
        </motion.div>

        {/* Urgent Alerts Banner */}
        <AnimatePresence>
          {urgentAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Alert className={`border-l-4 ${alert.type === 'high' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' : 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20'}`}>
                <AlertTriangle className={`h-4 w-4 ${alert.type === 'high' ? 'text-red-600' : 'text-amber-600'}`} />
                <AlertDescription className="flex items-center justify-between">
                  <span className="font-medium">{alert.message}</span>
                  <Button size="sm" variant={alert.type === 'high' ? 'destructive' : 'default'}>
                    {alert.action}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>{category}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Newspaper className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Articles</p>
                  <p className="text-2xl font-bold">{filteredArticles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Trending</p>
                  <p className="text-2xl font-bold">{filteredArticles.filter(a => a.isTrending).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookmarkX className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Saved</p>
                  <p className="text-2xl font-bold">{savedArticles.size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Urgent</p>
                  <p className="text-2xl font-bold">{urgentAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* News Articles Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`h-full border-l-4 ${getUrgencyColor(article.urgency)} hover:shadow-lg transition-all duration-300`}>
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={getCategoryColor(article.category)}>
                        {article.category}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {article.isTrending && (
                          <TrendingUp className="w-4 h-4 text-red-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(article.id)}
                          className="p-1 h-8 w-8"
                        >
                          {article.isBookmarked ? (
                            <BookmarkX className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-2 hover:text-blue-600 cursor-pointer transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {article.summary}
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime} min read</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{article.comments}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{article.source}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(article.publishedAt)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareArticle(article)}
                        className="p-2 h-8 w-8"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Load More Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center pt-6"
        >
          <Button variant="outline" size="lg" className="px-8">
            Load More Articles
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}