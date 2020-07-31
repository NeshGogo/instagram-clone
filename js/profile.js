import { firestore, auth } from '../services/firebase.js';


const USERS = 'users';

//htmlElements
const headerUserImage = document.querySelector('#headerUserImage');
const headerUserFullname= document.querySelector('#headerUserFullname');
const userImage = document.querySelector('#userImage');
const userName = document.querySelector('#userName');
const btnEdit = document.querySelector('#btnEdit');
const userFullname = document.querySelector('#userFullname');
const postCount = document.querySelector('#postCount');
const userBiography = document.querySelector('#userBiography');

window.onload = ()=> {
  if(!sessionStorage.getItem('user')){
    window.location.href = './index.html';
  }
  init();
}
auth.onAuthStateChanged(async (userAccount) => {
  if (userAccount) {
    const userRef = await firestore.collection(USERS).doc(userAccount.uid).get();
    const userDb = userRef.data();
    console.log(userDb);
    init(userDb);
  } else {
    window.location.href = './index.html';
  }
});

const init = (user) => {
  console.log(user)
  if(user.imageUrl !== ''){
    headerUserImage.src =  user.imageUrl;
    userImage.src = user.imageUrl;
  }
  headerUserFullname.innerText = user.fullName;
  userName.innerText = user.userName;
  userFullname.innerText = user.fullName;
  postCount.innerText = '0';
  userBiography.innerText = user.biography || '';
};
