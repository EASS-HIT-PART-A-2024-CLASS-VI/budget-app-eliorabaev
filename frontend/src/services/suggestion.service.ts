// src/services/suggestion.service.ts
import { apiClient } from './api';
import { SuggestionResponse } from '../types/financial.types';
import { API_ENDPOINTS } from '../utils/constants';

export const suggestionService = {
  // Generate new AI suggestions for a balance
  async generateSuggestions(balanceId: number): Promise<SuggestionResponse> {
    const response = await apiClient.post<SuggestionResponse>(
      API_ENDPOINTS.SUGGESTIONS.GENERATE(balanceId)
    );
    return response.data;
  },

  // Get cached suggestions for a balance
  async getSuggestions(balanceId: number): Promise<SuggestionResponse> {
    const response = await apiClient.get<SuggestionResponse>(
      API_ENDPOINTS.SUGGESTIONS.GET(balanceId)
    );
    return response.data;
  },

  // Try to get cached suggestions, generate if not available
  async getSuggestionsWithFallback(balanceId: number): Promise<SuggestionResponse> {
    try {
      // First try to get cached suggestions
      return await this.getSuggestions(balanceId);
    } catch (error: any) {
      // If not found (404), generate new suggestions
      if (error.response?.status === 404) {
        return await this.generateSuggestions(balanceId);
      }
      // Re-throw other errors
      throw error;
    }
  },

  // Check if suggestions exist for a balance
  async hasSuggestions(balanceId: number): Promise<boolean> {
    try {
      await this.getSuggestions(balanceId);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  // Get suggestions summary (for dashboard widgets)
  async getSuggestionsSummary(balanceId: number): Promise<{
    hasData: boolean;
    cashFlowStatus: string;
    topPrioritySuggestion?: {
      category: string;
      details: string;
      priority: number;
    };
    suggestionsCount: number;
    lastUpdated?: string;
  }> {
    try {
      const suggestions = await this.getSuggestions(balanceId);
      
      const topPriority = suggestions.suggestions.length > 0 
        ? suggestions.suggestions.reduce((prev, current) => 
            prev.priority < current.priority ? prev : current
          )
        : undefined;

      return {
        hasData: true,
        cashFlowStatus: suggestions.analysis.cash_flow_status,
        topPrioritySuggestion: topPriority ? {
          category: topPriority.category,
          details: topPriority.details,
          priority: topPriority.priority
        } : undefined,
        suggestionsCount: suggestions.suggestions.length,
        lastUpdated: suggestions.generated_at
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          hasData: false,
          cashFlowStatus: 'Unknown',
          suggestionsCount: 0
        };
      }
      throw error;
    }
  },

  // Parse suggestion steps for better UI display
  parseSuggestionSteps(suggestion: SuggestionResponse['suggestions'][0]): {
    actionableSteps: string[];
    estimatedTimeToComplete: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  } {
    const stepCount = suggestion.steps?.length || 0;
    
    let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
    if (suggestion.level_of_effort === 'Low') difficulty = 'Easy';
    else if (suggestion.level_of_effort === 'High') difficulty = 'Hard';

    let estimatedTime = '1-2 weeks';
    if (difficulty === 'Easy') estimatedTime = '1-3 days';
    else if (difficulty === 'Hard') estimatedTime = '1-3 months';

    return {
      actionableSteps: suggestion.steps || [],
      estimatedTimeToComplete: estimatedTime,
      difficulty
    };
  }
};