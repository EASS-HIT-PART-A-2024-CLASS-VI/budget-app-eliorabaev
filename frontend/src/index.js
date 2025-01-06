import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './static/css/index.css'; // Main CSS
import './static/css/Header.css'; // Header CSS
import ErrorBoundary from './ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
