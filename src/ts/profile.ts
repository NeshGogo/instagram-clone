import { UserService } from "../services/user-service"
import { AuthService } from "../services/auth-service";

//services
const authService: AuthService = AuthService.getInstance();
const userService: UserService = UserService.getInstance();

//htmlElements
const userName: HTMLElement = document.querySelector('#userName');
const btnEdit: HTMLElement = document.querySelector('#btnEdit');
const userFullname: HTMLElement = document.querySelector('#userFullname');
const postCount: HTMLElement = document.querySelector('#postCount');
const userBiography: HTMLElement = document.querySelector('#userBiography');

const init = async () => {
  let user = await userService.getUserById(sessionStorage.getItem('user')||'');
  userName.innerText = user.userName;
  userFullname.innerText = user.fullName;
  postCount.innerText = '0';
  userBiography.innerText = user.biography || '';
}

init();