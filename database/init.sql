-- Create the database schema for the Budget App

-- Use the budget_db database
USE budget_db;

-- Create balances table
CREATE TABLE IF NOT EXISTS balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL
);

-- Create incomes table
CREATE TABLE IF NOT EXISTS incomes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    balance_id INT NOT NULL,
    source VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (balance_id) REFERENCES balances(id) ON DELETE CASCADE
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    balance_id INT NOT NULL,
    category VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (balance_id) REFERENCES balances(id) ON DELETE CASCADE
);

-- Create suggestions cache table
CREATE TABLE IF NOT EXISTS suggestions_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    balance_id INT NOT NULL,
    suggestion_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (balance_id),
    FOREIGN KEY (balance_id) REFERENCES balances(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_incomes_balance_id ON incomes (balance_id);
CREATE INDEX idx_expenses_balance_id ON expenses (balance_id);