import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';
// import { getStorage } from "firebase/storage";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_L_5RPGeOlSoRDVzS3i5-Fr9y1hQ5Ym8",
  authDomain: "rule-of-3-6e753.firebaseapp.com",
  projectId: "rule-of-3-6e753",
  storageBucket: "rule-of-3-6e753.appspot.com",
  messagingSenderId: "134193141027",
  appId: "1:134193141027:web:cdfae22e8fe539992fa896",
  measurementId: "G-M7QFV590PG",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  // const storage = getStorage(app);
}

export default firebase;
