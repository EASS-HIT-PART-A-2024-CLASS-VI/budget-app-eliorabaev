import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import './static/css/index.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
            </div>
        </Router>
    );
}

export default App;
