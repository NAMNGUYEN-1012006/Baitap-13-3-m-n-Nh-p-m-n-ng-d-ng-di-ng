import React, { useState } from "react";
 import { createBottomTabNavigator } from "@react-navigation/bottomtabs";
  import { NavigationContainer } from "@react-navigation/native";
import { View, Text, TextInput, Image, FlatList, Alert, StyleSheet, TouchableOpacity } from "react-native";
 const Tab = createBottomTabNavigator();
function HomeScreen({ navigation, route }){
  const account = route?.params?.account;

  const name = account?.name || '';
  const email = account?.email || '';

  const [avatarUrl, setUrl] = useState('');
  const [text, setText] = useState('');
  const [posts, setPosts] = useState(account?.posts || []);

  const addPost = async () => {
    if (!text.trim()) return;
    if (posts.length >= 5) return Alert.alert('Hạn chế', 'Mỗi tk được tối đa 5 bài');

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
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.title}><Text>{name}</Text></View>
        <Image
          source={{ uri: avatarUrl || "https://shopgarena.net/wp-content/uploads/2023/06/Link-Logo-Blox-Fruit-Luffy.jpg" }}
          style={styles.avatar}
        />

        <Text style={styles.label}>Name</Text>
        <Text style={styles.input}>{name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.input}>{email}</Text>

        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} placeholder="xxxxxxxx" />

        <Text style={styles.label}>Avatar URL</Text>
        <TextInput style={styles.input} onChangeText={setUrl} />

        <TextInput
          style={styles.input}
          placeholder="Write ..."
          value={text}
          onChangeText={setText}
        />

        <TouchableOpacity style={styles.button} onPress={addPost}>
          <Text>Save</Text>
        </TouchableOpacity>

        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={<Text style={styles.empty}>Chưa có bài viết nào</Text>}
        />

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Loginscreen")}>
          <Text>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
function SettingScreen(){
  return(
     <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Loginscreen")}>
          <Text>Log Out</Text>
        </TouchableOpacity>
   
  ) ;
}
export default function Profilescreen({ navigation, route }) {
  <NavigationContainer>
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Setting" component={SettingScreen} />
    </Tab.Navigator>
  </NavigationContainer>
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#eee" },
  card: { width: 280, padding: 20, borderWidth: 2, borderColor: "black", backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: "center", marginBottom: 10 },
  label: { marginTop: 10 },
  input: { borderWidth: 1, borderColor: "black", padding: 8, marginTop: 5 },
  button: { borderWidth: 1, borderColor: "black", padding: 10, alignItems: "center", marginTop: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#ccc", alignSelf: "center", marginBottom: 15 },
  postItem: { backgroundColor: '#f1f1f1', padding: 10, marginVertical: 5, borderRadius: 5 },
  empty: { textAlign: 'center', marginTop: 10, fontStyle: 'italic' }
});
