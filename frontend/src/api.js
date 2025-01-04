import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const getBalance = (balanceId) => {
    return axios.get(`${API_BASE_URL}/balance/${balanceId}`);
};

export const setBalance = (balance) => {
    return axios.post(`${API_BASE_URL}/balance`, balance);
};

export const getIncomes = () => {
    return axios.get(`${API_BASE_URL}/incomes`);
};

export const addIncome = (income) => {
    return axios.post(`${API_BASE_URL}/incomes`, income);
};

export const getExpenses = () => {
    return axios.get(`${API_BASE_URL}/expenses`);
};

export const addExpense = (expense) => {
    return axios.post(`${API_BASE_URL}/expenses`, expense);
};

export const getSuggestions = (balanceId) => {
    return axios.get(`${API_BASE_URL}/suggestions/${balanceId}`);
};
