// src/components/forms/BalanceForm.tsx
import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
} from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { balanceSchema } from '../../utils/validators';
import { Balance, BalanceCreate, BalanceUpdate } from '../../types/financial.types';
import { useCreateBalance, useUpdateBalance } from '../../hooks/useBalance';

interface BalanceFormProps {
  balance?: Balance; // If provided, we're editing; otherwise creating
  onSuccess?: (balance: Balance) => void;
  onCancel?: () => void;
  submitButtonText?: string;
}

type FormData = {
  amount: number;
};

export const BalanceForm: React.FC<BalanceFormProps> = ({
  balance,
  onSuccess,
  onCancel,
  submitButtonText,
}) => {
  const isEditing = !!balance;
  const createMutation = useCreateBalance();
  const updateMutation = useUpdateBalance();
  
  const currentMutation = isEditing ? updateMutation : createMutation;

  // Form setup with validation
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(balanceSchema),
    mode: 'onChange',
    defaultValues: {
      amount: balance?.amount || 0,
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      clearErrors();
      
      let result: Balance;
      
      if (isEditing && balance) {
        // Update existing balance
        const updateData: BalanceUpdate = { amount: data.amount };
        result = await updateMutation.mutateAsync({ id: balance.id, data: updateData });
      } else {
        // Create new balance
        const createData: BalanceCreate = { amount: data.amount };
        result = await createMutation.mutateAsync(createData);
      }
      
      // Call success callback
      onSuccess?.(result);
      
      // Reset form if creating (not needed for editing as component usually unmounts)
      if (!isEditing) {
        reset();
      }
      
    } catch (err: any) {
      // Handle specific validation errors from backend
      if (err.response?.status === 422) {
        const detail = err.response.data.detail;
        if (detail.includes('amount')) {
          setError('amount', { message: detail });
        }
      }
      // General errors are handled by the error state from mutations
    }
  };

  // Get error message from mutation
  const getErrorMessage = () => {
    const error = currentMutation.error as any;
    if (error?.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error?.message) {
      return error.message;
    }
    return `Failed to ${isEditing ? 'update' : 'create'} balance`;
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        {/* Title */}
        <Box display="flex" alignItems="center" gap={1}>
          <AccountBalance color="primary" />
          <Typography variant="h6">
            {isEditing ? 'Edit Balance' : 'Set Initial Balance'}
          </Typography>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary">
          {isEditing 
            ? 'Update your current balance amount'
            : 'Enter your starting balance to begin tracking your finances'
          }
        </Typography>

        {/* Error Alert */}
        {currentMutation.error && (
          <Alert severity="error">
            {getErrorMessage()}
          </Alert>
        )}

        {/* Amount Field */}
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Balance Amount"
              type="number"
              variant="outlined"
              error={!!errors.amount}
              helperText={errors.amount?.message || 'Enter the current balance in your account'}
              disabled={currentMutation.isPending}
              autoFocus
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                step: 0.01,
              }}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                field.onChange(value);
              }}
            />
          )}
        />

        {/* Form Actions */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={currentMutation.isPending}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            variant="contained"
            disabled={currentMutation.isPending || !isValid}
            startIcon={
              currentMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                <AccountBalance />
              )
            }
          >
            {currentMutation.isPending 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (submitButtonText || (isEditing ? 'Update Balance' : 'Set Balance'))
            }
          </Button>
        </Stack>

        {/* Success Message */}
        {currentMutation.isSuccess && (
          <Alert severity="success">
            Balance {isEditing ? 'updated' : 'created'} successfully!
          </Alert>
        )}
      </Stack>
    </Box>
  );
};