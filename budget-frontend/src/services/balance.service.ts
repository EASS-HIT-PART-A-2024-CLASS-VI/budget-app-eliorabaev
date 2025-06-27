// src/services/balance.service.ts
import { apiClient } from './api';
import { 
  Balance, 
  BalanceCreate, 
  BalanceUpdate, 
  GraphData 
} from '../types/financial.types';
import { API_ENDPOINTS } from '../utils/constants';

export const balanceService = {
  // Create a new balance
  async createBalance(data: BalanceCreate): Promise<Balance> {
    const response = await apiClient.post<Balance>(API_ENDPOINTS.BALANCE.CREATE, data);
    return response.data;
  },

  // Get balance by ID
  async getBalance(id: number): Promise<Balance> {
    const response = await apiClient.get<Balance>(API_ENDPOINTS.BALANCE.GET(id));
    return response.data;
  },

  // Update balance
  async updateBalance(id: number, data: BalanceUpdate): Promise<Balance> {
    const response = await apiClient.patch<Balance>(API_ENDPOINTS.BALANCE.UPDATE(id), data);
    return response.data;
  },

  // Delete balance
  async deleteBalance(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.BALANCE.DELETE(id));
  },

  // Get balance graph data (charts)
  async getBalanceGraph(id: number): Promise<GraphData> {
    const response = await apiClient.get<GraphData>(API_ENDPOINTS.BALANCE.GRAPH(id));
    return response.data;
  },

  // Validate balance exists (utility function)
  async validateBalance(id: number): Promise<boolean> {
    try {
      await this.getBalance(id);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error; // Re-throw other errors
    }
  }
};