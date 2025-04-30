import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import Header from "./components/Header";
import DateTimePicker from "@react-native-community/datetimepicker";

const GlobalShipStores = () => {
  const [name, setName] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [requiredItem, setRequiredItem] = useState("");
  const [impaNo, setImpaNo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [portName, setPortName] = useState("");
  const [eta, setEta] = useState<Date | null>(null);
  const [etc, setEtc] = useState<Date | null>(null);
  const [etd, setEtd] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState({
    field: "",
    visible: false,
  });
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  // Function to pick an image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Function to handle date selection
  const showDateTimePicker = (field: string) => {
    setShowDatePicker({ field, visible: true });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      switch (showDatePicker.field) {
        case "ETA":
          setEta(selectedDate);
          break;
        case "ETC":
          setEtc(selectedDate);
          break;
        case "ETD":
          setEtd(selectedDate);
          break;
        default:
          break;
      }
    }
    setShowDatePicker({ field: "", visible: false });
  };

  // Function to submit the form
  const handleSubmit = () => {
    const formData = {
      vesselName,
      requiredItem,
      impaNo,
      name,
      quantity,
      itemDescription,
      image,
      portName,
      eta,
      etc,
      etd,
    };
    console.log("Form Submitted:", formData);
    alert("Form Submitted Successfully!");
  };

  return (
    <>
      <Header
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Wellness</Text>
        <Text style={styles.label}>Vessel Name</Text>
        <TextInput
          style={styles.input}
          value={vesselName}
          onChangeText={setVesselName}
          placeholder="Enter Vessel Name"
        />
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter Your Name"
        />

        <Text style={styles.label}>Items</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={requiredItem} onValueChange={setRequiredItem}>
            <Picker.Item label="Select an item" value="" />
            <Picker.Item label="Deck" value="deck" />
            <Picker.Item label="Engine" value="engine" />
            <Picker.Item label="Electrical" value="electrical" />
            <Picker.Item label="Saloon" value="saloon" />
            <Picker.Item label="Provisions" value="provisions" />
          </Picker>
        </View>

        <Text style={styles.label}>IMPA Number *</Text>
        <TextInput
          style={styles.input}
          value={impaNo}
          onChangeText={setImpaNo}
          placeholder="Enter IMPA No"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Enter Quantity"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.input}
          value={itemDescription}
          onChangeText={setItemDescription}
          placeholder="Enter Description"
        />

        <Text style={styles.label}>Sample Photo(Optional)</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadText}>Upload Image</Text>
        </TouchableOpacity>

        {image && (
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setImage(null)}
            >
              <Text style={styles.removeText}>Remove Image</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Port</Text>
        <TextInput
          style={styles.input}
          value={portName}
          onChangeText={setPortName}
          placeholder="Enter Port Name"
        />

        {["ETA", "ETC", "ETD"].map((field) => (
          <View key={field}>
            <Text style={styles.label}>Vessel {field}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => showDateTimePicker(field)}
            >
              <Text>
                {field === "ETA" && eta
                  ? eta.toLocaleString()
                  : field === "ETC" && etc
                  ? etc.toLocaleString()
                  : field === "ETD" && etd
                  ? etd.toLocaleString()
                  : `Select ${field}`}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {showDatePicker.visible && (
          <DateTimePicker
            value={
              showDatePicker.field === "ETA"
                ? eta || new Date()
                : showDatePicker.field === "ETC"
                ? etc || new Date()
                : etd || new Date()
            }
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
          />
        )}

        <View style={{ marginTop: 20 }}>
          <Button title="Submit" onPress={handleSubmit} color="#007BFF" />
        </View>
      </ScrollView>
    </>
  );
};

export default GlobalShipStores;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
    margin: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  uploadText: {
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  removeButton: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
  },
  removeText: {
    color: "#fff",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
});
