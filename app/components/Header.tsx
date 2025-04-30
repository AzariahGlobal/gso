import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Import useRouter for navigation

const { height, width } = Dimensions.get("window"); // Get screen dimensions

// Define Props Type
interface HeaderProps {
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
}

type IoniconName =
  | "home-outline"
  | "person-outline"
  | "settings-outline"
  | "log-out-outline"
  | "car-outline";

const Header: React.FC<HeaderProps> = ({ isSidebarVisible, toggleSidebar }) => {
  const router = useRouter(); // Initialize router for navigation
  const logoScale = useRef(new Animated.Value(1)).current;
  const [userName, setUserName] = useState<string | null>(null); // State to store user ID

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserName(parsedUser?.userInfo?.name || "N/A"); // Set user ID, fallback to "N/A" if not found
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user"); // Clear user data
      router.push("/(tabs)"); // Navigate to login page
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleTaxiBookings = () => {
    router.push("/taxi_bookings"); // Navigate to Taxi Booking List screen
  };

  // Sample list data for sidebar
  const listData: { title: string; icon: IoniconName; onPress?: () => void }[] =
    [
      {
        title: "Taxi Bookings",
        icon: "car-outline",
        onPress: handleTaxiBookings,
      }, // New Option
      { title: "Logout", icon: "log-out-outline", onPress: handleLogout },
    ];

  return (
    <>
      {/* Dark overlay when sidebar is open */}
      {isSidebarVisible && (
        <TouchableOpacity style={styles.overlay} onPress={toggleSidebar} />
      )}

      <LinearGradient
        colors={["skyblue", "skyblue"]}
        style={styles.headerContainer}
      >
        <Text style={styles.headerText}>Welcome {userName}</Text>
        <TouchableOpacity onPress={toggleSidebar} style={styles.toggleButton}>
          <Ionicons name="menu-outline" size={30} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Full-height Sidebar */}
      {isSidebarVisible && (
        <View style={styles.sidebar}>
          {/* Back Button (Now Positioned on Right Side) */}
          <TouchableOpacity style={styles.backButton} onPress={toggleSidebar}>
            <Ionicons name="arrow-back-circle" size={30} color="black" />
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: logoScale }] },
            ]}
          >
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
            />
          </Animated.View>
          <FlatList
            style={styles.list}
            data={listData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listItem} onPress={item.onPress}>
                <Ionicons
                  name={item.icon}
                  size={24}
                  color="black"
                  style={styles.listIcon}
                />
                <Text style={styles.listItemText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 10,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 1,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 35,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  list: {
    marginTop: 100,
  },
  toggleButton: {
    padding: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    flex: 1, // Takes up available space
    textAlign: "left", // Align text to the left
  },
  logoContainer: {
    position: "absolute",
    alignSelf: "center",
    marginTop: 50,
    top: "0%",
    transform: [{ translateY: -20 }], // Adjusts for perfect centering
    borderRadius: 50,
    backgroundColor: "white",
    padding: 10,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  loginButton: {
    padding: 10,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 250,
    height: height, // Full height
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 15,
    elevation: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowColor: "#000",
    zIndex: 20,
  },
  backButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  listItem: {
    flexDirection: "row", // Align icon & text horizontally
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  listIcon: {
    marginRight: 15, // Space between icon & text
  },
  listItemText: {
    fontSize: 16,
    color: "black",
  },
  overlay: {
    position: "absolute",
    width: width,
    height: height,
    backgroundColor: "rgba(0,0,0,0.5)", // Dark overlay with opacity
    zIndex: 15,
  },
});

export default Header;
