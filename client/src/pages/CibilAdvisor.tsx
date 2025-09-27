import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Alert,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CreditScore,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Lightbulb,
  Timeline,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { CibilAnalysis, CibilRecommendation } from '../types';

const CibilAdvisor: React.FC = () => {
  const [cibilAnalysis, setCibilAnalysis] = useState<CibilAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCibilAnalysis();
  }, []);

  const fetchCibilAnalysis = async () => {
    try {
      setLoading(true);
      const response = await apiService.analyzeCibil({
        transactions: [], // In real app, this would come from uploaded data
        creditHistory: [],
      });

      if (response.success) {
        setCibilAnalysis(response.data);
      }
    } catch (error) {
      console.error('Error fetching CIBIL analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'success';
    if (score >= 700) return 'info';
    if (score >= 650) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    if (score >= 600) return 'Poor';
    return 'Very Poor';
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        CIBIL Score Advisor
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Analyze your credit health and get personalized recommendations.
      </Typography>

      <Grid container spacing={3}>
        {/* CIBIL Score Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CreditScore sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h2" color={getScoreColor(cibilAnalysis?.currentScore || 0)}>
                {cibilAnalysis?.currentScore || 0}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {getScoreLabel(cibilAnalysis?.currentScore || 0)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(cibilAnalysis?.currentScore || 0) / 9}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
                color={getScoreColor(cibilAnalysis?.currentScore || 0) as any}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Score Range: 300-900
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Credit Factors */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Credit Score Factors
              </Typography>
              <Grid container spacing={2}>
                {cibilAnalysis?.factors && Object.entries(cibilAnalysis.factors).map(([factor, data]) => (
                  <Grid item xs={12} sm={6} key={factor}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {factor.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={data.score}
                        color={data.score >= 40 ? 'success' : data.score >= 20 ? 'warning' : 'error'}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Score: {data.score}/50
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personalized Recommendations
              </Typography>
              <Grid container spacing={2}>
                {cibilAnalysis?.recommendations?.map((recommendation, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Alert
                      severity={
                        recommendation.priority === 'High' ? 'error' :
                        recommendation.priority === 'Medium' ? 'warning' : 'info'
                      }
                      icon={<Lightbulb />}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        {recommendation.title}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        {recommendation.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip
                          label={recommendation.priority}
                          size="small"
                          color={
                            recommendation.priority === 'High' ? 'error' :
                            recommendation.priority === 'Medium' ? 'warning' : 'info'
                          }
                        />
                        <Chip
                          label={recommendation.impact}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={recommendation.timeline}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Factors */}
        {cibilAnalysis?.riskFactors && cibilAnalysis.riskFactors.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Risk Factors
                </Typography>
                <List>
                  {cibilAnalysis.riskFactors.map((risk, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={risk.factor}
                        secondary={risk.description}
                      />
                      <Chip
                        label={risk.severity}
                        color="error"
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Strengths */}
        {cibilAnalysis?.strengths && cibilAnalysis.strengths.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success">
                  Strengths
                </Typography>
                <List>
                  {cibilAnalysis.strengths.map((strength, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={strength.factor}
                        secondary={strength.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Action Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Next Steps
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<TrendingUp />}
                    onClick={() => {
                      // Handle improve score action
                    }}
                  >
                    Improve Score
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Timeline />}
                    onClick={() => {
                      // Handle view history action
                    }}
                  >
                    View History
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CreditScore />}
                    onClick={() => {
                      // Handle get report action
                    }}
                  >
                    Get Report
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Lightbulb />}
                    onClick={() => {
                      // Handle get tips action
                    }}
                  >
                    Get Tips
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CibilAdvisor;
