// src/hooks/useIncomes.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { incomeService, GetIncomesParams } from '../services/income.service';
import { Income, IncomeCreate, IncomeUpdate } from '../types/financial.types';
import { QUERY_KEYS } from '../utils/constants';

// Hook to get all incomes (with optional filtering)
export const useGetIncomes = (params: GetIncomesParams = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.INCOME.LIST(params.balance_id),
    queryFn: () => incomeService.getIncomes(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get incomes by balance ID
export const useGetIncomesByBalance = (balanceId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.INCOME.LIST(balanceId),
    queryFn: () => incomeService.getIncomesByBalance(balanceId),
    enabled: enabled && !!balanceId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook to get a specific income by ID
export const useGetIncome = (incomeId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.INCOME.GET(incomeId),
    queryFn: () => incomeService.getIncome(incomeId),
    enabled: enabled && !!incomeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook to create a new income
export const useCreateIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IncomeCreate) => incomeService.createIncome(data),
    onSuccess: (newIncome) => {
      // Add to individual income cache
      queryClient.setQueryData(
        QUERY_KEYS.INCOME.GET(newIncome.id),
        newIncome
      );
      
      // Invalidate income lists
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INCOME.LIST()
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INCOME.LIST(newIncome.balance_id)
      });
      
      // Invalidate balance data (balance might be affected)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BALANCE.GET(newIncome.balance_id)
      });
      
      // Invalidate suggestions (financial picture changed)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SUGGESTIONS.GET(newIncome.balance_id)
      });
      
      // Invalidate graphs
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GRAPH.GET(newIncome.balance_id)
      });
    },
    onError: (error) => {
      console.error('Failed to create income:', error);
    },
  });
};

// Hook to update an income
export const useUpdateIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IncomeUpdate }) =>
      incomeService.updateIncome(id, data),
    onSuccess: (updatedIncome, { id }) => {
      // Update individual income cache
      queryClient.setQueryData(
        QUERY_KEYS.INCOME.GET(id),
        updatedIncome
      );
      
      // Invalidate income lists
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INCOME.LIST()
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INCOME.LIST(updatedIncome.balance_id)
      });
      
      // Invalidate related data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BALANCE.GET(updatedIncome.balance_id)
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SUGGESTIONS.GET(updatedIncome.balance_id)
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GRAPH.GET(updatedIncome.balance_id)
      });
    },
    onError: (error) => {
      console.error('Failed to update income:', error);
    },
  });
};

// Hook to delete an income
export const useDeleteIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (incomeId: number) => incomeService.deleteIncome(incomeId),
    onMutate: async (incomeId) => {
      // Get the current income data to know which balance to invalidate
      const currentIncome = queryClient.getQueryData<Income>(
        QUERY_KEYS.INCOME.GET(incomeId)
      );
      return { balanceId: currentIncome?.balance_id };
    },
    onSuccess: (_, incomeId, context) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.INCOME.GET(incomeId)
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INCOME.LIST()
      });
      
      if (context?.balanceId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.INCOME.LIST(context.balanceId)
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
      console.error('Failed to delete income:', error);
    },
  });
};

// Hook to get income statistics
export const useGetIncomeStats = (balanceId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['income-stats', balanceId],
    queryFn: () => incomeService.getIncomeStats(balanceId),
    enabled: enabled && !!balanceId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Combined hook for income operations
export const useIncomeOperations = (balanceId?: number) => {
  const { data: incomes, isLoading, error } = useGetIncomesByBalance(
    balanceId!, 
    !!balanceId
  );
  const { data: stats, isLoading: statsLoading } = useGetIncomeStats(
    balanceId!, 
    !!balanceId
  );
  
  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();
  const deleteMutation = useDeleteIncome();
  
  const isAnyLoading = isLoading || 
    statsLoading ||
    createMutation.isPending || 
    updateMutation.isPending || 
    deleteMutation.isPending;

  const hasError = error || 
    createMutation.error || 
    updateMutation.error || 
    deleteMutation.error;

  return {
    // Data
    incomes: incomes || [],
    stats,
    
    // Loading states
    isLoading: isAnyLoading,
    
    // Error states
    error: hasError,
    
    // Operations
    createIncome: createMutation.mutateAsync,
    updateIncome: (id: number, data: IncomeUpdate) => 
      updateMutation.mutateAsync({ id, data }),
    deleteIncome: deleteMutation.mutateAsync,
    
    // Computed values
    totalIncome: stats?.total || 0,
    incomeCount: incomes?.length || 0,
    
    // Individual mutation states
    mutations: {
      create: createMutation,
      update: updateMutation,
      delete: deleteMutation,
    }
  };
};