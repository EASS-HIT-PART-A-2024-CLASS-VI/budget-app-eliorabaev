import React, { useState, useEffect } from 'react';
import { getBalance, setBalance as apiSetBalance } from '../api';
import '../static/css/StepStyles.css';

const Balance = ({ onSubmit, setStep }) => {
    const [amount, setAmount] = useState('');
    const [isBalanceSet, setIsBalanceSet] = useState(false);
    const balanceId = 1;

    useEffect(() => {
        checkAndFetchBalance();
    }, []);

    const checkAndFetchBalance = async () => {
        try {
            const response = await getBalance(balanceId);
            if (response.data && response.data.amount) {
                setAmount(response.data.amount);
                setIsBalanceSet(true);
                console.log('Balance fetched successfully:', response.data.amount);
            } else {
                console.log('No existing balance found. Ready to set a new balance.');
            }
        } catch (error) {
            console.warn('Unable to fetch balance. Proceeding without fetching.');
        }
    };

    const handleSetBalance = async (e) => {
        e.preventDefault();
        if (isBalanceSet) {
            console.warn('Balance is already set. No need to set it again.');
            return;
        }

        const balance = { id: balanceId, amount };
        try {
            await apiSetBalance(balance);
            setIsBalanceSet(true);
            console.log('Balance successfully set:', balance);
        } catch (error) {
            console.error('Error setting balance:', error);
        }
    };

    const handleNext = () => {
        if (!isBalanceSet) {
            alert('Please set your balance before proceeding.');
            return;
        }
        const balance = { id: balanceId, amount };
        onSubmit(balance);
        setStep(2);
    };

    return (
        <div className="step-container">
            {/* Consistent Content Wrapper */}
            <div className="dynamic-content">
                {!isBalanceSet ? (
                    <>
                        <h2 className="step-title">Enter Your Total Balance</h2>
                        <p className="balance-message">If you have more than one balance, add them up.</p>
                        <p className="balance-warning">(Once a balance is set it cannot be changed!)</p>
                    </>
                ) : (
                    <p className="balance-set">
                        Balance set to ${amount}. <br /> You cannot change it unless you open an account.
                    </p>
                )}
            </div>

            {/* Balance Input Form */}
            <form className="step-form" onSubmit={handleSetBalance}>
                <label>
                    Amount:
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="step-input"
                        placeholder="Enter your balance: $0"
                        disabled={isBalanceSet}
                        required
                    />
                </label>
                <div className="buttons">
                    {!isBalanceSet && (
                        <button type="submit" className="step-button">
                            Set Balance
                        </button>
                    )}
                    <button
                        type="button"
                        className="step-button next-button"
                        onClick={handleNext}
                        disabled={!isBalanceSet}
                    >
                        Next
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Balance;
