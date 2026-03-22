import {React, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity,Alert } from "react-native";
import {accounts} from "./store" ;
import { usePreventRemoveContext } from "@react-navigation/native";
export default function RegisterScreen({navigation}) {
    const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("") ;
  const register = () =>{  
  if(!email || !password) return Alert.alert('Error','Điền đầy đủ thông tin') ;
  if (accounts.find(a=> a.email===email)) return Alert.alert('email đã được sử dụng') ;
   accounts.push({email,password,posts: []}) ;
   Alert.alert('Thành công','Đăng kí thành công',
    [{text:'OK',onPress:() => navigation.navigate('Loginscreen')}]
   )

  } ;
  return (
    <View style={styles.container}>
      <View style={styles.card}>

        <Text style={styles.title}>Register</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} 
        placeholder="Name"
        value={name}
        onChangeText={setName}
         />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} 
        placeholder="Email"
        value={email}
        onChangeText={setEmail} />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} 
        placeholder="Password"
        value={password} 
        onChangeText={setPassword}
        secureTextEntry/>
         <Text style={styles.label}>Confirm Password</Text>
        <TextInput style={styles.input} />
        <Text style = {styles.forgot} onPress = {() => navigation.navigate("Loginscreen")}>Back to Login</Text>

        <TouchableOpacity style={styles.button} onPress ={register} >
          <Text>Create</Text>
        </TouchableOpacity>

      </View>
    </View>
  );


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  card: {
    width: 280,
    padding: 20,
    borderWidth: 2,
    borderColor: "black",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "black",
    padding: 8,
    marginTop: 5,
  },
  button: {
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
   width:80,
  height:80,
  borderRadius:40,
  backgroundColor:"#ccc",
  alignSelf:"center",
  marginBottom:15
  }
});