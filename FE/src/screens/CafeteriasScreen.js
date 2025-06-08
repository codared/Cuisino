// src/screens/CafeteriasScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { cafeterias } from "../constants/cafeterias";

// const CAFETERIAS = [
//   { id: 1, name: "CAFETERIA 1" },
//   { id: 2, name: "SMOOTHIE SHACK" },
//   { id: 3, name: "CAFETERIA 2" },
//   { id: 4, name: "MED CAFETERIA" },
//   { id: 5, name: "SEASONS DELI" },
// ];

const CafeteriasScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cafeterias</Text>
      <FlatList
        data={cafeterias}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("MealList", {
                cafeteriaId: item.id,
                title: item.name,
              })
            }
          >
            <Text style={styles.cardText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  card: {
    padding: 20,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
  },
  cardText: { fontSize: 18 },
});

export default CafeteriasScreen;
