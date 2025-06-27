// src/hooks/useBalance.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { balanceService } from '../services/balance.service';
import { Balance, BalanceCreate, BalanceUpdate } from '../types/financial.types';
import { QUERY_KEYS } from '../utils/constants';

// Hook to get a balance by ID
export const useGetBalance = (balanceId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.BALANCE.GET(balanceId),
    queryFn: () => balanceService.getBalance(balanceId),
    enabled: enabled && !!balanceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to create a new balance
export const useCreateBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BalanceCreate) => balanceService.createBalance(data),
    onSuccess: (newBalance) => {
      // Add the new balance to the cache
      queryClient.setQueryData(
        QUERY_KEYS.BALANCE.GET(newBalance.id),
        newBalance
      );
      
      // Invalidate any lists that might contain balances
      queryClient.invalidateQueries({
        queryKey: ['balances'] // If you have a list query
      });
    },
    onError: (error) => {
      console.error('Failed to create balance:', error);
    },
  });
};

// Hook to update a balance
export const useUpdateBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BalanceUpdate }) =>
      balanceService.updateBalance(id, data),
    onSuccess: (updatedBalance, { id }) => {
      // Update the balance in the cache
      queryClient.setQueryData(
        QUERY_KEYS.BALANCE.GET(id),
        updatedBalance
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BALANCE.GET(id)
      });
      
      // Invalidate any income/expense queries that depend on this balance
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INCOME.LIST(id)
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXPENSE.LIST(id)
      });
    },
    onError: (error) => {
      console.error('Failed to update balance:', error);
    },
  });
};

// Hook to delete a balance
export const useDeleteBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (balanceId: number) => balanceService.deleteBalance(balanceId),
    onSuccess: (_, balanceId) => {
      // Remove the balance from cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.BALANCE.GET(balanceId)
      });
      
      // Remove related data
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.INCOME.LIST(balanceId)
      });
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.EXPENSE.LIST(balanceId)
      });
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.SUGGESTIONS.GET(balanceId)
      });
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.GRAPH.GET(balanceId)
      });
      
      // Invalidate balance lists
      queryClient.invalidateQueries({
        queryKey: ['balances']
      });
    },
    onError: (error) => {
      console.error('Failed to delete balance:', error);
    },
  });
};

// Hook to get balance graph data
export const useGetBalanceGraph = (balanceId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.GRAPH.GET(balanceId),
    queryFn: () => balanceService.getBalanceGraph(balanceId),
    enabled: enabled && !!balanceId,
    staleTime: 10 * 60 * 1000, // 10 minutes - graph data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook to validate if a balance exists
export const useValidateBalance = (balanceId: number) => {
  return useQuery({
    queryKey: ['validate-balance', balanceId],
    queryFn: () => balanceService.validateBalance(balanceId),
    enabled: !!balanceId,
    retry: false, // Don't retry validation failures
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Combined hook for balance operations (business logic)
export const useBalanceOperations = (balanceId: number) => {
  const { data: balance, isLoading, error } = useGetBalance(balanceId);
  const createMutation = useCreateBalance();
  const updateMutation = useUpdateBalance();
  const deleteMutation = useDeleteBalance();
  
  const isAnyLoading = isLoading || 
    createMutation.isPending || 
    updateMutation.isPending || 
    deleteMutation.isPending;

  const hasError = error || 
    createMutation.error || 
    updateMutation.error || 
    deleteMutation.error;

  return {
    // Data
    balance,
    
    // Loading states
    isLoading: isAnyLoading,
    
    // Error states
    error: hasError,
    
    // Operations
    createBalance: createMutation.mutateAsync,
    updateBalance: (data: BalanceUpdate) => 
      updateMutation.mutateAsync({ id: balanceId, data }),
    deleteBalance: () => deleteMutation.mutateAsync(balanceId),
    
    // Individual mutation states (for granular control)
    mutations: {
      create: createMutation,
      update: updateMutation,
      delete: deleteMutation,
    }
  };
};

export const useGetCurrentUserBalance = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['currentUserBalance'],
    queryFn: () => balanceService.getCurrentUserBalance(),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Don't retry 404 errors (user has no balance)
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
  });
};