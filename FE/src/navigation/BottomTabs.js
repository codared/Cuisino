// src/navigation/BottomTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";

import HomeScreen from "../screens/HomeScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CafeteriasScreen from "../screens/CafeteriasScreen";
import AdminOrdersScreen from "../screens/AdminOrdersScreen";
import EditMealScreen from "../screens/EditMealScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import MealListScreen from "../screens/MealListScreen";
import MealDetailsScreen from "../screens/MealDetailsScreen";
import PaymentScreen from "../screens/PaymentScreen";
import MealManagementScreen from "../screens/MealManagementScreen";
import PostNotificationScreen from "../screens/PostNotificationScreen";
import PaymentSuccessScreen from "../screens/PaymentSuccess";
import AddMealScreen from "../screens/AddMealScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function UserTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cafeterias"
        component={CafeteriasScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="History"
        component={OrderHistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Admin Orders"
        component={AdminOrdersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Edit Meals"
        component={MealManagementScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function BottomTabs() {
  const { user } = useUser();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MainTabs"
        component={user?.isAdmin ? AdminTabs : UserTabs}
      />
      <Stack.Screen name="MealList" component={MealListScreen} />
      <Stack.Screen name="MealDetails" component={MealDetailsScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Stack.Screen name="EditMealScreen" component={EditMealScreen} />
      <Stack.Screen
        name="PostNotification"
        component={PostNotificationScreen}
      />
      <Stack.Screen name="AddMealScreen" component={AddMealScreen} />
    </Stack.Navigator>
  );
}
