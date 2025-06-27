// src/pages/Login.tsx
import React, { useEffect } from 'react';
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
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuthContext } from '../contexts/AuthContext';
import { loginSchema } from '../utils/validators';
import { LoginCredentials } from '../types/auth.types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated } = useAuthContext();
  const [showPassword, setShowPassword] = React.useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Form setup with validation
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      username_or_email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginCredentials) => {
    try {
      clearErrors();
      await login(data);
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (err: any) {
      // Handle specific validation errors from backend
      if (err.response?.status === 422) {
        const detail = err.response.data.detail;
        if (detail.includes('Username') || detail.includes('Email')) {
          setError('username_or_email', { message: detail });
        } else if (detail.includes('Password')) {
          setError('password', { message: detail });
        }
      }
      // General errors are handled by the error state from useAuth
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ textAlign: 'left' }}>
                  {error}
                </Alert>
              )}
              
              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={3}>
                  {/* Username or Email Field */}
                  <Controller
                    name="username_or_email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Username or Email"
                        variant="outlined"
                        error={!!errors.username_or_email}
                        helperText={errors.username_or_email?.message}
                        autoFocus
                        autoComplete="username"
                      />
                    )}
                  />

                  {/* Password Field */}
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        autoComplete="current-password"
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                              aria-label="toggle password visibility"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          ),
                        }}
                      />
                    )}
                  />
                  
                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading || !isValid}
                    sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                  >
                    {isLoading ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={20} />
                        <span>Signing In...</span>
                      </Stack>
                    ) : (
                      'Sign In'
                    )}
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