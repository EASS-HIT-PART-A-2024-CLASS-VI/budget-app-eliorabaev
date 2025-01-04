import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Balance from './components/Balance';
import Income from './components/Income';
import Expense from './components/Expense';
import Suggestions from './components/Suggestions';
import './index.css';

function Home() {
    return (
        <div>
            <header>
                <h1>Budget App</h1>
            </header>
            <main>
                <Balance />
                <Income />
                <Expense />
                <Suggestions />
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
