import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './Homepage';
import '@testing-library/jest-dom';


test('renders Homepage with Try It Now button', () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
  
  // Verify that the "Try It Now For Free!" button is rendered.
  const tryNowButton = screen.getByRole('button', { name: /Try It Now For Free!/i });
  expect(tryNowButton).toBeInTheDocument();
});
