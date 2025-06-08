import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Alert,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

import { ActivityIndicator } from "react-native";
import { useUser } from "../context/UserContext";
import { Ionicons } from "@expo/vector-icons";

const EditMealScreen = ({ route, navigation }) => {
  const { meal } = route.params || {};
  const { user } = useUser();
  const [name, setName] = useState(meal?.name || "");
  const [price, setPrice] = useState(meal?.price?.toString() || "");
  const [image, setImage] = useState(meal?.image || "");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(
    meal?.availabilityStatus || "Available"
  );
  const predefinedOptions = [
    "Available",
    "Temporarily Unavailable",
    "Available in 5 mins",
    "Finished for the Day",
    "Last Batch",
  ];

  const [customTime, setCustomTime] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧿 Request permission on mount
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please grant access to your media.");
    }
  };

  React.useEffect(() => {
    requestPermission();
  }, []);

  const pickImage = async () => {
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        options: { mediaTypes: ["images"] },
        base64: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        const base64Img = `data:image/jpg;base64,${result.assets[0].base64}`;
        const data = {
          file: base64Img,
          upload_preset: "ml_default",
        };

        setUploading(true);

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dan8108wf/image/upload",
          {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          }
        );

        const cloud = await res.json();
        console.log("cloud", cloud);

        if (cloud.secure_url) {
          setImage(cloud.secure_url);
          setImageUrl(cloud.secure_url);
          Alert.alert(
            "✅ Uploaded",
            "Image uploaded successfully. \n Your image will be updated shortly."
          );
          // navigation.navigate("Edit Meals", { updated: true });
          // navigation.goBack();
        } else {
          Alert.alert(
            "❌ Upload Failed",
            cloud.error?.message || "Unknown error"
          );
        }
      }
    } catch (err) {
      console.error("Picker error:", err);
      Alert.alert("❌ Error", "Image selection failed.");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  //  const res = await fetch(`http://localhost:3000/meals/${meal.id}`,

  const updateMeal = async () => {
    setLoading(true);
    const payload = {
      name,
      price: parseFloat(price),
      image,
      availabilityStatus:
        availabilityStatus === "Available in 5 mins" && customTime
          ? `Available in ${customTime}`
          : availabilityStatus,
    };

    console.log("Updating meal ID:", meal._id);
    console.log("Payload:", payload);
    console.log("Token:", user.token);

    try {
      const res = await fetch(
        `https://cuisino.onrender.com/meals/${meal._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        Alert.alert("✅ Meal Updated", "Changes saved.");
        navigation.goBack();
      } else {
        console.error("Update failed:", data);
        Alert.alert("❌ Failed", data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Update exception:", err);
      Alert.alert("Error", "Failed to update meal");
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (mealId) => {
    setLoading(true);
    try {
      const res = await fetch(`https://cuisino.onrender.com/meals/${mealId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("✅ Meal deleted");
        navigation.goBack();
      } else {
        Alert.alert("Error", data?.error || "Could not delete meal");
      }
    } catch (err) {
      console.log("error deleting meal:", err);
      Alert.alert("Error", "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!meal) {
    return (
      <View style={styles.container}>
        <Text>No meal found</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#E7B008" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ zIndex: 10 }}
      >
        <Ionicons name="arrow-back" size={28} color="#007AFF" />
      </TouchableOpacity>
      {image ? (
        <Image
          source={{
            uri: image,
          }}
          style={{
            width: "50%",
            height: 200,
            marginTop: 15,
            alignSelf: "center",
          }}
        />
      ) : (
        <Image
          source={require("../assets/images/take-away.png")}
          style={{
            width: "50%",
            height: 200,
            marginTop: 15,
            alignSelf: "center",
          }}
        />
      )}
      {uploading && (
        <ActivityIndicator
          size="large"
          color="#000000"
          style={{ marginVertical: 20 }}
        />
      )}

      <Text style={[styles.label, { paddingTop: 35 }]}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholder="Meal name"
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        style={styles.input}
        keyboardType="numeric"
        returnKeyType="done"
        placeholder="Meal price"
      />

      <Button title="Upload Image" onPress={pickImage} />

      <Text style={styles.label}>Availability</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={availabilityStatus}
          onValueChange={(itemValue) => setAvailabilityStatus(itemValue)}
        >
          <Picker.Item label="Available" value="Available" />
          <Picker.Item
            label="Available in 5 mins"
            value="Available in 5 mins"
          />
          <Picker.Item
            label="Temporarily Unavailable"
            value="Temporarily Unavailable"
          />
          <Picker.Item label="Last Batch" value="Last Batch" />
          <Picker.Item
            label="Finished for the Day"
            value="Finished for the Day"
          />
        </Picker>
      </View>

      {availabilityStatus === "Available in 5 mins" && (
        <TextInput
          style={styles.input}
          placeholder="e.g. 10 mins"
          value={customTime}
          onChangeText={setCustomTime}
        />
      )}

      <View style={{ marginTop: 0 }}>
        <Button title="Save Changes" onPress={updateMeal} />
      </View>

      <View style={{ alignItems: "center", marginTop: 30 }}>
        <TouchableOpacity onPress={() => deleteMeal(meal._id)}>
          <Text
            style={{
              backgroundColor: "red",
              width: 250,
              borderRadius: 20,
              textAlign: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: 20,
              padding: 15,
            }}
          >
            Delete Meal
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 10,
    backgroundColor: "#fff",
  },
  label: { fontWeight: "bold", marginBottom: 5 },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 8,
  },
  image: {
    marginTop: 50,
    width: "100%",
    height: 180,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
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

export default EditMealScreen;
