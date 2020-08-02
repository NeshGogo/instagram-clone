import { firestore, auth, storage } from '../services/firebase.js';
import { User } from '../models/user.js';


const USERS = 'users';
let currentUserId = '';
let userApp;

// HtmlElements de la pagina principal
const headerUserImage = document.querySelector('#headerUserImage');
const headerUserFullname = document.querySelector('#headerUserFullname');
const userImage = document.querySelector('#userImage');
const userName = document.querySelector('#userName');
const btnEdit = document.querySelector('#btnEdit');
const userFullname = document.querySelector('#userFullname');
const postCount = document.querySelector('#postCount');
const userBiography = document.querySelector('#userBiography');

// HtmlElements del modal de edicion de perfil
const inputUserName = document.querySelector('#inputUserName');
const inputFullName = document.querySelector('#inputFullName');
const inputBiography = document.querySelector('#inputBiography');
const inputUserImageFile = document.querySelector('#inputUserImageFile');
const btnUpdateUser = document.querySelector('#btnUpdateUser');


auth.onAuthStateChanged(async (userAccount) => {
  if (userAccount) {
    currentUserId = userAccount.uid;
    firestore.collection(USERS).doc(userAccount.uid)
      .onSnapshot(function (userRef) {
        init(userRef.data());
      });
  } else {
    window.location.href = './index.html';
  }
});

const init = (user) => {
  if (user.imageUrl !== '') {
    headerUserImage.src = user.imageUrl;
    userImage.src = user.imageUrl;
  }
  headerUserFullname.innerText = user.fullName;
  userName.innerText = user.userName;
  userFullname.innerText = user.fullName;
  postCount.innerText = '0';
  userBiography.innerText = user.biography || '';
  userApp = new User(
    user.email,
    user.userName,
    user.fullName,
    user.imageUrl,
    user.biography
  );
};

btnEdit.onclick = () => {
  const openEdit = document.getElementById('open-edit');
  inputUserName.value = userApp.userName;
  inputFullName.value = userApp.fullName;
  inputBiography.value = userApp.biography;
  setTimeout(() => {
    openEdit.style.opacity = '1';
    openEdit.style.pointerEvents = 'auto';
  }, 0);
}

document.getElementById('close-edit').onclick = () => {
  const openEdit = document.getElementById('open-edit');
  setTimeout(() => {
    openEdit.style.opacity = '0';
    openEdit.style.pointerEvents = 'none';
  }, 0);
}

btnUpdateUser.onclick = async () => {
  userApp.userName = inputUserName.value;
  userApp.fullName = inputFullName.value;
  userApp.biography = inputBiography.value;
  const file = inputUserImageFile.files[0];
  if (file) {
    const storageRef = storage.ref(`${currentUserId}/profile.${file.name.split('.')[1]}`)
    storageRef.put(file);
    if (userApp.imageUrl === ''){
      storageRef.getDownloadURL().then(url => {
        userApp.imageUrl = url;
        firestore.collection(USERS).doc(currentUserId).set({ ...userApp }, {merge: true});
      });
    }else{
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }else{
    await firestore.collection(USERS).doc(currentUserId).set({ ...userApp });
  }
  document.getElementById('close-edit').onclick();
}

