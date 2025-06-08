// src/screens/OrderHistoryScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useUser } from "../context/UserContext";

const OrderHistoryScreen = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      // const res = await fetch(`http://localhost:3000/orders`);
      const res = await fetch(` https://cuisino.onrender.com/orders`);

      const data = await res.json();
      const filtered = data.filter((order) => order.user_id === user.userId);
      setOrders(filtered);
    };

    fetchOrders();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Past Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text>{item.meal}</Text>
            <Text>Order Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, paddingHorizontal: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  orderItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default OrderHistoryScreen;
