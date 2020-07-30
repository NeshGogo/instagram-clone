import { environment } from "../env/environment";

const Firebase = require('firebase/app');
Firebase.initializeApp(environment.firebaseConfig);

export class FirebaseService {
  static getFirebase(){
    return Firebase;
  }
}