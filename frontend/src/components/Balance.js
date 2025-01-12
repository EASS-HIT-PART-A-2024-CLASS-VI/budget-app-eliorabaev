import React, { useState, useEffect } from 'react';
import { getBalance, setBalance as apiSetBalance } from '../api';
import '../static/css/StepStyles.css';

const Balance = ({ onSubmit, setStep }) => {
    const [amount, setAmount] = useState('');
    const [balanceId, setBalanceId] = useState(1);
    const [isBalanceSet, setIsBalanceSet] = useState(false); // Track if balance has been set

    useEffect(() => {
        fetchBalance(balanceId);
    }, [balanceId]);

    const fetchBalance = async (id) => {
        try {
            const response = await getBalance(id);
            if (response.data && response.data.amount) {
                setAmount(response.data.amount);
                setIsBalanceSet(true); // Mark balance as set if fetched successfully
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
            setAmount(0); // Default state if fetch fails
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const balance = { id: balanceId, amount };
        try {
            await apiSetBalance(balance);
            setIsBalanceSet(true); // Mark balance as set
            onSubmit(balance);
        } catch (error) {
            console.error('Error setting balance:', error);
        }
    };

    const handleNext = () => {
        setStep(2); // Move to the next step
    };

    return (
        <div className="step-container">
            <h2 className="step-title">Hello customer, what is your balance right now?</h2>
            <form className="step-form" onSubmit={handleSubmit}>
                <label>
                    Amount:
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="step-input"
                        placeholder="Enter your balance"
                        disabled={isBalanceSet} // Disable input if balance is set
                    />
                </label>
                {!isBalanceSet && (
                    <button type="submit" className="step-button">
                        Set Balance
                    </button>
                )}
            </form>
            {isBalanceSet && (
                <div className="balance-actions">
                    <p className="balance-message">
                        Balance set to ${amount}. You cannot change it anymore.
                    </p>
                    <button
                        className="step-button next-button"
                        onClick={handleNext}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Balance;
