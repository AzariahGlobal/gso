import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Header from "./components/Header";

const HelplineScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rank, setRank] = useState("");
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [nationality, setNationality] = useState("");
  const [message, setMessage] = useState("");
  const [ranks, setRanks] = useState([]);
  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    fetch("https://globalseafarers.org/dashboard/api/rank.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "1" && Array.isArray(data.message)) {
          setRanks(data.message);
        } else {
          Alert.alert("Error", "Failed to fetch ranks");
        }
      })
      .catch((error) =>
        Alert.alert("Error", "Something went wrong while fetching ranks")
      );
  }, []);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("rank", rank);
    formData.append("nationality", nationality);
    formData.append("email", email);
    formData.append("message", message);  
  
    fetch("https://globalseafarers.org/dashboard/api/helpline.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        Alert.alert("Response", data.message);
      })
      .catch((error) => {
        console.error("Fetch Error:", error); // Log any errors
        Alert.alert("Error", "Failed to submit request");
      });
  };  

  return (
    <>
      <Header
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
      />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Helpline</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Enter your name"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            placeholder="Enter your email"
          />
          <Text style={styles.label}>Rank</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={rank}
              onValueChange={(itemValue) => setRank(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Rank" value="" />
              {ranks.map((item: any) => (
                <Picker.Item key={item.id} label={item.rank} value={item.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Nationality</Text>
          <TextInput
            value={nationality}
            onChangeText={setNationality}
            style={styles.input}
            placeholder="Enter your nationality"
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            style={styles.textarea}
            multiline
            placeholder="Enter your message"
          />

          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    width: "100%",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 15,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 60,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    height: 100,
    textAlignVertical: "top", // ✅ Fixes issue where text starts at the center
    width: "100%",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "#007AFF",
  },
});

export default HelplineScreen;
