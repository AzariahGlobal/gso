import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import Header from "./components/Header";

interface MaritimeInstitution {
  id: number;
  country: string;
  image: string;
  city: string;
  university: string;
  state: string;
  mti_no: number
}

interface ShipChandler {
  id: number;
  country: string;
  image: string;
  name: string;
  content: string;
}

interface DgaDoctor {
  id: number;
  state: string;
  city: string;
  dgs_approval_no: string;
  name: string;
  qualification: string;
  examination_center: string;
  landline_no: string;
  mobile_no: string;
  email: string;
  course_completion_date: string;
  date_of_regn: string;
  valid_of_regn: string;
}

interface IndianEmbassy {
  id: number;
  name: string;
  address: string;
  phone: string;
  fax: string;
  email: string;
  ambassdor: string;
  website: string;
}

const MaritimeDirectory = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<MaritimeInstitution[]>([]);
  const [shipChandlers, setShipChandlers] = useState<ShipChandler[]>([]);
  const [dgaDoctors, setDgaDoctors] = useState<DgaDoctor[]>([]);
  const [indianEmbassy, setIndianEmbassy] = useState<IndianEmbassy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  // Fetch Maritime Institutions
  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://globalseafarers.org/dashboard/api/maritime_directory/institutes.php"
      );
      const data = await response.json();
      setInstitutions(data.message as MaritimeInstitution[]);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Ship Chandlers
  const fetchShipChandlers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://globalseafarers.org/dashboard/api/maritime_directory/ship_chandlers.php"
      );
      const data = await response.json();
      setShipChandlers(data.message as ShipChandler[]);
    } catch (error) {
      console.error("Error fetching ship chandlers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch DGA Approved Doctors
  const fetchDgaDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://globalseafarers.org/dashboard/api/dg_approved_doctors.php"
      );
      const data = await response.json();
      setDgaDoctors(data.message as DgaDoctor[]);
    } catch (error) {
      console.error("Error fetching DGA Approved Doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch DGA Approved Doctors
  const fetchIndianEmbassy = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://globalseafarers.org/dashboard/api/indian_embussy.php"
      );
      const data = await response.json();
      setIndianEmbassy(data.message as IndianEmbassy[]);
    } catch (error) {
      console.error("Error fetching IndianEmbassy:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Category Selection
  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    if (category === "Indian Embassy") {
      fetchIndianEmbassy();
    } else if (category === "Maritime Institutions") {
      fetchInstitutions();
    } else if (category === "DGA Approved Doctors") {
      fetchDgaDoctors();
    } else if (category === "DGA Approved RPSL List") {
      fetchShipChandlers();
    } else {
      Alert.alert("Coming Soon", `${category} will be added soon.`);
    }
  };

  // Render Item for Maritime Institutions
  const renderInstitution = ({ item }: { item: MaritimeInstitution }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.mti_no}</Text>
      <Text style={styles.title}>{item.university}</Text>
      <Text style={styles.subtitle}>
        {item.city}, {item.state}, {item.country}
      </Text>
    </View>
  );


  // Render Item for DGA Approved Doctors
  const renderDgaDoctor = ({ item }: { item: DgaDoctor }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>
        {item.city}, {item.state}
      </Text>
      <Text style={styles.description}>
        <Text style={{ fontWeight: "bold" }}>Approval No: </Text>
        {item.dgs_approval_no}
      </Text>
      <Text style={styles.description}>
        <Text style={{ fontWeight: "bold" }}>Qualification: </Text>
        {item.qualification}
      </Text>
      <Text style={styles.description}>
        <Text style={{ fontWeight: "bold" }}>Exam Center: </Text>
        {item.examination_center}
      </Text>
      <Text style={styles.description}>
        <Text style={{ fontWeight: "bold" }}>Contact: </Text>
        {item.mobile_no || item.landline_no}
      </Text>
      <Text style={styles.description}>
        <Text style={{ fontWeight: "bold" }}>Email: </Text>
        {item.email}
      </Text>
    </View>
  );

  const renderIndianEmbassy = ({ item }: { item: IndianEmbassy }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>{item.address}</Text>
      <Text style={styles.description}>
        <Text style={{ fontWeight: "bold" }}>Phone: </Text>
        {item.phone}
      </Text>
      <Text style={styles.description}>
        <Text style={{ fontWeight: "bold" }}>Fax: </Text>
        {item.fax}
      </Text>
      <Text style={styles.description}>
        <Text style={{ fontWeight: "bold" }}>Email: </Text>
        {item.email}
      </Text>
      <Text style={styles.description}>
        <Text style={{ fontWeight: "bold" }}>Ambassador: </Text>
        {item.ambassdor}
      </Text>
      <Text style={styles.description}>
        <Text style={{ fontWeight: "bold" }}>Website: </Text>
        {item.website}
      </Text>
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
        <Text style={styles.header}>Maritime Directory</Text>
        <View style={styles.categoryContainer}>
          {[
            "Indian Embassy",
            "Maritime Institutions",
            "DGA Approved Doctors",
            "DGA Approved RPSL List"
          ].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton,
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCategory && (
          <Text style={styles.categoryTitle}>Showing {selectedCategory}</Text>
        )}

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : selectedCategory === "Maritime Institutions" ? (
          <FlatList
            data={institutions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderInstitution}
          />
        ) : selectedCategory === "DGA Approved Doctors" ? (
          <FlatList
            data={dgaDoctors}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderDgaDoctor}
          />
        ) : selectedCategory === "Indian Embassy" ? (
          <FlatList
            data={indianEmbassy}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderIndianEmbassy}
          />
        ) : (
          <Text style={styles.defaultText}>
            Select a category to view details
          </Text>
        )}
      </View>
    </>
  );
};

export default MaritimeDirectory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
    margin: 20,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10, // Gives spacing between buttons
    marginBottom: 15,
  },
  categoryButton: {
    paddingVertical: 8, // Reduced height
    paddingHorizontal: 12, // Adjust width
    borderRadius: 8,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "30%", // Ensures buttons are smaller
  },
  selectedCategoryButton: {
    backgroundColor: "#0056b3",
  },
  categoryText: {
    color: "white",
    fontSize: 14, // Reduced font size
    fontWeight: "500",
    textAlign: "center",
  },
  selectedCategoryText: {
    fontWeight: "bold",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginTop: 5,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#007bff",
    marginTop: 20,
  },
  defaultText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});
