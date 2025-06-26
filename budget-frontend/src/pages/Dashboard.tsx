import React from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Box,
  Button,
  Stack
} from '@mui/material';
import { 
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Psychology 
} from '@mui/icons-material';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove('access_token');
    navigate('/login');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      
      {/* Financial Overview Cards using Stack/Box layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
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
              </Box>
              <Psychology color="info" />
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* Charts Section using CSS Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Balance Projection
            </Typography>
            <Box 
              height={300} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              bgcolor="grey.50"
              borderRadius={1}
            >
              <Typography color="textSecondary">
                Chart will be implemented in next steps
              </Typography>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Suggestions
            </Typography>
            <Box 
              height={300} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              bgcolor="grey.50"
              borderRadius={1}
            >
              <Typography color="textSecondary">
                Suggestions will be implemented in next steps
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};