import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Balance from './Balance';
import Income from './Income';
import Expense from './Expense';
import Suggestions from './Suggestions';
import '../static/css/BudgetSteps.css';
import '../static/css/StepStyles.css';

function BudgetSteps() {
    const [step, setStep] = useState(1);
    const [balance, setBalance] = useState({ id: null, amount: '' });
    const navigate = useNavigate();

    const handleBalanceSubmit = (balance) => {
        setBalance(balance);
        setStep(2);
    };

    const handleIncomeSubmit = () => {
        setStep(3);
    };

    const handleExpenseSubmit = () => {
        setStep(4);
    };

    const goBackToHomepage = () => {
        navigate('/');
    };

    return (
        <div className="budget-steps">
            <Header />
            <div className="budget-steps-main">
                <div className="budget-steps-navigation">
                    <button className="budget-steps-back-button" onClick={goBackToHomepage}>
                        Back to Homepage
                    </button>
                </div>
                {step === 1 && <Balance onSubmit={handleBalanceSubmit} />}
                {step === 2 && <Income onSubmit={handleIncomeSubmit} />}
                {step === 3 && <Expense onSubmit={handleExpenseSubmit} />}
                {step === 4 && <Suggestions balanceId={balance.id} />}
            </div>
        </div>
    );
}

export default BudgetSteps;
