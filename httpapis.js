import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  StyleSheet,
} from 'react-native';


const getMoviesFromApi = () => {
  return fetch('https://reactnative.dev/movies.json')
    .then(response => response.json())
    .then(json => {
      return json.movies;
    })
    .catch(error => {
      console.error(error);
    });
};

const App = () => {
  const [isLoading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);

  useEffect(() => {
   
    getMoviesFromApi()
      .then(data => {
        setMovies(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const renderItem = ({item}) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>Năm: {item.releaseYear}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách phim</Text>

      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={item => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;