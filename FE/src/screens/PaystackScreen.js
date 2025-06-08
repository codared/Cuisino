// import React from "react";
// import { View } from "react-native";
// import { WebView } from "react-native-webview";

// const PaystackScreen = () => {
//   const amount = 2000 * 100; // Kobo
//   const email = "test@example.com";
//   const publicKey = "pk_test_XXXXXXXXXXXXXXXXXXXXXXXX";

//   const html = `
//     <html>
//     <head><script src="https://js.paystack.co/v1/inline.js"></script></head>
//     <body>
//       <script>
//         PaystackPop.setup({
//           key: '${publicKey}',
//           email: '${email}',
//           amount: ${amount},
//           callback: function(response){
//             window.ReactNativeWebView.postMessage('Payment successful');
//           },
//           onClose: function(){
//             window.ReactNativeWebView.postMessage('Payment closed');
//           }
//         }).openIframe();
//       </script>
//     </body>
//     </html>
//   `;

//   return (
//     <WebView
//       source={{ html }}
//       onMessage={(event) => alert(event.nativeEvent.data)}
//     />
//   );
// };

// export default PaystackScreen;

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";

const PaystackScreen = () => {
  const navigation = useNavigation();

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;

    // Simulate payment success redirect
    if (url.includes("paystack.com/success")) {
      navigation.replace("PaymentSuccess");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pay with Paystack</Text>
      </View>

      <WebView
        source={{ uri: "https://paystack.com/pay/your-test-url" }} // Replace with test pay URL
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState
        style={{ flex: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    color: "#fff",
    fontSize: 16,
    marginRight: 16,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default PaystackScreen;
