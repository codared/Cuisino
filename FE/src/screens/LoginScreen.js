import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Switch,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useUser } from "../context/UserContext";
import { cafeterias } from "../constants/cafeterias";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";

export default function AuthScreen({ navigation }) {
  const { setUser } = useUser();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [selectedCafeteriaId, setSelectedCafeteriaId] = useState();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic required fields
    if (loading) return;

    if (mode === "register" && (!name || !email || !password)) {
      alert("Please fill all required fields");
      return;
    }
    if (mode === "login" && (!email || !password)) {
      alert("Please enter email and password");
      return;
    }

    // Admin-specific checks
    if (isAdmin) {
      if (!adminKey) {
        alert("Please enter admin key");
        return;
      }
      if (mode === "register" && !selectedCafeteriaId) {
        alert("Please select a cafeteria");
        return;
      }
    }

    const body =
      mode === "login"
        ? {
            email,
            password,
            adminKey: isAdmin ? adminKey : undefined,
            cafeteriaId: selectedCafeteriaId,
          }
        : {
            name,
            email,
            password,
            phone,
            adminKey: isAdmin ? adminKey : undefined,
            cafeteriaId: isAdmin ? selectedCafeteriaId : undefined,
            isAdmin,
          };

    setLoading(true);
    try {
      const endpoint =
        mode === "login"
          ? "https://cuisino.onrender.com/login"
          : "https://cuisino.onrender.com/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) return Alert.alert("❌ Error", data.error || "Failed");

      setUser({ ...data.user, token: data.token });
      navigation.replace("Main");
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Network Error", "Check your connection and try again");
    } finally {
      setLoading(false);
    }
  };

  // Clear cafeteria and adminKey when toggling admin switch
  React.useEffect(() => {
    if (!isAdmin) {
      setAdminKey("");
      setSelectedCafeteriaId(undefined);
    }
  }, [isAdmin]);

  // Clear name, phone, cafeteriaId, adminKey when switching mode (login/register)
  React.useEffect(() => {
    setName("");
    setPhone("");
    setAdminKey("");
    setSelectedCafeteriaId(undefined);
  }, [mode]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{mode === "login" ? "Login" : "Sign Up"}</Text>

      {mode === "register" && (
        <>
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </>
      )}

      {mode === "login" && (
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      )}

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        style={styles.input}
      />
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <Text style={{ color: "#007AFF", marginBottom: 10 }}>
          {showPassword ? "Hide Password" : "Show Password"}
        </Text>
      </TouchableOpacity>

      <View style={styles.switchRow}>
        <Text>Are you an admin?</Text>
        <Switch value={isAdmin} onValueChange={setIsAdmin} />
      </View>

      {isAdmin && (
        <>
          <TextInput
            placeholder={
              selectedCafeteriaId
                ? `Enter ${
                    cafeterias.find((c) => c.id === selectedCafeteriaId)?.name
                  } Admin Key`
                : "Enter Admin Key"
            }
            value={adminKey}
            onChangeText={setAdminKey}
            editable={!!selectedCafeteriaId}
            style={[
              styles.input,
              !selectedCafeteriaId && { backgroundColor: "#f0f0f0" },
            ]}
          />

          {isAdmin && !selectedCafeteriaId && (
            <Text style={{ color: "red", marginBottom: 8 }}>
              Select a cafeteria before entering admin key
            </Text>
          )}

          {/* 👇 Dropdown to select cafeteria */}
          <Text style={{ marginBottom: 4 }}>Select Cafeteria</Text>
          <Picker
            selectedValue={selectedCafeteriaId}
            onValueChange={(value) => setSelectedCafeteriaId(value)}
            style={styles.input}
          >
            <Picker.Item label="-- Select Cafeteria --" value={undefined} />
            {cafeterias.map((caf) => (
              <Picker.Item key={caf.id} label={caf.name} value={caf.id} />
            ))}
          </Picker>
          {isAdmin && selectedCafeteriaId && (
            <Text
              style={{ fontStyle: "italic", color: "#555", marginBottom: 10 }}
            >
              Selected Cafeteria:{" "}
              {cafeterias.find((c) => c.id === selectedCafeteriaId)?.name ||
                "Unknown"}
            </Text>
          )}
        </>
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginVertical: 20 }}
        />
      ) : (
        <Button
          title={mode === "login" ? "Login" : "Create Account"}
          onPress={handleSubmit}
        />
      )}

      <TouchableOpacity
        onPress={() => setMode(mode === "login" ? "register" : "login")}
      >
        <Text style={styles.switchText}>
          {mode === "login"
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    flex: 1,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    paddingVertical: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "space-between",
  },
  switchText: {
    marginTop: 16,
    textAlign: "center",
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});
