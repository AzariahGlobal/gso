import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router"; // Import the useRouter hook
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "../components/CustomAlert"; // Import the custom alert
import usePushNotifications from "@/hooks/usePushNotifications";
import * as Notifications from "expo-notifications";

// Handle notifications even when the app is killed
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Show notification as an alert
    shouldPlaySound: true, // Play notification sound
    shouldSetBadge: true,  // Show badge icon on the app
  }),
});


// Define the user data type
interface UserData {
  id: string;
  email: string;
  password: string;
}

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  usePushNotifications();
  const router = useRouter();
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    const loginData = { email, password };
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://globalseafarers.org/dashboard/api/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      const result = await response.json();
      setIsLoading(false);

      if (result.status === "1") {
        const userInfo = {
          id: result.message.id, 
          name: result.message.name,
          email: result.message.email,
        };
        await AsyncStorage.setItem("user", JSON.stringify({ userInfo }));
        setLoginSuccess(true);
        setUserData(result.message);
        setShowSuccessAlert(true);
        setEmail("");
        setPassword("");
      } else {
        Alert.alert("Login Failed", "Invalid credentials, please try again.");
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        "Login Failed",
        "An error occurred while logging in. Please try again."
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeScreen(false);
    }, 2000); // Show welcome screen for 10 seconds

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  if (showWelcomeScreen) {
    return (
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome To GSO</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {showSuccessAlert && (
              <CustomAlert
                message="Login Successful"
                isLoading={isLoading} 
                onClose={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setShowSuccessAlert(false);
                    setIsLoading(false);
                    setEmail("");
                    setPassword("");
                    router.push("/home"); 
                  }, 2000); 
                }}
              />
            )}

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

            <View style={styles.formContainer}>
              <Text style={styles.subtitle}>Login to your account</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-sharp" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#333"
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-sharp"
                  size={20}
                  color="#333"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry={!isPasswordVisible}
                  placeholderTextColor="#777"
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <Ionicons
                    name={isPasswordVisible ? "eye-off-sharp" : "eye-sharp"}
                    size={20}
                    style={styles.iconRight}
                  />
                </TouchableOpacity>
              </View>

              {isLoading ? (
                <ActivityIndicator size="large" color="skyblue" />
              ) : (
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.signupText}>
                Don't have an account?
                <Text
                  style={styles.signupLink}
                  onPress={() => router.push("/register")}
                >
                  Sign up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    width: "100%",
    height: height * 0.35,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  wave: {
    position: "absolute",
    bottom: -10,
    left: 0,
    right: 0,
  },
  // backButton: {
  //   position: "absolute",
  //   top: 50,
  //   left: 20,
  //   padding: 10,
  //   backgroundColor: "rgba(0, 0, 0, 0.5)",
  //   borderRadius: 50,
  //   zIndex: 2,
  // },
  formContainer: {
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    margin: 0,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: width * 0.06,
    color: "#333",
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: width * 0.05,
    color: "#333",
    marginBottom: height * 0.02,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E90FF",
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.02,
    width: "100%",
    borderWidth: 1,
    borderColor: "skyblue",
  },
  icon: {
    marginRight: width * 0.02,
    color: "skyblue",
    fontWeight: "bold",
  },
  iconRight: {
    marginLeft: "auto",
    color: "skyblue",
  },
  input: {
    flex: 1,
    paddingVertical: height * 0.018,
    fontFamily: "Roboto_400Regular",
    fontSize: width * 0.045,
    color: "#333",
  },
  loginButton: {
    backgroundColor: "skyblue",
    paddingVertical: height * 0.012,
    borderRadius: 15,
    alignItems: "center",
    width: "100%",
  },
  loginButtonText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: width * 0.055,
    fontWeight: "bold",
  },
  signupText: {
    marginTop: height * 0.025,
    color: "#333",
  },
  signupLink: {
    color: "#007bff",
    fontWeight: "bold",
  },
});
