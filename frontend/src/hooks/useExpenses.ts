// src/hooks/useExpenses.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseService, GetExpensesParams } from '../services/expense.service';
import { Expense, ExpenseCreate, ExpenseUpdate } from '../types/financial.types';
import { QUERY_KEYS } from '../utils/constants';

// Hook to get all expenses (with optional filtering)
export const useGetExpenses = (params: GetExpensesParams = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.EXPENSE.LIST(params.balance_id),
    queryFn: () => expenseService.getExpenses(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get expenses by balance ID
export const useGetExpensesByBalance = (balanceId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.EXPENSE.LIST(balanceId),
    queryFn: () => expenseService.getExpensesByBalance(balanceId),
    enabled: enabled && !!balanceId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook to get a specific expense by ID
export const useGetExpense = (expenseId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.EXPENSE.GET(expenseId),
    queryFn: () => expenseService.getExpense(expenseId),
    enabled: enabled && !!expenseId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook to create a new expense
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExpenseCreate) => expenseService.createExpense(data),
    onSuccess: (newExpense) => {
      // Add to individual expense cache
      queryClient.setQueryData(
        QUERY_KEYS.EXPENSE.GET(newExpense.id),
        newExpense
      );
      
      // Invalidate expense lists
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXPENSE.LIST()
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXPENSE.LIST(newExpense.balance_id)
      });
      
      // Invalidate balance data (balance might be affected)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BALANCE.GET(newExpense.balance_id)
      });
      
      // Invalidate suggestions (financial picture changed)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SUGGESTIONS.GET(newExpense.balance_id)
      });
      
      // Invalidate graphs
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GRAPH.GET(newExpense.balance_id)
      });
    },
    onError: (error) => {
      console.error('Failed to create expense:', error);
    },
  });
};

// Hook to update an expense
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExpenseUpdate }) =>
      expenseService.updateExpense(id, data),
    onSuccess: (updatedExpense, { id }) => {
      // Update individual expense cache
      queryClient.setQueryData(
        QUERY_KEYS.EXPENSE.GET(id),
        updatedExpense
      );
      
      // Invalidate expense lists
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXPENSE.LIST()
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXPENSE.LIST(updatedExpense.balance_id)
      });
      
      // Invalidate related data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BALANCE.GET(updatedExpense.balance_id)
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SUGGESTIONS.GET(updatedExpense.balance_id)
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GRAPH.GET(updatedExpense.balance_id)
      });
    },
    onError: (error) => {
      console.error('Failed to update expense:', error);
    },
  });
};

// Hook to delete an expense
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: number) => expenseService.deleteExpense(expenseId),
    onMutate: async (expenseId) => {
      // Get the current expense data to know which balance to invalidate
      const currentExpense = queryClient.getQueryData<Expense>(
        QUERY_KEYS.EXPENSE.GET(expenseId)
      );
      return { balanceId: currentExpense?.balance_id };
    },
    onSuccess: (_, expenseId, context) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.EXPENSE.GET(expenseId)
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXPENSE.LIST()
      });
      
      if (context?.balanceId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.EXPENSE.LIST(context.balanceId)
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.BALANCE.GET(context.balanceId)
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SUGGESTIONS.GET(context.balanceId)
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GRAPH.GET(context.balanceId)
        });
      }
    },
    onError: (error) => {
      console.error('Failed to delete expense:', error);
    },
  });
};

// Hook to get expense statistics
export const useGetExpenseStats = (balanceId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['expense-stats', balanceId],
    queryFn: () => expenseService.getExpenseStats(balanceId),
    enabled: enabled && !!balanceId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook to get top spending categories
export const useGetTopCategories = (
  balanceId: number, 
  limit: number = 5,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['top-categories', balanceId, limit],
    queryFn: () => expenseService.getTopCategories(balanceId, limit),
    enabled: enabled && !!balanceId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Combined hook for expense operations
export const useExpenseOperations = (balanceId?: number) => {
  const { data: expenses, isLoading, error } = useGetExpensesByBalance(
    balanceId!, 
    !!balanceId
  );
  const { data: stats, isLoading: statsLoading } = useGetExpenseStats(
    balanceId!, 
    !!balanceId
  );
  const { data: topCategories, isLoading: categoriesLoading } = useGetTopCategories(
    balanceId!, 
    5, 
    !!balanceId
  );
  
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();
  
  const isAnyLoading = isLoading || 
    statsLoading ||
    categoriesLoading ||
    createMutation.isPending || 
    updateMutation.isPending || 
    deleteMutation.isPending;

  const hasError = error || 
    createMutation.error || 
    updateMutation.error || 
    deleteMutation.error;

  return {
    // Data
    expenses: expenses || [],
    stats,
    topCategories: topCategories || [],
    
    // Loading states
    isLoading: isAnyLoading,
    
    // Error states
    error: hasError,
    
    // Operations
    createExpense: createMutation.mutateAsync,
    updateExpense: (id: number, data: ExpenseUpdate) => 
      updateMutation.mutateAsync({ id, data }),
    deleteExpense: deleteMutation.mutateAsync,
    
    // Computed values
    totalExpenses: stats?.total || 0,
    expenseCount: expenses?.length || 0,
    averageExpense: stats?.average || 0,
    
    // Individual mutation states
    mutations: {
      create: createMutation,
      update: updateMutation,
      delete: deleteMutation,
    }
  };
};