import * as yup from 'yup';

// Email validation
export const emailValidation = yup
  .string()
  .email('Invalid email format')
  .required('Email is required')
  .max(255, 'Email is too long');

// Password validation
export const passwordValidation = yup
  .string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  );

// Username validation
export const usernameValidation = yup
  .string()
  .required('Username is required')
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .matches(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers');

// Amount validation (for financial data)
export const amountValidation = yup
  .number()
  .required('Amount is required')
  .positive('Amount must be positive')
  .max(1000000000, 'Amount is too large');

// Registration schema
export const registrationSchema = yup.object({
  username: usernameValidation,
  email: emailValidation,
  password: passwordValidation,
  password_confirmation: yup
    .string()
    .required('Password confirmation is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

// Login schema
export const loginSchema = yup.object({
  username_or_email: yup
    .string()
    .required('Username or email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

// Balance schema
export const balanceSchema = yup.object({
  amount: amountValidation,
});

// Income schema
export const incomeSchema = yup.object({
  balance_id: yup.number().required('Balance ID is required').positive(),
  source: yup
    .string()
    .required('Income source is required')
    .max(255, 'Source description is too long'),
  amount: amountValidation,
});

// Expense schema
export const expenseSchema = yup.object({
  balance_id: yup.number().required('Balance ID is required').positive(),
  category: yup
    .string()
    .required('Expense category is required')
    .max(255, 'Category description is too long'),
  amount: amountValidation,
});

// Utility functions
export const validateEmail = (email: string): boolean => {
  return emailValidation.isValidSync(email);
};

export const validatePassword = (password: string): boolean => {
  return passwordValidation.isValidSync(password);
};

export const validateAmount = (amount: number): boolean => {
  return amountValidation.isValidSync(amount);
};