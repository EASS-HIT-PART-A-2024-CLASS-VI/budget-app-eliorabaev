// src/pages/Homepage.tsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Paper,
  Divider,
  IconButton,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Psychology,
  Security,
  Smartphone,
  CloudSync,
  AutoAwesome,
  GitHub,
  LinkedIn,
  Twitter,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const Homepage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <AccountBalance color="primary" sx={{ fontSize: 40 }} />,
      title: 'Smart Balance Management',
      description: 'Track your finances with intelligent balance monitoring and real-time updates.',
    },
    {
      icon: <Psychology color="secondary" sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Insights',
      description: 'Get personalized financial recommendations powered by advanced AI algorithms.',
    },
    {
      icon: <TrendingUp color="success" sx={{ fontSize: 40 }} />,
      title: 'Growth Projections',
      description: 'Visualize your financial future with detailed growth charts and projections.',
    },
    {
      icon: <Security color="warning" sx={{ fontSize: 40 }} />,
      title: 'Bank-Level Security',
      description: 'Your data is protected with enterprise-grade security and encryption.',
    },
    {
      icon: <Smartphone color="info" sx={{ fontSize: 40 }} />,
      title: 'Mobile Responsive',
      description: 'Access your finances anywhere with our fully responsive design.',
    },
    {
      icon: <CloudSync color="primary" sx={{ fontSize: 40 }} />,
      title: 'Real-time Sync',
      description: 'All your data syncs in real-time across all your devices.',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '99.9%', label: 'Uptime' },
    { number: '$2M+', label: 'Money Managed' },
    { number: '4.9★', label: 'User Rating' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Chip 
                  label="🚀 Now with AI-Powered Insights" 
                  color="primary" 
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
                />
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                  }}
                >
                  Take Control of Your
                  <Box component="span" sx={{ color: 'primary.main', display: 'block' }}>
                    Financial Future
                  </Box>
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, lineHeight: 1.6 }}
                >
                  Smart budgeting made simple with AI-powered insights, real-time tracking, 
                  and personalized recommendations to help you achieve your financial goals.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      py: 1.5, 
                      px: 4, 
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ py: 1.5, px: 4, borderRadius: 2, fontSize: '1.1rem' }}
                  >
                    Sign In
                  </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  ✨ No credit card required • Free forever plan available
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: (theme) => theme.palette.background.paper,
                    transform: 'rotate(-2deg)',
                    maxWidth: 300,
                  }}
                >
                  <Stack spacing={2}>
                    <Typography variant="h6" textAlign="center">
                      Your Financial Dashboard
                    </Typography>
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Balance
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          $12,450
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Growth
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          +15.3%
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ height: 60, bgcolor: 'primary.main', borderRadius: 1, opacity: 0.1 }} />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      AI Recommendation: Save $200 more this month
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {stat.number}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              Everything You Need to
              <Box component="span" sx={{ color: 'primary.main' }}> Succeed</Box>
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth="600px" mx="auto">
              Powerful features designed to make financial management effortless and effective
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: (theme) => theme.shadows[12],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box mb={2}>{feature.icon}</Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
    <Box
    sx={{
        background: (theme) => {
        if (theme.palette.mode === 'dark') {
            return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        } else {
            return 'linear-gradient(135deg, #1976d2 0%, #dc004e 100%)';
        }
        },
        color: 'white',
        py: 8,
    }}
    >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <AutoAwesome sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            Ready to Transform Your Finances?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of users who have already taken control of their financial future
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Start Your Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'white',
                color: 'white',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Sign In
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                💰 Budget App
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Empowering individuals to take control of their financial future with 
                smart technology and AI-powered insights.
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" color="primary">
                  <GitHub />
                </IconButton>
                <IconButton size="small" color="primary">
                  <Twitter />
                </IconButton>
                <IconButton size="small" color="primary">
                  <LinkedIn />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Product
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">Features</Typography>
                    <Typography variant="body2" color="text.secondary">Pricing</Typography>
                    <Typography variant="body2" color="text.secondary">Security</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Support
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">Help Center</Typography>
                    <Typography variant="body2" color="text.secondary">Contact Us</Typography>
                    <Typography variant="body2" color="text.secondary">Privacy Policy</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              © 2025 Budget App. All rights reserved.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Made with ❤️ for better financial health
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};