import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Category {
  id: number;
  category_name: string;
  category_image: string;
}

interface Product {
  id: number;
  product_name: string;
  product_image: string;
}

interface HeaderProps {
  cartItems: any[];
}

const Header: React.FC<HeaderProps> = ({ cartItems = [] }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const categoryScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserName(parsedUser?.userInfo?.name || "Guest");
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "https://globalseafarers.org/dashboard/api/seamen_services/category.php"
        );
        const data = await response.json();
        if (data.status === "1" && Array.isArray(data.message)) {
          setCategories(data.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://globalseafarers.org/dashboard/api/seamen_services/all_products.php"
        );
        const data = await response.json();

        if (data.status === "1" && Array.isArray(data.message)) {
          setProducts(data.message);
        } else {
          console.error("Unexpected API response format:", data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchUserName();
    fetchCategories();
    fetchProducts();
  }, []);
  
  useEffect(() => {
    console.log("Products state updated:", products);
  }, [products]);

  const handleProductClick = async (productId: number) => {
    try {
      const response = await fetch(
        `https://globalseafarers.org/dashboard/api/seamen_services/product_details.php?id=${productId}`
      );
      const data = await response.json();
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  return (
    <>
      <LinearGradient
        colors={["lightblue", "skyblue"]}
        style={styles.headerContainer}
      >
        <View style={styles.headerTop}>
          <Text style={styles.userNameText}>Welcome {userName}</Text>
          <TouchableOpacity style={styles.cartIcon}>
            <Ionicons name="cart-outline" size={30} color="white" />
            {cartItems?.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartCount}>{cartItems?.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Categories with Scroll Arrows */}
      <View style={styles.categoryWrapper}>
        <TouchableOpacity
          onPress={() =>
            categoryScrollRef.current?.scrollTo({ x: 0, animated: true })
          }
        >
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryContainer}
            >
              <Image
                source={{ uri: category.category_image }}
                style={styles.categoryImage}
              />
              <Text style={styles.categoryText}>{category.category_name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          onPress={() =>
            categoryScrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          <Ionicons name="chevron-forward" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <ScrollView style={{ backgroundColor: "white" }}>
        <View style={styles.productGrid}>
          {products.length > 0 ? (
            products.map((product) => (
              <View key={product.id} style={styles.productContainer}>
                <Image
                  source={{ uri: product.product_image }}
                  style={styles.productImage}
                />
                <Text style={styles.productName}>{product.product_name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.loadingText}>No products found...</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 5,
    marginTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userNameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  cartIcon: {
    position: "relative",
  },
  categoryText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: "black", // Ensures better visibility
    textAlign: "center",
    width: 80, // Ensures proper alignment
  },
  cartCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    width: 18, // Adjusts to fit inside the badge properly
    height: 18,
    borderRadius: 9,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
  },
  categoryScroll: {
    flexGrow: 1,
  },
  categoryContainer: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  productCard: {
    width: "45%",
    margin: 10,
    alignItems: "center",
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productText: {
    textAlign: "center",
    marginTop: 5,
  },
  productContainer: {
    backgroundColor: "white",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  productPrice: {
    fontSize: 14,
    color: "green",
  },
  discountPrice: {
    fontSize: 14,
    color: "red",
    fontWeight: "bold",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    marginTop: 20,
  },
});

export default Header;
