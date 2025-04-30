import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  BackHandler,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import Header from "@/app/components/Header";

interface ProfileBoxProps {
  onBack: () => void;
  portId: string;
  countryId: string;
}

interface Official {
  name?: string;
  email?: string;
  mobile?: string;
}

interface PortDetails {
  port: string;
  country: string;
  information: string;
  official?: Official; // Making it optional in case it's missing
  [key: string]: any; // Allowing additional dynamic keys
}

export default function ProfileBox({
  portId,
  countryId,
  onBack,
}: ProfileBoxProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const [portDetails, setPortDetails] = useState<PortDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const handleBackPress = () => {
      router.replace("/home"); // Navigates to the home screen
      return true; // Prevents default behavior (exiting the app)
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, [router]);

  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, [navigation]);

  useEffect(() => {
    fetchPortDetails();
  }, [countryId, portId]);

  const fetchPortDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://globalseafarers.org/dashboard/api/detailed_port_info.php?port_id=${portId}&country_id=${countryId}`
      );
      console.log("response", response);
      if (
        response.data.status === "1" &&
        Array.isArray(response.data.message) &&
        response.data.message.length > 0
      ) {
        setPortDetails(response.data.message[0]);
      } else {
        alert("No port details found.");
        setPortDetails(null);
      }
    } catch (error) {
      console.error("Error fetching port details:", error);
      alert("An error occurred while fetching port details.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCategories = () => {
    router.replace({
      pathname: "/components/PortModal",
      params: { countryId: countryId, portId: portId, isVisible: "true" },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2575fc" />
      </View>
    );
  }

  return (
    <>
      <Header
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {!portDetails ? (
          <Text style={styles.noDataText}>
            No Data available for this port.
          </Text>
        ) : (
          <>
            <TouchableOpacity
              onPress={handleBackToCategories}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
              <Text>Back</Text>
            </TouchableOpacity>
            <View style={styles.card}>
              <View style={styles.imageContainer}>
                {portDetails.port_image ? (
                  <Image
                    source={{
                      uri: portDetails.port_image,
                    }}
                    style={styles.shipImage}
                  />
                ) : null}
              </View>
              <Text style={styles.title}>{portDetails.port}</Text>
              <Text style={styles.subtitle}>{portDetails.country}</Text>
              <Text style={styles.text}>{portDetails.information}</Text>

              {expanded && (
                <>
                  <Text style={styles.sectionTitle}>
                    Port Official Information
                  </Text>
                  {portDetails.official && (
                    <View style={styles.contactItem}>
                      <Text style={styles.label}>
                        Name: {portDetails.official.name}
                      </Text>
                      <Text style={styles.label}>
                        Email: {portDetails.official.email}
                      </Text>
                      <Text style={styles.label}>
                        Mobile: {portDetails.official.mobile}
                      </Text>
                    </View>
                  )}
                  {/* City Information */}
                  {portDetails["City Information"] && (
                    <View style={styles.cityContainer}>
                      {portDetails["City Information"].city_image && (
                        <Image
                          source={{
                            uri: portDetails["City Information"].city_image,
                          }}
                          style={styles.cityImage}
                        />
                      )}
                      <Text style={styles.text}>
                        {portDetails["City Information"].city_info ||
                          "No city information available"}
                      </Text>
                    </View>
                  )}
                  {Object.entries(portDetails).map(([key, value]) => {
                    if (
                      typeof value === "object" &&
                      value !== null &&
                      key !== "official"
                    ) {
                      return (
                        <View key={key} style={styles.contactItem}>
                          <Text style={styles.label}>
                            {key.replace(/_/g, " ")}
                          </Text>
                          {value.name && <Text>Name: {value.name}</Text>}
                          {value.email && <Text>Email: {value.email}</Text>}
                          {value.mobile && <Text>Mobile: {value.mobile}</Text>}
                        </View>
                      );
                    }
                    return null;
                  })}
                </>
              )}

              <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                style={styles.viewMoreButton}
              >
                <Ionicons
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#fff"
                />
                <Text style={styles.viewMoreText}>
                  {expanded ? "View Less" : "View More"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f0f4f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "skyblue",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  card: {
    borderRadius: 15,
    backgroundColor: "white",
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  cityContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  cityImage: {
    width: width * 0.9,
    height: width * 0.5,
    borderRadius: 10,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 10,
  },
  sectionContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#eef5fc",
    borderRadius: 8,
  },
  contactItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  link: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  text: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
    textAlign: "justify",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
    textAlign: "center",
  },
  sectionTitle1: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "skyblue",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 16,
    alignSelf: "center",
  },
  viewMoreText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  image: {
    width: width - 40,
    height: 200,
    resizeMode: "cover",
    borderRadius: 15,
    alignSelf: "center",
    marginBottom: 20,
  },
  shipImage: {
    width: width * 0.9, // 90% of screen width
    height: width * 0.5, // Keeps proportional height
    borderRadius: 10,
    resizeMode: "contain", // Prevents cropping
    alignSelf: "center",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});
