// src/pages/Settings.tsx
import React from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Box,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { useThemeMode } from '../hooks/useTheme';

export const Settings: React.FC = () => {
  const { isDarkMode, toggleColorMode } = useThemeMode();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={toggleColorMode}
                color="primary"
              />
            }
            label="Dark Mode"
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Account
          </Typography>
          
          <Typography color="textSecondary">
            Additional settings will be implemented in future updates
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};