import React, { useEffect, useRef, useState } from "react";
import { View, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function PaymentScreen({ route, navigation }) {
  const { amount, email, order } = route.params;
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [reference, setReference] = useState(null);
  const webviewRef = useRef(null);

  const callback_url = "https://example.com/payment-success"; // doesn't have to resolve
  const cancel_url = "https://cuisino.app/payment-cancel";

  useEffect(() => {
    const initializePayment = async () => {
      try {
        console.log("Initializing payment with:", { email, amount, order });

        const res = await fetch(
          "https://api.paystack.co/transaction/initialize",
          {
            method: "POST",
            headers: {
              Authorization:
                "Bearer sk_test_cc58eabc688ab8ebc98cbc1567b9843fd141b53b",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              amount: amount * 100,
              callback_url,
              metadata: {
                order_id: order._id,
              },
            }),
          }
        );

        const data = await res.json();
        console.log("Paystack init response:", data);

        if (data.status) {
          setPaymentUrl(data.data.authorization_url);
          setReference(data.data.reference);
        } else {
          Alert.alert("Failed", "Could not initialize payment.");
          navigation.goBack();
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Network Error", "Could not start payment.");
        navigation.goBack();
      }
    };

    initializePayment();
  }, []);

  const handleNavigation = async (navState) => {
    const { url } = navState;
    console.log("🌍 Navigated to:", url);

    if (url.includes("example.com/payment-success")) {
      try {
        const res = await fetch(
          `https://cuisino.onrender.com/verify/${reference}`
        );

        if (!res.ok) {
          // Read raw text to help debug
          const text = await res.text();
          console.error("Verification failed, response text:", text);
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Parse JSON only if response OK
        const data = await res.json();
        console.log("Verification response data:", data);

        if (data?.order?.paid) {
          navigation.replace("PaymentSuccess", { order: data.order });
        } else {
          Alert.alert("❌ Payment failed to verify.");
          navigation.goBack();
        }
      } catch (err) {
        console.error("❌ Verification error:", err);
        Alert.alert("❌ Verification Error");
        navigation.goBack();
      }
    }

    if (url.includes(cancel_url) || url.includes("paystack.co/close")) {
      Alert.alert("❌ Payment cancelled");
      navigation.goBack();
    }
  };

  if (!paymentUrl) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  console.log("🧾 Payment URL:", paymentUrl);

  return (
    <WebView
      ref={webviewRef}
      source={{ uri: paymentUrl }}
      onNavigationStateChange={handleNavigation}
      style={{ flex: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
