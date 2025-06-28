// frontend/src/components/forms/BalanceForm.tsx - Updated for balance updates

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiClient } from '../../services/api';

interface BalanceFormProps {
  balance?: any;
  onSuccess: (balance: any) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  isUpdate?: boolean;
  balanceId?: number;
}

interface BalanceFormData {
  amount: number;
}

const balanceSchema = yup.object({
  amount: yup
    .number()
    .required('Amount is required')
    .min(0, 'Amount must be positive or zero')
    .max(999999999, 'Amount is too large')
    .typeError('Please enter a valid number'),
});

export const BalanceForm: React.FC<BalanceFormProps> = ({
  balance,
  onSuccess,
  onCancel,
  submitButtonText,
  isUpdate = false,
  balanceId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<BalanceFormData>({
    resolver: yupResolver(balanceSchema),
    mode: 'onChange',
    defaultValues: {
      amount: balance?.amount || 0,
    },
  });

  // Watch the amount for real-time feedback
  const currentAmount = watch('amount');

  useEffect(() => {
    if (balance?.amount !== undefined) {
      setValue('amount', balance.amount);
    }
  }, [balance, setValue]);

  const onSubmit = async (data: BalanceFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      
      if (isUpdate && (balanceId || balance?.id)) {
        // Update existing balance
        const updateId = balanceId || balance.id;
        if (updateId) {
          // Use the convenient /current endpoint if available, otherwise use specific ID
          response = await apiClient.patch('/balance/current', {
            amount: data.amount
          });
        } else {
          throw new Error('No balance ID provided for update');
        }
      } else {
        // Create new balance (fallback for edge cases)
        response = await apiClient.post('/balance/', {
          amount: data.amount
        });
      }

      onSuccess(response.data);
    } catch (err: any) {
      console.error('Balance operation error:', err);
      if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Invalid balance data');
      } else if (err.response?.status === 404) {
        setError('Balance not found. Please contact support.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to modify this balance.');
      } else {
        setError('Failed to save balance. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const isFirstTimeSetup = balance?.amount === 0 || currentAmount === 0;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        {/* Help text for first-time users */}
        {isFirstTimeSetup && (
          <Alert severity="info">
            <Typography variant="body2">
              💡 <strong>Tip:</strong> Enter your current bank account balance or total available funds. 
              You can always update this later as your balance changes.
            </Typography>
          </Alert>
        )}

        {/* Error display */}
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {/* Amount input */}
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Current Balance"
              type="number"
              variant="outlined"
              error={!!errors.amount}
              helperText={
                errors.amount?.message || 
                'Enter your current account balance'
              }
              autoFocus
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                field.onChange(value);
              }}
            />
          )}
        />

        {/* Real-time preview */}
        {currentAmount > 0 && (
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'primary.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.200'
            }}
          >
            <Typography variant="body2" color="primary.main" gutterBottom>
              💰 Your balance will be set to:
            </Typography>
            <Typography variant="h6" color="primary.main">
              {formatCurrency(currentAmount)}
            </Typography>
          </Box>
        )}

        {/* Action buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isLoading}
              fullWidth
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !isValid}
            fullWidth
            startIcon={
              isLoading ? (
                <CircularProgress size={20} />
              ) : null
            }
          >
            {isLoading 
              ? 'Saving...' 
              : submitButtonText || (isUpdate ? 'Update Balance' : 'Set Balance')
            }
          </Button>
        </Stack>

        {/* Additional help for new users */}
        {isFirstTimeSetup && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            After setting your balance, you can add income sources and track expenses 
            to get personalized financial insights powered by AI.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};