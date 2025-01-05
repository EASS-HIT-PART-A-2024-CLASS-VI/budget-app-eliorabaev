import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header'; // Import the Header component
import Balance from './components/Balance';
import Income from './components/Income';
import Expense from './components/Expense';
import Suggestions from './components/Suggestions';
import './static/css/index.css';

function App() {
    const [step, setStep] = useState(1);
    const [balance, setBalance] = useState({ id: null, amount: '' });

    const handleBalanceSubmit = (balance) => {
        setBalance(balance);
        setStep(2); // Move to the income step
    };

    const handleIncomeSubmit = () => {
        setStep(3); // Move to the expense step
    };

    const handleExpenseSubmit = () => {
        setStep(4); // Move to the suggestions step
    };

    return (
        <Router>
            <div className="App">
                <Header /> {/* Include the Header component */}
                <main>
                    {step === 1 && <Balance onSubmit={handleBalanceSubmit} />}
                    {step === 2 && <Income onSubmit={handleIncomeSubmit} />}
                    {step === 3 && <Expense onSubmit={handleExpenseSubmit} />}
                    {step === 4 && <Suggestions balanceId={balance.id} />}
                </main>
            </div>
        </Router>
    );
}

export default App;
