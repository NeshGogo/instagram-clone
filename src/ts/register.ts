import { AuthService } from '../services/auth-service';
import { User } from '../models/user';

type errorObject = {
  id: string;
  message: string;
};

const authService = AuthService.getInstance();

const btnRegister: any = document.getElementById('btnRegister');
const email: HTMLInputElement | null = document.querySelector('#inputEmail');
const fullName: HTMLInputElement | null = document.querySelector('#inputFullName');
const userName: HTMLInputElement | null = document.querySelector('#inputUserName');
const password: HTMLInputElement | null = document.querySelector('#inputPassword');
const errorsLog: errorObject[] = [];

const validateForm = () => {

  if (email?.value === '') {
    const error = { id: String(email?.id) + 'Error', message: '* Este campo es requerido.' };
    const verified = !errorsLog.some( er => er.message === error.message && er.id === error.id);
    if(verified)
      errorsLog.push(error);
  }
  if ( !email?.value.includes('@')) {
    const error = { id: String(email?.id) + 'Error', message: '* Debe ingresar una direccion de correo electronico.' };
    const verified = !errorsLog.some( er => er.message === error.message && er.id === error.id);
    if(verified)
      errorsLog.push(error);
  }
  if (fullName?.value === '') {
    const error = { id: String(fullName?.id) + 'Error', message: '* Este campo es requerido.' }
    const verified = !errorsLog.some( er => er.message === error.message && er.id === error.id);
    if(verified)
      errorsLog.push(error);
  }
  if (userName?.value === '') {
    const error = { id: String(userName?.id) + 'Error', message: '* Este campo es requerido.' };
    const verified = !errorsLog.some( er => er.message === error.message && er.id === error.id);
    if(verified)
      errorsLog.push(error);
  }
  if (password?.value === '') {
    const error = { id: String(password?.id) + 'Error', message: '* Este campo es requerido.' };
    const verified = !errorsLog.some( er => er.message === error.message && er.id === error.id);
    if(verified)
      errorsLog.push(error);
  }
};

const cleanInputs = () => {
  let inputs = document.querySelectorAll('.auth__input');
  errorsLog.length = 0;
  inputs.forEach((element: any) => {
    element.value = '';
  });
}

btnRegister.onclick = () => {
  validateForm();
  if(errorsLog.length == 0){
    const user: User = {
      email: email?.value || '',
      userName: userName?.value || '',
      fullName: fullName?.value || '',
    };
    authService.addUser(user, password?.value || '');
    cleanInputs();
  }else{
    errorsLog.forEach(error =>{
      const element: any = document.getElementById(error.id);
      element.innerHTML = ` `;
    });
    errorsLog.forEach(error =>{
      const element: any = document.getElementById(error.id);
      element.innerHTML += `
        <p>${error.message}</p>
      `;
    });
  }
};
