# Budget App Backend
This repository contains the backend for a budget management application built using FastAPI and Docker.

## Project Structure
* app/
    * `main.py` - FastAPI application with CRUD operations for balance, incomes, and expenses.
    * `unit_tests.py` - Unit tests for the FastAPI application.
    * `requirements.txt` - Python dependencies for the project.
* `integration_test.py` - Integration tests for the FastAPI application.
* `Dockerfile` - Docker configuration for running the FastAPI application.
* `client.py` - Python script making HTTP requests to httpbin.org.
* `README.md` - Project documentation.

## Setup Instructions
## Prerequisites
* Docker must be installed on your machine.
* Python 3.12 and pip (Python package manager) if running locally without Docker.

## Installation
#### 1. Clone the repository
```
git clone https://github.com/EASS-HIT-PART-A-2024-CLASS-VI/http-api-demo-eliorabaev.git 
cd http-api-demo-eliorabaev
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
pytest app/unit_tests.py
```
#### 2. Run Integration Tests
```
pytest integration_test.py
```
## API Endpoints
* Balance:
    * `POST /balance/` - Set the initial balance.
    * `GET /balance/` - Retrieve the current balance.

* Incomes:
    * `POST /incomes/` - Add a new income source.
    * `GET /incomes/` - Retrieve all income sources.
    * `DELETE /incomes/` - Delete all incomes.

* Expenses:
    * `POST /expenses/` - Add a new expense.
    * `GET /expenses/` - Retrieve all expenses.
    * `DELETE /expenses/` - Delete all expenses.

* Suggestions:
    * `GET /suggestions/` - Get financial suggestions based on the current balance.

## Client Script
The client.py script demonstrates HTTP requests using httpbin.

## Usage
#### 1. Run the client script
```
python3 client.py
```
### Example Output
* POST request
```
Status Code: 200
Response Body: {...}
```
* GET request
```
Status Code: 200
Response Body: {...}
```
## Docker Configuration
### Dockerfile
This Dockerfile runs the FastAPI application.
```
FROM python:3.12-slim

WORKDIR /app

COPY ./app/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY ./app /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Building the Docker Image
```
docker build -t budget-app-backend .
```
### Running the Docker Container
```
docker run -d --name budget-app-backend -p 8000:8000 budget-app-backend
```
