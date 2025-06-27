// src/pages/Dashboard.tsx (Updated with Real Data Integration)
import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Box,
  Alert,
  Stack,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Skeleton,
  Chip,
  LinearProgress,
} from '@mui/material';
import { 
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Psychology,
  Add,
  Refresh,
  Timeline,
} from '@mui/icons-material';
import { useAuthContext } from '../contexts/AuthContext';
import { useBalanceOperations } from '../hooks/useBalance';
import { useIncomeOperations } from '../hooks/useIncomes';
import { useExpenseOperations } from '../hooks/useExpenses';
import { useSuggestionsOperations } from '../hooks/useSuggestions';
import { BalanceForm } from '../components/forms/BalanceForm';
import { IncomeForm } from '../components/forms/IncomeForm';
import { ExpenseForm } from '../components/forms/ExpenseForm';
import { FormDialog } from '../components/forms/FormDialog';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const { user } = useAuthContext();
  
  // For this demo, we'll assume the user has one balance with ID 1
  // In a real app, you'd fetch the user's balances first
  const DEMO_BALANCE_ID = 1;
  
  // State for dialogs
  const [dialogs, setDialogs] = useState({
    balance: false,
    income: false,
    expense: false,
  });
  
  // Hooks for data operations
  const {
    balance,
    isLoading: balanceLoading,
    error: balanceError,
    createBalance,
  } = useBalanceOperations(DEMO_BALANCE_ID);
  
  const {
    incomes,
    stats: incomeStats,
    totalIncome,
    isLoading: incomeLoading,
  } = useIncomeOperations(balance ? DEMO_BALANCE_ID : undefined);
  
  const {
    expenses,
    stats: expenseStats,
    totalExpenses,
    topCategories,
    isLoading: expenseLoading,
  } = useExpenseOperations(balance ? DEMO_BALANCE_ID : undefined);
  
  const {
    suggestions,
    summary: suggestionsSummary,
    isLoading: suggestionsLoading,
    refreshSuggestions,
    hasData: hasSuggestions,
    cashFlowStatus,
  } = useSuggestionsOperations(balance ? DEMO_BALANCE_ID : undefined);

  // Handle dialog toggles
  const toggleDialog = (type: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Calculate net cash flow
  const netCashFlow = totalIncome - totalExpenses;
  const cashFlowColor = netCashFlow >= 0 ? 'success.main' : 'error.main';
  const cashFlowIcon = netCashFlow >= 0 ? <TrendingUp /> : <TrendingDown />;

  // Handle initial balance creation
  const handleBalanceCreated = () => {
    toggleDialog('balance');
    // The balance will automatically refresh due to React Query
  };

  // Loading state for initial data
  const isInitialLoading = balanceLoading && !balance;

  // Show balance creation form if no balance exists
  if (!balance && !balanceLoading && !balanceError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <BalanceForm 
              onSuccess={handleBalanceCreated}
              submitButtonText="Get Started"
            />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Message */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.username}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your financial overview
        </Typography>
      </Box>

      {/* Error States */}
      {balanceError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load balance data. Please try refreshing the page.
        </Alert>
      )}
      
      {/* Financial Overview Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: '1fr 1fr', 
          md: 'repeat(4, 1fr)' 
        }, 
        gap: 3, 
        mb: 3 
      }}>
        {/* Current Balance Card */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Current Balance
                </Typography>
                {isInitialLoading ? (
                  <Skeleton variant="text" width={100} height={40} />
                ) : (
                  <Typography variant="h5" component="div">
                    {formatCurrency(balance?.amount || 0)}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Last updated {balance ? formatRelativeTime(new Date()) : 'never'}
                </Typography>
              </Box>
              <AccountBalance color="primary" />
            </Box>
          </CardContent>
        </Card>
        
        {/* Total Income Card */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Income
                </Typography>
                {incomeLoading ? (
                  <Skeleton variant="text" width={100} height={40} />
                ) : (
                  <Typography variant="h5" component="div">
                    {formatCurrency(totalIncome)}
                  </Typography>
                )}
                <Typography variant="body2" color="success.main">
                  {incomeStats?.count || 0} income sources
                </Typography>
              </Box>
              <TrendingUp color="success" />
            </Box>
          </CardContent>
        </Card>
        
        {/* Total Expenses Card */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Expenses
                </Typography>
                {expenseLoading ? (
                  <Skeleton variant="text" width={100} height={40} />
                ) : (
                  <Typography variant="h5" component="div">
                    {formatCurrency(totalExpenses)}
                  </Typography>
                )}
                <Typography variant="body2" color="error.main">
                  {expenseStats?.count || 0} transactions
                </Typography>
              </Box>
              <TrendingDown color="error" />
            </Box>
          </CardContent>
        </Card>
        
        {/* Net Cash Flow Card */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Net Cash Flow
                </Typography>
                {incomeLoading || expenseLoading ? (
                  <Skeleton variant="text" width={100} height={40} />
                ) : (
                  <Typography variant="h5" component="div" sx={{ color: cashFlowColor }}>
                    {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
                  </Typography>
                )}
                <Chip 
                  label={cashFlowStatus || (netCashFlow >= 0 ? 'Positive' : 'Negative')}
                  size="small"
                  color={netCashFlow >= 0 ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
              {cashFlowIcon}
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* Charts and Suggestions Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          lg: '2fr 1fr' 
        }, 
        gap: 3,
        mb: 3
      }}>
        {/* Balance Projection Chart Placeholder */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">
                Balance Projection
              </Typography>
              <Button startIcon={<Timeline />} variant="outlined" size="small">
                View Details
              </Button>
            </Box>
            <Box 
              height={300} 
              display="flex" 
              flexDirection="column"
              alignItems="center" 
              justifyContent="center"
              bgcolor="grey.50"
              borderRadius={1}
              gap={1}
            >
              <TrendingUp sx={{ fontSize: 48, color: 'grey.400' }} />
              <Typography color="textSecondary" textAlign="center">
                Interactive charts coming soon
              </Typography>
              <Typography variant="body2" color="textSecondary" textAlign="center">
                Your projected balance: {formatCurrency((balance?.amount || 0) + netCashFlow * 12)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
        
        {/* AI Financial Suggestions */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">
                AI Suggestions
              </Typography>
              <Button 
                startIcon={<Refresh />} 
                variant="outlined" 
                size="small"
                onClick={refreshSuggestions}
                disabled={suggestionsLoading}
              >
                Refresh
              </Button>
            </Box>
            
            {suggestionsLoading ? (
              <Box>
                <LinearProgress sx={{ mb: 2 }} />
                <Skeleton variant="text" height={20} />
                <Skeleton variant="text" height={20} />
                <Skeleton variant="text" height={20} />
              </Box>
            ) : hasSuggestions && suggestionsSummary ? (
              <Stack spacing={2}>
                <Alert severity="info">
                  Cash Flow: {suggestionsSummary.cashFlowStatus}
                </Alert>
                
                {suggestionsSummary.topPrioritySuggestion && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Top Priority:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {suggestionsSummary.topPrioritySuggestion.details}
                    </Typography>
                  </Box>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  {suggestionsSummary.suggestionsCount} suggestions available
                </Typography>
                
                <Button variant="contained" size="small" fullWidth>
                  View All Suggestions
                </Button>
              </Stack>
            ) : (
              <Box 
                height={200} 
                display="flex" 
                flexDirection="column"
                alignItems="center" 
                justifyContent="center"
                gap={1}
              >
                <Psychology sx={{ fontSize: 48, color: 'grey.400' }} />
                <Typography color="textSecondary" textAlign="center">
                  Add income and expenses to get AI insights
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="outlined"
              startIcon={<TrendingUp />}
              onClick={() => toggleDialog('income')}
              disabled={!balance}
            >
              Add Income
            </Button>
            <Button
              variant="outlined"
              startIcon={<TrendingDown />}
              onClick={() => toggleDialog('expense')}
              disabled={!balance}
            >
              Add Expense
            </Button>
            <Button
              variant="outlined"
              startIcon={<AccountBalance />}
              onClick={() => toggleDialog('balance')}
            >
              Update Balance
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => toggleDialog('expense')}
        disabled={!balance}
      >
        <Add />
      </Fab>

      {/* Form Dialogs */}
      <FormDialog
        open={dialogs.balance}
        onClose={() => toggleDialog('balance')}
        title={balance ? 'Update Balance' : 'Set Initial Balance'}
        subtitle={balance ? 'Adjust your current balance' : 'Start tracking your finances'}
      >
        <BalanceForm
          balance={balance}
          onSuccess={() => toggleDialog('balance')}
          onCancel={() => toggleDialog('balance')}
        />
      </FormDialog>

      <FormDialog
        open={dialogs.income}
        onClose={() => toggleDialog('income')}
        title="Add Income"
        subtitle="Track your income sources"
      >
        <IncomeForm
          balanceId={DEMO_BALANCE_ID}
          onSuccess={() => toggleDialog('income')}
          onCancel={() => toggleDialog('income')}
        />
      </FormDialog>

      <FormDialog
        open={dialogs.expense}
        onClose={() => toggleDialog('expense')}
        title="Add Expense"
        subtitle="Track your spending"
      >
        <ExpenseForm
          balanceId={DEMO_BALANCE_ID}
          onSuccess={() => toggleDialog('expense')}
          onCancel={() => toggleDialog('expense')}
        />
      </FormDialog>
    </Box>
  );
};