import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Balance from './Balance';
import Income from './Income';
import Expense from './Expense';
import Suggestions from './Suggestions';
import '../static/css/StepStyles.css'; // Already existing styles
import '../static/css/BudgetSteps.css'; // For additional styling

const BudgetSteps = () => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        balance: null,
        incomes: [],
        expenses: [],
    });
    const navigate = useNavigate();

    const handleBalanceSubmit = (balance) => {
        setData({ ...data, balance });
        setStep(2);
    };

    const handleIncomeSubmit = (incomes) => {
        setData({ ...data, incomes });
        setStep(3);
    };

    const handleExpenseSubmit = (expenses) => {
        setData({ ...data, expenses });
        setStep(4);
    };

    const handleSuggestionsComplete = () => {
        navigate('/');
    };

    const steps = [
        { component: <Balance onSubmit={handleBalanceSubmit} setStep={setStep} />, title: 'Balance' },
        { component: <Income onSubmit={handleIncomeSubmit} setStep={setStep} />, title: 'Income' },
        { component: <Expense onSubmit={handleExpenseSubmit} setStep={setStep} />, title: 'Expense' },
        { component: <Suggestions balanceId={data.balance?.id} setStep={setStep} />, title: 'Suggestions' },
    ];
    
    // Helper function to handle "Back" button behavior
    const getBackButtonLabel = () => {
        if (step === 1) return 'Back to Homepage';
        if (step === 2) return 'Back to Balance';
        if (step === 3) return 'Back to Income';
        if (step === 4) return 'Back to Expenses';
        return 'Back';
    };

    const handleBackButtonClick = () => {
        if (step === 1) {
            navigate('/'); // Navigate to the homepage
        } else {
            setStep(step - 1); // Navigate to the previous step
        }
    };

    return (
        <div className="budget-steps">
            <header>
                {(
                    <button
                        className="budget-steps-back-button"
                        onClick={handleBackButtonClick}
                    >
                        {getBackButtonLabel()}
                    </button>
                )}
                <h1 className="step-title">{steps[step - 1].title}</h1>
            </header>
            {steps[step - 1].component}
        </div>
    );
};

export default BudgetSteps;
