import { AuthService } from '../services/auth-service';

type errorObject = {
  id: string;
  message: string;
};

const authService = AuthService.getInstance();

const btnLogin: any = document.querySelector('#btnLogin');
const email: HTMLInputElement | null = document.querySelector('#inputEmail');
const password: HTMLInputElement | null = document.querySelector('#inputPassword');
const errorsLog: errorObject[] = [];

const validateForm = () => {
  if (email?.value === '') {
    const error = { id: String(email?.id) + 'Error', message: '* Este campo es requerido.' };
    const verified = !errorsLog.some((er) => er.message === error.message && er.id === error.id);
    if (verified) errorsLog.push(error);
  }
  if (!email?.value.includes('@')) {
    const error = { id: String(email?.id) + 'Error', message: '* Debe ingresar una direccion de correo electronico.' };
    const verified = !errorsLog.some((er) => er.message === error.message && er.id === error.id);
    if (verified) errorsLog.push(error);
  }
  if (password?.value === '') {
    const error = { id: String(password?.id) + 'Error', message: '* Este campo es requerido.' };
    const verified = !errorsLog.some((er) => er.message === error.message && er.id === error.id);
    if (verified) errorsLog.push(error);
  }
};

const cleanInputs = () => {
  let inputs = document.querySelectorAll('.auth__input');
  errorsLog.length = 0;
  inputs.forEach((element: any) => {
    element.value = '';
  });
};

btnLogin.onclick = () => {
  validateForm();
  if (errorsLog.length == 0) {
    authService.singIn(email?.value || '', password?.value || '');
    if (authService.getCurrentUser() !== null) {
      console.log(authService.getCurrentUser());
      cleanInputs();
      sessionStorage.setItem('user', authService.getCurrentUser().uid)
      window.location.href = './profile.html';
    }
  } else {
    errorsLog.forEach((error) => {
      const element: any = document.getElementById(error.id);
      element.innerHTML = ` `;
    });
    errorsLog.forEach((error) => {
      const element: any = document.getElementById(error.id);
      element.innerHTML += `
        <p>${error.message}</p>
      `;
    });
  }
};
