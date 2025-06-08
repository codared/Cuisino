// src/screens/MealManagementScreen.js
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import { fetchWithRetry, safeJson } from "../constants/constants";

// const API_BASE = "http://localhost:3000";
const API_BASE = "https://cuisino.onrender.com";

const MealManagementScreen = () => {
  const [meals, setMeals] = useState([]);
  const navigation = useNavigation();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [isWakingUp, setIsWakingUp] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.cafeteria_id) {
        const fetchMeals = async () => {
          try {
            const data = await fetchWithRetry(
              `${API_BASE}/meals/?cafeteria_id=${user?.cafeteria_id}`
            );
            setMeals(data);
            console.log("✅ Meals fetched:", data);
          } catch (err) {
            console.error("❌ Fetch error (focus effect):", err.message);
          } finally {
            setLoading(false);
          }
        };
        fetchMeals();
      }
    }, [user?.cafeteria_id])
  );

  const route = useRoute();

  useEffect(() => {
    const fetchUpdatedMeals = async () => {
      try {
        const data = await fetchWithRetry(
          `${API_BASE}/meals/?cafeteria_id=${user?.cafeteria_id}`
        );
        setMeals(data);
      } catch (err) {
        console.error("Fetch error (route update):", err.message);
      }
    };

    if (route.params?.updated) {
      console.log("🔄 Refreshing meals after update");
      fetchUpdatedMeals();
      route.params.updated = false;
    }
  }, [route.params?.updated]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Meals</Text>
      {isWakingUp ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Waking up server, please wait...</Text>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading meals...</Text>
        </View>
      ) : meals.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No meals found for this cafeteria.
        </Text>
      ) : (
        <View>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={meals}
            keyExtractor={(item, index) => `item?.id?.toString()${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("EditMealScreen", { meal: item })
                }
                style={[styles.card]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ paddingTop: 10, fontSize: 18, fontWeight: 500 }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{ paddingTop: 10, fontSize: 17, fontWeight: 500 }}
                  >
                    ₦{item.price}
                  </Text>
                </View>
                <Image
                  source={
                    item.image
                      ? { uri: item.image }
                      : require("../assets/images/take-away.png")
                  }
                  style={{
                    width: "100%",
                    height: 150,
                    borderRadius: 8,
                    marginTop: 10,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("AddMealScreen")}
      >
        <Text style={styles.plusText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    paddingBottom: 35,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "center",
  },
  card: {
    padding: 16,
    backgroundColor: "#E7B008",
    marginBottom: 10,
    borderRadius: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  plusText: {
    fontSize: 36,
    color: "#fff",
    marginTop: -3,
  },
});

export default MealManagementScreen;
