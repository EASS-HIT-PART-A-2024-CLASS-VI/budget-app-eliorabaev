// frontend/src/components/Dashboard.tsx - Updated to handle auto-created $0 balance

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
  Edit,
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
  
  // State for the user's balance info
  const [userBalance, setUserBalance] = useState<any>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  
  // State for dialogs
  const [dialogs, setDialogs] = useState({
    balance: false,
    income: false,
    expense: false,
  });
  
  // Load user's balance on component mount
  useEffect(() => {
    const loadUserBalance = async () => {
      if (!user) return;
      
      try {
        setIsLoadingBalance(true);
        setBalanceError(null);
        
        // Get user's current balance (should always exist now)
        const response = await apiClient.get('/balance/current');
        const balance = response.data;
        
        setUserBalance(balance);
        
        // Check if this is a first-time user (balance is $0 and no income/expenses)
        setIsFirstTimeUser(balance.amount === 0);
        
      } catch (error: any) {
        console.error('Error loading user balance:', error);
        setBalanceError('Failed to load balance data');
        setUserBalance(null);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    loadUserBalance();
  }, [user]);

  // Hooks for data operations - only active when we have a balance
  const {
    incomes,
    stats: incomeStats,
    totalIncome,
    isLoading: incomeLoading,
  } = useIncomeOperations(userBalance?.id);
  
  const {
    expenses,
    stats: expenseStats,
    totalExpenses,
    topCategories,
    isLoading: expenseLoading,
  } = useExpenseOperations(userBalance?.id);
  
  const {
    suggestions,
    summary: suggestionsSummary,
    isLoading: suggestionsLoading,
    refreshSuggestions,
    hasData: hasSuggestions,
    cashFlowStatus,
  } = useSuggestionsOperations(userBalance?.id);

  // Handle dialog toggles
  const toggleDialog = (type: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Calculate net cash flow
  const netCashFlow = totalIncome - totalExpenses;
  const cashFlowColor = netCashFlow >= 0 ? 'success.main' : 'error.main';
  const cashFlowIcon = netCashFlow >= 0 ? <TrendingUp /> : <TrendingDown />;

  // Handle balance update
  const handleBalanceUpdated = async (newBalance: any) => {
    setUserBalance(newBalance);
    setIsFirstTimeUser(false); // No longer a first-time user
    toggleDialog('balance');
  };

  // Check if user needs onboarding
  const needsOnboarding = isFirstTimeUser && totalIncome === 0 && totalExpenses === 0;

  // Show loading while initializing
  if (isLoadingBalance) {
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

  // Show error state
  if (balanceError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {balanceError}
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

  // Show onboarding for first-time users
  if (needsOnboarding) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} textAlign="center">
              <AccountBalance sx={{ fontSize: 60, color: 'primary.main', mx: 'auto' }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome to Budget App! 🎉
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Hi {user?.username}! Let's set up your finances.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                We've created your account with a $0 balance. Let's update it with your current financial situation.
              </Typography>
              
              <Alert severity="info" sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Quick Setup Steps:
                </Typography>
                <Typography variant="body2">
                  1. 💰 Set your current balance<br/>
                  2. 💵 Add your income sources<br/>
                  3. 💸 Track your expenses<br/>
                  4. 🧠 Get AI-powered insights
                </Typography>
              </Alert>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<Edit />}
                  onClick={() => toggleDialog('balance')}
                >
                  Set My Current Balance
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  startIcon={<TrendingUp />}
                  onClick={() => toggleDialog('income')}
                >
                  Add Income First
                </Button>
              </Box>
            </Stack>
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
        
        {/* Show setup prompt for users with $0 balance */}
        {isFirstTimeUser && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">
                💡 Ready to get started? Update your balance and add some transactions to unlock AI insights!
              </Typography>
              <Button 
                size="small" 
                variant="contained"
                onClick={() => toggleDialog('balance')}
              >
                Set Balance
              </Button>
            </Stack>
          </Alert>
        )}
      </Box>
      
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
                <Typography variant="h5" component="div">
                  {formatCurrency(userBalance?.amount || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isFirstTimeUser ? 'Tap to set your balance' : `Last updated ${formatRelativeTime(new Date())}`}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" alignItems="center">
                <AccountBalance color="primary" />
                {isFirstTimeUser && (
                  <Button 
                    size="small" 
                    startIcon={<Edit />}
                    onClick={() => toggleDialog('balance')}
                    sx={{ mt: 1 }}
                  >
                    Set
                  </Button>
                )}
              </Box>
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
                Your projected balance: {formatCurrency((userBalance?.amount || 0) + netCashFlow * 12)}
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
                disabled={suggestionsLoading || !userBalance?.id}
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
                  {isFirstTimeUser ? 
                    "Set your balance and add transactions to get AI insights" :
                    "Add income and expenses to get AI insights"
                  }
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => toggleDialog(isFirstTimeUser ? 'balance' : 'income')}
                >
                  {isFirstTimeUser ? 'Set Balance' : 'Add Income'}
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
            >
              Add Income
            </Button>
            <Button
              variant="outlined"
              startIcon={<TrendingDown />}
              onClick={() => toggleDialog('expense')}
            >
              Add Expense
            </Button>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => toggleDialog('balance')}
            >
              Update Balance
            </Button>
          </Stack>
          
          {/* Helper text for users */}
          {isFirstTimeUser && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                💡 <strong>Getting Started:</strong> {userBalance?.amount === 0 ? 
                  "Start by setting your current balance, then add income and expenses to get personalized AI insights." :
                  "Add your income sources and track expenses to get personalized AI insights about your finances."
                }
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
      >
        <Add />
      </Fab>

      {/* Form Dialogs */}
      <FormDialog
        open={dialogs.balance}
        onClose={() => toggleDialog('balance')}
        title={isFirstTimeUser ? 'Set Your Current Balance' : 'Update Balance'}
        subtitle={isFirstTimeUser ? 
          'Enter your current account balance to get started' : 
          'Adjust your current balance'
        }
      >
        <BalanceForm
          balance={userBalance}
          onSuccess={handleBalanceUpdated}
          onCancel={() => toggleDialog('balance')}
          isUpdate={true}
          balanceId={userBalance?.id}
        />
      </FormDialog>

      <FormDialog
        open={dialogs.income}
        onClose={() => toggleDialog('income')}
        title="Add Income"
        subtitle="Track your income sources"
      >
        <IncomeForm
          balanceId={userBalance?.id}
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
          balanceId={userBalance?.id}
          onSuccess={() => toggleDialog('expense')}
          onCancel={() => toggleDialog('expense')}
        />
      </FormDialog>
    </Box>
  );
};