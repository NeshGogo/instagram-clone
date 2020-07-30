import { User } from '../models/user';
import { environment } from '../env/environment';
const Firebase = require('firebase/app');
require('firebase/firestore');

export class UserService {
  private static instance: UserService = new UserService();
  private USERS = 'users';
  private db: any;

  private constructor() {
    Firebase.initializeApp(environment.firebaseConfig);
    this.db = Firebase.firestore();
  }

  static getInstance(): UserService {
    return this.instance;
  }

  async getUserById(id: string): Promise<User> {
    try {
      const docref = await this.db.collection(this.USERS).doc(id).get();
      const user: User = { ...docref.data() };
      return user;
    } catch (error) {
      console.log(error.message);
      return error;
    }
  }

  async addUserOrUpdate(user: User, id:string){
    try {
      await this.db.collection(this.USERS).doc(id).set(user);
    } catch (error) {
      return error;
    }
  }

  async deleteUser(id: string){
    try {
      await  this.db.collection(this.USERS).doc(id).delete();
    } catch (error) {
      return error;
    }
  }
}
