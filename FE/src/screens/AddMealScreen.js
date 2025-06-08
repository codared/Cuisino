// screens/AddMealScreen.js
import React, { useEffect, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useUser } from "../context/UserContext";

const API_BASE = "https://cuisino.onrender.com";

const AddMealScreen = ({ navigation }) => {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(true);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
      console.log("Cloudinary response:", data);

      if (data.secure_url) {
        return data.secure_url;
      } else {
        console.warn("Upload failed:", data);
        return null;
      }
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!name || !price) return Alert.alert("Name and price required");

    const finalCategory = category === "__custom__" ? customCategory : category;

    try {
      setUploading(true);
      const imageUrl = image ? await uploadImageToCloudinary(image) : "";

      const res = await fetch(`${API_BASE}/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name,
          price,
          available,
          image: imageUrl,
          cafeteria_id: user.cafeteria_id,
          category: finalCategory || "Uncategorized",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Meal added successfully");
        navigation.goBack();
      } else {
        Alert.alert("Error", data?.error || "Something went wrong");
      }
    } catch (err) {
      Alert.alert("Upload failed", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ zIndex: 10 }}
      >
        <Ionicons name="arrow-back" size={28} color="#007AFF" />
      </TouchableOpacity>
      {image ? (
        <Image source={{ uri: image }} style={styles.preview} />
      ) : (
        <Image
          source={require("../assets/images/take-away.png")}
          style={styles.preview}
        />
      )}

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

      <Text style={styles.label}>Category</Text>
      <Picker
        selectedValue={category}
        onValueChange={(value) => setCategory(value)}
      >
        <Picker.Item label="Select Category" value="" />
        {categories.map((cat) => (
          <Picker.Item key={cat} label={cat} value={cat} />
        ))}
        <Picker.Item label="Custom..." value="__custom__" />
      </Picker>

      {category === "__custom__" && (
        <TextInput
          placeholder="Enter new category"
          value={customCategory}
          onChangeText={setCustomCategory}
          style={styles.input}
        />
      )}

      <Text style={styles.label}>Availability</Text>
      <Picker
        selectedValue={available}
        onValueChange={(value) => setAvailable(value)}
      >
        <Picker.Item label="Available" value={true} />
        <Picker.Item label="Not Available" value={false} />
      </Picker>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={{ fontSize: 19 }}>Select Image</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20 }}>
        <Button
          title={uploading ? "Saving..." : "Save Meal"}
          onPress={handleSave}
          disabled={uploading}
        />
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
  preview: { width: "80%", height: 250, borderRadius: 8, alignSelf: "center" },
});

export default AddMealScreen;
