// src/components/forms/FormDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  hideCloseButton?: boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'sm',
  fullScreen,
  hideCloseButton = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use fullscreen on mobile if not explicitly set
  const shouldUseFullScreen = fullScreen !== undefined ? fullScreen : isMobile;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={shouldUseFullScreen}
      aria-labelledby="form-dialog-title"
      aria-describedby={subtitle ? "form-dialog-subtitle" : undefined}
      PaperProps={{
        sx: {
          borderRadius: shouldUseFullScreen ? 0 : 2,
          minHeight: shouldUseFullScreen ? '100vh' : 'auto',
        },
      }}
    >
      {/* Dialog Title */}
      <DialogTitle
        id="form-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: subtitle ? 1 : 2,
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {subtitle && (
            <Typography
              id="form-dialog-subtitle"
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {!hideCloseButton && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        )}
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent
        sx={{
          pb: 2,
          px: 3,
          // Remove default padding on mobile for better space usage
          ...(shouldUseFullScreen && {
            px: 2,
            py: 1,
          }),
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

// Convenience component for quick form dialogs
interface QuickFormDialogProps extends Omit<FormDialogProps, 'children'> {
  form: React.ReactNode;
  actions?: React.ReactNode;
}

export const QuickFormDialog: React.FC<QuickFormDialogProps> = ({
  form,
  actions,
  ...dialogProps
}) => {
  return (
    <FormDialog {...dialogProps}>
      <Box>
        {form}
        {actions && (
          <DialogActions sx={{ px: 0, pt: 2 }}>
            {actions}
          </DialogActions>
        )}
      </Box>
    </FormDialog>
  );
};