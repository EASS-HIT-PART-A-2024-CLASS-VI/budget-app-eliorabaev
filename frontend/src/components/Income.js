import React, { useState, useEffect } from 'react';
import { getIncomes, addIncome } from '../api';
import '../static/css/StepStyles.css';

const Income = ({ onSubmit }) => {
    const [incomes, setIncomes] = useState([]);
    const [income, setIncome] = useState({ balance_id: 1, source: '', amount: '' });

    useEffect(() => {
        fetchIncomes();
    }, []);

    const fetchIncomes = async () => {
        try {
            const response = await getIncomes();
            setIncomes(response.data || []);
        } catch (error) {
            console.error('Error fetching incomes:', error);
        }
    };

    const handleChange = (e) => {
        setIncome({ ...income, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addIncome(income);
            setIncomes([...incomes, income]);
            setIncome({ balance_id: 1, source: '', amount: '' }); // Reset form
            onSubmit();
        } catch (error) {
            console.error('Error adding income:', error);
        }
    };

    return (
        <div className="step-container">
            <h2 className="step-title">Add Your Income Sources</h2>
            <form className="step-form" onSubmit={handleSubmit}>
                <label>
                    Source:
                    <input
                        type="text"
                        name="source"
                        value={income.source}
                        onChange={handleChange}
                        className="step-input"
                        placeholder="e.g., Job, Freelance"
                        required
                    />
                </label>
                <label>
                    Amount:
                    <input
                        type="number"
                        name="amount"
                        value={income.amount}
                        onChange={handleChange}
                        className="step-input"
                        placeholder="Enter amount"
                        required
                    />
                </label>
                <button type="submit" className="step-button">Add Income</button>
            </form>
            <div className="list-container">
                <h3>Your Income Sources</h3>
                <ul>
                    {incomes.map((inc, index) => (
                        <li key={index} className="list-item">
                            <span>{inc.source}</span>
                            <span>${inc.amount}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Income;
