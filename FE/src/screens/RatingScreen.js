// src/screens/RatingScreen.js
import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useUser } from "../context/UserContext";

// const API_BASE = "http://localhost:3000";
const API_BASE = "https://cuisino.onrender.com";

const RatingScreen = () => {
  const { params } = useRoute();
  const { mealId, mealName } = params;
  const [rating, setRating] = useState(null);

  const { user } = useUser();

  const submitRating = async () => {
    if (!rating) return Alert.alert("Select a rating");

    try {
      const res = await fetch(`${API_BASE}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_id: mealId,
          rating,
          user_id: user.id, // 👈 send current user
        }),
      });
      const data = await res.json();
      Alert.alert("Thank you!", "Your rating has been submitted.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit rating.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate {mealName}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((num) => (
          <Button
            key={num}
            title={`${num}⭐`}
            color={rating === num ? "gold" : "gray"}
            onPress={() => setRating(num)}
          />
        ))}
      </View>
      <Button title="Submit Rating" onPress={submitRating} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  stars: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
});

export default RatingScreen;
