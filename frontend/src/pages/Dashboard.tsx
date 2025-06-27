// src/pages/Dashboard.tsx (Complete Updated Version)
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Box,
  Alert,
  Stack,
  Button,
  Fab,
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
import { apiClient } from '../services/api';

export const Dashboard: React.FC = () => {
  const { user } = useAuthContext();
  
  // State for the user's primary balance ID
  const [userBalanceId, setUserBalanceId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  // State for dialogs
  const [dialogs, setDialogs] = useState({
    balance: false,
    income: false,
    expense: false,
  });
  
  // Try to get the user's balance first
  useEffect(() => {
    const findUserBalance = async () => {
      if (!user) return;
      
      try {
        setIsInitializing(true);
        setInitializationError(null);
        
        // Try to get user's current balance
        // First, try the hardcoded ID 1 (for backward compatibility)
        try {
          const response = await apiClient.get('/balance/1');
          if (response.data) {
            setUserBalanceId(1);
            return;
          }
        } catch (error: any) {
          // If 404, that's fine - user might not have balance ID 1
          if (error.response?.status !== 404) {
            throw error; // Re-throw other errors
          }
        }
        
        // If that doesn't work, try to find any balance for the user
        // This would require a backend endpoint, but for now we'll try a few IDs
        for (let i = 1; i <= 10; i++) {
          try {
            const response = await apiClient.get(`/balance/${i}`);
            if (response.data) {
              setUserBalanceId(i);
              return;
            }
          } catch (error: any) {
            // Continue trying other IDs
            if (error.response?.status !== 404) {
              console.warn(`Error checking balance ${i}:`, error);
            }
          }
        }
        
        // No balance found
        setUserBalanceId(null);
        
      } catch (error: any) {
        console.error('Error finding user balance:', error);
        setInitializationError('Failed to load balance data');
        setUserBalanceId(null);
      } finally {
        setIsInitializing(false);
      }
    };

    findUserBalance();
  }, [user]);

  // Hooks for data operations - only active when we have a balance ID
  const {
    balance,
    isLoading: balanceLoading,
    error: balanceError,
  } = useBalanceOperations(userBalanceId || 0);
  
  const {
    incomes,
    stats: incomeStats,
    totalIncome,
    isLoading: incomeLoading,
  } = useIncomeOperations(userBalanceId || undefined);
  
  const {
    expenses,
    stats: expenseStats,
    totalExpenses,
    topCategories,
    isLoading: expenseLoading,
  } = useExpenseOperations(userBalanceId || undefined);
  
  const {
    suggestions,
    summary: suggestionsSummary,
    isLoading: suggestionsLoading,
    refreshSuggestions,
    hasData: hasSuggestions,
    cashFlowStatus,
  } = useSuggestionsOperations(userBalanceId || undefined);

  // Handle dialog toggles
  const toggleDialog = (type: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Calculate net cash flow
  const netCashFlow = totalIncome - totalExpenses;
  const cashFlowColor = netCashFlow >= 0 ? 'success.main' : 'error.main';
  const cashFlowIcon = netCashFlow >= 0 ? <TrendingUp /> : <TrendingDown />;

  // Handle initial balance creation
  const handleBalanceCreated = (newBalance: any) => {
    setUserBalanceId(newBalance.id);
    toggleDialog('balance');
  };

  // Handle balance update
  const handleBalanceUpdated = () => {
    toggleDialog('balance');
    // The balance will automatically refresh due to React Query
  };

  // Check if we should show the balance creation form
  const shouldShowBalanceCreation = () => {
    // Show if we're not initializing and no balance was found
    if (isInitializing) return false;
    
    // Show if we explicitly don't have a balance ID
    if (!userBalanceId) return true;
    
    // Show if there's a 404 error (balance doesn't exist)
    if (balanceError && (balanceError as any)?.response?.status === 404) {
      return true;
    }
    
    return false;
  };

  // Show loading while initializing
  if (isInitializing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Stack spacing={2} alignItems="center">
          <Skeleton variant="rectangular" width={300} height={200} sx={{ borderRadius: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading your financial data...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Show initialization error
  if (initializationError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {initializationError}
            </Alert>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Show balance creation form if no balance exists
  if (shouldShowBalanceCreation()) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2} textAlign="center" mb={3}>
              <AccountBalance sx={{ fontSize: 48, color: 'primary.main', mx: 'auto' }} />
              <Typography variant="h5" component="h1" gutterBottom>
                Welcome to Budget App! 🎉
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Let's get started by setting up your initial balance
              </Typography>
            </Stack>
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
      {balanceError && (balanceError as any)?.response?.status !== 404 && (
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
                {balanceLoading ? (
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
                disabled={suggestionsLoading || !userBalanceId}
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
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => toggleDialog('income')}
                >
                  Add Your First Income
                </Button>
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
              disabled={!userBalanceId}
            >
              Add Income
            </Button>
            <Button
              variant="outlined"
              startIcon={<TrendingDown />}
              onClick={() => toggleDialog('expense')}
              disabled={!userBalanceId}
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
          
          {/* Helper text for new users */}
          {totalIncome === 0 && totalExpenses === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                💡 <strong>Getting Started:</strong> Add your income sources and track expenses to get personalized AI insights about your finances.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Preview (if there's data) */}
      {(incomes.length > 0 || expenses.length > 0) && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 2 
            }}>
              {/* Recent Income */}
              <Box>
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  Recent Income
                </Typography>
                {incomes.slice(0, 3).map((income, index) => (
                  <Box key={income.id} display="flex" justifyContent="space-between" py={0.5}>
                    <Typography variant="body2">{income.source}</Typography>
                    <Typography variant="body2" color="success.main">
                      +{formatCurrency(income.amount)}
                    </Typography>
                  </Box>
                ))}
                {incomes.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No income recorded yet
                  </Typography>
                )}
              </Box>
              
              {/* Recent Expenses */}
              <Box>
                <Typography variant="subtitle2" color="error.main" gutterBottom>
                  Recent Expenses
                </Typography>
                {expenses.slice(0, 3).map((expense, index) => (
                  <Box key={expense.id} display="flex" justifyContent="space-between" py={0.5}>
                    <Typography variant="body2">{expense.category}</Typography>
                    <Typography variant="body2" color="error.main">
                      -{formatCurrency(expense.amount)}
                    </Typography>
                  </Box>
                ))}
                {expenses.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No expenses recorded yet
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add expense"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => toggleDialog('expense')}
        disabled={!userBalanceId}
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
          onSuccess={handleBalanceUpdated}
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
          balanceId={userBalanceId!}
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
          balanceId={userBalanceId!}
          onSuccess={() => toggleDialog('expense')}
          onCancel={() => toggleDialog('expense')}
        />
      </FormDialog>
    </Box>
  );
};