import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import io from "socket.io-client";
import { Alert } from "react-native";

const UserContext = createContext();
// export const socket = io("http://localhost:3000");
// Use LAN IP on physical device
export const socket = io("https://cuisino.onrender.com");

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const json = await AsyncStorage.getItem("user");
        if (json) {
          setUser(JSON.parse(json));
        }
      } catch (err) {
        console.error("Failed to load user from storage:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const saveUser = async () => {
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem("user");
      }
    };
    saveUser();
  }, [user]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("📶 Connected to WebSocket");
    });

    if (user?.userId) {
      socket.on(`order_status_${user.userId}`, (data) => {
        Alert.alert(
          "Order Update",
          `Your order for ${data.meal} is now ${data.status}`
        );
      });
    }

    if (user?.isAdmin) {
      socket.on("new_order", (order) => {
        Alert.alert(
          "📢 New Order",
          `User ${order.user_id} ordered ${order.meal}`
        );
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#E7B008" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
});

export const useUser = () => useContext(UserContext);
