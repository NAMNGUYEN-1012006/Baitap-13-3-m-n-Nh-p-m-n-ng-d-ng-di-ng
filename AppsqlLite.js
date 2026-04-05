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
import db from "./db";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return Alert.alert("Error", "Điền đầy đủ thông tin");
    }

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM accounts WHERE email = ?",
        [email.trim().toLowerCase()],
        (_, result) => {
          if (result.rows.length > 0) {
            Alert.alert("Error", "Email đã được sử dụng");
          } else {
            tx.executeSql(
              "INSERT INTO accounts (name, email, password, avatarUrl) VALUES (?, ?, ?, ?)",
              [name.trim(), email.trim().toLowerCase(), password, ""],
              () => {
                Alert.alert("Thành công", "Đăng ký thành công", [
                  {
                    text: "OK",
                    onPress: () => navigation.navigate("Login"),
                  },
                ]);
              },
              (_, error) => {
                console.log("Insert account error:", error);
                Alert.alert("Lỗi", "Không thể đăng ký");
              }
            );
          }
        },
        (_, error) => {
          console.log("Check email error:", error);
          Alert.alert("Lỗi", "Không thể kiểm tra email");
        }
      );
    });
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

function LoginScreen({ navigation, setCurrentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM accounts WHERE email = ? AND password = ?",
        [email.trim().toLowerCase(), password],
        (_, result) => {
          if (result.rows.length > 0) {
            const account = result.rows.item(0);
            setCurrentUser(account);
            navigation.replace("Profilescreen", { account });
          } else {
            Alert.alert("Error", "Email hoặc password sai");
          }
        },
        (_, error) => {
          console.log("Login error:", error);
          Alert.alert("Lỗi", "Không thể đăng nhập");
        }
      );
    });
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

  const loadUser = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM accounts WHERE email = ?",
        [account.email],
        (_, result) => {
          if (result.rows.length > 0) {
            const latestUser = result.rows.item(0);
            setUser(latestUser);
            setAvatarUrl(latestUser.avatarUrl || "");
          }
        },
        (_, error) => {
          console.log("loadUser error:", error);
        }
      );
    });
  };

  const loadPosts = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM posts WHERE email = ? ORDER BY id DESC",
        [account.email],
        (_, result) => {
          const tempPosts = [];
          for (let i = 0; i < result.rows.length; i++) {
            tempPosts.push(result.rows.item(i).content);
          }
          setPosts(tempPosts);
        },
        (_, error) => {
          console.log("loadPosts error:", error);
        }
      );
    });
  };

  const saveAvatar = () => {
    if (!avatarUrl.trim()) {
      return Alert.alert("Thông báo", "Nhập URL avatar");
    }

    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE accounts SET avatarUrl = ? WHERE email = ?",
        [avatarUrl.trim(), account.email],
        () => {
          Alert.alert("Thành công", "Lưu avatar thành công");
          loadUser();
        },
        (_, error) => {
          console.log("saveAvatar error:", error);
          Alert.alert("Lỗi", "Không thể lưu avatar");
        }
      );
    });
  };

  const addPost = () => {
    if (!text.trim()) return;
    if (!user) return Alert.alert("Lỗi", "Không tìm thấy tài khoản");

    if (posts.length >= 5) {
      return Alert.alert("Hạn chế", "Mỗi tài khoản tối đa 5 bài");
    }

    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO posts (email, content) VALUES (?, ?)",
        [account.email, text.trim()],
        () => {
          setText("");
          loadPosts();
        },
        (_, error) => {
          console.log("addPost error:", error);
          Alert.alert("Lỗi", "Không thể thêm bài viết");
        }
      );
    });
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

function SettingScreen({ navigation, setCurrentUser }) {
  const logout = () => {
    setCurrentUser(null);
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

function Profilescreen({ route, navigation, setCurrentUser }) {
  const account = route?.params?.account;

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
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
    createTables();
  }, []);

  const createTables = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            avatarUrl TEXT
          );
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            content TEXT
          );
        `);
      },
      (error) => {
        console.log("createTables error:", error);
        setLoading(false);
      },
      () => {
        checkLogin();
      }
    );
  };

  const checkLogin = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM accounts LIMIT 1",
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            const account = result.rows.item(0);
            setInitialRoute("Profilescreen");
            setInitialAccount(account);
          } else {
            setInitialRoute("Login");
          }
          setLoading(false);
        },
        (_, error) => {
          console.log("checkLogin error:", error);
          setInitialRoute("Login");
          setLoading(false);
        }
      );
    });
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