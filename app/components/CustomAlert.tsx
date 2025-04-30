import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image
} from "react-native";

interface CustomAlertProps {
  message: string;
  isLoading: boolean; // Accept loading prop
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  message,
  isLoading,
  onClose,
}) => {
  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          {isLoading ? (
            <ActivityIndicator size="large" color="skyblue" />
          ) : (
            <>
              <Image source={require("@/assets/images/sucess.png")} style={{ width: 100, height: 100 }} />
              <Text style={styles.message}>{message}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertBox: {
    width: 250,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "skyblue",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomAlert;
