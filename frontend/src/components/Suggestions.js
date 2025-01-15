import React, { useState } from 'react';
import { getSuggestions } from '../api';
import '../static/css/StepStyles.css';

const Suggestions = () => {
    const [suggestions, setSuggestions] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchSuggestions = async () => {
        const hardcodedBalanceId = 1; // Replace with dynamic ID if needed
        setLoading(true);
        try {
            const response = await getSuggestions(hardcodedBalanceId);
            setSuggestions(response.data.suggestions || 'No suggestions available.');
        } catch (error) {
            console.error('Error fetching suggestions:', error.response?.data || error.message);
            setSuggestions('Failed to fetch suggestions. Please try again later.');
        } finally {
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
            <div className="suggestions-container">
                {suggestions ? (
                    <div
                        className="suggestions-text"
                        dangerouslySetInnerHTML={{ __html: suggestions.replace(/\n/g, '<br>') }}
                    />
                ) : (
                    <p>No suggestions available yet.</p>
                )}
            </div>
        </div>
    );
};

export default Suggestions;
