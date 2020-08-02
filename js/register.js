import { User } from '../models/user.js';
import { auth, firestore } from '../services/firebase.js';

//consts
const USERS = 'users';
const errorsLog = [];

//HtmlElements
const btnRegister = document.getElementById('btnRegister');
const email = document.querySelector('#inputEmail');
const fullName = document.querySelector('#inputFullName');
const userName = document.querySelector('#inputUserName');
const password = document.querySelector('#inputPassword');


btnRegister.onclick = () => {
  validateForm();
  if (errorsLog.length === 0) {
    const user = new User(email?.value, userName?.value, fullName?.value);
    addUser(user);
  } else {
    showErrors();
  }
};

const validateForm = () => {
  validateEmail();
  validateFullName();
  validateUserName();
  validatePassword();
};

const validateEmail = () => {
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
}

const validateFullName = () => {
  if (fullName?.value === '') {
    const error = { id: String(fullName?.id) + 'Error', message: '* Este campo es requerido.' };
    const verified = !errorsLog.some((er) => er.message === error.message && er.id === error.id);
    if (verified) errorsLog.push(error);
  }
}

const validateUserName = () => {
  if (userName?.value === '') {
    const error = { id: String(userName?.id) + 'Error', message: '* Este campo es requerido.' };
    const verified = !errorsLog.some((er) => er.message === error.message && er.id === error.id);
    if (verified) errorsLog.push(error);
  }
}

const validatePassword = () => {
  if (password?.value === '') {
    const error = {
      id: String(password?.id) + 'Error',
      message: '* Este campo es requerido',
    };
    const verified = !errorsLog.some((er) => er.message === error.message && er.id === error.id);
    if (verified) errorsLog.push(error);
  }
  if (password?.value.length < 6) {
    const error = {
      id: String(password?.id) + 'Error',
      message: '* La contraseña debe tener una longitud minima de 6 caracteres.',
    };
    const verified = !errorsLog.some((er) => er.message === error.message && er.id === error.id);
    if (verified) errorsLog.push(error);
  }
}



const showErrors = () => {
  errorsLog.forEach((error) => {
    const element = document.getElementById(error.id);
    element.innerHTML = ` `;
  });
  errorsLog.forEach((error) => {
    const element = document.getElementById(error.id);
    element.innerHTML += `
      <p>${error.message}</p>
    `;
  });
  errorsLog.length = 0;
}

const addUser = async (user) => {
    try {
      const account = await auth.createUserWithEmailAndPassword(user.email, password.value);
      await firestore.collection(USERS).doc(account.user.uid).set({...user});
      let clicked = await swal('Registrado!', 'El usuario fue registrado exitosamente!!', 'success');
      if (clicked)
        window.location.href = './profile.html'
    } catch (error) {
      console.log(error);
      error.code === 'auth/email-already-in-use'
        ? swal('Oops', 'Este correo electronico esta en uso.', 'error')
        : swal('Lo sentimos ☹', 'Ocurrion un error al momento de registro. Vuelve a intentarlo.', 'error');
    }
}
