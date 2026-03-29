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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const ACCOUNTS_KEY = "accounts";
const CURRENT_USER_KEY = "currentUser";

async function getAccounts() {
  try {
    const data = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log("getAccounts error:", error);
    return [];
  }
}

async function saveAccounts(accounts) {
  try {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.log("saveAccounts error:", error);
  }
}

async function saveCurrentUser(user) {
  try {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.log("saveCurrentUser error:", error);
  }
}

async function getCurrentUser() {
  try {
    const data = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log("getCurrentUser error:", error);
    return null;
  }
}

async function removeCurrentUser() {
  try {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.log("removeCurrentUser error:", error);
  }
}

function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return Alert.alert("Error", "Điền đầy đủ thông tin");
    }

    try {
      const accounts = await getAccounts();

      const existed = accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (existed) {
        return Alert.alert("Error", "Email đã được sử dụng");
      }

      const newAccount = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        avatarUrl: "",
        posts: [],
      };

      const newAccounts = [...accounts, newAccount];
      await saveAccounts(newAccounts);

      Alert.alert("Thành công", "Đăng ký thành công", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      console.log("register error:", error);
      Alert.alert("Lỗi", "Không thể đăng ký");
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

      <TouchableOpacity style={styles.button} onPress={register}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
        Already have an account? Sign In
      </Text>
    </ScrollView>
  );
}

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const accounts = await getAccounts();

      const account = accounts.find(
        (a) =>
          a.email === email.trim().toLowerCase() && a.password === password
      );

      if (!account) {
        return Alert.alert("Error", "Email hoặc password sai");
      }

      await saveCurrentUser(account);
      navigation.replace("Profilescreen", { account });
    } catch (error) {
      console.log("login error:", error);
      Alert.alert("Lỗi", "Không thể đăng nhập");
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
  const [posts, setPosts] = useState(account?.posts || []);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;

      const accounts = await getAccounts();
      const latestUser = accounts.find((a) => a.email === currentUser.email);

      if (latestUser) {
        setUser(latestUser);
        setAvatarUrl(latestUser.avatarUrl || "");
        setPosts(latestUser.posts || []);
      }
    } catch (error) {
      console.log("loadUser error:", error);
    }
  };

  const updateUserData = async (updatedFields) => {
    try {
      const accounts = await getAccounts();
      const index = accounts.findIndex((a) => a.email === user.email);

      if (index === -1) return null;

      const updatedUser = {
        ...accounts[index],
        ...updatedFields,
      };

      accounts[index] = updatedUser;

      await saveAccounts(accounts);
      await saveCurrentUser(updatedUser);

      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.log("updateUserData error:", error);
      return null;
    }
  };

  const saveAvatar = async () => {
    if (!avatarUrl.trim()) {
      return Alert.alert("Thông báo", "Nhập URL avatar");
    }

    const updated = await updateUserData({
      avatarUrl: avatarUrl.trim(),
    });

    if (updated) {
      Alert.alert("Thành công", "Lưu avatar thành công");
    }
  };

  const addPost = async () => {
    if (!text.trim()) return;
    if (!user) return Alert.alert("Lỗi", "Không tìm thấy tài khoản");

    const currentPosts = user.posts || [];

    if (currentPosts.length >= 5) {
      return Alert.alert("Hạn chế", "Mỗi tài khoản tối đa 5 bài");
    }

    const newPosts = [text.trim(), ...currentPosts];

    const updated = await updateUserData({
      posts: newPosts,
    });

    if (updated) {
      setPosts(updated.posts);
      setText("");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.postItem}>
      <Text>{item}</Text>
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
        <Text style={styles.buttonText}>Save Avatar</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Write post..."
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity style={styles.button} onPress={addPost}>
        <Text style={styles.buttonText}>Add Post</Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
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

function SettingScreen({ navigation }) {
  const logout = async () => {
    await removeCurrentUser();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const Tab = createBottomTabNavigator();

function Profilescreen({ route }) {
  const account = route?.params?.account;

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} account={account} />}
      </Tab.Screen>
      <Tab.Screen name="Setting" component={SettingScreen} />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Login");
  const [initialAccount, setInitialAccount] = useState(null);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const currentUser = await getCurrentUser();

      if (currentUser) {
        setInitialRoute("Profilescreen");
        setInitialAccount(currentUser);
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
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="Profilescreen"
          component={Profilescreen}
          options={{ headerShown: false }}
          initialParams={{ account: initialAccount }}
        />
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
  },
});