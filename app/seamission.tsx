import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  Linking,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import Header from "./components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

type BibleItem = {
  id: number;
  name: string;
  bible: string;
};

const MissionScreen = () => {
  const [userId, setUserId] = useState("");
  const [selectedType, setSelectedType] = useState<"bibles" | "prayerRequest">("bibles");
  const [data, setData] = useState<BibleItem[]>([]);
  const [prayerText, setPrayerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const fetchData = async () => {
    if (selectedType === "bibles") {
      try {
        const response = await fetch(
          "https://globalseafarers.org/dashboard/api/sea_mission/bibles.php"
        );
        const json = await response.json();
        setData(json.message || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser?.userInfo?.id || "");
      }
    };
    fetchUser();
  }, []);

  const handlePrayerRequestSubmit = async () => {
    if (!prayerText.trim()) {
      Alert.alert("Error", "Please enter your prayer request.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://globalseafarers.org/dashboard/api/sea_mission/prayer_request.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, prayer_request: prayerText }),
        }
      );

      const json = await response.json();
      if (json.status === "1") {
        Alert.alert("Success", "Prayer Request Submitted");
        setPrayerText("");
      } else {
        Alert.alert("Error", "Failed to submit prayer request.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />
      <View style={styles.container}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setSelectedType("bibles")}
            style={[
              styles.toggleButton,
              selectedType === "bibles" && styles.activeButton,
            ]}
          >
            <FontAwesome5
              name="bible"
              size={20}
              color={selectedType === "bibles" ? "white" : "#007AFF"}
            />
            <Text
              style={[
                styles.toggleText,
                selectedType === "bibles" && styles.activeText,
              ]}
            >
              Bible & Literature
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedType("prayerRequest")}
            style={[
              styles.toggleButton,
              selectedType === "prayerRequest" && styles.activeButton,
            ]}
          >
            <Ionicons
              name="book"
              size={22}
              color={selectedType === "prayerRequest" ? "white" : "#007AFF"}
            />
            <Text
              style={[
                styles.toggleText,
                selectedType === "prayerRequest" && styles.activeText,
              ]}
            >
              Prayer Request
            </Text>
          </TouchableOpacity>
        </View>

        {selectedType === "bibles" ? (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => Linking.openURL(item.bible)}
                >
                  <Ionicons name="download-outline" size={20} color="white" />
                  <Text style={styles.downloadText}>Download PDF</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <View style={styles.prayerContainer}>
            <Text style={styles.prayerTitle}>Submit Your Prayer Request</Text>
            <TextInput
              style={styles.prayerInput}
              placeholder="Enter your prayer request..."
              value={prayerText}
              onChangeText={setPrayerText}
              multiline
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handlePrayerRequestSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitText}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    padding: 15,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 12,
  },
  activeButton: {
    backgroundColor: "#007AFF",
    padding: 10,
  },
  toggleText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "bold",
    marginLeft: 8,
  },
  activeText: {
    color: "white",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: "center",
    width: width * 0.92,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  itemTitle: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 10,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 5,
  },
  downloadText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  prayerContainer: {
    padding: 15,
    alignItems: "center",
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  prayerInput: {
    width: "100%",
    height: 100,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  submitButton: {
    marginTop: 15,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MissionScreen;