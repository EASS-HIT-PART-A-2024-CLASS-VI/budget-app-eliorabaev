import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Homepage from './components/Homepage';
import BudgetSteps from './components/BudgetSteps';
import AboutMe from './components/AboutMe';
import './static/css/index.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/budget-steps" element={<BudgetSteps />} />
                    <Route path="/about" element={<AboutMe />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
