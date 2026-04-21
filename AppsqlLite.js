import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { initDB, dbQuery, dbExecute, dbGetOne } from "./db";
import { registerUser, loginUser, getPosts, createPost, deletePost, updateAvatar } from "./httpapis";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");

  const register = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return Alert.alert("Error", "Điền đầy đủ thông tin");
    }

    try {
      // Try API first
      await registerUser({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        description: description.trim(),
      });

      Alert.alert("Thành công", "Đăng ký thành công", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (apiError) {
      console.log("API register failed, falling back to SQLite:", apiError);
      // Fallback to SQLite
      try {
        const existing = await dbGetOne(
          "SELECT * FROM accounts WHERE email = ?",
          [email.trim().toLowerCase()]
        );
        
        if (existing) {
          return Alert.alert("Error", "Email đã được sử dụng");
        }

        await dbExecute(
          "INSERT INTO accounts (name, email, password, avatarUrl) VALUES (?, ?, ?, ?)",
          [name.trim(), email.trim().toLowerCase(), password, ""]
        );

        Alert.alert("Thành công", "Đăng ký thành công (SQLite)", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]);
      } catch (dbError) {
        console.log("Register error:", dbError);
        Alert.alert("Lỗi", "Không thể đăng ký: " + (dbError?.message || dbError));
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create Account</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Tell us about yourself"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={register}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
        Already have an account? Sign In
      </Text>
    </ScrollView>
  );
}

function LoginScreen({ navigation, setCurrentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert("Error", "Điền đầy đủ thông tin");
    }

    try {
      const account = await dbGetOne(
        "SELECT * FROM accounts WHERE email = ? AND password = ?",
        [email.trim().toLowerCase(), password]
      );

      if (account) {
        setCurrentUser(account);
        navigation.replace("Profilescreen", { account });
      } else {
        Alert.alert("Error", "Email hoặc password sai");
      }
    } catch (error) {
      console.log("Login error:", error);
      Alert.alert("Lỗi", "Không thể đăng nhập: " + (error?.message || error));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Login</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
        Create new account
      </Text>
    </ScrollView>
  );
}

function HomeScreen({ account }) {
  const [user, setUser] = useState(account || null);
  const [avatarUrl, setAvatarUrl] = useState(account?.avatarUrl || "");
  const [text, setText] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (account?.email) {
      loadUser();
      loadPosts();
    }
  }, [account]);

  const loadUser = async () => {
    try {
      const latestUser = await dbGetOne(
        "SELECT * FROM accounts WHERE email = ?",
        [account.email]
      );

      if (latestUser) {
        setUser(latestUser);
        setAvatarUrl(latestUser.avatarUrl || "");
      }
    } catch (error) {
      console.log("loadUser error:", error);
    }
  };

  const loadPosts = async () => {
    try {
      const result = await dbQuery(
        "SELECT * FROM posts WHERE email = ? ORDER BY id DESC",
        [account.email]
      );

      setPosts(result);
    } catch (error) {
      console.log("loadPosts error:", error);
    }
  };

  const saveAvatar = async () => {
    if (!avatarUrl.trim()) {
      return Alert.alert("Thông báo", "Nhập URL avatar");
    }

    try {
      await dbExecute(
        "UPDATE accounts SET avatarUrl = ? WHERE email = ?",
        [avatarUrl.trim(), account.email]
      );

      Alert.alert("Thành công", "Lưu avatar thành công");
      loadUser();
    } catch (error) {
      console.log("saveAvatar error:", error);
      Alert.alert("Lỗi", "Không thể lưu avatar");
    }
  };

  const addPost = async () => {
    if (!text.trim()) return;
    if (!user) return Alert.alert("Lỗi", "Không tìm thấy tài khoản");

    if (posts.length >= 5) {
      return Alert.alert("Hạn chế", "Mỗi tài khoản tối đa 5 bài");
    }

    try {
      await dbExecute(
        "INSERT INTO posts (email, content) VALUES (?, ?)",
        [account.email, text.trim()]
      );

      setText("");
      loadPosts();
    } catch (error) {
      console.log("addPost error:", error);
      Alert.alert("Lỗi", "Không thể thêm bài viết");
    }
  };

  const deletePost = async (postId) => {
    try {
      await dbExecute("DELETE FROM posts WHERE id = ?", [postId]);
      loadPosts();
    } catch (error) {
      console.log("deletePost error:", error);
      Alert.alert("Lỗi", "Không thể xóa bài viết");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.postItem}>
      <Text style={{ flex: 1 }}>{item.content}</Text>
      <TouchableOpacity
        onPress={() => deletePost(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{
          uri:
            avatarUrl ||
            "https://shopgarena.net/wp-content/uploads/2023/06/Link-Logo-Blox-Fruit-Luffy.jpg",
        }}
        style={styles.avatar}
      />

      <Text style={styles.nameText}>{user?.name || ""}</Text>
      <Text style={styles.emailText}>Email: {user?.email || ""}</Text>

      <TextInput
        style={styles.input}
        placeholder="Avatar URL"
        value={avatarUrl}
        onChangeText={setAvatarUrl}
      />

      <TouchableOpacity style={styles.button} onPress={saveAvatar}>
        <Ionicons name="camera" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Save Avatar</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Write post..."
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity style={styles.button} onPress={addPost}>
        <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Add Post</Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        style={{ width: "100%" }}
        ListEmptyComponent={
          <Text style={{ marginTop: 10, color: "#888" }}>
            Chưa có bài viết nào
          </Text>
        }
      />
    </ScrollView>
  );
}

function SettingScreen({ navigation, setCurrentUser }) {
  const logout = () => {
    setCurrentUser(null);
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name="settings-outline"
        size={64}
        color="#4caf50"
        style={{ marginBottom: 20 }}
      />
      <Text style={[styles.header, { marginBottom: 20 }]}>Settings</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function Profilescreen({ route, navigation, setCurrentUser }) {
  const account = route?.params?.account;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = route.name === "Home" ? "home" : "settings";
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Setting") {
            iconName = focused ? "settings" : "settings-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4caf50",
        tabBarInactiveTintColor: "#888",
      })}
    >
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} account={account} />}
      </Tab.Screen>
      <Tab.Screen name="Setting">
        {(props) => (
          <SettingScreen
            {...props}
            navigation={navigation}
            setCurrentUser={setCurrentUser}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Login");
  const [initialAccount, setInitialAccount] = useState(null);

  useEffect(() => {
    setupDatabase();
  }, []);

  const setupDatabase = async () => {
    try {
      await initDB();
      await checkLogin();
    } catch (error) {
      console.log("Database setup error:", error);
      setLoading(false);
    }
  };

  const checkLogin = async () => {
    try {
      const account = await dbGetOne("SELECT * FROM accounts LIMIT 1", []);

      if (account) {
        setInitialRoute("Profilescreen");
        setInitialAccount(account);
      } else {
        setInitialRoute("Login");
      }
    } catch (error) {
      console.log("checkLogin error:", error);
      setInitialRoute("Login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              setCurrentUser={(user) => setInitialAccount(user)}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Profilescreen"
          options={{ headerShown: false }}
        >
          {(props) => (
            <Profilescreen
              {...props}
              setCurrentUser={(user) => setInitialAccount(user)}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
  },
  emailText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    padding: 14,
    backgroundColor: "#4caf50",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#007bff",
    marginTop: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 15,
  },
  postItem: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 5,
    borderRadius: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
});