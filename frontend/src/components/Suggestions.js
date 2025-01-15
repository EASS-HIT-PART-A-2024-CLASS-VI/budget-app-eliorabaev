import React, { useState, useEffect } from 'react';
import { getSuggestions } from '../api';
import ReactMarkdown from 'react-markdown';
import '../static/css/StepStyles.css';

const Suggestions = () => {
    const [suggestions, setSuggestions] = useState('');
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        // Automatically fetch suggestions if they exist in the backend
        const fetchExistingSuggestions = async () => {
            const hardcodedBalanceId = 1; // Replace with dynamic balance ID if applicable
            try {
                const response = await getSuggestions(hardcodedBalanceId);
                if (response.data.suggestions) {
                    setSuggestions(response.data.suggestions);
                    setDisabled(true); // Disable button if suggestions already exist
                }
            } catch (error) {
                console.error('Error fetching existing suggestions:', error.response?.data || error.message);
            }
        };

        fetchExistingSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        const hardcodedBalanceId = 1; // Replace with dynamic balance ID if applicable
        setLoading(true);
        try {
            const response = await getSuggestions(hardcodedBalanceId);
            const fetchedSuggestions = response.data.suggestions || 'No suggestions available.';
            setSuggestions(fetchedSuggestions);
            setDisabled(true); // Disable button after successful fetch
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
                disabled={loading || disabled}
            >
                {loading ? 'Loading...' : disabled ? 'Suggestions Loaded' : 'Get Suggestions'}
            </button>
            <div className="suggestions-container">
                {suggestions ? (
                    <ReactMarkdown className="suggestions-text">{suggestions}</ReactMarkdown>
                ) : (
                    <p>No suggestions available yet.</p>
                )}
            </div>
        </div>
    );
};

export default Suggestions;
