import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import Header from "./components/Header";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import usePushNotifications from "@/hooks/usePushNotifications";

const TaxiBookingScreen = () => {
  usePushNotifications();
  const [userId, setUserId] = useState("");
  const [bookingExists, setBookingExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [countries, setCountries] = useState([]);
  const [ports, setPorts] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [bookingMessage, setBookingMessage] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedRank, setSelectedRank] = useState("");
  const [name, setName] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState<Date | null>(null); // Explicitly set type to Date | null
  const [time, setTime] = useState<Date | null>(null); // Explicitly set type to Date | null
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [members, setMembers] = useState("");
  const [dropLocation, setDropLocation] = useState(""); // For selected drop location from predefined options
  const [customLocation, setCustomLocation] = useState(""); // For custom location if 'Others' is selected
  const [dropLocationName, setDropLocationName] = useState(""); // For API parameter when 'Others' is selected
  const router = useRouter();
  const currentDate = new Date();

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

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

  const fetchData = async () => {
    try {
      const [countryRes, rankRes] = await Promise.all([
        axios.get("https://globalseafarers.org/dashboard/api/country.php"),
        axios.get("https://globalseafarers.org/dashboard/api/rank.php"),
      ]);
      setCountries(countryRes.data.message || []);
      setRanks(rankRes.data.message || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const checkExistingBooking = async () => {
    try {
      const response = await axios.post(
        `https://globalseafarers.org/dashboard/api/check_taxi_status.php?user_id=${userId}`
      );
      if (response.data.status === "1") {
        setBookingExists(true);
        setBookingMessage(
          `Your ride is booked, please wait for administrator approval\n\n` +
            (response.data.estimate_time
              ? `Estimated Time: ${response.data.estimate_time}\n\n`
              : "")
        );
      } else {
        setBookingExists(false);
      }
    } catch (error) {
      console.error("Error checking booking:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      checkExistingBooking();
    }
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (selectedCountry) {
      axios
        .get(
          `https://globalseafarers.org/dashboard/api/ports.php?country_id=${selectedCountry}`
        )
        .then((res) => {
          if (Array.isArray(res.data.message) && res.data.message.length > 0) {
            setPorts(res.data.message);
          } else {
            setPorts([]); // Ensure it's an empty array
            Alert.alert(
              "No Ports Available",
              "No ports found for the selected country."
            );
          }
        })
        .catch((err) => {
          console.error("Error fetching ports:", err);
          setPorts([]); // Set empty array on error
        });
    } else {
      setPorts([]); // Reset ports if no country is selected
    }
  }, [selectedCountry]);

  const onChangeDate = (event: any, selectedDate: any) => {
    if (event.type === "dismissed") {
      // User clicked cancel, so don't update the date
      setShowDatePicker(false);
      return;
    }
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate); // Update the date state with the selected date
    }
  };

  const onChangeTime = (event: any, selectedTime: any) => {
    if (event.type === "dismissed") {
      // User clicked cancel, so don't update the time
      setShowTimePicker(false);
      return;
    }
    
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setTime(selectedTime); // Update the time state with the selected time
    }
  };

  const handleTaxiBooking = async () => {
    let locationToSend = dropLocation;
    let locationNameToSend = dropLocationName;

    // Check if "Others" is selected
    if (dropLocation === "Others") {
      locationToSend = "Others"; // Set dropLocation as 'Others'
      locationNameToSend = customLocation; // Set dropLocationName as the custom location
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://globalseafarers.org/dashboard/api/taxi.php",
        {
          user_id: userId,
          country_id: selectedCountry,
          port_id: selectedPort,
          rank: selectedRank,
          name,
          email: email,
          vessel_name: vesselName,
          sailing_date: date,
          what_time: time,
          members,
          drop_location: locationToSend,
          drop_location_name: locationNameToSend, // Add custom location parameter for API
        }
      );
      if (
        response.data.status == "1" &&
        response.data.taxi_status === "pending"
      ) {
        router.push("/success_screen"); // ✅ Redirect to success page
      } else {
        Alert.alert(
          "Booking Failed",
          response.data.message || "Unexpected response"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Booking Error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const controller = new AbortController();
    if (selectedCountry) {
      axios
        .get(
          `https://globalseafarers.org/dashboard/api/ports.php?country_id=${selectedCountry}`,
          { signal: controller.signal }
        )
        .then((res) => setPorts(res.data.message || []))
        .catch((err) => {
          if (err.name !== "CanceledError")
            console.error("Error fetching ports:", err);
        });
    } else {
      setPorts([]);
    }
    return () => controller.abort(); // Cleanup on unmount
  }, [selectedCountry]);

  const handleCancelRide = async () => {
    try {
      const response = await axios.get(
        `https://globalseafarers.org/dashboard/api/cancel_taxi.php?id=${userId}`
      );
      if (response.data.status === "1") {
        Alert.alert(
          "Success",
          response.data.message || "Ride cancelled successfully."
        );
        setBookingExists(false); // Hide booking details after cancellation
      } else {
        Alert.alert(
          "Failed",
          response.data.message || "Unable to cancel the ride."
        );
      }
    } catch (error) {
      console.error("Cancel Ride Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Header
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {bookingExists ? (
          <View style={styles.bookingContainer}>
            <View style={styles.bookingMessageBox}>
              <Icon name="check-circle" size={50} color="green" />
              <Text style={styles.bookingMessageText}>{bookingMessage}</Text>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelRide}
            >
              <Text style={styles.cancelButtonText}>Cancel Ride</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.heading}>Taxi Booking</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCountry}
                  onValueChange={setSelectedCountry}
                  style={styles.picker}
                >
                  <Picker.Item
                    label="Select Country *"
                    value=""
                    color="black"
                  />
                  {countries.map((country: any) => (
                    <Picker.Item
                      key={country.id}
                      label={country.country_name}
                      value={country.id}
                      color="black"
                    />
                  ))}
                </Picker>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedPort}
                  onValueChange={setSelectedPort}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Port *" value="" color="black" />
                  {Array.isArray(ports) && ports.length > 0 ? (
                    ports.map((port: any) => (
                      <Picker.Item
                        key={port.id}
                        label={port.port_name}
                        value={port.id}
                        color="black"
                      />
                    ))
                  ) : (
                    <Picker.Item
                      label="No Ports Available"
                      value=""
                      color="grey"
                    />
                  )}
                </Picker>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedRank}
                  onValueChange={setSelectedRank}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Rank *" value="" color="black" />
                  {ranks.map((rank: any) => (
                    <Picker.Item
                      key={rank.id}
                      label={rank.rank}
                      value={rank.id}
                      color="black"
                    />
                  ))}
                </Picker>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Full Name *"
                placeholderTextColor="black"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Vessel Name *"
                placeholderTextColor="black"
                value={vesselName}
                onChangeText={setVesselName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="black"
                value={email}
                onChangeText={setEmail}
              />
              {/* Date Picker Section */}
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <TextInput
                  value={date ? date.toLocaleDateString() : "Select Date *"} // If date is selected, show it, else show the placeholder
                  editable={false}
                  style={styles.input}
                />
              </TouchableOpacity>

              {/* Show Date Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={date || new Date()} // If no date is selected, use the current date
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                  minimumDate={currentDate} // Restrict to future dates (today and onwards)
                />
              )}

              {/* Time Picker Section */}
              <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                <TextInput
                  value={
                    time
                      ? time.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Select Time *"
                  } // If time is selected, show it, else show the placeholder
                  editable={false}
                  style={styles.input}
                />
              </TouchableOpacity>

              {/* Show Time Picker */}
              {showTimePicker && (
                <DateTimePicker
                  value={time || new Date()} // If no time is selected, use the current time
                  mode="time"
                  display="default"
                  onChange={onChangeTime}
                />
              )}
              <TextInput
                style={styles.input}
                placeholder="Members *"
                placeholderTextColor="black"
                value={members}
                onChangeText={setMembers}
              />
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={dropLocation}
                  onValueChange={(itemValue) => {
                    setDropLocation(itemValue);
                    if (itemValue !== "Others") {
                      setCustomLocation(""); // Clear custom location if a predefined location is selected
                      setDropLocationName(""); // Clear dropLocationName
                    }
                  }}
                  style={styles.picker}
                >
                  <Picker.Item
                    label="Select Drop Location *"
                    value=""
                    color="black"
                  />
                  <Picker.Item label="Seamen Centre" value="Seamen Centre" />
                  <Picker.Item label="Port Main Gate" value="Port Main Gate" />
                  <Picker.Item label="Duty Free" value="Duty Free" />
                  <Picker.Item label="Shopping Mall" value="Shopping Mall" />
                  <Picker.Item label="City" value="City" />
                  <Picker.Item label="Others" value="Others" />
                </Picker>
              </View>

              {/* Custom Drop Location Input (only if "Others" is selected) */}
              {dropLocation === "Others" && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your own location"
                  value={customLocation}
                  onChangeText={setCustomLocation}
                />
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.button}
              onPress={handleTaxiBooking}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Booking..." : "Book Taxi"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 60, // Space for fixed button
  },
  bookingContainer: {
    flex: 1, // Ensure it fills available space
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white", // Optional: Better contrast
  },
  placeholderText: {
    color: "gray", // Placeholder text color
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
    color: "#007AFF",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "skyblue",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "white",
  },
  picker: {
    height: 55,
    width: "100%",
    fontSize: 16,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "skyblue",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "white",
    marginBottom: 10,
  },
  bookingMessageBox: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5, // Shadow effect for Android
  },
  bookingMessageText: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    marginTop: 10,
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  pickerButton: {
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "skyblue",
    borderRadius: 8,
    marginBottom: 10,
  },
  pickerButtonText: {
    fontSize: 16,
    color: "black",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TaxiBookingScreen;
