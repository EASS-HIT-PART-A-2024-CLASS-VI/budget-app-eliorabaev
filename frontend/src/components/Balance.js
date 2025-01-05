import React, { useState, useEffect } from 'react';
import { getBalance, setBalance as apiSetBalance } from '../api';

const Balance = ({ onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [balanceId, setBalanceId] = useState(1);

    useEffect(() => {
        fetchBalance(balanceId);
    }, [balanceId]);

    const fetchBalance = async (id) => {
        try {
            const response = await getBalance(id);
            setAmount(response.data.amount || 0);
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
            onSubmit(balance);
        } catch (error) {
            console.error('Error setting balance:', error);
        }
    };

    return (
        <div>
            <h2>Hello customer, what is your balance right now?</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Amount:
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </label>
                <button type="submit">Set Balance</button>
            </form>
        </div>
    );
};

export default Balance;
