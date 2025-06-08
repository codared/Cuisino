import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useUser } from "../context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { cafeterias } from "../constants/cafeterias";

const PACK_PRICE = 250;
const DELIVERY_PRICE = 1000;

const MealDetailsScreen = ({ route, navigation }) => {
  const { meal } = route.params;
  const { user } = useUser();

  const [quantities, setQuantities] = useState({});
  const [packing, setPacking] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [locationModal, setLocationModal] = useState(false);

  const sides = [
    { name: "Plantain (6 pcs)", price: 300 },
    { name: "Chicken", price: 2500 },
    { name: "Sausage", price: 400 },
  ];

  const updateQty = (side, delta) => {
    setQuantities((prev) => {
      const newQty = Math.max(0, (prev[side.name] || 0) + delta);
      return { ...prev, [side.name]: newQty };
    });
  };

  useEffect(() => {
    if (delivery && !packing) setPacking(true);
    if (delivery && !deliveryLocation) setLocationModal(true);
  }, [delivery]);

  const total =
    meal.price +
    sides.reduce(
      (sum, side) => sum + (quantities[side.name] || 0) * side.price,
      0
    ) +
    (packing ? PACK_PRICE : 0) +
    (delivery ? DELIVERY_PRICE : 0);

  const placeOrder = async () => {
    console.log("meal", meal);
    const selectedSides = sides
      .map((s) => ({
        name: s.name,
        price: s.price,
        qty: quantities[s.name] || 0,
      }))
      .filter((s) => s.qty > 0);

    const order = {
      meal_id: meal._id,
      baseMeal: meal.name,
      basePrice: meal.price,
      sides: selectedSides,
      packing,
      delivery,
      deliveryLocation: delivery ? deliveryLocation : null,
      total,
      cafeteria_id: meal.cafeteria_id,
      user_id: user.userId,
      paid: false,
      quantity: 1,
    };
    // const res = await fetch("http://localhost:3000/orders",
    try {
      const res = await fetch("https://cuisino.onrender.com/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(order),
      });

      const data = await res.json(); // ✅ Read once

      if (!res.ok) {
        Alert.alert("❌ Failed", data.error || "Could not place order");
        return;
      }

      // Alert.alert("✅ Order placed!");

      navigation.navigate("Payment", {
        amount: total,
        email: user.email,
        order: data, // 👈 `data` is the placedOrder
      });
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Network error", "Please try again");
    }
  };

  const selectedSides = sides
    .map((s) => ({
      name: s.name,
      price: s.price,
      qty: quantities[s.name] || 0,
    }))
    .filter((s) => s.qty > 0);

  const [confirmModal, setConfirmModal] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleOrderPress = () => {
    console.log("handleOrderPress called");
    setConfirmModal(true); // show modal
  };

  return (
    <ScrollView
      style={{
        paddingHorizontal: 24,
        paddingTop: 20,
        backgroundColor: "white",
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ zIndex: 10 }}
      >
        <Ionicons name="arrow-back" size={28} color="#007AFF" />
      </TouchableOpacity>
      <Image
        source={
          meal.image
            ? { uri: meal.image }
            : require("../assets/images/take-away.png")
        }
        style={{
          width: "80%",
          height: 210,
          borderRadius: 10,
          marginTop: 20,
          alignSelf: "center",
        }}
      />
      <Text style={styles.title}>{meal.name}</Text>
      <Text style={styles.price}>₦{meal.price}</Text>
      <Text style={styles.section}>Sides</Text>
      {sides.map((side) => (
        <View key={side.name} style={styles.sideRow}>
          <Text>
            {side.name} (+ ₦{side.price})
          </Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity
              onPress={() => updateQty(side, -1)}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>
            <Text>{quantities[side.name] || 0}</Text>
            <TouchableOpacity
              onPress={() => updateQty(side, 1)}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <Text style={styles.section}>Options</Text>
      <View style={styles.switchRow}>
        <Text>Pack (₦{PACK_PRICE})</Text>
        <Switch value={packing} onValueChange={setPacking} />
      </View>
      <View style={styles.switchRow}>
        <Text>Deliver (₦{DELIVERY_PRICE})</Text>
        <Switch value={delivery} onValueChange={setDelivery} />
      </View>
      {selectedSides.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
            Selected Sides:
          </Text>
          {selectedSides.map((side, i) => (
            <Text key={i}>
              • {side.qty} × {side.name} (₦{side.price} each) = ₦
              {side.qty * side.price}
            </Text>
          ))}
        </View>
      )}
      {/* <Text style={styles.total}>Total: ₦{total}</Text>
      <TouchableOpacity onPress={placeOrder}>
        <Text style={styles.orderBtn}>Order Now</Text>
      </TouchableOpacity> */}
      <TouchableOpacity onPress={handleOrderPress}>
        {isConfirmed ? (
          <Text style={styles.orderBtn}></Text>
        ) : (
          <Text style={styles.orderBtn}>Confirm Order</Text>
        )}
      </TouchableOpacity>
      {/* Delivery location modal */}
      <Modal visible={locationModal} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Where would you be receiving this item?
            </Text>
            <TextInput
              value={deliveryLocation}
              onChangeText={setDeliveryLocation}
              placeholder="e.g. A308,4-man Deluxe or D17,College of Sciences"
              style={styles.modalInput}
            />
            <TouchableOpacity
              onPress={() => {
                if (deliveryLocation.trim() !== "") {
                  setLocationModal(false);
                }
              }}
              style={[
                styles.modalBtn,
                {
                  backgroundColor:
                    deliveryLocation.trim() === "" ? "#ccc" : "#007AFF",
                },
              ]}
              disabled={deliveryLocation.trim() === ""}
            >
              <Text style={styles.modalBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={confirmModal} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Review Your Order</Text>
            <Text style={{ marginBottom: 6 }}>
              Base: {meal.name} – ₦{meal.price}
            </Text>
            <Text>
              From Cafeteria: {cafeterias[meal.cafeteria_id]?.name || "Unknown"}
            </Text>
            {selectedSides.map((side, i) => (
              <Text key={i}>
                • {side.qty} × {side.name} = ₦{side.qty * side.price}
              </Text>
            ))}
            {packing && <Text>Packing: ₦{PACK_PRICE}</Text>}
            {delivery && (
              <Text>
                Delivery: ₦{DELIVERY_PRICE} to {deliveryLocation}
              </Text>
            )}
            <Text style={{ fontWeight: "bold", marginTop: 10 }}>
              Total: ₦{total}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setConfirmModal(false);
                setIsConfirmed(true);
                placeOrder(); // place the order immediately
              }}
              style={styles.modalBtn}
            >
              <Text style={styles.modalBtnText}>Confirm Order</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmModal(false)}>
              <Text style={{ textAlign: "center", marginTop: 8 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  price: { fontSize: 18, color: "#555", marginBottom: 20 },
  section: { fontWeight: "bold", fontSize: 16, marginTop: 20 },
  sideRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    alignItems: "center",
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyBtn: {
    backgroundColor: "#000000",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    alignItems: "center",
  },
  total: {
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 18,
    color: "#007AFF",
  },
  orderBtn: {
    marginTop: 60,
    textAlign: "center",
    fontSize: 16,
    color: "#007AFF",
  },
  modalWrap: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    padding: 30,
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
  },
  modalBtnText: {
    textAlign: "center",
    color: "white",
  },
});

export default MealDetailsScreen;
