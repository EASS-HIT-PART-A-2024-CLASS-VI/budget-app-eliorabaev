// src/components/layout/AppBar.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Stack,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { 
  Home, 
  Dashboard, 
  Settings, 
  AccountCircle,
  Logout,
  Person
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuthContext } from '../../contexts/AuthContext';

export const GlobalAppBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    // Navigate to home page after logout
    navigate('/');
  };

  // Don't show AppBar on login/register pages (optional)
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
        color: 'text.primary'
      }}
    >
      <Toolbar>
        {/* Logo/Brand */}
        <Box 
          display="flex" 
          alignItems="center" 
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            💰 Budget App
          </Typography>
        </Box>

        {/* Navigation Links - Show different links based on auth status */}
        <Box sx={{ flexGrow: 1, ml: 4 }}>
          {isAuthenticated ? (
            // Authenticated Navigation
            <Stack direction="row" spacing={1}>
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  color: location.pathname === '/dashboard' ? 'primary.main' : 'text.primary',
                  fontWeight: location.pathname === '/dashboard' ? 'bold' : 'normal'
                }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                startIcon={<Settings />}
                onClick={() => navigate('/settings')}
                sx={{ 
                  color: location.pathname === '/settings' ? 'primary.main' : 'text.primary',
                  fontWeight: location.pathname === '/settings' ? 'bold' : 'normal'
                }}
              >
                Settings
              </Button>
            </Stack>
          ) : (
            // Public Navigation
            <Stack direction="row" spacing={1}>
              <Button
                color="inherit"
                startIcon={<Home />}
                onClick={() => navigate('/')}
                sx={{ 
                  color: location.pathname === '/' ? 'primary.main' : 'text.primary',
                  fontWeight: location.pathname === '/' ? 'bold' : 'normal'
                }}
              >
                Home
              </Button>
            </Stack>
          )}
        </Box>

        {/* Right Side Actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          <ThemeToggle />
          
          {isAuthenticated && user ? (
            // Authenticated User Menu
            <>
              <Button
                color="inherit"
                onClick={handleUserMenuOpen}
                startIcon={
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                }
                sx={{ 
                  color: 'text.primary',
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                {user.username}
              </Button>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                onClick={handleUserMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1,
                      minWidth: 200,
                    },
                  },
                }}
              >
                <MenuItem disabled>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={user.username}
                    secondary={user.email}
                  />
                </MenuItem>
                
                <Divider />
                
                <MenuItem onClick={() => navigate('/dashboard')}>
                  <ListItemIcon>
                    <Dashboard fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </MenuItem>
                
                <MenuItem onClick={() => navigate('/settings')}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </MenuItem>
                
                <Divider />
                
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Menu>
            </>
          ) : (
            // Public Actions
            <>
              <Button 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ color: 'text.primary' }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/register')}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};