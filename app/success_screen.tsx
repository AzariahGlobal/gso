import { View, Text, Image, Button } from "react-native";
import { useRouter} from "expo-router";
import usePushNotifications from "@/hooks/usePushNotifications";

const BookingSuccessScreen = () => {
  const router = useRouter();
  usePushNotifications();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image source={require("@/assets/images/sucess.png")} style={{ width: 100, height: 100 }} />
      <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 10 }}>Booking Successful!</Text>
      <Text>Your taxi has been booked. An administrator will contact you soon.</Text>
      <Button title="Go to Home" onPress={() => router.push("/home")} />
    </View>
  );
};

export default BookingSuccessScreen;
