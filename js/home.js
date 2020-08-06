import { Comment } from '../models/comment.js'
import { auth, firestore } from '../services/firebase.js';
import firebase from '../services/firebase.js';

const USERS = 'users';
const POSTS = 'posts';
const COMMENTS = 'comments';
let currentUserId = '';
let currentUserName = '';

// HtmlElements del header.
const headerUserImage = document.querySelector('#headerUserImage');
const headerUserFullname = document.querySelector('#headerUserFullname');

auth.onAuthStateChanged(async (userAccount) => {
  if (userAccount) {
    currentUserId = userAccount.uid;
    firestore.collection(USERS).doc(userAccount.uid)
      .onSnapshot(function (userRef) {
        const user = { ...userRef.data() };
        currentUserName = user.userName;
        headerUserFullname.innerText = user.fullName;
        headerUserImage.src = user.imageUrl;
      });
  } else {
    window.location.href = './index.html';
  }
});


firestore.collection(POSTS).orderBy('date', 'desc').get().then(async (snapshots) => {
  const postList = document.querySelector('#homePosts');
  postList.innerHTML = '';
  snapshots.forEach(async (postRef) => {
    const post = { id: postRef.id, ...postRef.data() };

    postList.innerHTML += `
      <div class="post-card">
        <div class="post-card--header">
          <img id="postCartHeaderUserImg-${post.id}" alt="imagen del usuario del post">
          <p id="postCartHeaderUserName-${post.id}"> </p>
        </div>
        <img class="post-card--img" src="${post.imageUrl}" alt="Imagen del post">
        <div class="post-card--footer-img">
          <a id="addPostLike-${post.id}"><img id="postLikeIcon-${post.id}" alt="icono de favorito"></a>
          <a><img src="./assets/img/icon-comment.png" alt=""></a>
          <p><span id="postLikes-${post.id}">${post.likes}</span> Me gusta</p>
        </div>
        <div class="post-card--description">
          <h4>Descripcion</h4>
          <p><strong id="postCartDescriptionUserName-${post.id}"></strong> ${post.description}</p>
        </div>
        <div class="post-card--comments">
          <h4>Comentarios</h4>
          <a>
            Ver los <span id="postCommentAmout-${post.id}">${post.commentsRef.length}</span> comentarios
          </a>
          <div id="postComments-${post.id}">
          </div>
        </div>
        <div class="post--card--add-comment">
          <input id="inputComment-${post.id}" class="form__input" type="text" placeholder="Agrega un comentario...">
          <a id="addPostComment-${post.id}" >Publicar</a>
        </div>
      </div>
    `;
    const comments = getPostCommets(post.id);
    const user = await getuserById(post.userRef);
    document.querySelector(`#postCartHeaderUserImg-${post.id}`).src = user.imageUrl;
    document.querySelector(`#postCartHeaderUserName-${post.id}`).innerText = user.userName;
    document.querySelector(`#postCartDescriptionUserName-${post.id}`).innerText = user.userName;
    document.querySelector(`#addPostLike-${post.id}`).onclick = () => addPostLike(post.id);
    document.querySelector(`#addPostComment-${post.id}`).onclick = () => {
      const inputComment = document.querySelector(`#inputComment-${post.id}`);
      addPostComment(post.id, inputComment.value);
      inputComment.value = '';
    }
    onPostChange(post.id)
  })
})

const getPostCommets = (postId) => {
  // postComments-${postId}
  firestore.collection(COMMENTS)
    .where('postRef', '==', postId)
    .orderBy('date', 'desc').limit(2)
    .onSnapshot(querySnapShot => {
      const postComments = document.querySelector(`#postComments-${postId}`);
      postComments.innerHTML = '';
      querySnapShot.forEach(commentRef => {
        const comment = commentRef.data();
        postComments.innerHTML += `<p><strong>${comment.userName}</strong> ${comment.description}</p>`;
      });
    });
}

const getuserById = async (id) => {
  const user = await firestore.collection(USERS)
    .doc(id).get();
  return user.data();
}

const addPostComment = async (postId, value) => {
  if (value !== '') {
    try {
      const comment = new Comment(currentUserId, currentUserName, value, postId)
      const commentRef = await firestore.collection(COMMENTS).add({ ...comment });
      await firestore.collection(POSTS).doc(postId).update({
        commentsRef: firebase.firestore.FieldValue.arrayUnion(commentRef.id)
      });
    } catch (error) {
      console.log(error);
    }
  }
}
const addPostLike = async (postId) => {
  const docRef = firestore.collection(POSTS).doc(postId);
  const post = (await docRef.get()).data();
  const liked = !post.likesRef.includes(currentUserId);
  docRef.update({
    likes: liked? post.likes + 1 : post.likes - 1,
    likesRef: liked?
      firebase.firestore.FieldValue.arrayUnion(currentUserId)
      : firebase.firestore.FieldValue.arrayRemove(currentUserId),
  })
}
const onPostChange = (postId) => {
  firestore.collection(POSTS).doc(postId)
    .onSnapshot(snapShot => {
      const postComment = document.querySelector(`#postCommentAmout-${postId}`);
      const postLikes = document.querySelector(`#postLikes-${postId}`);
      const postLikeIcon = document.querySelector(`#postLikeIcon-${postId}`)
      const post = snapShot.data();
      const likeIcon = post.likesRef.includes(currentUserId) ?
        './assets/img/icon-heart-red.png'
        : './assets/img/icon-heart-outline.png';
      postLikes.innerText = post.likes;
      postComment.innerText = post.commentsRef.length;
      postLikeIcon.src = likeIcon;
    });
}

document.querySelector('#signOut').onclick = () => {
  auth.signOut();
}
