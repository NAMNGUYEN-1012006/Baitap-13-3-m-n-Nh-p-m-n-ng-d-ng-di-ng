import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { accounts } from './store';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login= ()=>{
    const account =accounts.find(a=>a.email==email && a.password==password) ;
    if(!account) Alert.alert('Lỗi',"tài khoản không đúng") ;
    navigation.navigate("Profilescreen",{account}) ;

  }
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <Text style={styles.label}>Email/Username</Text>
        <TextInput
          style={styles.input}
          placeholder="test@mail.com"
          value={email}
          onChangeText={setEmail} // capture input
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="● ● ●"
          secureTextEntry
          value={password}
          onChangeText={setPassword} // capture input
        />

        <Text
          style={{ color: "blue", marginTop: 10 }}
          onPress={() => navigation.navigate("Registerscreen")}
        >
          Sign Up
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => login() }
        >
          <Text>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#eee" },
  card: { width: 280, padding: 20, borderWidth: 2, borderColor: "black", backgroundColor: "#fff" },
  title: { fontSize: 28, textAlign: "center", marginBottom: 20 },
  label: { marginTop: 10 },
  input: { borderWidth: 1, borderColor: "black", padding: 8, marginTop: 5 },
  button: { borderWidth: 1, borderColor: "black", padding: 10, alignItems: "center", marginTop: 20 },
});