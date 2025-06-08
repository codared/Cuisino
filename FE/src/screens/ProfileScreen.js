import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import { useUser } from "../context/UserContext";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useUser();
  const userId = user.userId;

  // const user = {
  //   name: "James Ohue",
  //   userId: "user_1",
  //   isAdmin: false, // update if this user is an admin
  // };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          setUser(null); // Clear the user from context
          navigation.replace("Login"); // Go to login screen
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.infoBox}>
        {user.isAdmin ? null : <Text style={styles.label}>Name:</Text>}
        {user.isAdmin ? null : <Text style={styles.value}>{user.name}</Text>}

        <Text style={styles.label}>Email address:</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>Phone number:</Text>
        <Text style={styles.value}>{user.phone || "Not set"}</Text>

        {/* <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user.isAdmin ? "Admin" : "Student"}</Text> */}
      </View>

      {user.isAdmin ? (
        <Button
          title="Post Notification"
          onPress={() => navigation.navigate("PostNotification")}
        />
      ) : null}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* {user.isAdmin && (
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() =>
            // Alert.alert("Admin Panel", "Navigate to admin orders screen.")
            navigation.navigate("AdminOrders")
          }
        >
          <Text style={styles.adminText}>Go to Admin Orders</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  infoBox: { marginBottom: 30 },
  label: { fontSize: 16, fontWeight: "600", marginTop: 10 },
  value: { fontSize: 16, color: "#555" },
  logoutButton: {
    backgroundColor: "#FF3B30",
    padding: 14,
    marginTop: 40,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  adminButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  adminText: { color: "#fff", fontSize: 16 },
});

export default ProfileScreen;
