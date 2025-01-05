import React, { useState, useEffect } from 'react';
import { getIncomes, addIncome } from '../api';

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
            setIncomes([]); // Default state if fetch fails
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
            onSubmit();
        } catch (error) {
            console.error('Error adding income:', error);
        }
    };

    return (
        <div>
            <h2>What is your source of income?</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Source:
                    <input
                        type="text"
                        name="source"
                        value={income.source}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    How much do you get per month?
                    <input
                        type="number"
                        name="amount"
                        value={income.amount}
                        onChange={handleChange}
                    />
                </label>
                <button type="submit">Add Income</button>
            </form>
            <div>
                <h3>Incomes</h3>
                <ul>
                    {incomes.map((inc, index) => (
                        <li key={index}>
                            {inc.source}: {inc.amount}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Income;
