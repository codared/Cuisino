// src/screens/PaymentSuccessScreen.js
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { cafeterias } from "../constants/cafeterias";

export default function PaymentSuccessScreen({ route }) {
  const navigation = useNavigation();
  const { order } = route.params;
  console.log("order", order);
  console.log("order >>>", JSON.stringify(order, null, 2));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Payment Successful!</Text>
      <View>
        <Text style={styles.subtitle}>Order ID: {order._id}</Text>
      </View>
      <Text style={styles.label}>Meal: {order.meal_id.name}</Text>
      <Text style={styles.label}>
        From {cafeterias[order.cafeteria_id]?.name || "N/A"}
      </Text>

      <Text style={styles.label}>Total: ₦{order.total}</Text>

      <Text style={styles.label}>Sides:</Text>
      {order.sides?.length > 0 ? (
        <View>
          <FlatList
            data={order.sides}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.side}>
                - {item.name} x {item.qty} (₦{item.price})
              </Text>
            )}
          />
        </View>
      ) : (
        <Text style={styles.side}>None</Text>
      )}

      <Text style={styles.label}>
        Delivery: {order.delivery ? "Yes" : "No"}
      </Text>
      {order.delivery && (
        <Text style={styles.label}>
          Location: {order.deliveryLocation || "N/A"}
        </Text>
      )}

      <TouchableOpacity
        style={{
          marginTop: 30,
          padding: 12,
          backgroundColor: "#007AFF",
          borderRadius: 8,
        }}
        onPress={() => navigation.navigate("MainTabs", { screen: "Orders" })}
      >
        <Text
          style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
        >
          Go to Orders
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", color: "green", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginTop: 10 },
  side: { fontSize: 14, color: "#444" },
});
