import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import {
  Assessment,
  Download,
  PictureAsPdf,
  TableChart,
  Timeline,
  TrendingUp,
  CreditScore,
  Calculate,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('financial');
  const [reportPeriod, setReportPeriod] = useState('month');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const reportTypes = [
    {
      id: 'financial',
      name: 'Financial Summary',
      description: 'Complete overview of your financial health',
      icon: <Assessment />,
      color: 'primary',
    },
    {
      id: 'tax',
      name: 'Tax Report',
      description: 'Detailed tax calculations and optimizations',
      icon: <Calculate />,
      color: 'secondary',
    },
    {
      id: 'cibil',
      name: 'CIBIL Health Report',
      description: 'Credit score analysis and recommendations',
      icon: <CreditScore />,
      color: 'info',
    },
    {
      id: 'spending',
      name: 'Spending Analysis',
      description: 'Detailed breakdown of your expenses',
      icon: <TrendingUp />,
      color: 'warning',
    },
  ];

  const periods = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' },
  ];

  const formats = [
    { value: 'pdf', label: 'PDF', icon: <PictureAsPdf /> },
    { value: 'excel', label: 'Excel', icon: <TableChart /> },
    { value: 'csv', label: 'CSV', icon: <TableChart /> },
  ];

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await apiService.generateReport({
        type: reportType,
        period: reportPeriod,
        format: reportFormat,
      });

      if (response.success) {
        setReportUrl(response.data.downloadUrl);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Generate comprehensive reports of your financial data.
      </Typography>

      <Grid container spacing={3}>
        {/* Report Configuration */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generate Report
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Report Type
                  </Typography>
                  <Grid container spacing={2}>
                    {reportTypes.map((type) => (
                      <Grid item xs={12} sm={6} key={type.id}>
                        <Paper
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: reportType === type.id ? 2 : 1,
                            borderColor: reportType === type.id ? `${type.color}.main` : 'grey.300',
                            '&:hover': {
                              borderColor: `${type.color}.main`,
                            },
                          }}
                          onClick={() => setReportType(type.id)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ color: `${type.color}.main`, mr: 1 }}>
                              {type.icon}
                            </Box>
                            <Typography variant="subtitle2">
                              {type.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Time Period</InputLabel>
                    <Select
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                    >
                      {periods.map((period) => (
                        <MenuItem key={period.value} value={period.value}>
                          {period.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Format</InputLabel>
                    <Select
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value)}
                    >
                      {formats.map((format) => (
                        <MenuItem key={format.value} value={format.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ mr: 1 }}>{format.icon}</Box>
                            {format.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<Assessment />}
                    onClick={generateReport}
                    disabled={generating}
                  >
                    {generating ? 'Generating Report...' : 'Generate Report'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Report Features */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Features
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Timeline color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Historical Analysis"
                    secondary="Track trends over time"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Performance Metrics"
                    secondary="Key financial indicators"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assessment color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Detailed Insights"
                    secondary="Actionable recommendations"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Download color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Multiple Formats"
                    secondary="PDF, Excel, CSV"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Report Status */}
        {reportUrl && (
          <Grid item xs={12}>
            <Alert
              severity="success"
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<Download />}
                  onClick={downloadReport}
                >
                  Download
                </Button>
              }
            >
              Your report has been generated successfully! Click download to get your report.
            </Alert>
          </Grid>
        )}

        {/* Sample Reports */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sample Reports
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Here are some sample reports to give you an idea of what to expect:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <PictureAsPdf sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Financial Summary
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Complete overview of your finances
                    </Typography>
                    <Button size="small" variant="outlined">
                      Preview
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Calculate sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Tax Report
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tax calculations and optimizations
                    </Typography>
                    <Button size="small" variant="outlined">
                      Preview
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <CreditScore sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      CIBIL Report
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Credit score analysis
                    </Typography>
                    <Button size="small" variant="outlined">
                      Preview
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Spending Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Detailed expense breakdown
                    </Typography>
                    <Button size="small" variant="outlined">
                      Preview
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
