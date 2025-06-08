// src/screens/AdminOrdersScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useUser } from "../context/UserContext";

const AdminOrdersScreen = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);

  const isToday = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // `http://localhost:3000/orders/cafeteria/${user?.adminCafeteriaId}`,

  const fetchOrders = async () => {
    console.log("cid", user?.cafeteria_id);
    console.log("token", user?.token);

    try {
      const res = await fetch(
        `https://cuisino.onrender.com/admin/orders?cafeteria_id=${user?.cafeteria_id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      const text = await res.text(); // get raw text response
      console.log("🧾 Raw response text:", text);

      //Detect Render cold start (HTML response instead of JSON)
      if (text.startsWith("<")) {
        console.warn("Server returned HTML — likely cold starting");
        setIsWakingUp(true);
        return;
      }

      //Parse if it's valid JSON
      const data = JSON.parse(text);
      setOrders(data);
      console.log(" Orders fetched:", orders);
    } catch (err) {
      console.error("Fetch or parse error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // const res = await fetch(`http://localhost:3000/orders/${orderId}`,

  const updateStatus = async (orderId, status) => {
    setStatusUpdateLoading(orderId);

    try {
      const res = await fetch(
        `https://cuisino.onrender.com/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (res.ok) {
        Alert.alert("✅ Status updated");
        fetchOrders();
      } else {
        const error = await res.json();
        Alert.alert("❌ Failed to update", error?.error || "Unknown error");
      }
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("❌ Network error", "Please try again later.");
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  useEffect(() => {
    console.log("Logged-in admin user:", user);
    fetchOrders();
  }, []);

  const renderItem = ({ item }) => {
    console.log("Rendering order:", item);
    const isExpanded = item._id === expandedOrderId; // Also note: use `_id` from MongoDB
    const timeStamp = new Date(item.timestamp);
    const dateLabel = isToday(timeStamp)
      ? "Today"
      : timeStamp.toLocaleDateString();
    const statusOptions = [
      "Pending",
      "Ready",
      "Completed",
      "Sent out",
      "Cancelled",
    ];

    return (
      <TouchableOpacity
        onPress={() => setExpandedOrderId(isExpanded ? null : item._id)}
      >
        <View style={styles.card}>
          <Text style={styles.text}>MEAL: {item.meal_id?.name}</Text>
          <Text>DATE: {dateLabel}</Text>
          <Text>CUSTOMER: {item.user_id?.name}</Text>
          <Text>PHONE: {item.user_id?.phone || "No phone number added"}</Text>
          <Text>LOCATION: {item.deliveryLocation}</Text>
          <Text>STATUS: {item.status}</Text>
          <Text>TIME: {timeStamp.toLocaleTimeString()}</Text>
          {isExpanded && (
            <>
              <Text style={styles.section}>SIDES:</Text>
              {(item.sides || []).map((s, i) => (
                <Text key={i}>
                  - {s.name} x{s.qty} (₦{s.price})
                </Text>
              ))}

              <Text>Packing: {item.packing ? "Yes" : "No"}</Text>
              <Text>Delivery: {item.delivery ? "Yes" : "No"}</Text>
              <Text>Paid: {item.paid ? "✅" : "❌"}</Text>
              <Text>Total: ₦{item.total}</Text>
              <Text style={{ fontSize: 14, color: "#555", marginBottom: 4 }}>
                Order ID: {item._id}
              </Text>
            </>
          )}
          {statusUpdateLoading === item._id ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : (
            <FlatList
              data={statusOptions}
              horizontal
              keyExtractor={(item) => item}
              contentContainerStyle={styles.btnGroup}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: statusOption }) => (
                <TouchableOpacity
                  style={[
                    styles.statusBtn,
                    item.status === statusOption && styles.activeBtn,
                  ]}
                  onPress={() => updateStatus(item._id, statusOption)}
                >
                  <Text
                    style={[
                      styles.statusBtnText,
                      item.status === statusOption && styles.activeBtnText,
                    ]}
                  >
                    {statusOption}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cafeteria Orders</Text>
      {isWakingUp ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Waking up server... please wait</Text>
        </View>
      ) : loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          // keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>There are no orders yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 35,
  },
  card: {
    backgroundColor: "#f2f2f2",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  text: { fontWeight: "bold", marginBottom: 4 },
  btnGroup: { marginTop: 10, flexDirection: "row", gap: 8 },
  statusBtn: {
    backgroundColor: "#eee",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  activeBtn: {
    backgroundColor: "#007AFF",
  },

  statusBtnText: {
    fontWeight: "600",
    color: "#333",
  },

  activeBtnText: {
    color: "#fff",
  },

  section: { marginTop: 10, fontWeight: "bold" },

  loaderContainer: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
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
  btnGroup: {
    paddingVertical: 10,
    flexDirection: "row",
    gap: 8, // or `columnGap: 8` if needed in newer React Native versions
  },

  statusBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginRight: 8,
  },

  activeBtn: {
    backgroundColor: "#007AFF",
  },

  statusBtnText: {
    color: "#333",
  },

  activeBtnText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AdminOrdersScreen;
