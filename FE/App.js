// App.js
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabs from "./src/navigation/BottomTabs";
import LoginScreen from "./src/screens/LoginScreen";
import { UserProvider, useUser } from "./src/context/UserContext";
import { SafeAreaView } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { user } = useUser();

  useEffect(() => {
    console.log("Pinging server to wake it up...");
    fetch("https://cuisino.onrender.com/ping");
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={user ? "Main" : "Login"} // this is key
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={BottomTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <UserProvider>
        <AppContent />
        <StatusBar style="auto" />
      </UserProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
