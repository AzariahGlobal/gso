import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  BackHandler,
  Modal,
  TouchableOpacity
} from "react-native";
import { useRouter  } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Card } from "react-native-paper";
import Header from "./Header";

type CityDetailProps = {
  title: string;
  value: string | null;
  icon: any;
};

type CityInfoScreenProps = {
  countryId: string;
  portId: string;
  onBack: () => void;
};

const CityInfoScreen: React.FC<CityInfoScreenProps> = ({
  countryId,
  portId,
}) => {
  const [cityData, setCityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [countries, setCountries] = useState<any[]>([]); // List of countries for selection
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null); // Selected country
  const router = useRouter();
  const navigation = useNavigation();

  // Back Button Handling
  useEffect(() => {
    const handleBackPress = () => {
      router.push("/home"); // Navigate to the Home screen
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, [navigation]);

  // Hide Tab Bar
  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, [navigation]);

  // Fetch City Info
  useEffect(() => {
    const fetchCityInfo = async () => {
      try {
        const response = await fetch(
          `https://globalseafarers.org/dashboard/api/city_info.php?country_id=${countryId}&port_id=${portId}`
        );
        const data = await response.json();
        if (data.status === "1") {
          setCityData(data.message[0]); // Extract first object
        }
      } catch (error) {
        console.error("Error fetching city info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCityInfo();
  }, [countryId, portId]);

  // Toggle Sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  // Country selection handler
  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setModalVisible(false); // Close the modal when a country is selected
  };

  const handleBackButton = () => {
    router.push({
      pathname: "/home",
      params: { isVisible: "true" },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading City Info...</Text>
      </View>
    );
  }

  return (
    <>
      <Header
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
      />
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackButton}
          activeOpacity={0.7} // Prevents multiple rapid clicks
        >
          <FontAwesome5 name="arrow-left" size={20} color="#007BFF" />
        </TouchableOpacity>

        {/* Gradient Header */}
        <Text style={styles.header}>City Information</Text>

        {/* City Data */}
        {!cityData ? (
          <Text style={styles.noDataText}>
            No Data available for this city.
          </Text>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <CityDetail
              title="Nearest Airport"
              value={cityData.port_airport}
              icon="plane"
            />
            <CityDetail
              title="Nearest Railway Station"
              value={cityData.port_railwaystation}
              icon="train"
            />
            <CityDetail
              title="Hospitals"
              value={cityData.hospitals_info}
              icon="hospital"
            />
            <CityDetail
              title="Hotels"
              value={cityData.hotels_info}
              icon="hotel"
            />
            <CityDetail
              title="Shopping Malls"
              value={cityData.nearest_shoppingmalls}
              icon="shopping-bag"
            />
            <CityDetail
              title="Religious Places"
              value={cityData.nearest_religious_places}
              icon="place-of-worship"
            />
            <CityDetail
              title="Money Exchange Centers"
              value={cityData.money_exchange_centers}
              icon="money-bill-wave"
            />
            <CityDetail
              title="Taxi Centers"
              value={cityData.txi_centers}
              icon="taxi"
            />
            <CityDetail
              title="Tourism Info"
              value={cityData.tourism_info}
              icon="info-circle"
            />
            <CityDetail
              title="Handicrafts & Jewelry"
              value={cityData.handicrafts_jwelery}
              icon="gem"
            />
          </ScrollView>
        )}

        {/* Modal for Country Selection */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select a Country</Text>
              {/* Render Countries */}
              {countries.length > 0 ? (
                countries.map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.countryItem}
                    onPress={() => handleCountrySelect(country)}
                  >
                    <Text style={styles.countryText}>{country}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text>No countries available</Text>
              )}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const CityDetail: React.FC<CityDetailProps> = ({ title, value, icon }) => (
  <Card style={styles.card}>
    <Card.Content>
      <View style={styles.detailContainer}>
        <FontAwesome5
          name={icon}
          size={24}
          color="#007BFF"
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.detailTitle}>{title}</Text>
          <Text style={styles.detailValue}>{value ?? "Not available"}</Text>
        </View>
      </View>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 10,
  },
  scrollContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    color: "#007BFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "blue",
    margin: 20,
    textAlign: "center",
  },
  card: {
    width: "95%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#007BFF",
  },
  detailContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  detailValue: {
    fontSize: 15,
    color: "#555",
    marginTop: 4,
    flexWrap: "wrap",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#007BFF",
    borderRadius: 30,
    backgroundColor: "#FFF",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  countryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  countryText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 15,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
  modalCloseText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default CityInfoScreen;
