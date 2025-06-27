// src/components/forms/IncomeForm.tsx
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
  Autocomplete,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { incomeSchema } from '../../utils/validators';
import { Income, IncomeCreate, IncomeUpdate } from '../../types/financial.types';
import { useCreateIncome, useUpdateIncome } from '../../hooks/useIncomes';

interface IncomeFormProps {
  balanceId: number;
  income?: Income; // If provided, we're editing; otherwise creating
  onSuccess?: (income: Income) => void;
  onCancel?: () => void;
  submitButtonText?: string;
}

type FormData = {
  source: string;
  amount: number;
};

// Common income sources for autocomplete
const COMMON_INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment Returns',
  'Rental Income',
  'Dividend',
  'Bonus',
  'Commission',
  'Side Hustle',
  'Part-time Job',
  'Consulting',
  'Royalties',
  'Pension',
  'Social Security',
  'Unemployment',
  'Gift',
  'Other',
];

export const IncomeForm: React.FC<IncomeFormProps> = ({
  balanceId,
  income,
  onSuccess,
  onCancel,
  submitButtonText,
}) => {
  const isEditing = !!income;
  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();
  
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
    resolver: yupResolver(incomeSchema.omit(['balance_id'])), // Remove balance_id from validation
    mode: 'onChange',
    defaultValues: {
      source: income?.source || '',
      amount: income?.amount || 0,
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      clearErrors();
      
      let result: Income;
      
      if (isEditing && income) {
        // Update existing income
        const updateData: IncomeUpdate = {
          source: data.source,
          amount: data.amount,
        };
        result = await updateMutation.mutateAsync({ id: income.id, data: updateData });
      } else {
        // Create new income
        const createData: IncomeCreate = {
          balance_id: balanceId,
          source: data.source,
          amount: data.amount,
        };
        result = await createMutation.mutateAsync(createData);
      }
      
      // Call success callback
      onSuccess?.(result);
      
      // Reset form if creating
      if (!isEditing) {
        reset();
      }
      
    } catch (err: any) {
      // Handle specific validation errors from backend
      if (err.response?.status === 422) {
        const detail = err.response.data.detail;
        if (detail.includes('source')) {
          setError('source', { message: detail });
        } else if (detail.includes('amount')) {
          setError('amount', { message: detail });
        }
      }
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
    return `Failed to ${isEditing ? 'update' : 'add'} income`;
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        {/* Title */}
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingUp color="success" />
          <Typography variant="h6">
            {isEditing ? 'Edit Income' : 'Add Income'}
          </Typography>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary">
          {isEditing 
            ? 'Update your income details'
            : 'Track your income sources to get a complete financial picture'
          }
        </Typography>

        {/* Error Alert */}
        {currentMutation.error && (
          <Alert severity="error">
            {getErrorMessage()}
          </Alert>
        )}

        {/* Income Source Field */}
        <Controller
          name="source"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={COMMON_INCOME_SOURCES}
              freeSolo
              disabled={currentMutation.isPending}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Income Source"
                  variant="outlined"
                  error={!!errors.source}
                  helperText={errors.source?.message || 'Where does this income come from?'}
                  autoFocus
                />
              )}
              onChange={(_, value) => field.onChange(value || '')}
              onInputChange={(_, value) => field.onChange(value || '')}
              value={field.value}
            />
          )}
        />

        {/* Amount Field */}
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Amount"
              type="number"
              variant="outlined"
              error={!!errors.amount}
              helperText={errors.amount?.message || 'How much do you receive from this source?'}
              disabled={currentMutation.isPending}
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
            color="success"
            disabled={currentMutation.isPending || !isValid}
            startIcon={
              currentMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                <TrendingUp />
              )
            }
          >
            {currentMutation.isPending 
              ? (isEditing ? 'Updating...' : 'Adding...') 
              : (submitButtonText || (isEditing ? 'Update Income' : 'Add Income'))
            }
          </Button>
        </Stack>

        {/* Success Message */}
        {currentMutation.isSuccess && (
          <Alert severity="success">
            Income {isEditing ? 'updated' : 'added'} successfully!
          </Alert>
        )}
      </Stack>
    </Box>
  );
};