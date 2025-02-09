import React from 'react';
import { render, screen } from '@testing-library/react';
import AboutMe from './AboutMe';
import '@testing-library/jest-dom';


test('renders AboutMe component with correct information', () => {
  render(<AboutMe />);
  
  // Check for the presence of key texts.
  expect(screen.getByText(/Elior Abaev/i)).toBeInTheDocument();
  expect(screen.getByText(/Junior Front-End Developer/i)).toBeInTheDocument();
  expect(screen.getByText(/Elior\.Abaev@gmail\.com/i)).toBeInTheDocument();
});
