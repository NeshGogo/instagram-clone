import { environment } from "../env/environment.js";

firebase.initializeApp(environment.firebaseConfig);

const firestore = firebase.firestore?  firebase.firestore() :  undefined;
const auth = firebase.auth() || undefined;
const storage =  firebase.storage? firebase.storage() :  undefined
const fieldValue = firebase.firestore? firebase.firestore.FieldValue : undefined;
export default firebase;

export {
  firestore,
  auth,
  storage,
  fieldValue,
} ;