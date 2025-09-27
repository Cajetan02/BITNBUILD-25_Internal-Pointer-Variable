import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Upload, File, X, Eye, Download, AlertCircle,
  FileText, Image, FileSpreadsheet, Check, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import supabaseBackend from '../services/supabase-backend';

interface FileUploadProps {
  onFileUploaded?: (fileData: any) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  category?: string;
  multiple?: boolean;
  className?: string;
}

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return FileText;
  if (type.includes('csv') || type.includes('excel') || type.includes('spreadsheet')) return FileSpreadsheet;
  if (type.includes('image')) return Image;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const mockExtractFileData = (file: File) => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    return {
      type: 'bank_statement',
      transactions: [
        { date: '2024-01-15', description: 'Salary Credit', amount: 75000, category: 'Income', type: 'credit' },
        { date: '2024-01-16', description: 'Grocery Shopping', amount: -2500, category: 'Food', type: 'debit' },
        { date: '2024-01-17', description: 'Uber Ride', amount: -350, category: 'Transport', type: 'debit' },
        { date: '2024-01-18', description: 'SIP Investment', amount: -10000, category: 'Investment', type: 'debit' },
        { date: '2024-01-19', description: 'Electricity Bill', amount: -1800, category: 'Utilities', type: 'debit' }
      ],
      summary: {
        totalIncome: 75000,
        totalExpenses: 14650,
        netSavings: 60350,
        categories: {
          'Food': 2500,
          'Transport': 350,
          'Investment': 10000,
          'Utilities': 1800
        }
      }
    };
  } else if (fileName.endsWith('.pdf')) {
    return {
      type: 'tax_document',
      documentType: 'Form 16',
      employerName: 'TechCorp Solutions',
      panNumber: 'ABCDE1234F',
      financialYear: '2023-24',
      grossSalary: 1200000,
      tdsDeducted: 120000,
      exemptions: {
        section80C: 150000,
        section80D: 25000,
        hra: 180000
      },
      taxableIncome: 845000
    };
  } else if (file.type.startsWith('image/')) {
    return {
      type: 'receipt',
      vendor: 'Medical Store',
      amount: 2500,
      date: '2024-01-15',
      category: 'Medical',
      items: [
        { name: 'Medicine A', amount: 1200 },
        { name: 'Medicine B', amount: 800 },
        { name: 'Consultation', amount: 500 }
      ],
      isDeductible: true,
      section: '80D'
    };
  }
  
  return null;
};

export default function FileUpload({ 
  onFileUploaded, 
  acceptedTypes = ['*/*'], 
  maxSize = 10 * 1024 * 1024, // 10MB
  category = 'general',
  multiple = false,
  className = ''
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    // Size validation
    if (file.size > maxSize) {
      toast.error(`File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}.`);
      return false;
    }

    // Type validation
    if (acceptedTypes.length > 0 && !acceptedTypes.includes('*/*')) {
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('pdf') && file.type.includes('pdf')) return true;
        if (type.includes('csv') && (file.type.includes('csv') || file.name.endsWith('.csv'))) return true;
        if (type.includes('image') && file.type.startsWith('image/')) return true;
        if (type.includes('excel') && (file.type.includes('excel') || file.type.includes('spreadsheet'))) return true;
        return file.type === type;
      });

      if (!isValidType) {
        toast.error(`File type "${file.type || 'unknown'}" is not supported.`);
        return false;
      }
    }

    return true;
  };

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      toast.error('Multiple files not allowed');
      return;
    }

    for (const file of fileArray) {
      if (!validateFile(file)) continue;

      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add file to state immediately
      const newFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
        file: file,
        previewUrl: null
      };

      setUploadedFiles(prev => [...prev, newFile]);
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      try {
        // Create preview URL for images
        if (file.type.startsWith('image/')) {
          newFile.previewUrl = URL.createObjectURL(file);
        }

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileId] || 0;
            const newProgress = Math.min(currentProgress + Math.random() * 30, 90);
            return { ...prev, [fileId]: newProgress };
          });
        }, 200);

        // Upload file to backend
        const currentUser = supabaseBackend.getCurrentUser();
        const userId = currentUser?.id || 'user_demo_123';
        let response;
        
        if (supabaseBackend.isOfflineMode()) {
          // Simulate upload in offline mode
          await new Promise(resolve => setTimeout(resolve, 1000));
          response = {
            success: true,
            fileId: fileId,
            extractedData: mockExtractFileData(file),
            message: 'File processed in demo mode'
          };
        } else {
          response = await supabaseBackend.uploadFile(file, userId, category);
        }

        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

        // Update file status
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                status: 'completed', 
                backendId: response.fileId,
                extractedData: response.extractedData 
              }
            : f
        ));

        if (supabaseBackend.isOfflineMode()) {
          toast.success(`File "${file.name}" processed successfully!`, {
            description: 'Demo mode - File processed locally'
          });
        } else {
          toast.success(`File "${file.name}" uploaded successfully!`, {
            description: 'Saved to Supabase database'
          });
        }

        if (onFileUploaded) {
          onFileUploaded({
            ...newFile,
            backendId: response.fileId,
            extractedData: response.extractedData
          });
        }

      } catch (error) {
        console.error('Upload error:', error);
        
        clearInterval(progressInterval);
        
        // Update file status to failed
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'failed' } : f
        ));
        
        if (supabaseBackend.isOfflineMode()) {
          toast.error(`Demo Mode - Failed to process "${file.name}"`, {
            description: 'File processing simulated failure in demo mode'
          });
        } else {
          toast.error(`Failed to upload "${file.name}"`, {
            description: `Upload error: ${error.message || 'Please try again or contact support'}`
          });
        }
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const downloadFile = (file: any) => {
    if (file.previewUrl) {
      const link = document.createElement('a');
      link.href = file.previewUrl;
      link.download = file.name;
      link.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card className={`transition-all duration-200 ${isDragOver ? 'border-primary bg-primary/5' : ''}`}>
        <CardContent 
          className="p-8"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center space-y-4">
            <motion.div
              animate={{ 
                scale: isDragOver ? 1.1 : 1,
                rotate: isDragOver ? 5 : 0 
              }}
              transition={{ duration: 0.2 }}
            >
              <Upload className={`w-12 h-12 mx-auto ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            </motion.div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {isDragOver ? 'Drop files here' : 'Upload your files'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop files here, or click to browse
              </p>
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="mb-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Supported formats: PDF, CSV, Images, Excel</p>
                <p>Maximum file size: {formatFileSize(maxSize)}</p>
                {multiple && <p>Multiple files allowed</p>}
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept={acceptedTypes.join(',')}
            multiple={multiple}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h4 className="font-semibold">Uploaded Files</h4>
            {uploadedFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              const progress = uploadProgress[file.id] || 0;
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {file.previewUrl && file.type.startsWith('image/') ? (
                    <img 
                      src={file.previewUrl} 
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <FileIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate max-w-48">{file.name}</p>
                      <Badge variant={
                        file.status === 'completed' ? 'default' :
                        file.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {file.status === 'uploading' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                        {file.status === 'completed' && <Check className="w-3 h-3 mr-1" />}
                        {file.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {file.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.extractedData && (
                        <span>✓ Data extracted</span>
                      )}
                    </div>
                    
                    {file.status === 'uploading' && (
                      <Progress value={progress} className="mt-2 h-2" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.status === 'completed' && file.previewUrl && (
                      <Button variant="ghost" size="sm" onClick={() => downloadFile(file)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeFile(file.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}