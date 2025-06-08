import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function MealCategoryScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, meals } = route.params;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: category,
      headerBackTitleVisible: false,
      headerTintColor: "#000",
    });
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image
        source={{
          uri: item.image || "https://via.placeholder.com/100",
        }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₦{item.price}</Text>
        {item.availability !== "available" && (
          <Text style={styles.status}>{item.availability}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: "#fff" },
  card: {
    flexDirection: "row",
    marginVertical: 8,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    overflow: "hidden",
  },
  image: { width: 100, height: 100 },
  info: { padding: 10, flex: 1 },
  name: { fontWeight: "bold", fontSize: 16 },
  price: { color: "#007AFF", marginTop: 4 },
  status: {
    marginTop: 6,
    color: "red",
    fontSize: 13,
    fontStyle: "italic",
  },
});
