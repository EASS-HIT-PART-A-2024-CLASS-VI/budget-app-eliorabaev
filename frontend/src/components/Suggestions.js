import React, { useState } from 'react';
import { getSuggestions } from '../api';

const Suggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [balanceId, setBalanceId] = useState(1);

    const fetchSuggestions = async () => {
        try {
            const response = await getSuggestions(balanceId);
            setSuggestions(response.data || []);
            console.log('Suggestions fetched:', response.data);  // Log fetched suggestions
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleChange = (e) => {
        setBalanceId(e.target.value);
    };

    const handleButtonClick = () => {
        fetchSuggestions();
    };

    return (
        <div>
            <h2>Suggestions</h2>
            <label>
                Balance ID:
                <input type="number" value={balanceId} onChange={handleChange} />
            </label>
            <button onClick={handleButtonClick}>Get Suggestions</button>
            <div>
                <h3>Financial Suggestions</h3>
                <ul>
                    {suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Suggestions;
