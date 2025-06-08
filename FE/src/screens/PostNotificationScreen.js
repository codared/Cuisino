// src/screens/PostNotificationScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useUser } from "../context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PostNotificationScreen = () => {
  const { user } = useUser();

  const [message, setMessage] = useState("");

  const navigation = useNavigation();

  const postNotification = async () => {
    if (!message.trim()) {
      Alert.alert("Message is required");
      return;
    }

    try {
      const res = await fetch("https://cuisino.onrender.com/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`, // replace with your secure token
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("✅ Notification posted");
        setMessage("");
      } else {
        Alert.alert("❌ Failed", data.error || "Something went wrong");
      }
    } catch (err) {
      Alert.alert("Error", "Could not connect to server.");
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ zIndex: 10 }}
      >
        <Ionicons name="arrow-back" size={28} color="#007AFF" />
      </TouchableOpacity>
      <Text style={styles.label}>Post New Notification</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        style={styles.input}
        placeholder="Enter message to notify users"
        multiline
      />
      <Button
        title="Post Notification"
        onPress={postNotification}
        color="#28a745"
        disabled={true}
      />
      <Text style={{ alignSelf: "center", color: "gray" }}>
        Feature coming soon!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 24,
    flex: 1,
    backgroundColor: "#fff",
  },
  label: { fontSize: 18, fontWeight: "bold", marginBottom: 10, marginTop: 30 },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: "top",
  },
});

export default PostNotificationScreen;
