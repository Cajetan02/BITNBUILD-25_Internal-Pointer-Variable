import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Grid,
  Button,
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Edit,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { Transaction } from '../types';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [page, categoryFilter, typeFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTransactions({
        page,
        limit: 20,
        category: categoryFilter || undefined,
        type: typeFilter || undefined,
      });

      if (response.success) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      salary: 'success',
      food: 'warning',
      transport: 'info',
      entertainment: 'secondary',
      shopping: 'error',
      investment: 'primary',
      loan: 'default',
    };
    return colors[category] || 'default';
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        View and manage your financial transactions.
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search transactions"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="salary">Salary</MenuItem>
                  <MenuItem value="food">Food</MenuItem>
                  <MenuItem value="transport">Transport</MenuItem>
                  <MenuItem value="entertainment">Entertainment</MenuItem>
                  <MenuItem value="shopping">Shopping</MenuItem>
                  <MenuItem value="investment">Investment</MenuItem>
                  <MenuItem value="loan">Loan</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="debit">Debit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={fetchTransactions}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.category}
                        color={getCategoryColor(transaction.category) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        color={transaction.type === 'credit' ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        color={transaction.type === 'credit' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {transaction.type === 'credit' ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => {
                          // Handle edit transaction
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredTransactions.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No transactions found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or upload some data to get started.
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Transactions;
