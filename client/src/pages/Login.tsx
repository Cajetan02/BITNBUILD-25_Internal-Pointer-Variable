import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Container,
  Paper,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ width: '100%' }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                  Welcome to TaxWise
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Sign in to your account
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2">
                    Don't have an account?{' '}
                    <Link component={RouterLink} to="/register">
                      Sign up here
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
