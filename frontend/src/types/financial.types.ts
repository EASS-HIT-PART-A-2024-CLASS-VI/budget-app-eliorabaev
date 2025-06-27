export interface Balance {
  id: number;
  amount: number;
}

export interface Income {
  id: number;
  balance_id: number;
  source: string;
  amount: number;
  created_at: string;
}

export interface Expense {
  id: number;
  balance_id: number;
  category: string;
  amount: number;
  created_at: string;
}

export interface FinancialSuggestion {
  category: string;
  details: string;
  priority: number;
  impact: string;
  level_of_effort: string;
  steps: string[];
  reference_url?: string;
}

export interface SuggestionResponse {
  balance_id: number;
  current_balance: number;
  total_income: number;
  total_expense: number;
  analysis: {
    cash_flow_status: string;
    summary: string;
    warnings: string[];
    positives: string[];
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  suggestions: FinancialSuggestion[];
  generated_at: string;
}

export interface GraphData {
  balance_graph: Array<{ year: number; balance: number }>;
  projected_revenue: Array<{ year: number; projected_balance: number }>;
}

// Create/Update types
export interface BalanceCreate {
  amount: number;
}

export interface IncomeCreate {
  balance_id: number;
  source: string;
  amount: number;
}

export interface ExpenseCreate {
  balance_id: number;
  category: string;
  amount: number;
}

// Update types (partial)
export interface BalanceUpdate {
  amount?: number;
}

export interface IncomeUpdate {
  balance_id?: number;
  source?: string;
  amount?: number;
}

export interface ExpenseUpdate {
  balance_id?: number;
  category?: string;
  amount?: number;
}