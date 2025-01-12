import React, { useState } from 'react';
import { getSuggestions } from '../api';
import '../static/css/StepStyles.css';

const Suggestions = () => {
    const [suggestions, setSuggestions] = useState([]);

    const fetchSuggestions = async () => {
        const hardcodedBalanceId = 1; // Hardcoded balance ID
        try {
            const response = await getSuggestions(hardcodedBalanceId);
            setSuggestions(response.data || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error.response?.data || error.message);
        }
    };

    return (
        <div className="step-container">
            <h2 className="step-title">Financial Suggestions</h2>
            <button
                onClick={fetchSuggestions}
                className="step-button"
            >
                Get Suggestions
            </button>
            <div className="list-container">
                {suggestions.length > 0 ? (
                    <ul>
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="list-item">
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No suggestions available yet.</p>
                )}
            </div>
        </div>
    );
};

export default Suggestions;
