import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MealListScreen = ({ route, navigation }) => {
  const { cafeteriaId, title } = route.params;
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://cuisino.onrender.com/meals?cafeteria_id=${cafeteriaId}`
        );
        const meals = await res.json();

        const grouped = meals.reduce((acc, meal) => {
          const cat = meal.category || "Uncategorized";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(meal);
          return acc;
        }, {});

        const sectionsArray = Object.entries(grouped).map(
          ([category, data]) => ({
            title: category,
            data: data.slice(0, 5), // Preview 5
            fullList: data, // for "See All"
          })
        );

        setSections(sectionsArray);
      } catch (err) {
        console.error("Failed to fetch meals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.header}>{title}</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading meals...</Text>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate("MealDetails", { meal: item })}
              style={styles.card}
            >
              <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
              <Text>₦{item.price}</Text>
            </TouchableOpacity>
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.row}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {/* {section.fullList.length > 5 && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("MealCategory", {
                      category: section.title,
                      meals: section.fullList,
                    })
                  }
                >
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              )} */}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#A1A1AA",
    flex: 1,
    padding: 8,
    borderRadius: 8,
    textAlign: "center",
  },
  seeAll: { color: "#007AFF" },
  card: {
    padding: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 50,
  },
});

export default MealListScreen;
