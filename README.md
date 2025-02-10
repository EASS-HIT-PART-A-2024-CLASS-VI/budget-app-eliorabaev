# 🌟 Budget App

<div align="center">
  <img src="frontend/src/static/images/logo.png" alt="Budget App Logo" width="50%">

  A comprehensive financial management solution powered by AI and microservices architecture.

  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
  [![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
</div>

The **Budget App** is a full-stack application designed to help users effectively manage their finances. Built with a modern React frontend, FastAPI backend, and cutting-edge technologies like LLM integration and Pydantic, this app provides personalized financial insights and suggestions based on user data.

## 🚀 Key Features & Benefits

| Feature | Description | Benefit |
|---------|-------------|----------|
| Financial Tracking | Comprehensive management of balances, incomes, and expenses | Keep all your financial data in one place |
| AI-Powered Insights | Personalized financial suggestions using Google Gemini AI | Get smart recommendations tailored to your spending patterns |
| Microservices Architecture | Modular FastAPI services with independent scaling | Ensures high availability and maintainability |
| Real-time Analytics | Dynamic graphs and financial projections | Make informed decisions with visual data |
| Containerized Deployment | Full Docker support with compose setup | Easy deployment and consistent environments |

## 🗂️ Project Architecture

| Service | Technology | Purpose |
|---------|------------|----------|
| Frontend | React | User interface and data visualization |
| Core Backend | FastAPI | Main business logic and data management |
| LLM Service | Google Gemini AI | Financial analysis and recommendations |
| Graph Service | FastAPI | Financial projections and analytics |

## 🔧 Quick Start Guide

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|----------|
| Docker | 20.10+ | Containerization |
| Docker Compose | 2.0+ | Service orchestration |
| Google Gemini API Key | N/A | AI-powered insights |

### Installation Steps

1. **Clone the Repository**
```bash
git clone https://github.com/EASS-HIT-PART-A-2024-CLASS-VI/budget-app-eliorabaev.git 
cd budget-app-eliorabaev
```

2. **Configure Environment**
```bash
echo 'GEMINI_API_KEY=<YOUR_API_KEY>' > backend/app/llm_microservice/.env
```

3. **Launch Services**
```bash
docker-compose up
```

## 📖 API Reference

### Core Service Endpoints

#### Balance Management

| Method | Endpoint | Description | Example |
|--------|----------|-------------|----------|
| POST | `/balance/` | Create initial balance | `curl -X POST "http://localhost:8000/balance/" -H "Content-Type: application/json" -d '{"amount": 1000}'` |
| GET | `/balance/{id}` | Retrieve balance | `curl -X GET "http://localhost:8000/balance/1"` |
| PATCH | `/balance/{id}` | Update balance | `curl -X PATCH "http://localhost:8000/balance/1" -H "Content-Type: application/json" -d '{"amount": 1500}'` |

#### Income Management

| Method | Endpoint | Description | Example |
|--------|----------|-------------|----------|
| POST | `/incomes/` | Add new income | `curl -X POST "http://localhost:8000/incomes/" -H "Content-Type: application/json" -d '{"balance_id": 1, "source": "Job", "amount": 500}'` |
| GET | `/incomes/` | List all incomes | `curl -X GET "http://localhost:8000/incomes/"` |
| GET | `/incomes/{id}` | Retrieve specific income | `curl -X GET "http://localhost:8000/incomes/1"` |
| PATCH | `/incomes/{id}` | Update income | `curl -X PATCH "http://localhost:8000/incomes/1" -H "Content-Type: application/json" -d '{"amount": 600}'` |

#### Expense Management

| Method | Endpoint | Description | Example |
|--------|----------|-------------|----------|
| POST | `/expenses/` | Add new expense | `curl -X POST "http://localhost:8000/expenses/" -H "Content-Type: application/json" -d '{"balance_id": 1, "category": "Food", "amount": 100}'` |
| GET | `/expenses/` | List all expenses | `curl -X GET "http://localhost:8000/expenses/"` |
| GET | `/expenses/{id}` | Retrieve specific expense | `curl -X GET "http://localhost:8000/expenses/1"` |
| PATCH | `/expenses/{id}` | Update expense | `curl -X PATCH "http://localhost:8000/expenses/1" -H "Content-Type: application/json" -d '{"amount": 120}'` |

#### Financial Insights

| Method | Endpoint | Description | Example |
|--------|----------|-------------|----------|
| POST | `/suggestions/{id}` | Get AI recommendations | `curl -X POST "http://localhost:8000/suggestions/1"` |
| GET | `/suggestions/{id}` | Retrieve cached suggestions | `curl -X GET "http://localhost:8000/suggestions/1"` |
| GET | `/balance/{id}/graph` | Get balance projections | `curl -X GET "http://localhost:8000/balance/1/graph"` |

#### Delete Operations

| Method | Endpoint | Description | Example |
|--------|----------|-------------|----------|
| DELETE | `/expenses/{id}` | Delete expense | `curl -X DELETE "http://localhost:8000/expenses/1"` |
| DELETE | `/incomes/{id}` | Delete income | `curl -X DELETE "http://localhost:8000/incomes/1"` |
| DELETE | `/balance/{id}` | Delete balance | `curl -X DELETE "http://localhost:8000/balance/1"` |

## 🤖 Microservices Details

### LLM Service

The LLM service provides AI-powered financial analysis using Google Gemini AI. Here's an example interaction:

```json
{
  "Request": {
    "balance_id": 123,
    "current_balance": 5000.0,
    "total_income": 7000.0,
    "total_expense": 3000.0
  },
  "Response": {
    "analysis": {
      "cash_flow_status": "Positive",
      "summary": "Your finances are in good shape",
      "warnings": [],
      "positives": ["Good income balance"]
    },
    "suggestions": [
      {
        "category": "Investing",
        "details": "Consider investing 20% of your income",
        "priority": 1,
        "impact": "High",
        "steps": ["Set up an investment account", "Allocate funds"]
      }
    ]
  }
}
```

### Graph Service

| Endpoint | Description | Example Response |
|----------|-------------|------------------|
| `/balance-graph/{id}` | Balance projections | `[{"year": 2025, "balance": 10500.0}, {"year": 2026, "balance": 15300.0}]` |
| `/projected-revenue/{id}` | Revenue estimates | `[{"year": 2025, "projected_balance": 11000.0}, {"year": 2026, "projected_balance": 16800.0}]` |

## 🌐 Frontend Architecture

### Component Structure

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| Balance | Balance management | Real-time updates, transaction history |
| Expense | Expense tracking | Category management, expense analytics |
| Income | Income tracking | Source tracking, income trends |
| Suggestions | Financial insights | AI-powered recommendations |
| GraphComponent | Data visualization | Interactive charts, projections |

## 🧪 Testing Coverage

| Service | Test Type | Command | Coverage Areas |
|---------|-----------|---------|----------------|
| Backend | Unit Tests | `pytest backend/` | API endpoints, business logic |
| Frontend | Integration | `cd frontend && npm test` | Component rendering, user interactions |

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
|-------|--------------|----------|
| Frontend | React, React Router, CSS Modules | User interface |
| Backend | FastAPI, Pydantic, Uvicorn | API and business logic |
| AI | Google Gemini AI | Financial analysis |
| Testing | Pytest, Jest, React Testing Library | Quality assurance |
| Deployment | Docker, Docker Compose | Container orchestration |

## 🎉 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Thank you for exploring the **Budget App**! We hope it helps you manage your finances effectively. Happy budgeting! 🤑
