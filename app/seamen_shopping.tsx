import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Category {
  id: number;
  category_name: string;
  category_image: string;
}

interface Product {
  id: number;
  name: string;
  image: string;
  price: string;
  discount_price: string;
  stock: string;
}

const Header: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchCartItems = async () => {
        try {
          const userData = await AsyncStorage.getItem("user");
          const userId = userData ? JSON.parse(userData)?.userInfo?.id : null;
          if (!userId) return;

          const response = await fetch(
            `https://globalseafarers.org/dashboard/api/seamen_services/cart_list.php?user_id=${userId}`
          );
          const data = await response.json();
          if (data.status === "1" && Array.isArray(data.message)) {
            setCartItems(data.message);
          } else {
            setCartItems([]);
          }
        } catch (error) {
          console.error("Error fetching cart items:", error);
          setCartItems([]);
        }
      };

      fetchCartItems();
    }, [])
  );

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

    fetchUserName();
    fetchCategories();
  }, []);

  2;
  const fetchProducts = async (categoryId: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://globalseafarers.org/dashboard/api/seamen_services/cat_products.php?category_id=${categoryId}`
      );
      console.log("response", response);
      const data = await response.json();
      if (data.status === "1" && Array.isArray(data.message)) {
        setProducts(data.message);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
    setLoading(false);
  };

  const handleCategoryPress = (category: Category) => {
    console.log("category", category.id);
    setSelectedCategory(category);
    fetchProducts(category.id);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setProducts([]);
  };

  // Handle Go to Cart Button Press
  const handleGoToCart = () => {
    router.push("/cart_screen");
  };

  const handleGoToList = () => {
    router.push("/seamen_orders_list");
  };

  const handleProductPress = async (productId: number) => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const userId = userData ? JSON.parse(userData)?.userInfo?.id : null;
      if (!userId) return;

      const response = await fetch(
        `https://globalseafarers.org/dashboard/api/seamen_services/product_details.php?id=${productId}&user_id=${userId}`
      );
      const data = await response.json();
      if (data.status === "1") {
        router.push({
          pathname: "/product-details",
          params: {
            id: data.message.id,
            name: data.message.name,
            image: data.message.image,
            price: data.message.price,
            discount_price: data.message.discount_price,
            description: data.message.description,
            stock: data.message.stock,
            content: data.message.content,
          },
        });
      }
      console.log("Product Details:", data);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["lightblue", "skyblue"]}
        style={styles.headerContainer}
      >
        <View style={styles.headerTop}>
          <Text style={styles.userNameText}>Welcome {userName}</Text>

          <TouchableOpacity style={styles.cartIcon} onPress={handleGoToCart}>
            <Ionicons name="cart-outline" size={30} color="white" />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartCount}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.orderIcon} onPress={handleGoToList}>
            <Ionicons name="list-sharp" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {selectedCategory ? (
        loading ? (
          <ActivityIndicator
            size="large"
            color="skyblue"
            style={styles.loader}
          />
        ) : (
          <>
            <TouchableOpacity
              onPress={handleBackToCategories}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
              <Text>Back to Categories</Text>
            </TouchableOpacity>
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={styles.productGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.productItem}
                  onPress={() => handleProductPress(item.id)}
                >
                  <View>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.productImage}
                    />
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>{item.price}/- Rs</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.categoryGrid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(item)}
            >
              <Image
                source={{ uri: item.category_image }}
                style={styles.categoryImage}
                resizeMode="contain" // Ensures the image scales well
              />
              <Text style={styles.categoryText}>{item.category_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    paddingBottom: 10,
  },
  headerContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 5,
    marginTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  orderIcon: {
    marginRight: 10,
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
  loader: {
    marginTop: 50,
  },
  cartIcon: {
    position: "relative",
    marginLeft: 50,
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
  cartCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  productGrid: {
    padding: 10,
  },
  productItem: {
    width: "48%",
    margin: "1%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  productPrice: {
    fontSize: 14,
    color: "green",
  },
  categoryGrid: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  categoryItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    margin:4,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  categoryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: "cover",
  },

  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
});

export default Header;
