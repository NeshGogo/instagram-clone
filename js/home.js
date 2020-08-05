import { auth, firestore } from '../services/firebase.js';

const USERS = 'users';
let currentUserId = '';
// let userApp;

// HtmlElements del header.
const headerUserImage = document.querySelector('#headerUserImage');
const headerUserFullname = document.querySelector('#headerUserFullname');

auth.onAuthStateChanged(async (userAccount) => {
  if (userAccount) {
    currentUserId = userAccount.uid;
    firestore.collection(USERS).doc(userAccount.uid)
      .onSnapshot(function (userRef) {
        init(userRef.data());
        currentUserId = userAccount.uid;
      });
  } else {
    window.location.href = './index.html';
  }
});

const init = (user) => {
  headerUserFullname.innerText = user.fullName;
  headerUserImage.src = user.imageUrl;
}