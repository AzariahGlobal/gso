import React, { useState, useEffect } from "react";
import { Feather } from "@expo/vector-icons"; // Import Feather icons
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import Picker
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import usePushNotifications from "@/hooks/usePushNotifications";

const { width, height } = Dimensions.get("window");

export default function RegisterScreen() {
  usePushNotifications();
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [rank, setRank] = useState(""); // Rank State
  const [nationality, setNationality] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rankList, setRankList] = useState<{ id: string; rank: string }[]>([]);

  // Fetch Rank List
  useEffect(() => {
    fetch("https://globalseafarers.org/dashboard/api/rank.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "1" && Array.isArray(data.message)) {
          setRankList(data.message); // Use "message" instead of "ranks"
        } else {
          Alert.alert("Error", "Failed to load rank list.");
        }
      })
      .catch((error) => {
        console.error("Error fetching rank list:", error);
      });
  }, []);

  // Handle Register API Call
  const handleRegister = () => {
    if (
      !name ||
      !rank ||
      !nationality ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "All fields are required!");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("rank", rank);
    formData.append("referral_code", referralCode);
    formData.append("nationality", nationality);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("password", password);

    fetch("https://globalseafarers.org/dashboard/api/register.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        if (data.status === "1") {
          Alert.alert("Success", "Registration Successful!", [
            { text: "OK", onPress: () => router.push("/(tabs)") },
          ]);
        } else {
          Alert.alert(
            "Error",
            data.message || "Registration failed. Try again."
          );
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Registration Error:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <ImageBackground
            source={require("@/assets/images/ship-background.jpg")}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <Svg
            height={100}
            width={width}
            viewBox="0 0 1440 320"
            style={styles.wave}
          >
            <Path
              fill="#f5f5f5"
              d="M0,256 Q200,120 720,220 T1440,180 V320 H0 Z"
            />
          </Svg>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Create Your Account</Text>

          {/* Name Input */}
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            placeholderTextColor="black"
            onChangeText={setName}
          />

          {/* Phone Input */}
          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={phone}
            placeholderTextColor="black"
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={email}
            placeholderTextColor="black"
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {/* Password Input */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password *"
              value={password}
              placeholderTextColor="black"
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.iconContainer}
            >
              <Feather
                name={passwordVisible ? "eye" : "eye-off"}
                size={20}
                color="skyblue"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password *"
              value={confirmPassword}
              placeholderTextColor="black"
              onChangeText={setConfirmPassword}
              secureTextEntry={!confirmPasswordVisible}
            />
            <TouchableOpacity
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              style={styles.iconContainer}
            >
              <Feather
                name={confirmPasswordVisible ? "eye" : "eye-off"}
                size={20}
                color="skyblue"
              />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholderTextColor="black"
            placeholder="Referral Code"
            value={referralCode}
            onChangeText={setReferralCode}
          />

          {/* Rank Dropdown */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={rank}
              onValueChange={(itemValue) => setRank(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Rank *" value="" />
              {rankList.map((item, index) => (
                <Picker.Item key={index} label={item.rank} value={item.id} />
              ))}
            </Picker>
          </View>

          {/* Nationality Dropdown */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={nationality}
              onValueChange={(itemValue) => setNationality(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Nationality *" value="" />
              <Picker.Item label="India" value="99" />
              <Picker.Item label="International (Others)" value="100" />
            </Picker>
          </View>

          {/* Register Button */}
          {isLoading ? (
            <ActivityIndicator size="large" color="skyblue" />
          ) : (
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          )}

          {/* Login Redirect */}
          <Text style={styles.loginText}>
            Already have an account?
            <Text
              style={styles.loginLink}
              onPress={() => router.push("/(tabs)")}
            >
              Login
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  headerContainer: {
    width: "100%",
    height: height * 0.3,
    position: "relative",
  },
  headerImage: { width: "100%", height: "100%" },
  wave: { position: "absolute", bottom: -10, left: 0, right: 0 },
  formContainer: { alignItems: "center", paddingHorizontal: width * 0.05 },
  subtitle: {
    fontSize: width * 0.05,
    marginBottom: height * 0.02,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "skyblue",
    fontSize: 15,
    color: "#333",
  },
  pickerContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "skyblue",
    borderRadius: 5,
    marginBottom: 10,
    height: 50,
    justifyContent: "center",
  },
  picker: { height: 60, width: "100%", color: "#000" },
  registerButton: {
    backgroundColor: "skyblue",
    padding: 12,
    marginBottom: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  registerButtonText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  loginText: { marginBottom: 10, color: "#333" },
  loginLink: { color: "blue", fontWeight: "bold" },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "skyblue",
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
  },
  iconContainer: {
    padding: 10,
  },  
});
