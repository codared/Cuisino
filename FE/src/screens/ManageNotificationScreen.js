import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, Alert, StyleSheet } from "react-native";

const ManageNotificationsScreen = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    // const res = await fetch("http://localhost:3000/notifications");
    const res = await fetch("https://cuisino.onrender.com/notifications");
    const data = await res.json();
    setNotifications(data);
  };
  // const res = await fetch(`http://localhost:3000/notifications/${index}`,
  const deleteNotification = async (index) => {
    const res = await fetch(
      `https://cuisino.onrender.com/notifications/${index}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );

    if (res.ok) {
      Alert.alert("✅ Deleted");
      fetchNotifications();
    } else {
      Alert.alert("❌ Failed");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text>{item.message}</Text>
            <Button
              title="❌ Delete"
              onPress={() => deleteNotification(index)}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  item: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default ManageNotificationsScreen;
