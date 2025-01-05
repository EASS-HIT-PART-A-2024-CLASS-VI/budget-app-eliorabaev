import React, { useState, useEffect } from 'react';
import { getExpenses, addExpense } from '../api';

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
            setExpenses([]); // Default state if fetch fails
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
            onSubmit();
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    return (
        <div>
            <h2>What are your expenses?</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Category:
                    <input
                        type="text"
                        name="category"
                        value={expense.category}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Amount:
                    <input
                        type="number"
                        name="amount"
                        value={expense.amount}
                        onChange={handleChange}
                    />
                </label>
                <button type="submit">Add Expense</button>
            </form>
            <div>
                <h3>Expenses</h3>
                <ul>
                    {expenses.map((exp, index) => (
                        <li key={index}>
                            {exp.category}: {exp.amount}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Expense;
