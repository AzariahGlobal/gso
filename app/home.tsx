import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { useRouter } from "expo-router";
import Header from "@/app/components/Header";
import PortModal from "@/app/components/PortModal";
import SeamenCentre from "@/app/components/SeamenCentre";
import ProfileBox from "@/app/components/ProfileBox";
import Carousel from "@/app/components/Carousel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import CityInfoScreen from "./components/CityCentre";

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSeamenCentreModalVisible, setSeamenCentreModalVisible] =
    useState(false);
  const [showCentre, setShowCentre] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null
  );
  const [isCityCentreModalVisible, setCityCentreModalVisible] = useState(false);
  const [showCityCentre, setShowCityCentre] = useState(false);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [selectedPortId, setSelectedPortId] = useState<string | null>(null);
  const router = useRouter(); // Initialize the router
  const [userName, setUserName] = useState<string | null>(null); // State to store user ID

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert("Exit App", "Do you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
        return true; // Prevent default behavior
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

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

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://globalseafarers.org/dashboard/api/category.php"
        );
        if (response.data.status === "1") {
          setCategories(response.data.message);
        } else {
          Alert.alert("Error", "Failed to load categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        Alert.alert(
          "Error",
          "Failed to load categories. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryPress = async (categoryName: string, link: string) => {
    const userData = await AsyncStorage.getItem("user");
    let user_id = "";

    if (userData !== null) {
      const parsedUser = JSON.parse(userData);
      user_id = parsedUser?.userInfo?.id ?? "";

      console.log("User ID:", user_id);
    } else {
      console.log("User data not found");
    }

    switch (categoryName) {
      case "Port Info":
        setModalVisible(true);
        break;
      case "Profile":
        setShowProfile(true);
        break;
      case "Seamen Center":
        setSeamenCentreModalVisible(true);
        break;
      case "CentreInfo":
        setShowCentre(true);
        break;
      case "City Info":
        setCityCentreModalVisible(true);
        break;
      case "CityCenter":
        setShowCityCentre(true);
        break;
      case "Seamen Shopping":
        router.push("/seamen_shopping");
        break;
      case "Sea Mission":
        router.push("/seamission");
        break;
      case "Help Line":
        router.push("/helpline");
        break;
      case "Maritime Directory":
        router.push("/maritime_screen");
        break;
      case "Taxi":
        router.push("/taxi");
        break;
      case "Wellness":
        router.push("/wellness");
        break;
      case "Global Ship Store":
        router.push("/ship_store");
        break;  
      case "Contact Swo":
        router.push("/components/ChatScreen");
        break;
      case "Global Ship Jobs":
        router.push("/components/RpslVacancies");
        break;
        case "Global Ship Store":
          router.push("/ship_store");
          break;  
      case "Open Bank Account":
        if (link && link.trim() !== "") {
          Linking.openURL(link).catch(() =>
            Alert.alert("Error", "Failed to open the page.")
          );
        } else {
          Alert.alert(
            "No Link Available",
            `${categoryName} has no associated link.`
          );
        }
        break;
      default:
        Alert.alert(`${categoryName} is not implemented yet.`);
        break;
    }
  };

  const handlePortSelection = (countryId: string, portId: string) => {
    setSelectedCountryId(countryId); // Set the selected country ID
    setSelectedPortId(portId); // Set the selected port ID
    setModalVisible(false); // Close the modal
    setShowProfile(true);
  };

  const handlePortCentreSelection = (countryId: string, portId: string) => {
    setSelectedCountryId(countryId); // Set the selected country ID
    setSelectedPortId(portId); // Set the selected port ID
    setSeamenCentreModalVisible(false);
    setShowCentre(true); // Navigate to ProfileBox
  };

  const handleCitySelection = (countryId: string, portId: string) => {
    setSelectedCountryId(countryId); // Set the selected country ID
    setSelectedPortId(portId); // Set the selected port ID
    setCityCentreModalVisible(false);
    setShowCityCentre(true); // Navigate to ProfileBox
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2575fc" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (showProfile && selectedCountryId && selectedPortId) {
    return (
      <ProfileBox
        countryId={selectedCountryId}
        portId={selectedPortId}
        onBack={() => {
          setShowProfile(false); // Return to the main screen
          setSelectedCountryId(null); // Clear selected country
          setSelectedPortId(null); // Clear selected port
        }}
      />
    );
  }

  if (showCentre && selectedCountryId && selectedPortId) {
    return (
      <SeamenCentre
        countryId={selectedCountryId}
        portId={selectedPortId}
        onBack={() => {
          setShowCentre(false);
          setSelectedCountryId(null); // Clear selected country
          setSelectedPortId(null); // Clear selected port
        }}
      />
    );
  }

  if (showCityCentre && selectedCountryId && selectedPortId) {
    return (
      <CityInfoScreen
        countryId={selectedCountryId}
        portId={selectedPortId}
        onBack={() => {
          setShowCentre(false);
          setSelectedCountryId(null); // Clear selected country
          setSelectedPortId(null); // Clear selected port
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
      />
      <ScrollView>
        <LinearGradient colors={["white", "skyblue"]} style={styles.background}>
          {!isModalVisible &&
            !isSeamenCentreModalVisible &&
            !isCityCentreModalVisible && <Carousel />}
          <View style={styles.iconContainer}>
            {categories.map((category: any) => (
              <TouchableOpacity
                key={category.id}
                onPress={() =>
                  handleCategoryPress(category.category_name, category.link)
                }
                style={styles.iconCard}
              >
                <Image
                  source={{ uri: category.category_image }}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
                <Text style={styles.iconText}>{category.category_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </ScrollView>

      {isModalVisible && (
        <PortModal
          isVisible={isModalVisible}
          type="port"
          onClose={() => setModalVisible(false)}
          onSubmit={handlePortSelection} // Pass countryId and portId from PortModal
        />
      )}

      {isSeamenCentreModalVisible && (
        <PortModal
          type="port"
          isVisible={isSeamenCentreModalVisible}
          onClose={() => setSeamenCentreModalVisible(false)}
          onSubmit={handlePortCentreSelection} // Pass countryId and portId from PortModal
        />
      )}

      {isCityCentreModalVisible && (
        <PortModal
          type="city"
          isVisible={isCityCentreModalVisible}
          onClose={() => setCityCentreModalVisible(false)}
          onSubmit={handleCitySelection} // Pass countryId and portId from PortModal
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  bannerImage: {
    width: screenWidth * 0.9,
    height: 200,
    borderRadius: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  iconContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    padding: 16,
    gap: 10,
  },
  iconCard: {
    width: "30%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconImage: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  iconText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
});
