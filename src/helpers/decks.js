import * as FileSystem from "expo-file-system";

import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "../helpers/config";

const STORAGE_KEY_deck_version = "deck_version";
const STORAGE_KEY_deck_content = "deck_content";

const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.warn(e);
  }
};

const readData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.warn(e);
    return null;
  }
};

const downloadDeck = async (d) => {
  const downloadResumable = FileSystem.createDownloadResumable(
    d.location,
    FileSystem.cacheDirectory + d.title + ".csv",
    {}
  );

  try {
    const { uri } = await downloadResumable.downloadAsync();
    const rawFile = await FileSystem.readAsStringAsync(uri);
    let fileArray = rawFile.split("\n");
    const version = fileArray.shift();
    let deckObj = [];
    fileArray.forEach((line) => {
      const words = line.split(", ");
      const tmp = {};
      tmp["n"] = words[0];
      tmp["r"] = words[1];
      deckObj.push(tmp);
    });
    await storeData(STORAGE_KEY_deck_version, version);
    const test = await readData(STORAGE_KEY_deck_version);
    await storeData(STORAGE_KEY_deck_content, JSON.stringify(deckObj));
  } catch (e) {
    console.error(e);
  }
};

const getDeckInfo = async () => {
  const testRef = firebase.firestore().collection("decks");
  let results = [];
  const querySnapshot = await testRef.get();
  querySnapshot.forEach((d) => {
    results.push({
      title: d.data().title,
      location: d.data().location,
      version: d.data().version,
    });
  });
  return results[0];
};

const updateDecks = async () => {
  try {
    const deckInfo = await getDeckInfo();
    const deckVersion = await readData(STORAGE_KEY_deck_version);
    if (deckVersion == null) {
      await downloadDeck(deckInfo);
    } else {
      if (deckInfo.version > deckVersion) {
        await downloadDeck(deckInfo);
      }
    }
  } catch (e) {
    console.warn(e);
  }
};

const getDecks = async () => {
  const f = await readData(STORAGE_KEY_deck_content);
  return JSON.parse(f);
};

export { updateDecks, getDecks };
