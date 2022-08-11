import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={{flex: 1,justifyContent: 'center'}}>
      <Text>unguuuddduu</Text>
      <StatusBar style="auto" />
      </View>
      <View style={styles.bottomModal}>
        <Text style={styles.bottomModalText}>Solo</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomModalText: {
    fontSize: 25,
    marginLeft: '5%',
    fontWeight: "bold"
  },
  bottomModal: {
    backgroundColor: "white",
    width: '95%',
    height: '10%',
    marginBottom: '3%',
    borderRadius: 10,
    shadowColor: "black",
    shadowOpacity: .5,
    shadowRadius: 40,
    shadowOffset: {
      height: 20
    },
    alignItems: "flex-start",
    justifyContent: "center"
  }
});
