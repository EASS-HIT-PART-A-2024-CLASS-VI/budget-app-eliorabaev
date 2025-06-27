// src/components/forms/ExpenseForm.tsx
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
import { TrendingDown } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { expenseSchema } from '../../utils/validators';
import { Expense, ExpenseCreate, ExpenseUpdate } from '../../types/financial.types';
import { useCreateExpense, useUpdateExpense } from '../../hooks/useExpenses';

interface ExpenseFormProps {
  balanceId: number;
  expense?: Expense; // If provided, we're editing; otherwise creating
  onSuccess?: (expense: Expense) => void;
  onCancel?: () => void;
  submitButtonText?: string;
}

type FormData = {
  category: string;
  amount: number;
};

// Common expense categories for autocomplete
const COMMON_EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Gas & Fuel',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Rent/Mortgage',
  'Insurance',
  'Healthcare',
  'Education',
  'Travel',
  'Hobbies',
  'Subscriptions',
  'Phone',
  'Internet',
  'Clothing',
  'Personal Care',
  'Home Maintenance',
  'Gifts & Donations',
  'Bank Fees',
  'Taxes',
  'Debt Payment',
  'Investment',
  'Savings',
  'Emergency Fund',
  'Other',
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  balanceId,
  expense,
  onSuccess,
  onCancel,
  submitButtonText,
}) => {
  const isEditing = !!expense;
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  
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
    resolver: yupResolver(expenseSchema.omit(['balance_id'])), // Remove balance_id from validation
    mode: 'onChange',
    defaultValues: {
      category: expense?.category || '',
      amount: expense?.amount || 0,
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      clearErrors();
      
      let result: Expense;
      
      if (isEditing && expense) {
        // Update existing expense
        const updateData: ExpenseUpdate = {
          category: data.category,
          amount: data.amount,
        };
        result = await updateMutation.mutateAsync({ id: expense.id, data: updateData });
      } else {
        // Create new expense
        const createData: ExpenseCreate = {
          balance_id: balanceId,
          category: data.category,
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
        if (detail.includes('category')) {
          setError('category', { message: detail });
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
    return `Failed to ${isEditing ? 'update' : 'add'} expense`;
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        {/* Title */}
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingDown color="error" />
          <Typography variant="h6">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </Typography>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary">
          {isEditing 
            ? 'Update your expense details'
            : 'Track your expenses to understand your spending patterns'
          }
        </Typography>

        {/* Error Alert */}
        {currentMutation.error && (
          <Alert severity="error">
            {getErrorMessage()}
          </Alert>
        )}

        {/* Expense Category Field */}
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={COMMON_EXPENSE_CATEGORIES}
              freeSolo
              disabled={currentMutation.isPending}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Expense Category"
                  variant="outlined"
                  error={!!errors.category}
                  helperText={errors.category?.message || 'What type of expense is this?'}
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
              helperText={errors.amount?.message || 'How much did you spend?'}
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
            color="error"
            disabled={currentMutation.isPending || !isValid}
            startIcon={
              currentMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                <TrendingDown />
              )
            }
          >
            {currentMutation.isPending 
              ? (isEditing ? 'Updating...' : 'Adding...') 
              : (submitButtonText || (isEditing ? 'Update Expense' : 'Add Expense'))
            }
          </Button>
        </Stack>

        {/* Success Message */}
        {currentMutation.isSuccess && (
          <Alert severity="success">
            Expense {isEditing ? 'updated' : 'added'} successfully!
          </Alert>
        )}
      </Stack>
    </Box>
  );
};