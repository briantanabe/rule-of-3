import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "../helpers/config";
import bundledDecks from "../../assets/decks/decks";

const STORAGE_KEY_deck_version = "_deck_version";
const STORAGE_KEY_deck_content = "_deck_content";
const STORAGE_KEY_deck_manifest = "deck_manifest";

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

const downloadDeck = async (id, location) => {
  const downloadResumable = FileSystem.createDownloadResumable(
    location,
    FileSystem.cacheDirectory + id,
    {}
  );

  try {
    const { uri } = await downloadResumable.downloadAsync();
    const rawFile = await FileSystem.readAsStringAsync(uri);
    const json = JSON.parse(rawFile);
    return json;
    // let fileArray = rawFile.split("\n");
    // // const version = fileArray.shift();
    // let deckObj = [];
    // fileArray.forEach((line) => {
    //   // const words = line.split(", ");
    //   // const tmp = {};
    //   // tmp["n"] = words[0];
    //   // tmp["r"] = words[1];
    //   deckObj.push(line);
    // });
    // await storeData(STORAGE_KEY_deck_version, v);
    // const test = await readData(STORAGE_KEY_deck_version);
    // await storeData(STORAGE_KEY_deck_content, JSON.stringify(deckObj));
  } catch (e) {
    console.error(e);
  }
};

const getDeckManifest = async () => {
  const manifest = await readData(STORAGE_KEY_deck_manifest);
  if (manifest == null) {
    await storeData(STORAGE_KEY_deck_manifest, JSON.stringify([]));
    return [];
  } else {
    return JSON.parse(manifest);
  }
};

const updateManifest = async (manifest, id, version, contents) => {
  var newManifest = [...manifest];
  console.log("Checking if", id, "exists in the manifest");
  for (var i = 0; i < newManifest.length; i++) {
    if (newManifest[i].id == id) {
      console.log("Found");
      console.log("Setting new version to", version);
      newManifest[i].version = version;
      newManifest[i].contents = contents;
      await storeData(STORAGE_KEY_deck_manifest, JSON.stringify(newManifest));
      return newManifest;
    }
  }
  console.log(id, "not found in manifest");
  newManifest.push({
    id: id,
    version: version,
    contents: contents,
  });
  console.log("Added new item", newManifest[newManifest.length - 1].id);
  await storeData(STORAGE_KEY_deck_manifest, JSON.stringify(newManifest));
  return newManifest;
};

const getVersionFromManifest = (manifest, id) => {
  for (var i = 0; i < manifest.length; i++) {
    if (manifest[i].id == id) {
      return manifest[i].version;
    }
  }
  return -1;
};

const installBundledDecks = async (m) => {
  var manifest = [...m];
  const d = Object.keys(bundledDecks);
  for (var i = 0; i < d.length; i++) {
    let version = getVersionFromManifest(m, d[i]);
    // console.log("Found version", version, "for", d[i]);
    // console.log("Bundled version:", bundledDecks[d[i]].version);
    if (version == null || version < bundledDecks[d[i]].version) {
      console.log("--------");
      console.log("Need to import " + d[i]);
      manifest = await updateManifest(
        manifest,
        d[i],
        bundledDecks[d[i]].version,
        bundledDecks[d[i]]
      );
    } else {
      // console.log("No need to import " + d[i]);
    }
  }
  return manifest;
};

const uploadAsFile = async (uri, location, metadata, progressCallback) => {
  // console.log("uploadAsFile", uri);
  const response = await fetch(uri);
  const blob = await response.blob();

  const ref = firebase.storage().ref().child(location);

  await ref.put(blob, metadata);
  let URL;
  await ref.getDownloadURL().then((url) => {
    URL = url;
  });
  return URL;
};

const test = async () => {
  let fileUri = FileSystem.documentDirectory + "text.json";
  const obj = { name: "John", age: 30, city: "New York" };
  const myJSON = JSON.stringify(obj);

  const response = await fetch(FileSystem.documentDirectory + "text.json");
  const blob = await response.blob();

  // let f = funcion();
  let location = "decks/" + new Date().getTime() + "-test.json";
  var metadata = {
    contentType: "text/json",
  };
  const downloadURL = await uploadAsFile(
    FileSystem.documentDirectory + "text.json",
    location,
    metadata,
    (p) => {
      console.log(p);
    }
  );

  const data = {
    name: "Deck Title",
    location: downloadURL,
    version: 69,
  };

  // Add a new document in collection "cities" with ID 'LA'
  const res = await firebase
    .firestore()
    .collection("decks")
    .doc("test1")
    .set(data);
  // console.log("Done");

  // await FileSystem.writeAsStringAsync(fileUri, myJSON, {
  //   encoding: FileSystem.EncodingType.UTF8,
  // });
  // console.log(2);
  // // const storageRef = firebase.storage().ref();
  // var metadata = {
  //   contentType: "text/json",
  // };

  // let name = new Date().getTime() + "-test.json";
  // const ref = firebase
  //   .storage()
  //   .ref()
  //   .child("assets/" + name);

  // console.log(3);
  // const task = ref.put(blob, metadata);
  // console.log(4);
  // const ref = storageRef.child('decks/' + "test.json");
  // console.log(Object.keys(ref));
  // await reference.putFile(fileUri);
  // console.log("done");
  // const test = await FileSystem.readAsStringAsync(fileUri, {
  //   encoding: FileSystem.EncodingType.UTF8,
  // });
  // console.log(JSON.parse(test));
};

const updateDeckInfo = async () => {
  const testRef = firebase.firestore().collection("decks");
  let results = [];
  const querySnapshot = await testRef.get();
  querySnapshot.forEach((d) => {
    results.push({
      title: d.data().title,
      location: d.data().location,
      version: d.data().version,
      id: d.data().id,
    });
  });
  return results;
};

const updateDecks = async () => {
  // await AsyncStorage.removeItem(STORAGE_KEY_deck_manifest);
  try {
    var deckManifest = await getDeckManifest();
    deckManifest = await installBundledDecks(deckManifest);
    const deckInfo = await updateDeckInfo();
    if (deckInfo.length == 0) {
      console.log("Failed to get update data");
    } else {
      console.log("-----");
      console.log("Got update data, comparing to existing decks");
      for (let j = 0; j < deckInfo.length; j++) {
        let updateNeeded = true;
        for (let i = 0; i < deckManifest.length; i++) {
          if (deckInfo[j].id == deckManifest[i].id) {
            if (deckInfo[j].version <= deckManifest[i].version) {
              // console.log(
              //   deckInfo[j].title,
              //   "doesn't need an update – online:",
              //   deckInfo[j].version,
              //   "local:",
              //   deckManifest[i].version
              // );
              updateNeeded = false;
            }
            break;
          }
        }
        if (updateNeeded) {
          console.log("-----");
          console.log("Online update found for", deckInfo[j].title);
          console.log(Object.keys(deckInfo[j]));
          // GET JSON STRING from item.location
          let deckContents;
          try {
            deckContents = await downloadDeck(
              deckInfo[j].id,
              deckInfo[j].location
            );
          } catch (e) {
            console.log(e);
          }
          console.log("Downloaded contents");
          try {
            deckManifest = await updateManifest(
              deckManifest,
              deckInfo[j].id,
              deckInfo[j].version,
              deckContents
            );
          } catch (e) {
            console.log(e);
          }
          console.log(
            "Updated manifest, new version for",
            deckInfo[j].title,
            deckInfo[j].version
          );
          // deckManifest = await downloadDeck(item, deckManifest);
        }
      }
      // const deckVersion = await readData(STORAGE_KEY_deck_version);
      // if (deckVersion == null) {
      //   console.log("Downloading deck for first time");
      // } else {
      //   if (deckInfo.version > deckVersion) {
      //     console.log("Updating deck");
      //     await downloadDeck(deckInfo, deckInfo.version);
      //   }
      // }
    }
    // console.log(Object.keys(deckManifest[0]));
    console.log("Done");
    console.log(typeof deckManifest[0].contents);
    return deckManifest;
  } catch (e) {
    console.warn(e);
  }
};

// const getDecks = async () => {
//   // const f = await readData(STORAGE_KEY_deck_content);
//   // return JSON.parse(f);
//   return [
//     {
//       title: "Animals",
//       icon: "map",
//       color: "pink",
//       contents: [
//         "animal card1",
//         "animal card2",
//         "animal card3",
//         "animal card4",
//       ],
//     },
//     {
//       title: "Oceans",
//       icon: "water",
//       color: "blue",
//       contents: ["ocean card1", "ocean card2", "ocean card3", "ocean card4"],
//     },
//     {
//       title: "Books",
//       icon: "book",
//       color: "tan",
//       contents: ["book card1", "book card2", "book card3", "book card4"],
//     },
//     {
//       title: "Food",
//       icon: "map",
//       color: "brown",
//       contents: ["food card1", "food card2", "food card3", "food card4"],
//     },
//     {
//       title: "World",
//       icon: "map",
//       color: "green",
//       contents: ["world card1", "world card2", "world card3", "world card4"],
//     },
//     {
//       title: "Math",
//       icon: "map",
//       color: "red",
//       contents: ["math card1", "math card2", "math card3", "math card4"],
//     },
//   ];
// };

export { updateDecks, test };
