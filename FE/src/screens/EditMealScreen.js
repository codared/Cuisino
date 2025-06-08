import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";

const API_BASE = "https://cuisino.onrender.com";

const EditMealScreen = ({ route, navigation }) => {
  const { meal } = route.params || {};
  const { user } = useUser();

  const [name, setName] = useState(meal?.name || "");
  const [price, setPrice] = useState(meal?.price?.toString() || "");
  const [image, setImage] = useState(meal?.image || null);
  const [newImage, setNewImage] = useState(null); // if updated
  const [uploading, setUploading] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(
    meal?.availabilityStatus || "Available"
  );
  const [customTime, setCustomTime] = useState("");
  const [loading, setLoading] = useState(false); // used for delete

  const predefinedOptions = [
    "Available",
    "Temporarily Unavailable",
    "Available in 5 mins",
    "Finished for the Day",
    "Last Batch",
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (uri) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "meal.jpg",
    });
    formData.append("upload_preset", "ml_default");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dan8108wf/image/upload",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await res.json();
      if (data.secure_url) return data.secure_url;
      else throw new Error("Image upload failed");
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return null;
    }
  };

  const updateMeal = async () => {
    if (!name || !price) {
      return Alert.alert("Missing info", "Name and price are required");
    }

    setUploading(true);

    try {
      let finalImageUrl = image;

      if (newImage) {
        const uploadedUrl = await uploadImageToCloudinary(newImage);
        if (!uploadedUrl) throw new Error("Image upload failed");
        finalImageUrl = uploadedUrl;
      }

      const payload = {
        name,
        price: parseFloat(price),
        image: finalImageUrl,
        availabilityStatus:
          availabilityStatus === "Available in 5 mins" && customTime
            ? `Available in ${customTime}`
            : availabilityStatus,
      };

      const res = await fetch(`${API_BASE}/meals/${meal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("✅ Meal Updated", "Changes saved");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.error || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", err.message || "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const deleteMeal = async (mealId) => {
    Alert.alert(
      "⚠️ Confirm Deletion",
      "Are you sure you want to delete this meal?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const res = await fetch(`${API_BASE}/meals/${mealId}`, {
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
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#007AFF" />
      </TouchableOpacity>

      {newImage || image ? (
        <Image source={{ uri: newImage || image }} style={styles.preview} />
      ) : (
        <Image
          source={require("../assets/images/take-away.png")}
          style={styles.preview}
        />
      )}

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={{ fontSize: 18 }}>Select Image</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Meal Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Price (₦)</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
        returnKeyType="done"
      />

      <Text style={styles.label}>Availability Status</Text>
      <Picker
        selectedValue={availabilityStatus}
        onValueChange={setAvailabilityStatus}
      >
        {predefinedOptions.map((opt) => (
          <Picker.Item key={opt} label={opt} value={opt} />
        ))}
      </Picker>

      {availabilityStatus === "Available in 5 mins" && (
        <>
          <Text style={styles.label}>Custom Time (e.g. 10 mins)</Text>
          <TextInput
            placeholder="Enter custom time"
            value={customTime}
            onChangeText={setCustomTime}
            style={styles.input}
          />
        </>
      )}

      {uploading ? (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 20 }}
        />
      ) : (
        <View style={{ marginTop: 5 }}>
          <Button title="Update Meal" onPress={updateMeal} />
        </View>
      )}

      <View style={{ alignItems: "center", marginTop: 9 }}>
        <TouchableOpacity
          onPress={() => deleteMeal(meal._id)}
          disabled={loading}
        >
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
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Deleting..." : "Delete Meal"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  label: { marginTop: 12, fontSize: 16, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  imagePicker: {
    marginVertical: 10,
    backgroundColor: "#eee",
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  preview: {
    width: "80%",
    height: 250,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 10,
  },
});

export default EditMealScreen;
