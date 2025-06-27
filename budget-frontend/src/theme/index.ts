import { createTheme, ThemeOptions } from '@mui/material/styles';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

export const createAppTheme = (mode: 'light' | 'dark') => {
  const themeOptions: ThemeOptions = mode === 'dark' ? darkTheme : lightTheme;
  
  return createTheme({
    ...themeOptions,
    components: {
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            ...(theme.palette.mode === 'dark' && {
              backgroundColor: theme.palette.grey[900],
              border: `1px solid ${theme.palette.grey[800]}`,
            }),
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            ...(theme.palette.mode === 'dark' && {
              backgroundColor: theme.palette.grey[900],
            }),
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
          },
        },
      },
    },
  });
};