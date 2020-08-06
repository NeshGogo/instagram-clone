import { auth, firestore } from '../services/firebase.js';

const USERS = 'users';
const POSTS = 'posts';
const COMMENTS = 'comments';
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

firestore.collection(POSTS).orderBy('date', 'desc').onSnapshot(async (snapshots) => {
  const postList = document.querySelector('#homePosts');
  postList.innerHTML = '';
  snapshots.forEach(async (postRef) => {
    const post = { id: postRef.id, ...postRef.data() };
    const likeIcon = post.likesRef.includes(currentUserId) ?
      './assets/img/icon-heart-red.png'
      : './assets/img/icon-heart-outline.png';

    const comments = await getPostCommets(post.id);

    postList.innerHTML += `
      <div class="post-card">
        <div class="post-card--header">
          <img id="postCartHeaderUserImg-${post.id}" alt="imagen del usuario del post">
          <p id="postCartHeaderUserName-${post.id}"> </p>
        </div>
        <img class="post-card--img" src="${post.imageUrl}" alt="Imagen del post">
        <div class="post-card--footer-img">
          <a><img src="${likeIcon}" alt="icono de favorito"></a>
          <a><img src="./assets/img/icon-comment.png" alt=""></a>
          <p>${post.likes} Me gusta</p>
        </div>
        <div class="post-card--description">
          <h4>Descripcion</h4>
          <p><strong id="postCartDescriptionUserName-${post.id}"></strong> ${post.description}</p>
        </div>
        <div class="post-card--comments">
          <h4>Comentarios</h4>
          <a href="">Ver los ${post.commentsRef.length} comentarios</a>
          <div>
            ${comments}
          </div>
        </div>
        <div class="post--card--add-comment">
          <input class="form__input" type="text" placeholder="Agrega un comentario...">
          <a >Publicar</a>
        </div>
      </div>
    `;
    const user = await getuserById(post.userRef);
    document.querySelector(`#postCartHeaderUserImg-${post.id}`).src = user.imageUrl;
    document.querySelector(`#postCartHeaderUserName-${post.id}`).innerText = user.userName;
    document.querySelector(`#postCartDescriptionUserName-${post.id}`).innerText = user.userName;
  })
})

const getPostCommets = async (postId) => {
  return await firestore.collection(COMMENTS)
    .where('postRef', '==', postId)
    .orderBy('date', 'desc')
    .limit(2).get()
    .then(async (querySnapShot) => {
      let comments = ``;
      querySnapShot.forEach(async (commentRef) => {
        let comment = commentRef.data();
        comments += `<p><strong>${comment.userName}</strong> ${comment.description}</p>`;
      });
      return comments;
    });
}
const getuserById = async (id) => {
  const user = await firestore.collection(USERS)
    .doc(id).get();
  return user.data();
}
document.querySelector('#signOut').onclick = () => {
  auth.signOut();
}
