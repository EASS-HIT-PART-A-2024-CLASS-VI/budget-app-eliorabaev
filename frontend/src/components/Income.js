import React, { useState, useEffect } from 'react';
import { getIncomes, addIncome, updateIncome } from '../api'; // Import updateIncome function
import '../static/css/StepStyles.css';

const Income = ({ onSubmit }) => {
    const [incomes, setIncomes] = useState([]);
    const [income, setIncome] = useState({ balance_id: 1, source: '', amount: '' });
    const [editId, setEditId] = useState(null); // Track the ID of the income being edited
    const [editAmount, setEditAmount] = useState(''); // Track the new amount during editing

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

    const handleAddIncome = async (e) => {
        e.preventDefault();
        if (!income.source || !income.amount) {
            alert("Please fill in all fields before adding an income.");
            return;
        }
        try {
            const response = await addIncome(income);
            setIncomes([...incomes, response.data]); // Add income to the list
            setIncome({ balance_id: 1, source: '', amount: '' }); // Reset the form
        } catch (error) {
            console.error('Error adding income:', error);
        }
    };

    const handleEditClick = (id, amount) => {
        setEditId(id); // Set the ID of the income being edited
        setEditAmount(amount); // Pre-fill the amount input with the current value
    };

    const handleEditChange = (e) => {
        setEditAmount(e.target.value);
    };

    const handleEditSave = async (id) => {
        try {
            await updateIncome(id, { amount: parseFloat(editAmount) }); // Update the income amount
            setIncomes(incomes.map((inc) => (inc.id === id ? { ...inc, amount: parseFloat(editAmount) } : inc))); // Update state
            setEditId(null); // Exit edit mode
        } catch (error) {
            console.error('Error updating income:', error);
        }
    };

    const handleNext = () => {
        if (incomes.length === 0) {
            alert("Please add at least one income before proceeding.");
            return;
        }
        onSubmit(incomes); // Pass incomes to the parent component
    };

    return (
        <div className="step-container">
            <h2 className="step-title">Add Your Income Sources</h2>
            <form className="step-form" onSubmit={handleAddIncome}>
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
                <div className="buttons">
                    <button type="submit" className="step-button">Add Income</button>
                    <button type="button" onClick={handleNext} className="secondary-button">Next</button>
                </div>
            </form>
            <div className="list-container">
                <h3>Your Income Sources</h3>
                {incomes.length > 0 ? (
                    <ul>
                        {incomes.map((inc) => (
                            <li key={inc.id} className="list-item">
                                <span>{inc.source}</span>
                                {editId === inc.id ? (
                                    <div className="edit-container">
                                        <input
                                            type="number"
                                            value={editAmount}
                                            onChange={handleEditChange}
                                            className="edit-input"
                                        />
                                        <button
                                            onClick={() => handleEditSave(inc.id)}
                                            className="save-button"
                                        >
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span>${inc.amount}</span>
                                        <button
                                            onClick={() => handleEditClick(inc.id, inc.amount)}
                                            className="edit-button"
                                        >
                                            ✏️
                                        </button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No incomes added yet.</p>
                )}
            </div>
        </div>
    );
};

export default Income;
