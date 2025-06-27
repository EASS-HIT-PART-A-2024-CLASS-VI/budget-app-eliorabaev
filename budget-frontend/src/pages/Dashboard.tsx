// src/pages/Dashboard.tsx
import React from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Box,
  Alert,
  Stack
} from '@mui/material';
import { 
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Psychology 
} from '@mui/icons-material';
import { useAuthContext } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuthContext();

  return (
    <Box>
      {/* Welcome Message */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.username}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your financial status
        </Typography>
      </Box>

      {/* Demo Notice */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Demo Mode:</strong> The data shown below is mock data. 
          In the next phase, we'll connect this to your real financial data from the backend API.
        </Typography>
      </Alert>
      
      {/* Financial Overview Cards using CSS Grid */}
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
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Current Balance
                </Typography>
                <Typography variant="h5" component="div">
                  $5,000.00
                </Typography>
                <Typography variant="body2" color="success.main">
                  +2.5% from last month
                </Typography>
              </Box>
              <AccountBalance color="primary" />
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Income
                </Typography>
                <Typography variant="h5" component="div">
                  $3,500.00
                </Typography>
                <Typography variant="body2" color="success.main">
                  +12% from last month
                </Typography>
              </Box>
              <TrendingUp color="success" />
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Expenses
                </Typography>
                <Typography variant="h5" component="div">
                  $1,200.00
                </Typography>
                <Typography variant="body2" color="error.main">
                  +5% from last month
                </Typography>
              </Box>
              <TrendingDown color="error" />
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Net Cash Flow
                </Typography>
                <Typography variant="h5" component="div" color="success.main">
                  +$2,300.00
                </Typography>
                <Typography variant="body2" color="success.main">
                  Healthy cash flow
                </Typography>
              </Box>
              <Psychology color="info" />
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* Charts Section using CSS Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          lg: '2fr 1fr' 
        }, 
        gap: 3 
      }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Balance Projection
            </Typography>
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
                Interactive charts will be implemented in the next phase
              </Typography>
              <Typography variant="body2" color="textSecondary" textAlign="center">
                This will show your projected balance growth over time
              </Typography>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Financial Suggestions
            </Typography>
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
              <Psychology sx={{ fontSize: 48, color: 'grey.400' }} />
              <Typography color="textSecondary" textAlign="center">
                AI-powered insights will be implemented in the next phase
              </Typography>
              <Typography variant="body2" color="textSecondary" textAlign="center">
                Get personalized recommendations based on your spending patterns
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box 
              sx={{ 
                p: 2, 
                border: '1px dashed',
                borderColor: 'grey.300',
                borderRadius: 1,
                textAlign: 'center',
                flex: 1
              }}
            >
              <Typography variant="body2" color="textSecondary">
                Add Income/Expense forms will be implemented in the next phase
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};