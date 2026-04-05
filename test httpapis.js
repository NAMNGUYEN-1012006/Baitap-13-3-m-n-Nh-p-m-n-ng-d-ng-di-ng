import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

export default function App() {
  const BASE_URL = 'http://blackntt.net:88/api/v1';

  const [result, setResult] = useState('');
  const [employeeId, setEmployeeId] = useState('1');

  const [name, setName] = useState('hello');
  const [age, setAge] = useState('22');
  const [salary, setSalary] = useState('99');
  const [profileImage, setProfileImage] = useState(
    'https://reactnative.dev/img/header_logo.svg'
  );

  const showResult = data => {
    setResult(JSON.stringify(data, null, 2));
  };

  const getAllEmployees = async () => {
    try {
      const response = await fetch(`${BASE_URL}/employees`);
      const data = await response.json();
      showResult(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không lấy được danh sách nhân viên');
    }
  };

  const getEmployeeById = async () => {
    try {
      const response = await fetch(`${BASE_URL}/employee/${employeeId}`);
      const data = await response.json();
      showResult(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không lấy được nhân viên theo id');
    }
  };

  const createEmployee = async () => {
    try {
      const bodyData = {
        employee_name: name,
        employee_age: Number(age),
        employee_salary: Number(salary),
        profile_image: profileImage,
      };

      const response = await fetch(`${BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      showResult(data);
      Alert.alert('Thành công', 'Đã tạo nhân viên');
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không tạo được nhân viên');
    }
  };

  const updateEmployee = async () => {
    try {
      const bodyData = {
        employee_name: name,
        employee_age: Number(age),
        employee_salary: Number(salary),
        profile_image: profileImage,
      };

      const response = await fetch(`${BASE_URL}/update/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      showResult(data);
      Alert.alert('Thành công', `Đã cập nhật nhân viên id = ${employeeId}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không cập nhật được nhân viên');
    }
  };

  const deleteEmployee = async () => {
    try {
      const response = await fetch(`${BASE_URL}/delete/${employeeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      showResult(data);
      Alert.alert('Thành công', `Đã xoá nhân viên id = ${employeeId}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không xoá được nhân viên');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Demo React Native API CRUD</Text>

        <Text style={styles.label}>Employee ID</Text>
        <TextInput
          style={styles.input}
          value={employeeId}
          onChangeText={setEmployeeId}
          keyboardType="numeric"
          placeholder="Nhập id nhân viên"
        />

        <Text style={styles.label}>Employee Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên"
        />

        <Text style={styles.label}>Employee Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          placeholder="Nhập tuổi"
        />

        <Text style={styles.label}>Employee Salary</Text>
        <TextInput
          style={styles.input}
          value={salary}
          onChangeText={setSalary}
          keyboardType="numeric"
          placeholder="Nhập lương"
        />

        <Text style={styles.label}>Profile Image</Text>
        <TextInput
          style={styles.input}
          value={profileImage}
          onChangeText={setProfileImage}
          placeholder="Nhập link ảnh"
        />

        <View style={styles.buttonBox}>
          <Button title="GET All Employees" onPress={getAllEmployees} />
        </View>

        <View style={styles.buttonBox}>
          <Button title="GET Employee By ID" onPress={getEmployeeById} />
        </View>

        <View style={styles.buttonBox}>
          <Button title="POST Create Employee" onPress={createEmployee} />
        </View>

        <View style={styles.buttonBox}>
          <Button title="PUT Update Employee" onPress={updateEmployee} />
        </View>

        <View style={styles.buttonBox}>
          <Button title="DELETE Employee" onPress={deleteEmployee} />
        </View>

        <Text style={styles.resultTitle}>Kết quả trả về:</Text>
        <ScrollView style={styles.resultBox}>
          <Text style={styles.resultText}>{result}</Text>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    marginTop: 10,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  buttonBox: {
    marginTop: 12,
  },
  resultTitle: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    minHeight: 220,
    padding: 10,
  },
  resultText: {
    fontSize: 14,
  },
});     