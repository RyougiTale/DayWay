import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8bbd0', // Different background for visual distinction
  },
  text: {
    fontSize: 20,
  },
});

export default SettingsScreen;