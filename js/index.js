import { auth } from '../services/firebase.js';

const btnLogin = document.querySelector('#btnLogin');
const email = document.querySelector('#inputEmail');
const password = document.querySelector('#inputPassword');
const errorsLog = [];


btnLogin.onclick = () => {
  validateForm();
  if (errorsLog.length == 0) {
    signIn(email?.value, password?.value);
  } else {
    showErrors();
  }
};

const validateForm = () => {
  verifiedEmail();
  verifiedPassword();
};

const verifiedEmail = () =>{
  if (email?.value === '') {
    const error = {
      id: String(email?.id) + 'Error',
      message: '* Este campo es requerido.'
    };
    addError(error);
  }
  if (!email?.value.includes('@')) {
    const error = {
      id: String(email?.id) + 'Error',
      message: '* Debe ingresar una direccion de correo electronico.'
    };
    addError(error);
  }
}

const verifiedPassword = () => {
  if (password?.value === '') {
    const error = {
      id: String(password?.id) + 'Error',
      message: '* Este campo es requerido.'
    };
    addError(error);
  }
}

addError = (error) => {
  const verified = !errorsLog
      .some((er) => er.message === error.message && er.id === error.id);
    if (verified) errorsLog.push(error);
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
}

const signIn = (email, password) => {
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      setTimeout(() => {
        window.location.href = './profile.html';
      }, 500);
    })
    .catch(error => {
      console.log(error);
      swal('Oops!', 'El usuario o la contraseña son incorrectos.', 'error');
    });
}