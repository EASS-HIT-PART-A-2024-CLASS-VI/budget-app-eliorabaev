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
        }
    };

    const handleChange = (e) => {
        setExpense({ ...expense, [e.target.name]: e.target.value });
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!expense.category || !expense.amount) {
            alert('Please fill in all fields before adding an expense.');
            return;
        }
        try {
            await addExpense(expense);
            setExpenses([...expenses, expense]); // Add expense to the list
            setExpense({ balance_id: 1, category: '', amount: '' }); // Reset the form
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    const handleNext = () => {
        if (expenses.length === 0) {
            alert('Please add at least one expense before proceeding.');
            return;
        }
        onSubmit(expenses); // Pass expenses to the parent component
    };

    return (
        <div className="step-container">
            <h2 className="step-title">Track Your Expenses</h2>
            <form className="step-form" onSubmit={handleAddExpense}>
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
                <div className="buttons">
                    <button type="submit" className="step-button">Add Expense</button>
                    <button onClick={handleNext} className="secondary-button">Next</button>
                </div>
            </form>
            <div className="list-container">
                <h3>Your Expenses</h3>
                {expenses.length > 0 ? (
                    <ul>
                        {expenses.map((exp, index) => (
                            <li key={index} className="list-item">
                                <span>{exp.category}</span>
                                <span>${exp.amount}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No expenses added yet.</p>
                )}
            </div>
        </div>
    );
};

export default Expense;
