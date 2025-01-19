# 🌟 Budget App

<p align="center">
  <img src="frontend/src/static/images/logo.png" alt="Budget App Logo" width="50%">
</p>

The **Budget App** is a full-stack application designed to help users effectively manage their finances. Featuring a modern React frontend, a FastAPI backend, and cutting-edge technologies like LLM (Large Language Model) integration and Pydantic, this app provides personalized financial insights and suggestions based on user data. Dockerized for seamless deployment, the app supports a microservice architecture to enhance scalability.

---

## 🚀 Features

- **Financial Tracking:** Manage balances, incomes, and expenses with ease.
- **Personalized Insights:** Get actionable financial suggestions powered by LLM.
- **Microservices:** Modular FastAPI architecture ensures scalability and maintainability.
- **Frontend Excellence:** Responsive React interface for a smooth user experience.
- **Docker Support:** Simplified deployment with Docker Compose.

---

## 🗂️ Project Structure

```bash
budget-app/
├── backend/     # Backend FastAPI service
├── frontend/    # Frontend React service
├── docker-compose.yml  # Orchestrates backend and frontend services
└── README.md    # Project documentation
```

---

## 🔑 Setting Up the .env File

To use the LLM-powered suggestions feature, you need to provide an API key for Google Gemini AI.

1. Visit [Google AI Studio](https://aistudio.google.com/apikey) to obtain your API key.
2. Create a `.env` file in the `backend/app/llm_microservice` directory.
3. Add the following line to the `.env` file, replacing `<YOUR_API_KEY>` with your actual key:

    ```plaintext
    GEMINI_API_KEY=<YOUR_API_KEY>
    ```

4. Ensure the `.env` file is not accidentally committed to version control by adding it to `.gitignore`.
This API key is required to enable the financial suggestion feature powered by Google Gemini AI.

---

## 🐳 Docker Deployment
#### Prerequisites
- Docker installed on your machine.

Run the entire project (frontend and backend) with a single command:

```bash
docker-compose up
```

---

## 📖 Backend

The backend is implemented with **FastAPI**, featuring:
- **LLM Integration:** Generate personalized financial suggestions.
- **Pydantic Validation:** Ensure robust data integrity.
- **Microservice Design:** Organized for scalability and modularity.

### 📂 Backend Directory Structure

```bash
backend/
├── app/
│   ├── main.py               # FastAPI application
│   ├── state.py              # State management
│   ├── requirements.txt      # Python dependencies
│   ├── core/
│   │   ├── config.py         # Configuration settings
│   │   └── utils.py          # Utility functions
│   ├── llm_microservice/
│   │   ├── Dockerfile
│   │   ├── llm_service.py    # LLM logic
│   │   ├── main.py           # LLM microservice entry point
│   │   ├── requirements.txt  # LLM-specific dependencies
│   │   └── schemas.py        # Data validation schemas
│   ├── models/
│   │   └── balance.py        # Data models for balance, income, and expense
│   ├── routers/
│   │   ├── balance.py        # API routes for balance
│   │   ├── expense.py        # API routes for expenses
│   │   ├── income.py         # API routes for incomes
│   │   └── suggestions.py    # API routes for suggestions
│   ├── services/
│   │   ├── balance_service.py
│   │   ├── expense_service.py
│   │   ├── income_service.py
│   │   └── suggestion_service.py
│   └── tests/
│       └── unit_test.py      # Unit tests for the application
├── Dockerfile                # Docker configuration
└── .gitignore                # Git ignore file
```

### 🛠️ Backend Setup

#### Prerequisites
- Docker installed on your machine.
- Python 3.12+ and pip if running locally.

#### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/EASS-HIT-PART-A-2024-CLASS-VI/budget-app-eliorabaev.git 
    cd budget-app/backend
    ```
2. Build and run the backend Docker container:
    ```bash
    docker build -t budget-app-backend .
    docker run -d --name budget-app-backend -p 8000:8000 budget-app-backend
    ```
3. Access the API:
    Open [http://localhost:8000](http://localhost:8000).

Alternatively, run both the backend and frontend together:
```bash
docker-compose up
```

### 🔍 API Endpoints

#### Balances
- `POST /balance/` - Set the initial balance:
```bash
curl -X POST "http://localhost:8000/balance/" -H "Content-Type: application/json" -d '{"amount": 1000}'
```
- `GET /balance/{balance_id}` - Retrieve the current balance:
```bash
curl -X GET "http://localhost:8000/balance/1"
```

#### Incomes
- `POST /incomes/` - Add a new income source:
```bash
curl -X POST "http://localhost:8000/incomes/" -H "Content-Type: application/json" -d '{"balance_id": 1, "source": "Job", "amount": 500}'
```
- `GET /incomes/{income_id}` - Retrieve an income source by ID:
```bash
curl -X GET "http://localhost:8000/incomes/1"
```

#### Expenses
- `POST /expenses/` - Add a new expense:
```bash
curl -X POST "http://localhost:8000/expenses/" -H "Content-Type: application/json" -d '{"balance_id": 1, "category": "Food", "amount": 100}'
```
- `GET /expenses/{expense_id}` - Retrieve an expense by ID:
```bash
curl -X GET "http://localhost:8000/expenses/1"
```

#### Suggestions
- `GET /suggestions/{balance_id}` - Get financial suggestions based on the current balance:
```bash
curl -X GET "http://localhost:8000/suggestions/1"
```

---

## 🌐 Frontend

The frontend is built using **React**, designed to deliver an intuitive and responsive user experience. Key features include:
- **Dynamic Financial Insights:** Displays analysis and suggestions with interactive elements.
- **State Persistence:** Leverages `sessionStorage` to prevent redundant API calls.
- **Theming:** Styled with CSS variables for a modern appearance.

### 📂 Frontend Directory Structure

```bash
frontend/
├── Dockerfile                  # Docker configuration for containerizing the frontend app
├── package-lock.json           # Auto-generated file that locks dependencies
├── package.json                # Project metadata, scripts, and dependencies
├── public
│   └── index.html              # Main HTML entry point
└── src                         # Application's source code
    ├── App.js                  # Main React component handling routes
    ├── api.js                  # API utility functions
    ├── components              # Reusable React components
    │   ├── Balance.js
    │   ├── BudgetSteps.js
    │   ├── Suggestions.js      # Displays financial suggestions
    ├── fonts                   # Custom fonts
    ├── static                  # Static assets (CSS, images)
        ├── css                 # Component styles
        └── images              # Logo and other assets
```

### 🛠️ Frontend Setup

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
    Open [http://localhost:3000](http://localhost:3000).

Alternatively, run both frontend and backend with:
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
