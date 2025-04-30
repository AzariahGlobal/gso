import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from './utils/notifications';
import * as Notifications from "expo-notifications";
import usePushNotifications from "@/hooks/usePushNotifications";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


export default function RootLayout() {
  usePushNotifications();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

   useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (loaded && isLoggedIn !== null) {
      SplashScreen.hideAsync();
      if (isLoggedIn) {
        setTimeout(() => {
          router.replace("/home"); // Navigate AFTER layout is mounted
        }, 100);
      }
    }
  }, [loaded, isLoggedIn]);

  if (!loaded || isLoggedIn === null) {
    return null; // Show nothing until we know login status
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <>
              <Stack.Screen name="home" />
              <Stack.Screen name="ProfileBox" />
              <Stack.Screen name="taxi" />
              <Stack.Screen name="taxi_bookings"/>
              <Stack.Screen name="checkout" />
              <Stack.Screen name="rpsl+vacancies" />
              <Stack.Screen name="success_screen" />
              <Stack.Screen name="helpline" />
              <Stack.Screen name="ship_store" />
              <Stack.Screen name="/components/seamenShopping/ProductListScreen" />
              <Stack.Screen name="seamen_shopping" />
              <Stack.Screen name="/seamen_orders_list" />
            </>
          ) : (
            <>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="register" />
            </>
          )}
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
