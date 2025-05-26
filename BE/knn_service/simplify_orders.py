import pandas as pd

# Load original CSV
df = pd.read_csv('orders.csv')

# Select user_id and meal_id, drop duplicates
df_simple = df[['user_id', 'meal_id']].drop_duplicates()

# Save simplified CSV for recommender
df_simple.to_csv('orders_simple.csv', index=False)

print("Simplified orders saved to orders_simple.csv")
