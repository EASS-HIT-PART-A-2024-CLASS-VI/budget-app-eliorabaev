import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Balance from './Balance';
import * as api from '../api';
import '@testing-library/jest-dom';

// Mock the API module
jest.mock('../api', () => ({
  getBalance: jest.fn(),
  setBalance: jest.fn(),
}));

describe('Balance Component', () => {
  test('displays fetched balance if it exists', async () => {
    api.getBalance.mockResolvedValue({ data: { amount: '100' } });
    
    render(<Balance onSubmit={jest.fn()} setStep={jest.fn()} />);
    
    const balanceText = await waitFor(() => screen.getByText(/Balance set to \$100/i));
    expect(balanceText).toBeInTheDocument();
  });

  test('allows setting balance if not already set', async () => {
    api.getBalance.mockRejectedValue(new Error('Not Found'));
    api.setBalance.mockResolvedValue({ data: { id: 1, amount: '200' } });

    render(<Balance onSubmit={jest.fn()} setStep={jest.fn()} />);

    expect(screen.getByText(/Enter your balance/i)).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText(/Enter your balance: \$0/i);
    fireEvent.change(input, { target: { value: '200' } });
    expect(input.value).toBe('200');

    const setBalanceButton = screen.getByRole('button', { name: /Set Balance/i });
    fireEvent.click(setBalanceButton);
    
    const updatedBalanceText = await waitFor(() => screen.getByText(/Balance set to \$200/i));
    expect(updatedBalanceText).toBeInTheDocument();
  });
});
