import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the trash icon

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const CartListScreen = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getUserId();
  }, []);

  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      if (!user) {
        console.log("User not logged in");
        return;
      }
      const userId = user?.userInfo?.id;
      if (userId) {
        setUserId(userId.toString());
        fetchCartItems(userId.toString());
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  };

  const fetchCartItems = async (userId: string) => {
    try {
      const response = await axios.get(
        `https://globalseafarers.org/dashboard/api/seamen_services/cart_list.php?user_id=${userId}`
      );
      if (response.data.status === "1") {
        const updatedItems: CartItem[] = response.data.message.map(
          (item: any) => ({
            id: item.id.toString(),
            name: item.name,
            price: parseFloat(item.price) || 0,
            quantity: item.quantity || 1,
            image: item.image,
          })
        );
        setCartItems(updatedItems);
      } else {
        Alert.alert("Error", "No products are there in cart!");
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  const removeCartItem = async (productId: string) => {
    if (!userId) return;

    try {
      const response = await axios.get(
        `https://globalseafarers.org/dashboard/api/seamen_services/remove_cart.php?user_id=${userId}&product_id=${productId}`
      );
      if (response.data.status === "1") {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
        Alert.alert("Success", "Item removed from cart.");
      } else {
        Alert.alert("Error", "Failed to remove item.");
      }
    } catch (error) {
      console.error("Error removing cart item:", error);
      Alert.alert("Error", "Something went wrong!");
    }
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Cart</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price.toFixed(2)}-/ Rs</Text>
            </View>
            <View style={styles.quantityContainer}>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  style={styles.quantityButton}
                >
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  style={styles.quantityButton}
                >
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* DELETE BUTTON BELOW QUANTITY BUTTONS */}
              <TouchableOpacity
                onPress={() => removeCartItem(item.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Text style={styles.totalText}>Total: ${calculateTotal()}</Text>
      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => {
          const filteredCartItems = cartItems.map(({ id, quantity, price }) => ({
            id,
            quantity,
            price,
          }));

          const totalPriceAmount = filteredCartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          router.push({
            pathname: "/checkout",
            params: {
              userId: userId,
              products: JSON.stringify(filteredCartItems),
              totalPriceAmount,
            },
          });
        }}
      >
        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    margin: 25,
    color: "#007AFF",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    justifyContent: "space-between",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  productPrice: {
    fontSize: 16,
    color: "#28a745",
    fontWeight: "600",
  },
  quantityContainer: {
    alignItems: "center",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  loader: {
    marginTop: 50,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: "#007bff",
    borderRadius: 15,
    marginHorizontal: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
    color: "#000",
  },
  checkoutButton: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: "#ff4444",
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CartListScreen;
