import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants"; // Import Constants

const usePushNotifications = () => {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (!Device.isDevice) {
        console.log("❌ Must use a real device for push notifications.");
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("🚫 Notification permission denied");
        return;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId; // Get projectId
        if (!projectId) throw new Error("Missing projectId in Constants");

        const token = (
          await Notifications.getExpoPushTokenAsync({ projectId })
        ).data;

        console.log("✅ Expo Push Token:", token);
        setExpoPushToken(token);
      } catch (error) {
        console.log("❌ Error getting push token:", error);
      }
    };

    registerForPushNotifications();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📩 Notification Received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("🔔 Notification Clicked:", response);
      });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  return expoPushToken;
};

export default usePushNotifications;
