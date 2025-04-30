import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

interface PortModalProps {
  isVisible: boolean;
  onClose: () => void;
  type: string;
  onSubmit: (country: string, port: string) => void; // Send selected values back to the parent
}

export default function PortModal({ isVisible, onClose, onSubmit, type }: PortModalProps) {
  const params = useLocalSearchParams();
  const [countries, setCountries] = useState([]);
  const [ports, setPorts] = useState([]);
  const [, setIsVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedPort, setSelectedPort] = useState('');
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingPorts, setLoadingPorts] = useState(false);

  useEffect(() => {
    console.log("Params:", params); // Debugging step
    if (params.isVisible === "true") {
      setIsVisible(true);
    }
  }, [params.isVisible]);

  // Log isVisible prop
  useEffect(() => {
    console.log('isVisible:', isVisible);  // Log isVisible prop value
  
    if (isVisible) {
      resetState(); // Reset state before fetching data
      fetchCountries(); // Fetch countries
    }
  }, [isVisible]);
  

  const resetState = () => {
    console.log('Resetting state...');
    setSelectedCountry('');
    setSelectedPort('');
    setCountries([]);  // Clear countries
    setPorts([]);  // Clear ports
  };

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await axios.get('https://globalseafarers.org/dashboard/api/country.php');
      console.log('Countries API Response:', response.data); // Log the response
      if (Array.isArray(response.data.message)) {
        setCountries(response.data.message); // Set the countries array
      } else {
        alert('Failed to fetch countries.');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      alert('Error fetching countries. Please try again later.');
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchPorts = async (countryId: string) => {
    try {
      setLoadingPorts(true);
      const response = await axios.get(`https://globalseafarers.org/dashboard/api/ports.php?country_id=${countryId}`);
      console.log('Ports API Response:', response.data); // Log the ports response
      if (Array.isArray(response.data.message)) {
        setPorts(response.data.message); // Set the ports array
      } else {
        setPorts([]);
        alert('No ports available for the selected country.');
      }
    } catch (error) {
      console.error('Error fetching ports:', error);
      alert('Error fetching ports. Please try again later.');
    } finally {
      setLoadingPorts(false);
    }
  };

  const handleCountryChange = (countryId: string) => {
    setSelectedCountry(countryId);
    setSelectedPort(''); // Reset port selection when the country changes
    if (countryId) {
      fetchPorts(countryId);
    } else {
      setPorts([]); // Clear ports if no country is selected
    }
  };

  const handleSubmit = () => {
    if (!selectedCountry || !selectedPort) {
      alert('Please select both country and port.');
      return;
    }
    onSubmit(selectedCountry, selectedPort); // Send selected values to the parent
    onClose(); // Close the modal
  };

  return (
    <Modal visible={isVisible} transparent={true}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{type === "port" ? "Select Country And Port" : "Select Country And City" }</Text>
          {/* Country Picker */}
          {loadingCountries ? (
            <ActivityIndicator size="small" color="#2575fc" />
          ) : (
            <Picker
              selectedValue={selectedCountry}
              onValueChange={handleCountryChange}
            >
              <Picker.Item label="Select a country" value="" />
              {countries.map((country: any) => (
                <Picker.Item key={country.id} label={country.country_name} value={country.id} />
              ))}
            </Picker>
          )}

          {/* Port Picker */}
          {loadingPorts ? (
            <ActivityIndicator size="small" color="#2575fc" />
          ) : (
            <Picker
              selectedValue={selectedPort}
              onValueChange={(value) => setSelectedPort(value)}
              enabled={!!selectedCountry} // Disable port picker until a country is selected
            >
              <Picker.Item label={type === "port" ? "Select a Port" : "Select a City"} value="" />
              {ports.map((port: any) => (
                <Picker.Item key={port.id} label={port.port_name} value={port.id} />
              ))}
            </Picker>
          )}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#2575fc',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 16,
  },
  closeButtonText: {
    color: '#2575fc',
    textAlign: 'center',
  },
});
