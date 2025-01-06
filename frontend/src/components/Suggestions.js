import React, { useState } from 'react';
import { getSuggestions } from '../api';

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
        <div>
            <h2>Get Financial Suggestions</h2>
            <button onClick={fetchSuggestions}>Get Suggestions</button>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <h3>Financial Suggestions</h3>
                    <ul>
                        {suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Suggestions;
