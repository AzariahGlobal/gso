import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import Header from "./Header";

const RPSLAgenciesScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<any>(null);

  useEffect(() => {
    fetch("https://globalseafarers.org/dashboard/api/rpsl_agencies.php")
      .then((response) => response.json())
      .then((json) => {
        if (json.status === "1") {
          setData(json.message);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const handlePress = (id: string) => {
    fetch(`https://globalseafarers.org/dashboard/api/detailed_rpsl_agencies.php?id=${id}`)
      .then((response) => response.json())
      .then((json) => {
        if (json.status === "1" && json.message.length > 0) {
          setSelectedAgency(json.message[0]);
          setModalVisible(true);
        } else {
          setSelectedAgency(null);
          setModalVisible(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const renderItem = ({ item }: { item: { id: string; image: string; name: string } }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(item.id)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.agencyName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <>
      <Header isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />
      <View style={styles.container}>
      <Text style={styles.header}>Ship Jobs</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {/* Modal for showing details */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedAgency ? (
              <>
                {/* <Image source={{ uri: selectedAgency.image }} style={styles.modalImage} /> */}
                <Text style={styles.modalTitle}>Agency Details</Text>
                <Text style={styles.modalText}>📌 ID: {selectedAgency.rpsl_id}</Text>
                <Text style={styles.modalText}>📞 Phone: {selectedAgency.phone}</Text>
                <Text style={styles.modalText}>📧 Email: {selectedAgency.email}</Text>
                <Text style={styles.modalText}>🗓 Expiry Date: {selectedAgency.expiry_date}</Text>
              </>
            ) : (
              <Text style={styles.modalText}>No details available.</Text>
            )}

            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
  listContainer: {
    justifyContent: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
    margin: 20,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    alignItems: "center",
    padding: 6,
  },
  image: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
    borderRadius: 10,
    alignSelf: "stretch",
  },
  agencyName: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  modalText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#ff4757",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default RPSLAgenciesScreen;
