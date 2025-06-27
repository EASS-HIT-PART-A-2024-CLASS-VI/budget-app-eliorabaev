// src/pages/Register.tsx
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
import { ArrowBack, CheckCircle, Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuthContext } from '../contexts/AuthContext';
import { registrationSchema } from '../utils/validators';
import { RegisterData } from '../types/auth.types';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, isAuthenticated } = useAuthContext();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [registrationSuccess, setRegistrationSuccess] = React.useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const benefits = [
    'AI-powered financial insights',
    'Real-time expense tracking',
    'Personalized budget recommendations',
    'Secure bank-level encryption',
  ];

  // Form setup with validation
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
    watch
  } = useForm<RegisterData>({
    resolver: yupResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  // Watch password for confirmation validation
  const password = watch('password');

  // Handle form submission
  const onSubmit = async (data: RegisterData) => {
    try {
      clearErrors();
      await registerUser(data);
      setRegistrationSuccess(true);
      // Show success screen - user will click to go to login
    } catch (err: any) {
      // Handle specific validation errors from backend
      if (err.response?.status === 422) {
        const detail = err.response.data.detail;
        if (detail.includes('Username')) {
          setError('username', { message: detail });
        } else if (detail.includes('Email')) {
          setError('email', { message: detail });
        } else if (detail.includes('Password')) {
          setError('password', { message: detail });
        }
      } else if (err.response?.status === 409) {
        const detail = err.response.data.detail;
        if (detail.includes('Username')) {
          setError('username', { message: 'This username is already taken' });
        } else if (detail.includes('Email')) {
          setError('email', { message: 'This email is already registered' });
        }
      }
      // General errors are handled by the error state from useAuth
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (registrationSuccess) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
        p={2}
      >
        <Card sx={{ maxWidth: 450, width: '100%', boxShadow: 8 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Registration Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Your account has been created successfully. You can now sign in with your credentials.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              fullWidth
              size="large"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

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

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ textAlign: 'left' }}>
                  {error}
                </Alert>
              )}
              
              {/* Registration Form */}
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={3}>
                  {/* Username Field */}
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Username"
                        variant="outlined"
                        error={!!errors.username}
                        helperText={errors.username?.message || "Only letters and numbers allowed"}
                        autoFocus
                        autoComplete="username"
                      />
                    )}
                  />

                  {/* Email Field */}
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email Address"
                        type="email"
                        variant="outlined"
                        error={!!errors.email}
                        helperText={errors.email?.message || "We'll never share your email"}
                        autoComplete="email"
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
                        helperText={
                          errors.password?.message || 
                          "At least 8 characters with uppercase, lowercase, number and special character"
                        }
                        autoComplete="new-password"
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

                  {/* Confirm Password Field */}
                  <Controller
                    name="password_confirmation"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        variant="outlined"
                        error={!!errors.password_confirmation}
                        helperText={errors.password_confirmation?.message}
                        autoComplete="new-password"
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={toggleConfirmPasswordVisibility}
                              edge="end"
                              aria-label="toggle confirm password visibility"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                        <span>Creating Account...</span>
                      </Stack>
                    ) : (
                      'Create Account'
                    )}
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