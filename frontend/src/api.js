import axios from 'axios';
const API_BASE_URL = '/api';

// Balance API
export const getBalance = (balanceId) => {
    return axios.get(`${API_BASE_URL}/balance/${balanceId}`);
};
export const setBalance = (balance) => {
    return axios.post(`${API_BASE_URL}/balance/`, balance);
};
export const updateBalance = (balanceId, balance) => {
    return axios.patch(`${API_BASE_URL}/balance/${balanceId}`, balance);
};
export const deleteBalance = (balanceId) => {
    return axios.delete(`${API_BASE_URL}/balance/${balanceId}`);
};

// Income API
export const getIncomes = () => {
    return axios.get(`${API_BASE_URL}/incomes/`);
};
export const addIncome = (income) => {
    return axios.post(`${API_BASE_URL}/incomes/`, income);
};
export const updateIncome = (incomeId, income) => {
    return axios.patch(`${API_BASE_URL}/incomes/${incomeId}`, income);
};
export const deleteIncome = (incomeId) => {
    return axios.delete(`${API_BASE_URL}/incomes/${incomeId}`);
};

// Expense API
export const getExpenses = () => {
    return axios.get(`${API_BASE_URL}/expenses/`);
};
export const addExpense = (expense) => {
    return axios.post(`${API_BASE_URL}/expenses/`, expense);
};
export const updateExpense = (expenseId, expense) => {
    return axios.patch(`${API_BASE_URL}/expenses/${expenseId}`, expense);
};
export const deleteExpense = (expenseId) => {
    return axios.delete(`${API_BASE_URL}/expenses/${expenseId}`);
};

// Suggestions API
export const getSuggestions = (balanceId) => {
    return axios.post(`${API_BASE_URL}/suggestions/${balanceId}`, {});
};
export const getCachedSuggestions = (balanceId) => {
    return axios.get(`${API_BASE_URL}/suggestions/${balanceId}`);
};

// Graph API
export const getBalanceGraph = (balanceId) => {
    return axios.get(`${API_BASE_URL}/balance/${balanceId}/graph`);
};
