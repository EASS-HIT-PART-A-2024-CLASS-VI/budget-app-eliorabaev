// src/hooks/useFinancialOverview.ts
import { useMemo } from 'react';
import { useBalanceOperations } from './useBalance';
import { useIncomeOperations } from './useIncomes';
import { useExpenseOperations } from './useExpenses';
import { useSuggestionsOperations } from './useSuggestions';

interface FinancialInsights {
  cashFlow: {
    net: number;
    status: 'positive' | 'negative' | 'neutral';
    trend: 'improving' | 'declining' | 'stable';
  };
  spending: {
    rate: number; // expenses as percentage of income
    topCategory: string | null;
    diversification: 'high' | 'medium' | 'low';
  };
  growth: {
    potential: number; // projected growth based on current trends
    savingsRate: number; // percentage of income saved
    recommendation: string;
  };
  risks: string[];
  opportunities: string[];
}

interface FinancialSummary {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  incomeSourcesCount: number;
  expensesCategoriesCount: number;
  suggestionsCount: number;
  lastUpdated: Date;
}

export const useFinancialOverview = (balanceId: number | undefined) => {
  // Data hooks
  const {
    balance,
    isLoading: balanceLoading,
    error: balanceError,
  } = useBalanceOperations(balanceId!);
  
  const {
    incomes,
    stats: incomeStats,
    totalIncome,
    isLoading: incomeLoading,
    error: incomeError,
  } = useIncomeOperations(balanceId);
  
  const {
    expenses,
    stats: expenseStats,
    totalExpenses,
    topCategories,
    isLoading: expenseLoading,
    error: expenseError,
  } = useExpenseOperations(balanceId);
  
  const {
    suggestions,
    summary: suggestionsSummary,
    isLoading: suggestionsLoading,
    hasData: hasSuggestions,
    cashFlowStatus,
  } = useSuggestionsOperations(balanceId!);

  // Computed values
  const netCashFlow = totalIncome - totalExpenses;
  
  // Financial insights calculation
  const insights: FinancialInsights = useMemo(() => {
    // Cash flow analysis
    const cashFlowStatus = netCashFlow > 0 ? 'positive' : netCashFlow < 0 ? 'negative' : 'neutral';
    
    // Spending analysis
    const spendingRate = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
    const topCategory = expenseStats?.categories?.[0]?.category || null;
    
    // Determine spending diversification
    const categoryCount = expenseStats?.categories?.length || 0;
    const diversification = categoryCount > 5 ? 'high' : categoryCount > 2 ? 'medium' : 'low';
    
    // Growth potential
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const annualSavings = netCashFlow * 12;
    const projectedGrowth = annualSavings * 1.08; // Assuming 8% growth
    
    // Recommendations based on savings rate
    let recommendation = '';
    if (savingsRate >= 20) {
      recommendation = 'Excellent savings rate! Consider investing for long-term growth.';
    } else if (savingsRate >= 10) {
      recommendation = 'Good savings rate. Try to increase to 20% for optimal growth.';
    } else if (savingsRate >= 0) {
      recommendation = 'Low savings rate. Focus on expense reduction and income increase.';
    } else {
      recommendation = 'Negative savings. Immediate budget review and expense cuts needed.';
    }
    
    // Risk assessment
    const risks: string[] = [];
    if (netCashFlow < 0) risks.push('Negative cash flow - spending exceeds income');
    if (incomeStats && incomeStats.sources.length === 1) risks.push('Single income source dependency');
    if (spendingRate > 90) risks.push('High spending rate - limited financial cushion');
    if (!balance || balance.amount < totalExpenses) risks.push('Low emergency fund');
    
    // Opportunities
    const opportunities: string[] = [];
    if (savingsRate > 0 && savingsRate < 20) opportunities.push('Increase savings rate for better growth');
    if (diversification === 'low') opportunities.push('Diversify spending categories for better budgeting');
    if (topCategory && expenseStats) {
      const topCategoryPercent = expenseStats.categories[0]?.percentage || 0;
      if (topCategoryPercent > 40) {
        opportunities.push(`Reduce ${topCategory} spending - it's ${topCategoryPercent.toFixed(0)}% of expenses`);
      }
    }
    if (incomeStats && incomeStats.sources.length === 1) {
      opportunities.push('Consider additional income sources');
    }
    
    return {
      cashFlow: {
        net: netCashFlow,
        status: cashFlowStatus,
        trend: 'stable', // This would need historical data to determine
      },
      spending: {
        rate: spendingRate,
        topCategory,
        diversification,
      },
      growth: {
        potential: projectedGrowth,
        savingsRate,
        recommendation,
      },
      risks,
      opportunities,
    };
  }, [
    netCashFlow,
    totalIncome,
    totalExpenses,
    expenseStats,
    incomeStats,
    balance,
  ]);

  // Financial summary
  const summary: FinancialSummary = useMemo(() => ({
    balance: balance?.amount || 0,
    totalIncome,
    totalExpenses,
    netCashFlow,
    incomeSourcesCount: incomes?.length || 0,
    expensesCategoriesCount: expenseStats?.categories?.length || 0,
    suggestionsCount: suggestions?.suggestions?.length || 0,
    lastUpdated: new Date(),
  }), [
    balance,
    totalIncome,
    totalExpenses,
    netCashFlow,
    incomes,
    expenseStats,
    suggestions,
  ]);

  // Loading and error states
  const isLoading = balanceLoading || incomeLoading || expenseLoading || suggestionsLoading;
  const hasError = balanceError || incomeError || expenseError;
  
  // Data availability
  const hasData = !!balance && (totalIncome > 0 || totalExpenses > 0);
  const isReady = !!balanceId && !isLoading && hasData;

  // Health score (0-100)
  const healthScore = useMemo(() => {
    if (!hasData) return 0;
    
    let score = 50; // Base score
    const currentSavingsRate = insights.growth.savingsRate;
    
    // Cash flow impact (±30 points)
    if (netCashFlow > 0) {
      score += Math.min(30, (currentSavingsRate / 20) * 30); // Max 30 points for 20%+ savings rate
    } else {
      score -= 30;
    }
    
    // Diversification impact (±10 points)
    if (insights.spending.diversification === 'high') score += 10;
    else if (insights.spending.diversification === 'low') score -= 10;
    
    // Income diversification (±10 points)
    const incomeSourcesCount = incomeStats?.sources?.length || 0;
    if (incomeSourcesCount > 2) score += 10;
    else if (incomeSourcesCount === 1) score -= 10;
    
    // Emergency fund (±20 points)
    const emergencyFundMonths = balance ? balance.amount / (totalExpenses || 1) : 0;
    if (emergencyFundMonths >= 6) score += 20;
    else if (emergencyFundMonths >= 3) score += 10;
    else if (emergencyFundMonths < 1) score -= 20;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [hasData, netCashFlow, insights, incomeStats, balance, totalExpenses]);

  // Quick actions suggestions
  const quickActions = useMemo(() => {
    const actions: Array<{
      type: 'income' | 'expense' | 'balance';
      priority: 'high' | 'medium' | 'low';
      action: string;
      reason: string;
    }> = [];

    if (netCashFlow < 0) {
      actions.push({
        type: 'expense',
        priority: 'high',
        action: 'Reduce expenses immediately',
        reason: 'You are spending more than you earn',
      });
    }

    if (insights.spending.rate > 80) {
      actions.push({
        type: 'income',
        priority: 'high',
        action: 'Increase income sources',
        reason: 'High spending rate leaves little room for savings',
      });
    }

    if (incomeStats?.sources?.length === 1) {
      actions.push({
        type: 'income',
        priority: 'medium',
        action: 'Diversify income sources',
        reason: 'Reduce dependency on single income source',
      });
    }

    if (balance && balance.amount < totalExpenses) {
      actions.push({
        type: 'balance',
        priority: 'high',
        action: 'Build emergency fund',
        reason: 'Your balance is less than monthly expenses',
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [netCashFlow, insights, incomeStats, balance, totalExpenses]);

  return {
    // Data
    summary,
    insights,
    healthScore,
    quickActions,
    
    // Raw data access
    balance,
    incomes: incomes || [],
    expenses: expenses || [],
    suggestions,
    topCategories: topCategories || [],
    
    // States
    isLoading,
    hasError,
    hasData,
    isReady,
    hasSuggestions,
    
    // Computed values
    netCashFlow,
    savingsRate: insights.growth.savingsRate,
    spendingRate: insights.spending.rate,
    
    // Status indicators
    cashFlowStatus: insights.cashFlow.status,
    financialHealth: healthScore >= 70 ? 'good' : healthScore >= 40 ? 'fair' : 'poor',
  };
};