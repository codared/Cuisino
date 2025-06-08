import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useUser } from "../context/UserContext";
import { fetchWithRetry, safeJson } from "../constants/constants";

// const API_BASE = "http://localhost:3000";
const API_BASE = "https://cuisino.onrender.com";

const OrdersScreen = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user?.token || hasFetchedOnce) return;

      console.log("Fetching orders for user:", user);

      const fetchOrders = async () => {
        const timeout = setTimeout(() => setIsWakingUp(true), 3000);

        try {
          setLoading(true);
          const res = await fetchWithRetry(`${API_BASE}/orders/user`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });

          if (Array.isArray(res)) {
            setOrders(res);
            setHasFetchedOnce(true); // ✅ Mark fetch as done
          }
        } catch (err) {
          console.error("Order fetch error (focus):", err.message);
        } finally {
          clearTimeout(timeout);
          setIsWakingUp(false);
          setLoading(false);
        }
      };

      fetchOrders();
    }, [user?.token, hasFetchedOnce])
  );

  const filtered = orders.filter((o) =>
    filter === "pending"
      ? ["Pending", "Ready", "Sent out"].includes(o.status)
      : ["Completed", "Cancelled"].includes(o.status)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "green";
      case "Cancelled":
        return "red";
      case "Sent out":
        return "blue";
      case "Ready":
        return "orange";
      case "Pending":
      default:
        return "gray";
    }
  };

  const onRefresh = async () => {
    if (!user?.token) return;

    setRefreshing(true);
    try {
      const res = await fetchWithRetry(`${API_BASE}/orders/user`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (Array.isArray(res)) {
        setOrders(res);
      }
    } catch (err) {
      console.error("Order refresh error:", err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const handlePress = () => {
      Alert.alert("Order ID", `#${item._id.slice(-4)}`);
    };

    return (
      <TouchableOpacity
        key={`${item._id}-${index}`}
        style={styles.row}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {item.meal_id?.image ? (
          <Image source={{ uri: item.meal_id.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {item.meal_id?.name || "Unknown Meal"}
          </Text>
          <Text style={styles.caf}>
            Cafeteria: {item.cafeteria_id || "N/A"}
          </Text>
          <Text style={styles.date}>
            {new Date(item.created_at || item.timestamp).toLocaleString()}
          </Text>
        </View>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: "#fff" }}>
      <Text style={styles.title}>My Orders</Text>
      {isWakingUp ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Waking up server, please wait...</Text>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Fetching your orders...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.toggle}>
            <TouchableOpacity
              onPress={() => setFilter("pending")}
              style={[styles.tab, filter === "pending" && styles.activeTab]}
            >
              <Text style={styles.tabText}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter("delivered")}
              style={[styles.tab, filter === "delivered" && styles.activeTab]}
            >
              <Text style={styles.tabText}>Completed</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filtered}
            // keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
            refreshing={refreshing}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {filter === "pending"
                    ? "You have no pending orders"
                    : "You have no delivered orders"}
                </Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  toggle: { flexDirection: "row", marginBottom: 16 },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  activeTab: { borderBottomColor: "#007AFF" },
  tabText: { fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  placeholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#ccc",
  },
  name: { fontSize: 16, fontWeight: "bold" },
  caf: { color: "#555", fontSize: 13 },
  date: { color: "#888", fontSize: 12 },
  status: { fontWeight: "600", marginLeft: 10 },
  separator: { height: 1, backgroundColor: "#ddd" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    fontStyle: "italic",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default OrdersScreen;
