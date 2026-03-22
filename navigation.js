import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Loginscreen from "./login";
import Profilescreen from "./profile";
import Registerscreen from './register';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Loginscreen" component={Loginscreen} />
        <Stack.Screen name="Profilescreen" component={Profilescreen} />
        <Stack.Screen name="Registerscreen" component={Registerscreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;