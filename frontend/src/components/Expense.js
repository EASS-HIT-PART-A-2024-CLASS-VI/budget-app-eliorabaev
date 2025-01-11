import React, { useState, useEffect } from 'react';
import { getExpenses, addExpense } from '../api';
import '../static/css/StepStyles.css';

const Expense = ({ onSubmit }) => {
    const [expenses, setExpenses] = useState([]);
    const [expense, setExpense] = useState({ balance_id: 1, category: '', amount: '' });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await getExpenses();
            setExpenses(response.data || []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            setExpenses([]);
        }
    };

    const handleChange = (e) => {
        setExpense({ ...expense, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addExpense(expense);
            setExpenses([...expenses, expense]);
            setExpense({ balance_id: 1, category: '', amount: '' }); // Reset form
            onSubmit();
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    return (
        <div className="step-container">
            <h2 className="step-title">Track Your Expenses</h2>
            <form className="step-form" onSubmit={handleSubmit}>
                <label>
                    Category:
                    <input
                        type="text"
                        name="category"
                        value={expense.category}
                        onChange={handleChange}
                        className="step-input"
                        placeholder="e.g., Food, Rent"
                        required
                    />
                </label>
                <label>
                    Amount:
                    <input
                        type="number"
                        name="amount"
                        value={expense.amount}
                        onChange={handleChange}
                        className="step-input"
                        placeholder="Enter amount"
                        required
                    />
                </label>
                <button type="submit" className="step-button">Add Expense</button>
            </form>
            <div className="expense-list">
                <h3>Your Expenses</h3>
                <ul>
                    {expenses.map((exp, index) => (
                        <li key={index} className="expense-list-item">
                            <span>{exp.category}</span>: <span>${exp.amount}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Expense;
