import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import '@testing-library/jest-dom';


test('renders the logo and About Me navigation link', () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
  
  // Check that the logo image is rendered by its alt text.
  const logo = screen.getByAltText(/Budget app logo/i);
  expect(logo).toBeInTheDocument();

  // Check that the "About Me" navigation link is present.
  const aboutLink = screen.getByText(/About Me/i);
  expect(aboutLink).toBeInTheDocument();
});
