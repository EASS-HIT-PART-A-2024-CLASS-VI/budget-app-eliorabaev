import React, { useState, useEffect } from 'react';
import { getBalance, setBalance } from '../api';

const Balance = () => {
    const [balance, setBalanceState] = useState({ id: null, amount: '' });
    const [balanceId, setBalanceId] = useState(1);

    useEffect(() => {
        fetchBalance(balanceId);
    }, [balanceId]);

    const fetchBalance = async (id) => {
        try {
            const response = await getBalance(id);
            setBalanceState(response.data || { id: null, amount: 0 });
        } catch (error) {
            console.error('Error fetching balance:', error);
            setBalanceState({ id: null, amount: 0 }); // Default state if fetch fails
        }
    };

    const handleChange = (e) => {
        setBalanceState({ ...balance, amount: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await setBalance(balance);
            setBalanceState(response.data);
        } catch (error) {
            console.error('Error setting balance:', error);
        }
    };

    return (
        <div>
            <h2>Balance</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Amount:
                    <input type="number" value={balance.amount} onChange={handleChange} />
                </label>
                <button type="submit">Set Balance</button>
            </form>
            <div>
                <h3>Current Balance</h3>
                <p>ID: {balance.id}</p>
                <p>Amount: {balance.amount}</p>
            </div>
        </div>
    );
};

export default Balance;
