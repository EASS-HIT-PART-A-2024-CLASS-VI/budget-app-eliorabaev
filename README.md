# 🌟 Budget App

![Budget App Logo](frontend/src/static/images/logo.png)

This repository contains the **Budget App**, a full-stack application designed to help users manage their finances effectively. It features a modern frontend built with React and a robust backend powered by FastAPI. The application tracks balances, incomes, and expenses while offering financial advice based on spending habits. All services are containerized using Docker for easy deployment.

---

## 🚀 Features
- **Track Finances:** Manage balances, incomes, and expenses seamlessly.
- **Financial Insights:** Receive personalized suggestions to optimize your spending habits.
- **Microservice Architecture:** Backend with FastAPI and frontend with React.
- **Dockerized:** Deploy easily using Docker or Docker Compose.

---

## 🗂️ Project Structure

```
budget-app/
├── backend/     # Backend FastAPI service
├── frontend/    # Frontend React service
├── docker-compose.yml  # Orchestrates backend and frontend services
└── README.md    # Project documentation
```
---

## 🐳 Docker

You can run the entire project (frontend and backend) using a single command:
```bash
docker-compose up
```

---

## 📖 Backend

The backend is implemented using FastAPI, offering a range of endpoints for managing finances. It is organized into microservices with a clean directory structure for scalability and maintainability.

### 📂 Directory Structure
```
backend/
├── app/
│   ├── main.py               # FastAPI application
│   ├── unit_tests.py         # Unit tests for the application
│   ├── state.py              # State management
│   ├── requirements.txt      # Python dependencies
│   ├── core/
│   │   ├── config.py         # Configuration settings
│   │   └── utils.py          # Utility functions
│   ├── models/
│   │   └── balance.py        # Data models for balance
│   ├── routers/
│   │   ├── balance.py        # API routes for balance
│   │   ├── expense.py        # API routes for expenses
│   │   ├── income.py         # API routes for income
│   │   └── suggestions.py    # API routes for suggestions
│   └── tests/
│       └── unit_test.py      # Unit tests for FastAPI
├── Dockerfile                # Docker configuration
└── .gitignore                # Git ignore file
```

### 🛠️ Setup Instructions
#### Prerequisites
- Docker installed on your machine.
- Python 3.12 and pip if running locally.

#### Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/EASS-HIT-PART-A-2024-CLASS-VI/budget-app-eliorabaev.git 
    cd budget-app/backend
    ```
2. Build and run the Docker container:
    ```bash
    docker build -t budget-app-backend .
    docker run -d --name budget-app-backend -p 8000:8000 budget-app-backend
    ```
3. Access the API:
    Open your web browser and navigate to [http://localhost:8000](http://localhost:8000).

**Alternatively, you can run the backend along with the frontend using a single command:**
```bash
docker-compose up
```

### 🔍 API Endpoints

#### Balance
- `POST /balance/` - Set the initial balance.
  ```bash
  curl -X POST "http://localhost:8000/balance/" -H "Content-Type: application/json" -d '{"amount": 1000}'
  ```
- `GET /balance/{balance_id}` - Retrieve the current balance.
  ```bash
  curl -X GET "http://localhost:8000/balance/1"
  ```

#### Incomes
- `POST /incomes/` - Add a new income source.
  ```bash
  curl -X POST "http://localhost:8000/incomes/" -H "Content-Type: application/json" -d '{"balance_id": 1, "source": "Job", "amount": 500}'
  ```
- `GET /incomes/{income_id}` - Retrieve an income source by ID.
  ```bash
  curl -X GET "http://localhost:8000/incomes/1"
  ```

#### Expenses
- `POST /expenses/` - Add a new expense.
  ```bash
  curl -X POST "http://localhost:8000/expenses/" -H "Content-Type: application/json" -d '{"balance_id": 1, "category": "Food", "amount": 100}'
  ```
- `GET /expenses/{expense_id}` - Retrieve an expense by ID.
  ```bash
  curl -X GET "http://localhost:8000/expenses/1"
  ```

#### Suggestions
- `GET /suggestions/{balance_id}` - Get financial suggestions based on the current balance.
  ```bash
  curl -X GET "http://localhost:8000/suggestions/1"
  ```

---

## 🌐 Frontend

The frontend is built with React, leveraging modern web technologies to deliver a responsive and interactive user experience.

### 📂 Directory Structure
```
├── Dockerfile                  # Docker configuration file for containerizing the frontend
├── package-lock.json           # Automatically generated file that locks dependencies
├── package.json                # Project metadata, scripts, and dependency management
├── public                      # Public folder for static assets accessible without build tools
│   └── index.html              # Main HTML file that serves as the entry point for the React app
└── src                         # Source folder containing the application's main code
    ├── App.js                  # Main application component, rendering routes and global layout
    ├── ErrorBoundary.js        # Error boundary for catching and displaying UI errors
    ├── api.js                  # API utilities for backend communication (e.g., HTTP requests)
    ├── components              # Folder containing reusable React components
    │   ├── Balance.js          # Displays and manages the user's current balance
    │   ├── BudgetSteps.js      # Multi-step component guiding users through budgeting tasks
    │   ├── Expense.js          # Displays and manages expense-related tasks
    │   ├── Header.js           # Header component with navigation and branding
    │   ├── Homepage.js         # Homepage layout and content
    │   ├── Income.js           # Displays and manages income-related tasks
    │   └── Suggestions.js      # Displays financial suggestions based on balance data
    ├── fonts                   # Folder containing custom font files
    │   ├── Garet-Book.ttf      # Font file for regular text
    │   └── Garet-Heavy.ttf     # Font file for bold or heavy text
    ├── index.js                # Application's entry point, responsible for rendering `App.js`
    └── static                  # Static assets folder for styling and images
        ├── css                 # Folder containing all CSS files for styling the app
        │   ├── BudgetSteps.css # Styles specific to the BudgetSteps component
        │   ├── Expense.css     # Styles specific to the Expense component
        │   ├── Header.css      # Styles for the Header component
        │   ├── Homepage.css    # Styles for the Homepage layout
        │   ├── Income.css      # Styles specific to the Income component
        │   ├── StepStyles.css  # Shared styles for all step-based components (e.g., Balance, Income)
        │   ├── Suggestions.css # Styles specific to the Suggestions component
        │   └── index.css       # General application-wide styles
        └── images              # Folder containing all image assets
            ├── logo.png        # Main logo image for the app
            ├── logo_clean.png  # Clean or simplified variant of the app logo
            └── logo_header.png # Logo used in the header component
```

### 🛠️ Setup Instructions
#### Prerequisites
- Docker installed on your machine.

#### Installation
1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2. Build and run the Docker container:
    ```bash
    docker build -t budget-app-frontend .
    docker run -d --name budget-app-frontend -p 3000:3000 budget-app-frontend
    ```
3. Access the application:
    Open your web browser and navigate to [http://localhost:3000](http://localhost:3000).

**Alternatively, run the entire project (frontend and backend) using a single command:**
```bash
docker-compose up
```

---

## 🧪 Running Tests
- **Backend Tests:**
    ```bash
    pytest backend/app/tests/unit_test.py
    ```
- **Frontend Tests:** Coming soon!

---

## 🎉 Conclusion
Thank you for exploring the **Budget App**! Feel free to contribute, report issues, or suggest enhancements. Happy budgeting! 🤑
