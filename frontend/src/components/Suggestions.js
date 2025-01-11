import React, { useState } from 'react';
import { getSuggestions } from '../api';
import '../static/css/StepStyles.css';

const Suggestions = ({ balanceId }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const response = await getSuggestions(balanceId);
            setSuggestions(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setLoading(false);
        }
    };

    return (
        <div className="step-container">
            <h2 className="step-title">Financial Suggestions</h2>
            <button
                onClick={fetchSuggestions}
                className="step-button"
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Get Suggestions'}
            </button>
            <div className="suggestions-list">
                {suggestions.length > 0 ? (
                    <ul>
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="suggestions-list-item">
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
