import React, { useState, useEffect } from 'react';
import { getSuggestions, getCachedSuggestions, getBalanceGraph } from '../api';
import GraphComponent from './GraphComponent';
import ReactMarkdown from 'react-markdown';
import '../static/css/StepStyles.css';

const Suggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [swot, setSwot] = useState(null);
    const [graphData, setGraphData] = useState([]);
    const [projectedRevenue, setProjectedRevenue] = useState([]);
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCachedSuggestions();
        fetchGraphData();
    }, []);

    const fetchCachedSuggestions = async () => {
        const balanceId = 1; // Hardcoded balance ID for free useres.
        try {
            const response = await getCachedSuggestions(balanceId);
            if (response.data.suggestions) {
                setSuggestions(response.data.suggestions);
                setAnalysis(response.data.analysis);
                setSwot(response.data.swot);
                setDisabled(true);
            }
        } catch (error) {
            console.error('Error fetching cached suggestions:', error.message);
            setError('No cached suggestions found. Please generate new suggestions.');
        }
    };

    const fetchGraphData = async () => {
        const balanceId = 1;
        try {
            // ✅ Fetch data separately
            const balanceResponse = await fetch(`http://localhost:8000/balance/${balanceId}`);
            const incomeResponse = await fetch(`http://localhost:8000/incomes?balance_id=${balanceId}`);
            const expenseResponse = await fetch(`http://localhost:8000/expenses?balance_id=${balanceId}`);
            const graphResponse = await getBalanceGraph(balanceId); // Fetch graph data
    
            // ✅ Convert responses to JSON
            const balanceData = await balanceResponse.json();
            const incomes = await incomeResponse.json();
            const expenses = await expenseResponse.json();
            const graphData = graphResponse.data.balance_graph || [];
            const projectedRevenue = graphResponse.data.projected_revenue || [];
    
            // ✅ Calculate total income and expenses from JSON data
            const totalIncome = incomes.reduce((sum, item) => sum + (item.amount || 0), 0);
            const totalExpense = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
            const cashFlow = totalIncome - totalExpense;
    
            console.log("Total Income:", totalIncome);
            console.log("Total Expense:", totalExpense);
            console.log("Cash Flow:", cashFlow);
    
            // ✅ Always show Balance Projection
            setGraphData(graphData);
    
            // ✅ Only show Projected Revenue if Cash Flow is positive
            if (cashFlow > 0) {
                setProjectedRevenue(projectedRevenue.filter(data => data.projected_balance > 0));
            } else {
                setProjectedRevenue([]);  // Hide Projected Revenue
            }
    
        } catch (error) {
            console.error('Error fetching balance, incomes, expenses, or graph data:', error.message);
            setError('Failed to fetch balance graph, incomes, and expenses.');
        }
    };    

    const fetchSuggestions = async () => {
        const balanceId = 1;
        setLoading(true);
        setError('');
        try {
            const response = await getSuggestions(balanceId);
            const { suggestions, analysis, swot } = response.data;
            setSuggestions(suggestions || []);
            setAnalysis(analysis || null);
            setSwot(swot || null);
            setDisabled(true);
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

            {graphData.length > 0 && (
                <GraphComponent 
                    balanceData={graphData} 
                    revenueData={projectedRevenue.length > 0 ? projectedRevenue : []}
                />
            )}

            {analysis && (
                <div className="analysis-container">
                    <h3>Analysis</h3>
                    {analysis.cash_flow_status && <p><strong>Cash Flow Status:</strong> {analysis.cash_flow_status}</p>}
                    {analysis.summary && <p><strong>Summary:</strong> {analysis.summary}</p>}
                    {analysis.warnings?.length > 0 && (
                        <>
                            <strong className="warnings">Warnings:</strong>
                            <ul>
                                {analysis.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
                            </ul>
                        </>
                    )}
                </div>
            )}

            {swot && (
                <div className="swot-container">
                    {swot.strengths?.length > 0 && (
                        <div className="swot-section">
                            <strong>Strengths:</strong>
                            <ul>{swot.strengths.map((s, index) => <li key={index}>{s}</li>)}</ul>
                        </div>
                    )}
                    {swot.weaknesses?.length > 0 && (
                        <div className="swot-section">
                            <strong>Weaknesses:</strong>
                            <ul>{swot.weaknesses.map((w, index) => <li key={index}>{w}</li>)}</ul>
                        </div>
                    )}
                    {swot.opportunities?.length > 0 && (
                        <div className="swot-section">
                            <strong>Opportunities:</strong>
                            <ul>{swot.opportunities.map((o, index) => <li key={index}>{o}</li>)}</ul>
                        </div>
                    )}
                    {swot.threats?.length > 0 && (
                        <div className="swot-section">
                            <strong>Threats:</strong>
                            <ul>{swot.threats.map((t, index) => <li key={index}>{t}</li>)}</ul>
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
                                {suggestion.category && <strong>{suggestion.category}:</strong>}
                                {suggestion.details && <ReactMarkdown>{suggestion.details}</ReactMarkdown>}
                                {suggestion.priority && <p><strong>Priority:</strong> {suggestion.priority}</p>}
                                {suggestion.impact && <p><strong>Impact:</strong> {suggestion.impact}</p>}
                                {suggestion.level_of_effort && <p><strong>Effort Level:</strong> {suggestion.level_of_effort}</p>}
                                {suggestion.steps?.length > 0 && (
                                    <ul>{suggestion.steps.map((step, stepIndex) => <li key={stepIndex}>{step}</li>)}</ul>
                                )}
                                {suggestion.reference_url && (
                                    <p><strong>Learn More:</strong> <a href={suggestion.reference_url} target="_blank" rel="noopener noreferrer">{suggestion.reference_url}</a></p>
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
