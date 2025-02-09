// __mocks__/react-router-dom.js
import React from 'react';

// Dummy MemoryRouter that simply renders its children.
export const MemoryRouter = ({ children }) => <>{children}</>;

// Dummy useNavigate that returns a no-op function.
export const useNavigate = () => {
  return () => {
  };
};

export default {
  MemoryRouter,
  useNavigate,
};
