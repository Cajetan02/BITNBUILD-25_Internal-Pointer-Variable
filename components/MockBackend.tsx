import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Database, Users, FileText, CreditCard, TrendingUp,
  MessageSquare, Bell, Share, Download, RefreshCw,
  Calendar, DollarSign, Eye, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import supabaseBackend from '../services/supabase-backend';

const tableIcons = {
  users: Users,
  questionnaire_responses: FileText,
  uploaded_files: Download,
  transactions: DollarSign,
  financial_data: TrendingUp,
  tax_data: FileText,
  credit_data: CreditCard,
  alerts: Bell,
  chat_history: MessageSquare,
  reports: Download,
  itr_filings: FileText,
  shared_links: Share
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'object') {
    if (Array.isArray(value)) return `Array(${value.length})`;
    return 'Object';
  }
  if (typeof value === 'string' && value.length > 30) {
    return value.substring(0, 30) + '...';
  }
  return String(value);
};

const getRowColor = (tableName: string, row: any) => {
  const now = new Date();
  const createdAt = new Date(row.createdAt || row.timestamp || row.filedAt || row.uploadedAt || now);
  const timeDiff = now.getTime() - createdAt.getTime();
  
  // Highlight recent entries (last 10 seconds)
  if (timeDiff < 10000) {
    return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
  }
  
  // Special status-based coloring
  if (row.status === 'active') return 'bg-blue-50 dark:bg-blue-950/20';
  if (row.status === 'completed') return 'bg-gray-50 dark:bg-gray-950/20';
  if (row.status === 'filed') return 'bg-green-50 dark:bg-green-950/20';
  
  return 'bg-background';
};

export default function MockBackend() {
  const [tables, setTables] = useState({});
  const [selectedTable, setSelectedTable] = useState('users');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = () => {
    const allTables = taxWiseBackend.getAllTables();
    setTables(allTables);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, 2000); // Refresh every 2 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const renderTable = (tableName: string, data: any[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No data in {tableName}</p>
        </div>
      );
    }

    const columns = Object.keys(data[0] || {});
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{data.length} records</Badge>
            <Badge variant="secondary">{columns.length} columns</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy JSON
          </Button>
        </div>

        <ScrollArea className="h-96 w-full">
          <div className="space-y-2">
            {data.slice(0, 50).map((row, index) => (
              <motion.div
                key={row.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border ${getRowColor(tableName, row)}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  {columns.slice(0, 9).map((column) => (
                    <div key={column} className="flex justify-between">
                      <span className="font-medium text-muted-foreground">
                        {column}:
                      </span>
                      <span className="font-mono text-right max-w-32 truncate" title={String(row[column])}>
                        {formatValue(row[column])}
                      </span>
                    </div>
                  ))}
                  {columns.length > 9 && (
                    <div className="text-muted-foreground text-xs">
                      +{columns.length - 9} more fields...
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const getTotalRecords = () => {
    return Object.values(tables).reduce((total, tableData: any) => {
      return total + (Array.isArray(tableData) ? tableData.length : 0);
    }, 0);
  };

  return (
    <div className="min-h-full p-6 bg-gradient-to-br from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-500" />
              Mock PostgreSQL Database
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time view of simulated database operations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <div>Last updated: {lastUpdated.toLocaleTimeString()}</div>
              <div>Total records: {getTotalRecords()}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 dark:bg-green-950/20' : ''}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <Eye className="w-4 h-4 mr-2" />
              Refresh Now
            </Button>
          </div>
        </div>

        {/* Database Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(tables).slice(0, 4).map(([tableName, data]) => {
            const Icon = tableIcons[tableName] || Database;
            const recordCount = Array.isArray(data) ? data.length : 0;
            
            return (
              <motion.div
                key={tableName}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => setSelectedTable(tableName)}
              >
                <Card className={`transition-colors ${selectedTable === tableName ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Icon className="w-8 h-8 text-blue-500" />
                      <div className="text-right">
                        <div className="text-2xl font-bold">{recordCount}</div>
                        <div className="text-xs text-muted-foreground">{tableName}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Database Tables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTable} onValueChange={setSelectedTable}>
              <TabsList className="grid grid-cols-6 lg:grid-cols-12 w-full">
                {Object.keys(tables).map((tableName) => {
                  const Icon = tableIcons[tableName] || Database;
                  const recordCount = Array.isArray(tables[tableName]) ? tables[tableName].length : 0;
                  
                  return (
                    <TabsTrigger
                      key={tableName}
                      value={tableName}
                      className="flex flex-col items-center gap-1 p-3"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs truncate max-w-16" title={tableName}>
                        {tableName.replace('_', ' ')}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {recordCount}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {Object.entries(tables).map(([tableName, data]) => (
                <TabsContent key={tableName} value={tableName} className="mt-6">
                  {renderTable(tableName, data as any[])}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-green-700 dark:text-green-400">
                PostgreSQL Connection Active
              </span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Mock Database
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}