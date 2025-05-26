# from fastapi import FastAPI
# from typing import List
# import pandas as pd
# from sklearn.neighbors import NearestNeighbors
# import json

# app = FastAPI()
# orders = pd.read_csv("orders_simple.csv")


# # Load meals.json to map meal_id -> meal_name
# with open("meals.json") as f:
#     meals_data = json.load(f)
# meal_id_to_name = {meal['id']: meal['name'] for meal in meals_data}

# # Create user-meal matrix
# pivot = orders.pivot_table(index="user_id", columns="meal_id", aggfunc=lambda x: 1, fill_value=0)
# model = NearestNeighbors(n_neighbors=3, metric="cosine")
# model.fit(pivot)

# # @app.get("/recommend/{user_id}")
# # def recommend(user_id: str):
# #     if user_id not in pivot.index:
# #         return {"recommended_meals": []}

# #     distances, indices = model.kneighbors([pivot.loc[user_id]])
# #     similar_users = pivot.index[indices[0][1:]]  # exclude self

# #     similar_orders = orders[orders["user_id"].isin(similar_users)]
# #     user_meals = set(orders[orders["user_id"] == user_id]["meal_id"])
# #     recommendations = set(similar_orders["meal_id"]) - user_meals

# #     if not recommendations:
# #         # Fallback: Recommend top 3 most ordered meals
# #         top_meals = (
# #             orders["meal_id"]
# #             .value_counts()
# #             .head(3)
# #             .index
# #             .tolist()
# #         )
# #         recommended_names = [meal_id_to_name[mid] for mid in top_meals if mid in meal_id_to_name]
# #         return {"recommended_meals": recommended_names}

# #     # Normal recommendation result
# #     recommended_names = [meal_id_to_name[mid] for mid in recommendations if mid in meal_id_to_name]
# #     return {"recommended_meals": recommended_names}


# @app.get("/recommend/{user_id}")
# def recommend(user_id: str):
#     if user_id not in pivot.index:
#         return {"recommended_meals": []}

#     distances, indices = model.kneighbors([pivot.loc[user_id]])
#     similar_users = pivot.index[indices[0][1:]]  # exclude self

#     similar_orders = orders[orders["user_id"].isin(similar_users)]
#     user_meals = set(orders[orders["user_id"] == user_id]["meal_id"])
#     recommendations = set(similar_orders["meal_id"]) - user_meals

#     if not recommendations:
#         # Fallback: Recommend top 3 most ordered meals
#         top_meals = (
#             orders["meal_id"]
#             .value_counts()
#             .head(3)
#             .index
#             .tolist()
#         )
#         recommended_names = [meal_id_to_name[mid] for mid in top_meals if mid in meal_id_to_name]
#     else:
#         # Normal recommendation result
#         recommended_names = [meal_id_to_name[mid] for mid in recommendations if mid in meal_id_to_name]

#     # ⬇️ Return full meal objects
#     recommended_meals = [meal for meal in meals_data if meal["name"] in recommended_names]
#     return {"recommended_meals": recommended_meals}

from fastapi import FastAPI
import pandas as pd
from sklearn.neighbors import NearestNeighbors
import json

app = FastAPI()

# Global variables
orders = None
pivot = None
model = None
meal_id_to_name = {}
meals_data = []

# 🔁 Load and train model
def load_data():
    global orders, pivot, model, meal_id_to_name, meals_data

    # Load orders
    orders = pd.read_csv("orders_simple.csv")

    # Load meals.json
    with open("meals.json") as f:
        meals_data = json.load(f)

    meal_id_to_name = {meal['id']: meal['name'] for meal in meals_data}

    # Create user-meal pivot table
    pivot = orders.pivot_table(index="user_id", columns="meal_id", aggfunc=lambda x: 1, fill_value=0)

    # Fit KNN model
    model = NearestNeighbors(n_neighbors=3, metric="cosine")
    model.fit(pivot)

# 🔄 Initial training
load_data()

# 🔁 Endpoint to trigger retraining
@app.post("/retrain")
def retrain():
    load_data()
    return {"message": "Model retrained successfully"}

# ✅ Recommend meals
@app.get("/recommend/{user_id}")
def recommend(user_id: str):
    if user_id not in pivot.index:
        return {"recommended_meals": []}

    distances, indices = model.kneighbors([pivot.loc[user_id]])
    similar_users = pivot.index[indices[0][1:]]  # Exclude self

    similar_orders = orders[orders["user_id"].isin(similar_users)]
    user_meals = set(orders[orders["user_id"] == user_id]["meal_id"])
    recommendations = set(similar_orders["meal_id"]) - user_meals

    if not recommendations:
        top_meals = (
            orders["meal_id"]
            .value_counts()
            .head(3)
            .index
            .tolist()
        )
        recommended_names = [meal_id_to_name[mid] for mid in top_meals if mid in meal_id_to_name]
    else:
        recommended_names = [meal_id_to_name[mid] for mid in recommendations if mid in meal_id_to_name]

    # Return full meal objects
    recommended_meals = [meal for meal in meals_data if meal["name"] in recommended_names]
    return {"recommended_meals": recommended_meals}

import os

port = int(os.getenv("PORT", 10000))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("knn_api:app", host="0.0.0.0", port=port)