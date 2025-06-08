// src/screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import { cafeterias } from "../constants/cafeterias";
import { fetchWithRetry, safeJson } from "../constants/constants";

// const API_BASE = "http://localhost:3000";
const API_BASE = "https://cuisino.onrender.com";

const HomeScreen = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const userId = user?.userId;

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [mealsByCaf, setMealsByCaf] = useState({});
  const [extras, setExtras] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isWakingUp, setIsWakingUp] = useState(false);

  // const cafeterias = [
  //   { id: 1, name: "Cafeteria 1" },
  //   { id: 2, name: "Smoothie Shack" },
  //   { id: 3, name: "Cafeteria 2" },
  //   { id: 4, name: "Med Cafeteria" },
  //   { id: 5, name: "Seasons Deli" },
  // ];

  // fetch(`http://127.0.0.1:8000/recommend/${userId}`),
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsWakingUp(true);

        // Use fetchWithRetry for each fetch call
        const [t, r, mealsRes] = await Promise.all([
          fetchWithRetry(`${API_BASE}/meals/trending`),
          fetchWithRetry(
            `https://cuisino-knn-service.onrender.com/recommend/${userId}`
          ),
          fetchWithRetry(`${API_BASE}/meals`),
        ]);

        setTrending(
          t.length > 0
            ? t
            : mealsRes.sort(() => 0.5 - Math.random()).slice(0, 5)
        );

        setRecommendations(
          r.recommended_meals?.length > 0
            ? r
            : {
                recommended_meals: mealsRes
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 5),
              }
        );

        const results = {};
        for (const caf of cafeterias) {
          const cafData = await fetchWithRetry(
            `${API_BASE}/meals?cafeteria_id=${caf.id}`
          );
          results[caf.id] = cafData;
        }
        setMealsByCaf(results);
      } catch (err) {
        console.error("Data fetch error:", err.message);
        if (err.message.includes("cold start")) {
          setIsWakingUp(true);
        }
      } finally {
        setIsWakingUp(false);
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const mapCafeteriaName = (meal) => {
    const match = cafeterias.find((c) => c.id === meal.cafeteria_id);
    return match ? match.name : "Unknown Cafeteria";
  };

  const renderMealCard = (meal, index) => (
    <TouchableOpacity
      key={`${meal.id}-${meal.name}`}
      style={styles.card}
      onPress={() => navigation.navigate("MealDetails", { meal })}
    >
      <Image
        source={
          meal.image
            ? { uri: meal.image }
            : require("../assets/images/take-away.png")
        }
        style={styles.image}
      />
      <Text style={styles.name}>{meal.name}</Text>
      <Text style={styles.cafName}>
        {meal.cafeteria_name || mapCafeteriaName(meal)}
      </Text>

      <Text style={styles.price}>₦{meal.price}</Text>
      <Text style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
        {meal.availabilityStatus}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      {isWakingUp ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Waking server up, please wait...</Text>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Finding the perfect meals for you...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.userText}>
            <Text style={{ textTransform: "capitalize" }}>
              {" "}
              Hi, {user.name}{" "}
            </Text>
          </Text>
          <Text style={styles.sectionTitle}>Top Picks for You</Text>
          <FlatList
            horizontal
            data={recommendations.recommended_meals?.slice(0, 10) || []}
            // keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => renderMealCard(item)}
            showsHorizontalScrollIndicator={false}
          />

          {cafeterias.map((caf) => (
            <View key={caf.id} style={{ marginVertical: 20 }}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Buy from {caf.name}</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("MealList", {
                      cafeteriaId: caf.id,
                      title: caf.name,
                    })
                  }
                >
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>

              {!mealsByCaf[caf.id] ? (
                <ActivityIndicator size="small" color="#aaa" />
              ) : (
                <FlatList
                  horizontal
                  data={mealsByCaf[caf.id]}
                  // keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => renderMealCard(item)}
                  showsHorizontalScrollIndicator={false}
                />
              )}
            </View>
          ))}

          {extras.length > 0 && (
            <View style={{ marginBottom: 30 }}>
              <Text style={styles.sectionTitle}>Drinks & Extras</Text>
              <FlatList
                horizontal
                data={extras}
                // keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => renderMealCard(item)}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
    paddingTop: 10,
    backgroundColor: "#fff",
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  userText: { fontSize: 20, marginBottom: 12 },

  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginRight: 12,
    padding: 10,
    width: 140,
    alignItems: "center",
  },
  image: { width: 100, height: 100, borderRadius: 8, marginBottom: 8 },
  name: { fontWeight: "600", textAlign: "center" },
  price: { color: "#007AFF", marginTop: 4 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  seeAll: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  separator: { height: 1, backgroundColor: "#ddd" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "center",
    backgroundColor: "#fff",
  },
});

export default HomeScreen;
