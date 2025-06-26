// src/pages/Register.tsx
import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Link,
  IconButton,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const benefits = [
    'AI-powered financial insights',
    'Real-time expense tracking',
    'Personalized budget recommendations',
    'Secure bank-level encryption',
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bgcolor="background.default"
    >
      {/* Back to Home Button */}
      <Box p={2}>
        <IconButton onClick={() => navigate('/')} color="primary">
          <ArrowBack />
        </IconButton>
      </Box>

      {/* Register Form */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flex={1}
        p={2}
      >
        <Card sx={{ maxWidth: 450, width: '100%', boxShadow: 8 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} textAlign="center">
              {/* Logo/Title */}
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  💰 Budget App
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom>
                  Create Your Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join thousands of users taking control of their finances
                </Typography>
              </Box>

              {/* Benefits */}
              <Alert 
                icon={<CheckCircle />} 
                severity="success" 
                sx={{ textAlign: 'left' }}
              >
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  What you'll get:
                </Typography>
                <Stack spacing={0.5}>
                  {benefits.map((benefit, index) => (
                    <Typography key={index} variant="body2">
                      ✓ {benefit}
                    </Typography>
                  ))}
                </Stack>
              </Alert>

              <Divider />
              
              {/* Registration Form */}
              <Box component="form" noValidate>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    required
                    autoFocus
                    helperText="Only letters and numbers allowed"
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    required
                    helperText="We'll never share your email"
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    required
                    helperText="At least 8 characters with uppercase, lowercase, number and special character"
                  />
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    variant="outlined"
                    required
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                  >
                    Create Account
                  </Button>
                </Stack>
              </Box>

              {/* Terms */}
              <Typography variant="body2" color="text.secondary">
                By creating an account, you agree to our{' '}
                <Link href="#" color="primary.main">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" color="primary.main">Privacy Policy</Link>
              </Typography>

              {/* Links */}
              <Stack spacing={1}>                
                <Box>
                  <Typography variant="body2" color="text.secondary" component="span">
                    Already have an account?{' '}
                  </Typography>
                  <Link component={RouterLink} to="/login" variant="body2" color="primary.main">
                    Sign in here
                  </Link>
                </Box>

                <Link component={RouterLink} to="/" variant="body2" color="text.secondary">
                  ← Back to Homepage
                </Link>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};