# 🌟 Budget App

<p align="left">
  <img src="frontend/src/static/images/logo.png" alt="Budget App Logo" width="50%">
</p>

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
```bash
backend/
├── app/
│   ├── main.py               # FastAPI application
│   ├── state.py              # State management
│   ├── requirements.txt      # Python dependencies
│   ├── core/
│   │   ├── config.py         # Configuration settings
│   │   └── utils.py          # Utility functions
│   ├── models/
│   │   └── balance.py        # Data models for balance, income, and expense
│   ├── routers/
│   │   ├── balance.py        # API routes for balance
│   │   ├── expense.py        # API routes for expenses
│   │   ├── income.py         # API routes for income
│   │   └── suggestions.py    # API routes for suggestions
│   ├── services/
│   │   ├── balance_service.py # Business logic for balance
│   │   ├── expense_service.py # Business logic for expenses
│   │   ├── income_service.py  # Business logic for incomes
│   │   └── suggestion_service.py # Business logic for suggestions
│   └── tests/
│       └── unit_tests.py     # Unit tests for the application
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
```bash
├── Dockerfile                  # Docker configuration for containerizing the frontend app
├── package-lock.json           # Auto-generated file that locks dependencies for consistency
├── package.json                # Project metadata, scripts, and dependencies
├── public
│   └── index.html              # Main HTML file as the entry point for the React app
└── src                         # Source folder containing the application's main code
    ├── App.js                  # Main React component, handling routes and global layout
    ├── ErrorBoundary.js        # Error boundary to catch and display UI errors gracefully
    ├── api.js                  # API utility functions for backend communication
    ├── components              # Reusable React components
    │   ├── AboutMe.js          # About Me page component with detailed professional info
    │   ├── Balance.js          # Balance step for setting and displaying user balance
    │   ├── BudgetSteps.js      # Multi-step budgeting process component
    │   ├── Expense.js          # Expense management step in the budgeting flow
    │   ├── Header.js           # Navigation header with logo and links
    │   ├── Homepage.js         # Homepage layout and content
    │   ├── Income.js           # Income management step in the budgeting flow
    │   └── Suggestions.js      # Suggestions step with financial advice based on user data
    ├── fonts                   # Folder for custom fonts used in the app
    │   ├── Garet-Book.ttf      # Font for regular text
    │   └── Garet-Heavy.ttf     # Font for bold headings or emphasis
    ├── index.js                # Application's entry point, rendering `App.js`
    └── static                  # Static assets like CSS and images
        ├── css                 # Stylesheets for various components and global styling
        │   ├── AboutMe.css     # Styles for the About Me page
        │   ├── BudgetSteps.css # Styles for the multi-step budgeting component
        │   ├── Header.css      # Styles for the Header component
        │   ├── Homepage.css    # Styles for the Homepage layout
        │   ├── StepStyles.css  # Shared styles for step-based components like Balance, Income
        │   ├── Suggestions.css # Styles for the Suggestions component
        │   └── index.css       # Global application-wide styles
        └── images              # Folder containing image assets
            ├── logo.png        # Main logo image for the app
            ├── logo_clean.png  # Clean version of the logo for specific use cases
            └── logo_header.png # Logo variant used in the header
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
