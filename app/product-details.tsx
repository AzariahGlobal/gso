import { useLocalSearchParams } from "expo-router";
import { View, Text, Image, StyleSheet, ScrollView, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

const ProductDetails = () => {
  const { id, name, image, price, discount_price, description, stock, content } = useLocalSearchParams();
  const [userId, setUserId] = useState("");
  const [isProductInCart, setIsProductInCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  // Fetch user ID from AsyncStorage
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const parsedUserId = userData ? JSON.parse(userData)?.userInfo?.id : null;
  
        if (parsedUserId) {
          setUserId(parsedUserId);
          fetchCartCount(parsedUserId); // Fetch cart count on load
  
          const parsedProductId = Array.isArray(id) ? +id[0] : +id; // Define parsedProductId here
          if (!isNaN(parsedProductId)) {
            checkIfProductInCart(parsedProductId, parsedUserId); // Now it's properly defined
          }
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
  
    getUserId();
  }, [id]);
  

  // Fetch cart count
  const fetchCartCount = async (userId: any) => {
    try {
      const response = await fetch(
        `https://globalseafarers.org/dashboard/api/seamen_services/cart_list.php?user_id=${userId}`
      );
      const data = await response.json();

      if (data.status === "1" && Array.isArray(data.message)) {
        setCartCount(data.message.length);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  // Check if the product is already in the cart
  const checkIfProductInCart = async (productId:any, userId: any) => {
    try {
      const response = await fetch(
        `https://globalseafarers.org/dashboard/api/seamen_services/cart_list.php?user_id=${userId}`
      );
      const data = await response.json();

      if (data.status === "1" && Array.isArray(data.message)) {
        const productInCart = data.message.find((item: any) => item.id === productId);
        setIsProductInCart(!!productInCart);
      } else {
        setIsProductInCart(false);
      }
    } catch (error) {
      console.error("Error checking product in cart:", error);
    }
  };

  // **GET Request to Add Product to Cart**
  const addToCart = async (productId: any) => {
    try {
      if (!userId) {
        console.log("User not logged in");
        return;
      }

      const response = await fetch(
        `https://globalseafarerjobs.com/new/dashboard/api/seamen_services/cart.php?user_id=${userId}&product_id=${productId}`
      );

      const data = await response.json();

      if (data.status === "1") {
        console.log("Product added to cart successfully!");
        setIsProductInCart(true);
        fetchCartCount(userId); // Update cart count
        router.push("/seamen_shopping"); // Navigate after adding to cart
      } else {
        console.error("Failed to add product to cart:", data.message);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  // Handle Add to Cart Button Press
  const handleAddToCart = async () => {
    const parsedProductId = Array.isArray(id) ? +id[0] : +id;
    if (isNaN(parsedProductId)) {
      console.error("Invalid product ID");
      return;
    }
    await addToCart(parsedProductId);
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: Array.isArray(image) ? image[0] : image }} style={styles.productImage} />
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.price}>Price: {price}Rs</Text>
      {/* <Text style={styles.discountPrice}>Discounted Price: {discount_price}Rs</Text> */}
      <Text style={styles.stock}>Stock: {stock}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.content}>{content}</Text>

      {!isProductInCart ? (
        <Button title="Add to Cart" onPress={handleAddToCart} />
      ) : (
        <Button title="Go to Cart" onPress={() => router.push("/cart_screen")} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    margin: 10,
    marginTop: 35,
    backgroundColor: "white",
  },
  productImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
  },
  discountPrice: {
    fontSize: 16,
    color: "red",
  },
  stock: {
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    marginVertical: 10,
  },
  content: {
    fontSize: 14,
    fontStyle: "italic",
  },
});

export default ProductDetails;
