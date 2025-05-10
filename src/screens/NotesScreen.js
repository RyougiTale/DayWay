import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function NotesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notes Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3e5f5', // Different background
  },
  text: {
    fontSize: 20,
  },
});

export default NotesScreen;