import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { RadioButton } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";

const ShippingAddressScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [countries, setCountries] = useState([]);
  const [ports, setPorts] = useState([]);
  const [ranks, setRanks] = useState([]); // State for Rank list
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedRank, setSelectedRank] = useState(""); // State for selected rank
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingPorts, setLoadingPorts] = useState(false);
  const [loadingRanks, setLoadingRanks] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState("COD");
  const router = useRouter();
  const { userId, products, totalPriceAmount } = useLocalSearchParams();

  let parsedProducts: { id: string; quantity: number; price: number }[] = [];

  if (typeof products === "string") {
    try {
      parsedProducts = JSON.parse(products);
    } catch (error) {
      console.error("Error parsing products:", error);
    }
  }

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const response = await axios.get(
          "https://globalseafarers.org/dashboard/api/country.php"
        );
        setCountries(response.data.message || []);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch countries.");
      } finally {
        setLoadingCountries(false);
      }
    };

    const fetchRanks = async () => {
      try {
        setLoadingRanks(true);
        const response = await axios.get(
          "https://globalseafarers.org/dashboard/api/rank.php"
        );
        console.log("hjh", response)
        setRanks(response.data.message || []);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch ranks.");
      } finally {
        setLoadingRanks(false);
      }
    };

    fetchCountries();
    fetchRanks();
  }, []);



  useEffect(() => {
    if (selectedCountry) fetchPorts(selectedCountry);
    else setPorts([]);
  }, [selectedCountry]);

  const fetchPorts = async (countryId: any) => {
    try {
      setLoadingPorts(true);
      const response = await axios.get(
        `https://globalseafarers.org/dashboard/api/ports.php?country_id=${countryId}`
      );
      setPorts(
        Array.isArray(response?.data?.message) ? response.data.message : []
      );
    } catch (error) {
      Alert.alert("Error", "Failed to fetch ports.");
      setPorts([]);
    } finally {
      setLoadingPorts(false);
    }
  };

  const placeOrder = async () => {
    if (!selectedCountry || !selectedPort || !selectedRank) {
      Alert.alert("Error", "Please select country, port, and rank.");
      return;
    }

    try {
      const orderPayload = {
        user_id: userId,
        products: parsedProducts,
        country_id: selectedCountry,
        port_id: selectedPort,
        rank_id: selectedRank, // Include selected rank
        first_name: firstName,
        last_name: lastName,
        total_price: totalPriceAmount,
        vessel_name: vesselName,
        payment_method: paymentMode,
        address: address,
      };
      const response = await axios.post(
        "https://globalseafarers.org/dashboard/api/seamen_services/place_order.php",
        orderPayload
      );

      if (response.data.status === "1") {
        Alert.alert("✅ Success", "Order Placed Successfully!");
        router.push("/seamen_shopping");
      } else {
        Alert.alert("Error", "Failed to place order.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to place order.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Shipping Details</Text>
      <Text style={styles.totalAmount}>Total: ${totalPriceAmount}</Text>

      <TextInput
        placeholder="Name *"
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        placeholder="Vessel Name *"
        style={styles.input}
        value={vesselName}
        onChangeText={setVesselName}
      />

      {loadingCountries ? (
        <ActivityIndicator size="small" color="#FF5A5F" />
      ) : (
        <Picker
          selectedValue={selectedCountry}
          style={styles.picker}
          onValueChange={setSelectedCountry}
        >
          <Picker.Item label="Select Country *" value="" />
          {countries.map((country: any) => (
            <Picker.Item
              key={country.id}
              label={country.country_name}
              value={country.id}
            />
          ))}
        </Picker>
      )}

      {loadingPorts ? (
        <ActivityIndicator size="small" color="#FF5A5F" />
      ) : (
        <Picker
          selectedValue={selectedPort}
          style={styles.picker}
          onValueChange={setSelectedPort}
        >
          <Picker.Item label="Select Port *" value="" />
          {Array.isArray(ports) && ports.length > 0 ? (
            ports.map((port: any) => (
              <Picker.Item key={port.id} label={port.port_name} value={port.id} />
            ))
          ) : (
            <Picker.Item label="No Ports Available" value="" />
          )}
        </Picker>
      )}

      {loadingRanks ? (
        <ActivityIndicator size="small" color="#FF5A5F" />
      ) : (
        <Picker
          selectedValue={selectedRank}
          style={styles.picker}
          onValueChange={setSelectedRank}
        >
          <Picker.Item label="Select Rank *" value="" />
          {ranks.map((rank: any) => (
            <Picker.Item key={rank.id} label={rank.rank} value={rank.id} />
          ))}
        </Picker>
      )}

      <TextInput
        style={styles.textArea}
        placeholder="Write your comments (If any)"
        value={address}
        onChangeText={setAddress}
        multiline={true}
      />

      <RadioButton.Group onValueChange={setPaymentMode} value={paymentMode}>
        <View style={styles.radioContainer}>
          <RadioButton value="COD" color="#007AFF" />
          <Text style={styles.radioText}>Cash on Delivery (COD)</Text>
        </View>
      </RadioButton.Group>

      <TouchableOpacity style={styles.submitButton} onPress={placeOrder}>
        <Text style={styles.submitButtonText}>Place Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Add styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f7fa", // Light modern background
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#007AFF",
    marginTop: 20,
    marginBottom: 10,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ff6b6b",
    backgroundColor: "#fce4ec",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  input: {
    backgroundColor: "#fff",
    color: "black",
    padding: 14,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  textArea: {
    height: 120,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  picker: {
    backgroundColor: "#fff",
    color: "black",
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  radioText: {
    color: "black",
    marginLeft: 5,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ShippingAddressScreen;