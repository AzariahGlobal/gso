import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  BackHandler
} from "react-native";
import axios from "axios";
import Header from "./Header";
import { useRouter } from "expo-router";

interface SeamenCentreProps {
  onBack: () => void;
  portId: string;
  countryId: string;
}

export default function SeamenCentre({
  portId,
  countryId,
}: SeamenCentreProps) {
  const [seamenData, setSeamenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const router = useRouter(); // Initialize the router
  
  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    fetchSeamenData();
  }, [countryId, portId]);

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

  const fetchSeamenData = async () => {
    try {
      const response = await axios.get(
        `https://globalseafarers.org/dashboard/api/seamen_center.php?country_id=${countryId}&port_id=${portId}`
      );

      if (response.data.status === "1" && response.data.message.length > 0) {
        setSeamenData(response.data.message);
      } else {
        Alert.alert("No Data", "No Seamen Centre information available.");
        setSeamenData([]);
      }
    } catch (error) {
      console.error("Error fetching Seamen Centre data:", error);
      Alert.alert("Error", "Failed to fetch Seamen Centre data.");
    } finally {
      setLoading(false);
    }
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
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>Seamen Center Information</Text>
        {seamenData.length === 0 ? (
          <Text style={styles.noDataText}>
            No data available for this Seamen Centre.
          </Text>
        ) : (
          seamenData.map((item: any) => (
            <View key={item.id} style={styles.card}>
              {/* Seamen Center Info */}
              <View style={styles.row}>
                <Text style={styles.subHeading}>Center Name:</Text>
                <Text style={styles.textValue}>
                  {item["Seamen Center"].center_name}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Manager Name:</Text>
                <Text style={styles.textValue}>
                  {item["Seamen Center"].manager_name}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Center Email:</Text>
                <Text style={styles.textValue}>
                  {item["Seamen Center"].center_email}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Center Mobile:</Text>
                <Text style={styles.textValue}>
                  {item["Seamen Center"].center_mobile}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Center Website:</Text>
                <Text style={styles.textValue}>
                  {item["Seamen Center"].center_website}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Center Address:</Text>
                <Text style={styles.textValue}>
                  {item["Seamen Center"].center_address}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Google Map Location:</Text>
                <Text style={styles.textValue}>
                  {item["Seamen Center"].center_google_map}
                </Text>
              </View>

              {/* Seamen Hostel Info */}
              <View style={styles.row}>
                <Text style={styles.subHeading}>Hostel Address:</Text>
                <Text style={styles.textValue}>
                  {item["Seamen Hostel"].hostel_address}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Hostel Mobile:</Text>
                <Text style={styles.textValue}>
                  {item["Seamen Hostel"].hostel_mobile}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Hostel Email:</Text>
                <Text style={styles.textValue}>
                  {item["Seamen Hostel"].hostel_email}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Hostel Website:</Text>
                <Text style={styles.textValue}>
                  {item["Seamen Hostel"].hostel_website}
                </Text>
              </View>

              {/* Duty Free Shop Info */}
              <View style={styles.row}>
                <Text style={styles.subHeading}>Duty Free Shop Location:</Text>
                <Text style={styles.textValue}>
                  {item["Duty Free Shop"].shop_google_location}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Duty Free Shop Manager:</Text>
                <Text style={styles.textValue}>
                  {item["Duty Free Shop"].shop_manager_name}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Duty Free Shop Mobile:</Text>
                <Text style={styles.textValue}>
                  {item["Duty Free Shop"].shop_mobile}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>
                  Duty Free Shop Opening Hours:
                </Text>
                <Text style={styles.textValue}>
                  {item["Duty Free Shop"].shop_opening_hours}
                </Text>
              </View>

              {/* Port Outside Facilities Info */}
              <View style={styles.row}>
                <Text style={styles.subHeading}>Port Hostels:</Text>
                <Text style={styles.textValue}>
                  {item["Port Outside Facilities"].port_hostels}
                </Text>
              </View>

              {/* Services / Facilities Info */}
              <View style={styles.row}>
                <Text style={styles.subHeading}>Money Transfer:</Text>
                <Text style={styles.textValue}>
                  {item["Services / Facilities"].money_transfer}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Recreational Services:</Text>
                <Text style={styles.textValue}>
                  {item["Services / Facilities"].recreational_services}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Service Opening Hours:</Text>
                <Text style={styles.textValue}>
                  {item["Services / Facilities"].service_opening_hours}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Service Pool Table:</Text>
                <Text style={styles.textValue}>
                  {item["Services / Facilities"].service_pool_table}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Ship Visiting:</Text>
                <Text style={styles.textValue}>
                  {item["Services / Facilities"].ship_visiting}
                </Text>
              </View>

              {/* Additional Info */}
              <View style={styles.row}>
                <Text style={styles.subHeading}>Country:</Text>
                <Text style={styles.textValue}>{item.country}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Port:</Text>
                <Text style={styles.textValue}>{item.port}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 30,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    marginTop: 10,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginBottom: 5, // Small space between subHeading and textValue
  },
  textValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
    marginBottom: 15, // Add spacing after textValue
  },
  row: {
    flexDirection: "column", // Stack subHeading and textValue vertically
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 5,
  },
  backButton: {
    flexDirection: "row",
    backgroundColor: "skyblue",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 18,
    color: "black",
    marginTop: 40,
  },
});
