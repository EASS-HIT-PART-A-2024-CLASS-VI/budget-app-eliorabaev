// src/pages/Login.tsx
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
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const navigate = useNavigate();

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

      {/* Login Form */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flex={1}
        p={2}
      >
        <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 8 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} textAlign="center">
              {/* Logo/Title */}
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  💰 Budget App
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom>
                  Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to your account to continue managing your finances
                </Typography>
              </Box>

              <Divider />
              
              {/* Login Form */}
              <Box component="form" noValidate>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Username or Email"
                    variant="outlined"
                    required
                    autoFocus
                  />
                  <TextField
                    fullWidth
                    label="Password"
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
                    Sign In
                  </Button>
                </Stack>
              </Box>

              {/* Links */}
              <Stack spacing={1}>
                <Link href="#" variant="body2" color="primary.main">
                  Forgot your password?
                </Link>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" component="span">
                    Don't have an account?{' '}
                  </Typography>
                  <Link component={RouterLink} to="/register" variant="body2" color="primary.main">
                    Sign up here
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