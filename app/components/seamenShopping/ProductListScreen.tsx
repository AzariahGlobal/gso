import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function ProductsScreen() {
  const { categoryId } = useLocalSearchParams();

  return (
    <View>
      <Text>Showing products for category ID: {categoryId}</Text>
      {/* Render product list here */}
    </View>
  );
}
