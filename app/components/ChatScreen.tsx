import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Header from "./Header";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type Message = {
  id: number;
  message: string;
  type: "user" | "port"; // "port" means the message is from sender
};

type User = {
  id: number;
  port_id: string;
  name: string;
};

export default function ChatScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  // 📢 Register for Push Notifications
  useEffect(() => {
    async function registerForPushNotifications() {
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          console.log("Push Notification 1");
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus === "granted") {
          console.log("Push Notification ");
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          setExpoPushToken(token);
          console.log("Push Notification token:", token);
        }
      }
    }
    registerForPushNotifications();
  }, []);

  // 📥 Fetch User List
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const id = parsedUser?.userInfo?.id || "";
          console.log("Fetched user ID:", id); // Debugging
          setUserId(id);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    fetchUser();
  }, []);  
  
  // Fetch User List only after userId is available
  useEffect(() => {
    if (!userId) {
      console.log("User ID not available yet, skipping fetchUsers");
      return;
    }
  
    const fetchUsers = async () => {
      try {
        const response = await fetch(`https://globalseafarers.org/dashboard/api/swo/chat_users_list.php?user_id=${userId}`);
        const data = await response.json();
        console.log("Users API response:", data);
        if (data.status === "1") {
          setUsers(data.message);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
  
    fetchUsers();
  }, [userId]);
  

  const CHAT_API =
  "https://globalseafarers.org/dashboard/api/swo/user_user_chat_list.php";
  const SEND_MESSAGE_API =
  "https://globalseafarers.org/dashboard/api/swo/send_message.php";

  // 📨 Fetch Chat Messages (Poll every 5 seconds)
  useEffect(() => {
    if (!selectedUser || !userId) return;
  
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${CHAT_API}?user_id=${userId}&port_id=${selectedUser.port_id}`
        );
        const data = await res.json();        
        if (data.status === "1") {
          const newMessages: Message[] = data.message;
  
          if (newMessages.length > 0) {
            const latestMessage = newMessages[newMessages.length - 1];
  
            // Trigger push notification for new incoming messages from "port"
            if (latestMessage.id !== lastMessageId && latestMessage.type === "port") {
              console.log("data resposne..........calling")
              setLastMessageId(latestMessage.id); // Update lastMessageId before sending notification
              sendPushNotification(selectedUser.name, latestMessage.message);
            }
          }
  
          setMessages(newMessages); // Update chat messages
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
  
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
  
    return () => clearInterval(interval);
  }, [selectedUser, userId, lastMessageId]);
  

  // ✉️ Send Message
  const sendMessage = () => {
    if (!messageInput.trim() || !selectedUser) return;

    fetch(
      `${SEND_MESSAGE_API}?user_id=${userId}&port_id=${selectedUser.port_id}&message=${messageInput}`,
      {
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "1") {
          setMessages([
            ...messages,
            { id: Date.now(), message: messageInput, type: "user" },
          ]);
          setMessageInput("");
        }
      })
      .catch((err) => console.error(err));
  };

  // 📢 Send Push Notification when a new message arrives from "port"
  async function sendPushNotification(userName: string, message: string) {
    if (!expoPushToken) {
      console.log("❌ No Expo Push Token Available");
      return;
    }

    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: expoPushToken,
          sound: "default",
          title: `New message from ${userName}`,
          body: message,
        }),
      });

      const data = await response.json();
      console.log("✅ Push Notification Response:", data);
    } catch (error) {
      console.error("❌ Error sending push notification:", error);
    }
  }

  return (
    <>
      <Header
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
      />
      <View style={styles.container}>
        {!selectedUser ? (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => setSelectedUser(item)}
              >
                <Text style={styles.userName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <>
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.chatContainer}
            >
              {messages.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.messageBubble,
                    item.type === "user"
                      ? styles.userMessage
                      : styles.portMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{item.message}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={messageInput}
                onChangeText={setMessageInput}
                placeholder="Type a message..."
                placeholderTextColor="#555"
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Text style={styles.sendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 8,
    margin: 20,
    backgroundColor: "#e74c3c",
    borderRadius: 10,
  },
  backText: {
    fontSize: 16,
    color: "#fff",
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f9f9f9",
    marginVertical: 5,
    borderRadius: 10,
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  chatContainer: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  messageBubble: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 20,
    maxWidth: "75%",
  },
  userMessage: {
    backgroundColor: "#4CAF50",
    alignSelf: "flex-end",
  },
  portMessage: {
    backgroundColor: "#3498db",
    alignSelf: "flex-start",
  },
});
