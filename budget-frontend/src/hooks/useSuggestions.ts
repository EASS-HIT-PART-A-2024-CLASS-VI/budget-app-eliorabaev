// src/hooks/useSuggestions.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { suggestionService } from '../services/suggestion.service';
import { SuggestionResponse } from '../types/financial.types';
import { QUERY_KEYS } from '../utils/constants';

// Hook to get cached suggestions
export const useGetSuggestions = (balanceId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.SUGGESTIONS.GET(balanceId),
    queryFn: () => suggestionService.getSuggestions(balanceId),
    enabled: enabled && !!balanceId,
    staleTime: 15 * 60 * 1000, // 15 minutes - AI suggestions don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: false, // Don't retry if suggestions don't exist
  });
};

// Hook to generate new suggestions
export const useGenerateSuggestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (balanceId: number) => suggestionService.generateSuggestions(balanceId),
    onSuccess: (suggestions, balanceId) => {
      // Update the suggestions cache
      queryClient.setQueryData(
        QUERY_KEYS.SUGGESTIONS.GET(balanceId),
        suggestions
      );
    },
    onError: (error) => {
      console.error('Failed to generate suggestions:', error);
    },
  });
};

// Hook to get suggestions with automatic generation fallback
export const useGetSuggestionsWithFallback = (balanceId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.SUGGESTIONS.GET(balanceId),
    queryFn: () => suggestionService.getSuggestionsWithFallback(balanceId),
    enabled: enabled && !!balanceId,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// Hook to check if suggestions exist
export const useHasSuggestions = (balanceId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['has-suggestions', balanceId],
    queryFn: () => suggestionService.hasSuggestions(balanceId),
    enabled: enabled && !!balanceId,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: false,
  });
};

// Hook to get suggestions summary for dashboard widgets
export const useGetSuggestionsSummary = (balanceId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['suggestions-summary', balanceId],
    queryFn: () => suggestionService.getSuggestionsSummary(balanceId),
    enabled: enabled && !!balanceId,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

// Hook for suggestion analysis and parsing
export const useSuggestionAnalysis = (suggestion: SuggestionResponse['suggestions'][0] | null) => {
  return useQuery({
    queryKey: ['suggestion-analysis', suggestion?.category, suggestion?.priority],
    queryFn: () => {
      if (!suggestion) return null;
      return suggestionService.parseSuggestionSteps(suggestion);
    },
    enabled: !!suggestion,
    staleTime: Infinity, // This data doesn't change
    gcTime: 30 * 60 * 1000,
  });
};

// Combined hook for suggestions operations
export const useSuggestionsOperations = (balanceId: number | undefined) => {
  const { 
    data: suggestions, 
    isLoading, 
    error,
    refetch 
  } = useGetSuggestionsWithFallback(balanceId!, !!balanceId);
  
  const { data: summary, isLoading: summaryLoading } = useGetSuggestionsSummary(balanceId!, !!balanceId);
  const generateMutation = useGenerateSuggestions();
  
  const isAnyLoading = isLoading || 
    summaryLoading ||
    generateMutation.isPending;

  const hasError = error || generateMutation.error;

  // Helper to refresh suggestions
  const refreshSuggestions = async () => {
    if (!balanceId) return;
    try {
      await generateMutation.mutateAsync(balanceId);
      await refetch();
    } catch (error) {
      console.error('Failed to refresh suggestions:', error);
      throw error;
    }
  };

  // Helper to get prioritized suggestions
  const getPrioritizedSuggestions = () => {
    if (!suggestions?.suggestions) return [];
    return [...suggestions.suggestions].sort((a, b) => a.priority - b.priority);
  };

  // Helper to get suggestions by category
  const getSuggestionsByCategory = () => {
    if (!suggestions?.suggestions) return {};
    
    const categoryMap: Record<string, typeof suggestions.suggestions> = {};
    suggestions.suggestions.forEach(suggestion => {
      if (!categoryMap[suggestion.category]) {
        categoryMap[suggestion.category] = [];
      }
      categoryMap[suggestion.category].push(suggestion);
    });
    
    return categoryMap;
  };

  // Helper to get high priority suggestions
  const getHighPrioritySuggestions = (maxPriority: number = 3) => {
    if (!suggestions?.suggestions) return [];
    return suggestions.suggestions.filter(s => s.priority <= maxPriority);
  };

  return {
    // Data
    suggestions,
    summary,
    
    // Loading states
    isLoading: isAnyLoading,
    
    // Error states
    error: hasError,
    
    // Operations
    generateSuggestions: () => balanceId ? generateMutation.mutateAsync(balanceId) : Promise.reject('No balance ID'),
    refreshSuggestions,
    
    // Computed values
    hasData: !!suggestions,
    suggestionsCount: suggestions?.suggestions?.length || 0,
    cashFlowStatus: suggestions?.analysis?.cash_flow_status || 'Unknown',
    
    // Helper functions
    getPrioritizedSuggestions,
    getSuggestionsByCategory,
    getHighPrioritySuggestions,
    
    // Analysis helpers
    swot: suggestions?.swot,
    analysis: suggestions?.analysis,
    
    // Individual mutation states
    mutations: {
      generate: generateMutation,
    }
  };
};