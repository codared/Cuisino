// src/AppContent.js
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import BottomTabs from "./navigation/BottomTabs";
import { useUser } from "./context/UserContext";
import { socket, registerSocket } from "./utils/socket";
import { StatusBar } from "expo-status-bar";

const AppContent = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user?.userId) {
      registerSocket(user.userId, user.role || "user");

      socket.on("order_update", (order) => {
        alert(`🚀 Your order for ${order.meal} is now ${order.status}`);
      });

      socket.on("new_order", (order) => {
        if (user.role === "admin") {
          alert(`📢 New order: ${order.meal} from ${order.user_id}`);
        }
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [user?.userId]);

  return (
    <View style={styles.container}>
      <BottomTabs />
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

export default AppContent;
