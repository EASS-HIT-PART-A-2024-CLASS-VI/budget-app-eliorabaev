import React, { useState, useEffect } from 'react';
import { getSuggestions } from '../api';
import ReactMarkdown from 'react-markdown';
import '../static/css/StepStyles.css';

const Suggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [swot, setSwot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if suggestions and analysis are already stored in sessionStorage
        const storedSuggestions = sessionStorage.getItem('suggestions');
        const storedAnalysis = sessionStorage.getItem('analysis');
        const storedSwot = sessionStorage.getItem('swot');

        if (storedSuggestions && storedAnalysis && storedSwot) {
            setSuggestions(JSON.parse(storedSuggestions));
            setAnalysis(JSON.parse(storedAnalysis));
            setSwot(JSON.parse(storedSwot));
            setDisabled(true); // Disable the button since data already exists
        } else {
            fetchExistingSuggestions(); // Fetch from backend if not in sessionStorage
        }
    }, []);

    const fetchExistingSuggestions = async () => {
        const hardcodedBalanceId = 1; // Replace with dynamic balance ID if applicable
        try {
            const response = await getSuggestions(hardcodedBalanceId);
            if (response.data.suggestions) {
                setSuggestions(response.data.suggestions);
                setAnalysis(response.data.analysis);
                setSwot(response.data.swot);
                setDisabled(true); // Disable button after successful fetch
                sessionStorage.setItem('suggestions', JSON.stringify(response.data.suggestions));
                sessionStorage.setItem('analysis', JSON.stringify(response.data.analysis));
                sessionStorage.setItem('swot', JSON.stringify(response.data.swot));
            }
        } catch (error) {
            console.error('Error fetching existing suggestions:', error.response?.data || error.message);
            setError('Failed to fetch suggestions. Please try again later.');
        }
    };

    const fetchSuggestions = async () => {
        const hardcodedBalanceId = 1; // Replace with dynamic balance ID if applicable
        setLoading(true);
        setError('');
        try {
            const response = await getSuggestions(hardcodedBalanceId);
            const fetchedSuggestions = response.data.suggestions || [];
            const fetchedAnalysis = response.data.analysis || null;
            const fetchedSwot = response.data.swot || null;

            setSuggestions(fetchedSuggestions);
            setAnalysis(fetchedAnalysis);
            setSwot(fetchedSwot);
            setDisabled(true); // Disable button after successful fetch
            sessionStorage.setItem('suggestions', JSON.stringify(fetchedSuggestions));
            sessionStorage.setItem('analysis', JSON.stringify(fetchedAnalysis));
            sessionStorage.setItem('swot', JSON.stringify(fetchedSwot));
        } catch (error) {
            console.error('Error fetching suggestions:', error.response?.data || error.message);
            setError('Failed to fetch suggestions. Please try again later.');
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
            {error && <p className="error-message">{error}</p>}
            {analysis && (
                <div className="analysis-container">
                    <h3>Analysis</h3>
                    <p><strong>Cash Flow Status:</strong> {analysis.cash_flow_status}</p>
                    <p><strong>Summary:</strong> {analysis.summary}</p>
                    {analysis.warnings.length > 0 && (
                        <>
                            <strong className="warnings">Warnings:</strong>
                            <ul>
                                {analysis.warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
            {swot && (
                <div className="swot-container">
                    <h3>SWOT Analysis</h3>
                    <div className="swot-section">
                        <strong>Strengths:</strong>
                        <ul>
                            {swot.strengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="swot-section">
                        <strong>Weaknesses:</strong>
                        <ul>
                            {swot.weaknesses.map((weakness, index) => (
                                <li key={index}>{weakness}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="swot-section">
                        <strong>Opportunities:</strong>
                        <ul>
                            {swot.opportunities.map((opportunity, index) => (
                                <li key={index}>{opportunity}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="swot-section">
                        <strong>Threats:</strong>
                        <ul>
                            {swot.threats.map((threat, index) => (
                                <li key={index}>{threat}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            <div className="suggestions-container">
                {suggestions.length > 0 ? (
                    <>
                        <h3>Suggestions</h3>
                        <ul className="suggestions-list">
                            {suggestions.map((suggestion, index) => (
                                <li key={index} className="suggestion-item">
                                    <strong>{suggestion.category}:</strong>
                                    <ReactMarkdown>{suggestion.details}</ReactMarkdown>
                                    <p><strong>Priority:</strong> {suggestion.priority}</p>
                                    {suggestion.impact && <p><strong>Impact:</strong> {suggestion.impact}</p>}
                                    {suggestion.level_of_effort && <p><strong>Effort Level:</strong> {suggestion.level_of_effort}</p>}
                                    {suggestion.steps && suggestion.steps.length > 0 && (
                                        <ul>
                                            {suggestion.steps.map((step, stepIndex) => (
                                                <li key={stepIndex}>{step}</li>
                                            ))}
                                        </ul>
                                    )}
                                    {suggestion.reference_url && (
                                        <p>
                                            <strong>Learn More:</strong>{' '}
                                            <a href={suggestion.reference_url} target="_blank" rel="noopener noreferrer">
                                                {suggestion.reference_url}
                                            </a>
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>No suggestions available yet.</p>
                )}
            </div>
        </div>
    );
};

export default Suggestions;
