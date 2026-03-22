import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, Alert, StyleSheet, ScrollView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
const accounts = [];
function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = () => {
    if(!name || !email || !password) return Alert.alert('Error','Điền đầy đủ thông tin');
    if(accounts.find(a => a.email === email)) return Alert.alert('Error','Email đã được sử dụng');

    accounts.push({ name, email, password, posts: [] });
    Alert.alert('Thành công','Đăng ký thành công', [
      { text: 'OK', onPress: () => navigation.navigate('Login') }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create Account</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} placeholder="Your name" value={name} onChangeText={setName} />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={register}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Already have an account? Sign In</Text>
    </ScrollView>
  );
}


function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = () => {
    const account = accounts.find(a => a.email === email && a.password === password);
    if(!account) return Alert.alert('Error','Email hoặc password sai');

    navigation.navigate('Profilescreen', { account });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Login</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>Create new account</Text>
    </ScrollView>
  );
}

function HomeScreen({ account }) {
  const name = account?.name || '';
  const email = account?.email || '';
  const [avatarUrl, setUrl] = useState('');
  const [text, setText] = useState('');
  const [posts, setPosts] = useState(account?.posts || []);

  const addPost = () => {
    if(!text.trim()) return;
    if(posts.length >=5) return Alert.alert('Hạn chế','Mỗi tài khoản tối đa 5 bài');

    const newPosts = [text, ...posts];
    setPosts(newPosts);
    setText('');
  };

  const renderItem = ({ item }) => (
    <View style={styles.postItem}>
      <Text>{item}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
     

      
      <Image
        source={{ uri: avatarUrl || 'https://shopgarena.net/wp-content/uploads/2023/06/Link-Logo-Blox-Fruit-Luffy.jpg'}}
        style={styles.avatar}
      />
      <Text style={styles.nameText}>{name}</Text>
      <Text style={styles.emailText}>Email: {email}</Text>
      
      <TextInput style={styles.input} placeholder="Avatar URL" onChangeText={setUrl} />
      <TextInput style={styles.input} placeholder="Write post..." value={text} onChangeText={setText} />
      <TouchableOpacity style={styles.button} onPress={addPost}><Text style={styles.buttonText}>Add Post</Text></TouchableOpacity>

     
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item,index)=>index.toString()}
        ListEmptyComponent={<Text style={{marginTop:10, color:'#888'}}>Chưa có bài viết nào</Text>}
      />
    </ScrollView>
  );
}


function SettingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}


const Tab = createBottomTabNavigator();
function Profilescreen({ route }) {
  const account = route?.params?.account;

  return (
    <Tab.Navigator screenOptions={{ headerShown:false }}>
      <Tab.Screen name="Home">{props => <HomeScreen {...props} account={account} />}</Tab.Screen>
      <Tab.Screen name="Setting" component={SettingScreen} />
    </Tab.Navigator>
  );
}


const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Profilescreen" component={Profilescreen} options={{ headerShown:false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container:{ flexGrow:1, alignItems:'center', justifyContent:'center', padding:20, backgroundColor:'#f2f2f2' },
  header:{ fontSize:28, fontWeight:'bold', marginBottom:20, color:'#222' },
  nameText:{ fontSize:24, fontWeight:'bold', color:'#222', marginBottom:20 },
  emailText:{ fontSize:16, color:'#555', marginBottom:30 },
  label:{ fontSize:14, marginBottom:5, color:'#555', alignSelf:'flex-start' },
  input:{ width:'100%', borderWidth:1, borderColor:'#ccc', padding:12, borderRadius:10, marginBottom:15, backgroundColor:'#fff' },
  button:{ width:'100%', padding:14, backgroundColor:'#4caf50', borderRadius:10, alignItems:'center', marginBottom:15 },
  buttonText:{ color:'#fff', fontWeight:'bold', fontSize:16 },
  link:{ color:'#007bff', marginTop:10 },
  avatar:{ width:100, height:100, borderRadius:50, marginVertical:15 },
  postItem:{ backgroundColor:'#fff', padding:12, marginVertical:5, borderRadius:10, width:'100%', borderWidth:1, borderColor:'#ddd' }
});