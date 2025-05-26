# ABUAD Food Ordering App Starter

## Structure
- `backend/fastapi-knn/`: FastAPI KNN recommendation engine
- `backend/menu-service/`: Node.js MongoDB menu service
- `frontend/`: Placeholder for React Native frontend

## Setup Instructions
1. Run MongoDB locally or use MongoDB Atlas for menu-service.
2. Start the menu service:
   - `cd backend/menu-service`
   - `npm install express mongoose`
   - `node server.js`
3. Start the recommendation engine:
   - `cd backend/fastapi-knn`
   - `pip install fastapi uvicorn scikit-learn pandas`
   - Add your dummy CSV
   - `uvicorn main:app --reload`
