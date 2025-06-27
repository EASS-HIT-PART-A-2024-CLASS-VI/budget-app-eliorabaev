// src/services/income.service.ts
import { apiClient } from './api';
import { 
  Income, 
  IncomeCreate, 
  IncomeUpdate 
} from '../types/financial.types';
import { API_ENDPOINTS } from '../utils/constants';

export interface GetIncomesParams {
  balance_id?: number;
  skip?: number;
  limit?: number;
}

export const incomeService = {
  // Create a new income
  async createIncome(data: IncomeCreate): Promise<Income> {
    const response = await apiClient.post<Income>(API_ENDPOINTS.INCOME.CREATE, data);
    return response.data;
  },

  // Get all incomes with optional filtering
  async getIncomes(params: GetIncomesParams = {}): Promise<Income[]> {
    const response = await apiClient.get<Income[]>(API_ENDPOINTS.INCOME.LIST, { 
      params 
    });
    return response.data;
  },

  // Get incomes by balance ID
  async getIncomesByBalance(balanceId: number): Promise<Income[]> {
    return this.getIncomes({ balance_id: balanceId });
  },

  // Get specific income by ID
  async getIncome(id: number): Promise<Income> {
    const response = await apiClient.get<Income>(API_ENDPOINTS.INCOME.GET(id));
    return response.data;
  },

  // Update income
  async updateIncome(id: number, data: IncomeUpdate): Promise<Income> {
    const response = await apiClient.patch<Income>(API_ENDPOINTS.INCOME.UPDATE(id), data);
    return response.data;
  },

  // Delete income
  async deleteIncome(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.INCOME.DELETE(id));
  },

  // Calculate total income for a balance
  async getTotalIncome(balanceId: number): Promise<number> {
    const incomes = await this.getIncomesByBalance(balanceId);
    return incomes.reduce((total, income) => total + income.amount, 0);
  },

  // Get income statistics
  async getIncomeStats(balanceId: number): Promise<{
    total: number;
    count: number;
    average: number;
    sources: { source: string; amount: number; count: number }[];
  }> {
    const incomes = await this.getIncomesByBalance(balanceId);
    
    const total = incomes.reduce((sum, income) => sum + income.amount, 0);
    const count = incomes.length;
    const average = count > 0 ? total / count : 0;
    
    // Group by source
    const sourceMap = new Map<string, { amount: number; count: number }>();
    incomes.forEach(income => {
      const existing = sourceMap.get(income.source) || { amount: 0, count: 0 };
      sourceMap.set(income.source, {
        amount: existing.amount + income.amount,
        count: existing.count + 1
      });
    });
    
    const sources = Array.from(sourceMap.entries()).map(([source, data]) => ({
      source,
      amount: data.amount,
      count: data.count
    }));
    
    return { total, count, average, sources };
  }
};