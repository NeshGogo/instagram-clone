import { User } from '../models/user';
import { UserService } from './user-service';
const Swal = require('sweetalert');

export class AuthService {
  private static instance: AuthService = new AuthService();
  private auth: any;
  private currentUser: any;
  private userService: UserService;

  private constructor() {
    this.userService = UserService.getInstance();
  }

  static getInstance(): AuthService {
    return this.instance;
  }

  getCurrentUser() {
    this.currentUser = this.auth.currentUser;
    return this.currentUser;
  }

  async addUser(user: User, password: string) {
    try {
      debugger;
      await this.auth.createUserWithEmailAndPassword(user.email, password);
      this.userService.addOrUpdateUser(user, this.getCurrentUser().uid);
      Swal('Registrado!', 'El usuario fue registrado exitosamente!!', 'success');
    } catch (error) {
      error.code === 'auth/email-already-in-use'
        ? Swal('Oops', 'Este correo electronico esta en uso.', 'error')
        : Swal('Lo sentimos ☹', 'Ocurrion un error al momento de registro. Vuelve a intentarlo.', 'error');
    }
  }

  singIn(email: string, password: string): void {
    this.auth
      .signInWithEmailAndPassword(email, password)
      .catch((error: any) => {
        Swal('Oops!', 'El usuario o la contraseña son incorrectos.', 'error');
      });
  }

  singOut(): void {
    this.auth
      .signOut()
      .the(() => console.log('sesion cerrada.'))
      .catch(() => console.log('error ocurrio al serrar la session.'));
  }
}