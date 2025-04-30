import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import Header from "./components/Header";
import usePushNotifications from "@/hooks/usePushNotifications";

// Define Type for Wellness Data
type WellnessItem = {
  id: number;
  image: string;
  wellness: string;
};

const WellnessScreen = () => {
  const [wellnessData, setWellnessData] = useState<WellnessItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  usePushNotifications();

  useEffect(() => {
    fetch("https://globalseafarers.org/dashboard/api/wellness.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "1") {
          setWellnessData(data.message);
        }
      })
      .catch((error) => console.error("Error fetching wellness data:", error))
      .finally(() => setLoading(false));
  }, []);

  // Render each wellness item
  const renderItem = ({ item }: { item: WellnessItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.text}>{item.wellness}</Text>
    </View>
  );

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <>
      <Header
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
      />
      <View style={styles.container}>
        <Text style={styles.header}>Wellness</Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={wellnessData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 15,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
    margin: 20,
  },
  loader: {
    marginTop: 50,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: width * 0.5,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#333",
    textAlign: "justify",
  },
});

export default WellnessScreen;
