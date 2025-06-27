// src/services/expense.service.ts
import { apiClient } from './api';
import { 
  Expense, 
  ExpenseCreate, 
  ExpenseUpdate 
} from '../types/financial.types';
import { API_ENDPOINTS } from '../utils/constants';

export interface GetExpensesParams {
  balance_id?: number;
  skip?: number;
  limit?: number;
}

export const expenseService = {
  // Create a new expense
  async createExpense(data: ExpenseCreate): Promise<Expense> {
    const response = await apiClient.post<Expense>(API_ENDPOINTS.EXPENSE.CREATE, data);
    return response.data;
  },

  // Get all expenses with optional filtering
  async getExpenses(params: GetExpensesParams = {}): Promise<Expense[]> {
    const response = await apiClient.get<Expense[]>(API_ENDPOINTS.EXPENSE.LIST, { 
      params 
    });
    return response.data;
  },

  // Get expenses by balance ID
  async getExpensesByBalance(balanceId: number): Promise<Expense[]> {
    return this.getExpenses({ balance_id: balanceId });
  },

  // Get specific expense by ID
  async getExpense(id: number): Promise<Expense> {
    const response = await apiClient.get<Expense>(API_ENDPOINTS.EXPENSE.GET(id));
    return response.data;
  },

  // Update expense
  async updateExpense(id: number, data: ExpenseUpdate): Promise<Expense> {
    const response = await apiClient.patch<Expense>(API_ENDPOINTS.EXPENSE.UPDATE(id), data);
    return response.data;
  },

  // Delete expense
  async deleteExpense(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.EXPENSE.DELETE(id));
  },

  // Calculate total expenses for a balance
  async getTotalExpenses(balanceId: number): Promise<number> {
    const expenses = await this.getExpensesByBalance(balanceId);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  },

  // Get expense statistics
  async getExpenseStats(balanceId: number): Promise<{
    total: number;
    count: number;
    average: number;
    categories: { category: string; amount: number; count: number; percentage: number }[];
  }> {
    const expenses = await this.getExpensesByBalance(balanceId);
    
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const count = expenses.length;
    const average = count > 0 ? total / count : 0;
    
    // Group by category
    const categoryMap = new Map<string, { amount: number; count: number }>();
    expenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || { amount: 0, count: 0 };
      categoryMap.set(expense.category, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1
      });
    });
    
    const categories = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? (data.amount / total) * 100 : 0
    }));
    
    // Sort by amount descending
    categories.sort((a, b) => b.amount - a.amount);
    
    return { total, count, average, categories };
  },

  // Get top spending categories
  async getTopCategories(balanceId: number, limit: number = 5): Promise<{
    category: string;
    amount: number;
    percentage: number;
  }[]> {
    const stats = await this.getExpenseStats(balanceId);
    return stats.categories.slice(0, limit).map(cat => ({
      category: cat.category,
      amount: cat.amount,
      percentage: cat.percentage
    }));
  }
};