import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Grid,
  Paper,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { apiService } from '../services/apiService';

interface UploadResult {
  totalTransactions: number;
  transactions: any[];
  summary: any;
}

const Upload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setError(null);

    try {
      const response = await apiService.uploadBankStatement(file);
      if (response.success) {
        setUploadResult(response.data);
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload Financial Data
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Upload your bank statements, credit card statements, or CSV files to get started.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Paper
                {...getRootProps()}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Supported formats: CSV, XLSX, PDF
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Maximum file size: 10MB
                </Typography>
                {uploading && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Processing file...
                    </Typography>
                  </Box>
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Supported File Types
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description color="primary" />
                  <Typography variant="body2">CSV Files</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description color="primary" />
                  <Typography variant="body2">Excel Files (.xlsx)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description color="primary" />
                  <Typography variant="body2">PDF Statements</Typography>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                What We Extract
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip label="Transaction Details" size="small" />
                <Chip label="Amounts & Dates" size="small" />
                <Chip label="Merchant Names" size="small" />
                <Chip label="Transaction Types" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {uploadResult && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Upload Successful!</Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {uploadResult.totalTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transactions Found
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    ₹{uploadResult.summary?.totalIncome?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Income
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    ₹{uploadResult.summary?.totalExpenses?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Expenses
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color={uploadResult.summary?.netAmount && uploadResult.summary.netAmount >= 0 ? 'success.main' : 'error.main'}>
                    ₹{uploadResult.summary?.netAmount?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Net Amount
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Categories
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {uploadResult.summary?.topCategories?.map((category: any, index: number) => (
                  <Chip
                    key={index}
                    label={`${category.category}: ₹${category.amount.toLocaleString()}`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary">
                View Transactions
              </Button>
              <Button variant="outlined" color="primary">
                Generate Report
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Upload;
