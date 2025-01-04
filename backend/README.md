# Budget App Backend
This repository contains the backend for a budget management application built using FastAPI and Docker.
The Budget App backend manages a user's finances by tracking balances, incomes, and expenses, and provides financial advice based on spending habits.
It features an organized microservice architecture with FastAPI, making it easily deployable in a Docker environment.

## Project Structure
```
budget-app/
├── app/
│   ├── main.py  # FastAPI application with CRUD operations for balance, incomes, and expenses.
│   ├── unit_tests.py  # Unit tests for the FastAPI application.
│   ├── state.py  # State management for the application.
│   ├── requirements.txt  # Python dependencies for the project.
│   ├── core/
│   │   ├── config.py  # Configuration settings.
│   │   └── utils.py  # Utility functions.
│   ├── models/
│   │   └── balance.py  # Balance data models.
│   ├── routers/
│   │   ├── balance.py  # Balance-related API routes.
│   │   ├── expense.py  # Expense-related API routes.
│   │   ├── income.py  # Income-related API routes.
│   │   └── suggestions.py  # Suggestions-related API routes.
│   └── tests/
│       └── unit_test.py  # Unit tests for the FastAPI application.
├── Dockerfile  # Docker configuration for running the FastAPI application.
├── client.py  # Python script making HTTP requests to httpbin.org.
├── README.md  # Project documentation.
└── .gitignore  # Git ignore file to specify untracked files to ignore.
```

## Setup Instructions
## Prerequisites
* Docker must be installed on your machine.
* Python 3.12 and pip (Python package manager) if running locally without Docker.

## Installation
#### 1. Clone the repository
```
git clone https://github.com/EASS-HIT-PART-A-2024-CLASS-VI/budget-app-eliorabaev.git 
cd budget-app-eliorabaev
```
#### 2. Build and run the Docker container
```
docker build -t budget-app-backend .
docker run -d --name budget-app-backend -p 8000:8000 budget-app-backend
```
#### 3. Access the API
Open your web browser and go to http://localhost:8000 to see the root message of your application.

## Running Tests
#### 1. Run Unit Tests
```
pytest app/tests/unit_test.py
```
## API Endpoints
* Balance:
    * `POST /balance/` - Set the initial balance.
    ```
    curl -X POST "http://localhost:8000/balance/" -H "Content-Type: application/json" -d '{"amount": 1000}'
    ```
    * `GET /balance/{balance_id}` - Retrieve the current balance.
    ```
    curl -X GET "http://localhost:8000/balance/1"
    ```

* Incomes:
    * `POST /incomes/` - Add a new income source.
    ```
    curl -X POST "http://localhost:8000/incomes/" -H "Content-Type: application/json" -d '{"balance_id": 1, "source": "Job", "amount": 500}'
    ```
    * `GET /incomes/{income_id}` - Retrieve an income source by ID.
    ```
    curl -X GET "http://localhost:8000/incomes/1"
    ```

* Expenses:
    * `POST /expenses/` - Add a new expense.
    ```
    curl -X POST "http://localhost:8000/expenses/" -H "Content-Type: application/json" -d '{"balance_id": 1, "category": "Food", "amount": 100}'
    ```
    * `GET /expenses/{expense_id}` - Retrieve an expense by ID.
    ```
    curl -X GET "http://localhost:8000/expenses/1"
    ```

* Suggestions:
    * `GET /suggestions/{balance_id}` - Get financial suggestions based on the current balance.
    ```
    curl -X GET "http://localhost:8000/suggestions/1"
    ```

## Client Script
The client.py script demonstrates HTTP requests using httpbin.

## Usage
#### 1. Run the client script
```
python3 client.py
```
### Example Output
```
POST request
Status Code: 200
Response Body: {...}

GET request
Status Code: 200
Response Body: {...}
```
## Docker Configuration
### Dockerfile
This Dockerfile runs the FastAPI application.

### Building the Docker Image
```
docker build -t budget-app-backend .
```
### Running the Docker Container
```
docker run -d --name budget-app-backend -p 8000:8000 budget-app-backend
```
