import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function FeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Feed Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f7fa', // Different background for visual distinction
  },
  text: {
    fontSize: 20,
  },
});

export default FeedScreen;