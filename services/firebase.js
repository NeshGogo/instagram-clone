
const firebaseConfig = {
  apiKey: "AIzaSyCCZ-iww8Jso70jWRHVWQ2smIkK667Qvck",
  authDomain: "instagram-clone-98d1e.firebaseapp.com",
  databaseURL: "https://instagram-clone-98d1e.firebaseio.com",
  projectId: "instagram-clone-98d1e",
  storageBucket: "gs://instagram-clone-98d1e.appspot.com",
  messagingSenderId: "596748224340",
  appId: "1:596748224340:web:6cf3cbbdb9423e95efaac1"
};

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore?  firebase.firestore() :  undefined;
const auth = firebase.auth() || undefined;
const storage =  firebase.storage? firebase.storage() :  undefined

export default firebase;

export {
  firestore,
  auth,
  storage
} ;