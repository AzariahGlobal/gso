import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, BackHandler } from "react-native";
import Header from "./components/Header";
import { useRouter } from "expo-router";
import usePushNotifications from "@/hooks/usePushNotifications";


// Define TypeScript Interface for Booking Data
interface Booking {
  id: number;
  booking_id: string;
  country: string;
  port: string;
  status: string;
  rank: string;
  name: string;
  vessel_name: string;
  sailing_date: string;
  what_time: string;
  members: string;
  drop_location: string;
  estimate_time: string;
  booking_at: string;
}

const API_URL =
  "https://globalseafarers.org/dashboard/api/taxi_bookings_list.php?user_id=2";

const TaxiBookings = () => {
  usePushNotifications();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "1") {
          setBookings(data.message);
        }
      })
      .catch((error) => console.error("Error fetching bookings:", error));
  }, []);

  // Handle Back Button Press
  useEffect(() => {
    const backAction = () => {
      if (isSidebarVisible) {
        setSidebarVisible(false); // Close sidebar if open
        return true; // Prevent default back action
      } else {
        router.push("/home"); // Navigate to Home
        return true; // Prevent default back action
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup on unmount
  }, [isSidebarVisible]);

  // 🔹 Define Status Colors Safely
  const statusColors: { [key: string]: string } = {
    pending: "orange",
    approved: "green",
    cancelled: "red",
  };

  return (
    <>
      <Header
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Taxi Booking List</Text>
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.bookingId}>
                {item.booking_id}
              </Text>
              <Text>Country: {item.country}</Text>
              <Text>Port: {item.port}</Text>
              <Text>
                Status:
                <Text
                  style={{
                    color: statusColors[item.status] || "black",
                  }}
                >
                  {item.status}
                </Text>
              </Text>
              <Text>Rank: {item.rank}</Text>
              <Text>Name: {item.name}</Text>
              <Text>Vessel Name: {item.vessel_name}</Text>
              <Text>Members: {item.members}</Text>
              <Text>Drop Location: {item.drop_location}</Text>
              <Text>Booking Date: {item.booking_at}</Text>
            </View>
          )}
        />
      </View>
    </>
  );
};

// 🔹 StyleSheet for Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f2f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: "#007bff",
  },
  bookingId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    color: "#555",
    marginBottom: 2,
  },
  statusContainer: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
    fontWeight: "bold",
  },
});

// Status-specific colors
const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return { backgroundColor: "#FFD700", color: "#8B6508" };
    case "approved":
      return { backgroundColor: "#4CAF50", color: "#fff" };
    case "cancelled":
      return { backgroundColor: "#FF4C4C", color: "#fff" };
    default:
      return { backgroundColor: "#ddd", color: "#333" };
  }
};


export default TaxiBookings;