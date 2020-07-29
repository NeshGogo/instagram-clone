import { User } from '../models/user';
import { environment } from '../env/environment';
const Swal = require('sweetalert');
const Firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

export class AuthService {
  private static instance: AuthService = new AuthService();
  private USERS = 'users';
  private currentUser: any;
  private auth: any;
  private db: any;

  private constructor() {
    Firebase.initializeApp(environment.firebaseConfig);
    this.auth = Firebase.auth;
    this.db = Firebase.firestore;
  }

  static getInstance(): AuthService {
    return this.instance;
  }
  getCurrentUser(): any {
    this.currentUser = this.auth().currentUser;
    return this.currentUser;
  }

  async addUser(user: User, password: string) {
    try {
      await this.auth().createUserWithEmailAndPassword(user.email, password);
      await this.db().collection(this.USERS).doc(this.getCurrentUser().uid).set(user);
      Swal('Registrado!', 'El usuario fue registrado exitosamente!!', 'success');
    } catch (error) {
      error.code === 'auth/email-already-in-use'
        ? Swal('Oops', 'Este correo electronico esta en uso.', 'error')
        : Swal('Lo sentimos ☹', 'Ocurrion un error al momento de registro. Vuelve a intentarlo.', 'error');
    }
  }

  singIn(email: string, password: string): boolean {
    this.auth()
      .signInWithEmailAndPassword(email, password)
      .catch((error: any) => {
        Swal('Oops!', 'El usuario o la contraseña son incorrectos.', 'error');
      });
    return true;
  }

  singOut(): void {
    this.auth()
      .signOut()
      .the(() => console.log('sesion cerrada.'))
      .catch(() => console.log('error ocurrio al serrar la session.'));
  }
}
