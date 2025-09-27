import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Download, FileText, File, Search, Calendar,
  ExternalLink, Trash2, Eye, Filter, SortAsc, SortDesc
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import supabaseBackend from '../services/supabase-backend';

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return '📄';
  if (type.includes('csv')) return '📊';
  if (type.includes('excel')) return '📈';
  if (type.includes('image')) return '🖼️';
  return '📎';
};

const getFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [filteredDownloads, setFilteredDownloads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadDownloads();
  }, []);

  useEffect(() => {
    filterAndSortDownloads();
  }, [downloads, searchTerm, filterType, sortOrder]);

  const loadDownloads = async () => {
    try {
      const userId = 'user_demo_123';
      const reports = await supabaseBackend.getReports(userId);
      const files = await supabaseBackend.getUploadedFiles(userId);
      
      // Combine reports and files into downloads list
      const allDownloads = [
        ...reports.map(report => ({
          ...report,
          type: 'report',
          name: report.title,
          size: Math.floor(Math.random() * 1000000) + 100000, // Mock size
          icon: getFileIcon('pdf')
        })),
        ...files.map(file => ({
          ...file,
          type: 'upload',
          name: file.name,
          size: file.size,
          icon: getFileIcon(file.type || '')
        }))
      ];

      // Add some mock generated files for demo
      const mockDownloads = [
        {
          id: 'download_1',
          name: 'Tax Planning Report 2024.pdf',
          type: 'report',
          format: 'PDF',
          size: 2500000,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          downloadUrl: '#mock-download-1',
          icon: '📄'
        },
        {
          id: 'download_2',
          name: 'Investment Summary.csv',
          type: 'export',
          format: 'CSV',
          size: 45000,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          downloadUrl: '#mock-download-2',
          icon: '📊'
        },
        {
          id: 'download_3',
          name: 'Credit Score Analysis.pdf',
          type: 'report',
          format: 'PDF',
          size: 1800000,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          downloadUrl: '#mock-download-3',
          icon: '📄'
        }
      ];

      setDownloads([...allDownloads, ...mockDownloads]);
    } catch (error) {
      console.error('Failed to load downloads:', error);
    }
  };

  const filterAndSortDownloads = () => {
    let filtered = downloads.filter(download => {
      const matchesSearch = download.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || download.type === filterType;
      return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.uploadedAt);
      const dateB = new Date(b.createdAt || b.uploadedAt);
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

    setFilteredDownloads(filtered);
  };

  const handleDownload = (download: any) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = download.downloadUrl || '#';
    link.download = download.name;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (download: any) => {
    const now = new Date();
    const createdAt = new Date(download.createdAt || download.uploadedAt);
    const timeDiff = now.getTime() - createdAt.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 1) return <Badge className="bg-green-500">New</Badge>;
    if (hoursDiff < 24) return <Badge variant="secondary">Recent</Badge>;
    return null;
  };

  return (
    <div className="min-h-full p-6 bg-gradient-to-br from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Download className="w-8 h-8 text-blue-500" />
              Downloads & Reports
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your exported files and generated reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filteredDownloads.length} items
            </Badge>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Downloads</p>
                  <p className="text-2xl font-bold">{downloads.length}</p>
                </div>
                <Download className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Size</p>
                  <p className="text-2xl font-bold">
                    {getFileSize(downloads.reduce((total, d) => total + (d.size || 0), 0))}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recent Files</p>
                  <p className="text-2xl font-bold">
                    {downloads.filter(d => {
                      const timeDiff = Date.now() - new Date(d.createdAt || d.uploadedAt).getTime();
                      return timeDiff < 24 * 60 * 60 * 1000;
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search downloads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="report">Reports</SelectItem>
                  <SelectItem value="export">Exports</SelectItem>
                  <SelectItem value="upload">Uploads</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                {sortOrder === 'desc' ? <SortDesc className="w-4 h-4 mr-2" /> : <SortAsc className="w-4 h-4 mr-2" />}
                Date
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Downloads List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Files</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDownloads.length === 0 ? (
              <div className="text-center py-12">
                <Download className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No downloads found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Your exported files and reports will appear here'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDownloads.map((download, index) => (
                  <motion.div
                    key={download.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{download.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{download.name}</h4>
                          {getStatusBadge(download)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{getFileSize(download.size || 0)}</span>
                          <span>{formatDate(download.createdAt || download.uploadedAt)}</span>
                          <Badge variant="outline" className="text-xs">
                            {download.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(download)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}