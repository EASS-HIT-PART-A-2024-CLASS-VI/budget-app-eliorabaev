import React, { useState, useEffect } from 'react';
import { getSuggestions, getCachedSuggestions } from '../api';
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
        // Fetch cached suggestions on component mount
        fetchCachedSuggestions();
    }, []);

    const fetchCachedSuggestions = async () => {
        const balanceId = 1; // Hardcoded balance ID for now
        try {
            const response = await getCachedSuggestions(balanceId);
            if (response.data.suggestions) {
                setSuggestions(response.data.suggestions);
                setAnalysis(response.data.analysis);
                setSwot(response.data.swot);
                setDisabled(true); // Disable the button if cached data exists
            }
        } catch (error) {
            console.error('Error fetching cached suggestions:', error.message);
            setError('No cached suggestions found. Please generate new suggestions.');
        }
    };

    const fetchSuggestions = async () => {
        const balanceId = 1; // Hardcoded balance ID for now
        setLoading(true);
        setError('');
        try {
            const response = await getSuggestions(balanceId);
            const { suggestions, analysis, swot } = response.data;

            // Set state with the fetched data
            setSuggestions(suggestions || []);
            setAnalysis(analysis || null);
            setSwot(swot || null);
            setDisabled(true); // Disable the button after fetching
        } catch (error) {
            console.error('Error fetching suggestions:', error.response?.data || error.message);
            setError('Failed to fetch suggestions. Please try again later.');
        } finally {
            setLoading(false); // Stop loading spinner
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
                    {analysis.cash_flow_status && (
                        <p><strong>Cash Flow Status:</strong> {analysis.cash_flow_status}</p>
                    )}
                    {analysis.summary && (
                        <p><strong>Summary:</strong> {analysis.summary}</p>
                    )}
                    {analysis.warnings && analysis.warnings.length > 0 && (
                        <>
                            <strong className="warnings">Warnings:</strong>
                            <ul>
                                {analysis.warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </>
                    )}
                    {analysis.positives && analysis.positives.length > 0 && (
                        <>
                            <strong className="positives">Positives:</strong>
                            <ul>
                                {analysis.positives.map((positive, index) => (
                                    <li key={index}>{positive}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}

            {swot && (
                <div className="swot-container">
                    {swot.strengths && swot.strengths.length > 0 && (
                        <div className="swot-section">
                            <strong>Strengths:</strong>
                            <ul>
                                {swot.strengths.map((strength, index) => (
                                    <li key={index}>{strength}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {swot.weaknesses && swot.weaknesses.length > 0 && (
                        <div className="swot-section">
                            <strong>Weaknesses:</strong>
                            <ul>
                                {swot.weaknesses.map((weakness, index) => (
                                    <li key={index}>{weakness}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {swot.opportunities && swot.opportunities.length > 0 && (
                        <div className="swot-section">
                            <strong>Opportunities:</strong>
                            <ul>
                                {swot.opportunities.map((opportunity, index) => (
                                    <li key={index}>{opportunity}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {swot.threats && swot.threats.length > 0 && (
                        <div className="swot-section">
                            <strong>Threats:</strong>
                            <ul>
                                {swot.threats.map((threat, index) => (
                                    <li key={index}>{threat}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {suggestions.length > 0 ? (
                <div className="suggestions-container">
                    <h3>Suggestions</h3>
                    <ul className="suggestions-list">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="suggestion-item">
                                {suggestion.category && (
                                    <strong>{suggestion.category}:</strong>
                                )}
                                {suggestion.details && (
                                    <ReactMarkdown>{suggestion.details}</ReactMarkdown>
                                )}
                                {suggestion.priority && (
                                    <p><strong>Priority:</strong> {suggestion.priority}</p>
                                )}
                                {suggestion.impact && (
                                    <p><strong>Impact:</strong> {suggestion.impact}</p>
                                )}
                                {suggestion.level_of_effort && (
                                    <p><strong>Effort Level:</strong> {suggestion.level_of_effort}</p>
                                )}
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
                </div>
            ) : (
                <p>No suggestions available yet.</p>
            )}
        </div>
    );
};

export default Suggestions;
