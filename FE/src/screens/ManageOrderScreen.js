import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, StyleSheet } from "react-native";

const ManageOrdersScreen = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    // const res = await fetch("http://localhost:3000/orders");
    const res = await fetch("https://cuisino.onrender.com/orders");
    const data = await res.json();
    setOrders(data);
  };
  // const res = await fetch(`http://localhost:3000/orders/${id}`,
  const updateStatus = async (id, newStatus) => {
    const res = await fetch(`https://cuisino.onrender.com/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      alert("Status updated!");
      fetchOrders();
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text>
            {item.meal} - {item.status}
          </Text>
          <Text>User: {item.user_id}</Text>
          <View style={styles.buttons}>
            <Button
              title="Ready"
              onPress={() => updateStatus(item.id, "Ready")}
            />
            <Button
              title="Delivered"
              onPress={() => updateStatus(item.id, "Delivered")}
            />
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: { padding: 10, borderBottomWidth: 1 },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
});

export default ManageOrdersScreen;
