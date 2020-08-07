import { Comment } from '../models/comment.js'
import { auth, firestore } from '../services/firebase.js';
import firebase from '../services/firebase.js';

const USERS = 'users';
const POSTS = 'posts';
const COMMENTS = 'comments';
let currentUser = {};

// HtmlElements del header.
const headerUserImage = document.querySelector('#headerUserImage');
const headerUserFullname = document.querySelector('#headerUserFullname');

//HtmlElements del modal de open post
const openPost = document.getElementById('open-post');
const postImg = document.querySelector('#postImg');
const postHeader = document.querySelector('#postHeader');
const postDescription = document.querySelector('#postDescription');
const postCommentList = document.querySelector('#postCommentList');
const modalPostLikes = document.querySelector('#modalPostLikes');
const sentComment = document.querySelector('#sentComment');
const modalPostLikeIcon = document.querySelector('#modalPostLikeIcon');

auth.onAuthStateChanged(async (userAccount) => {
  if (userAccount) {
    currentUser = { id: userAccount.uid };
    firestore.collection(USERS).doc(userAccount.uid)
      .onSnapshot(function (userRef) {
        currentUser = { ...currentUser, ...userRef.data() }
        headerUserFullname.innerText = currentUser.fullName;
        headerUserImage.src = currentUser.imageUrl || './assets/img/user-account.png';
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
          <a id="openPost-${post.id}"><img src="./assets/img/icon-comment.png" alt=""></a>
          <p><span id="postLikes-${post.id}">${post.likes}</span> Me gusta</p>
        </div>
        <div class="post-card--description">
          <h4>Descripcion</h4>
          <p><strong id="postCartDescriptionUserName-${post.id}"></strong> ${post.description}</p>
        </div>
        <div class="post-card--comments">
          <h4>Comentarios</h4>
          <a id="openPostComment-${post.id}"></a>
          <div id="postComments-${post.id}"></div>
        </div>
        <div class="post-card--add-comment">
          <input id="inputComment-${post.id}" class="form__input" type="text" placeholder="Agrega un comentario...">
          <a id="addPostComment-${post.id}" >Publicar</a>
        </div>
      </div>
    `;
    initPost(post);
  })
})

const initPost = async (post) => {
  getLastTwoPostCommets(post.id);
  const user = await getuserById(post.userRef);
  document.querySelector(`#postCartHeaderUserImg-${post.id}`).src = user.imageUrl;
  document.querySelector(`#postCartHeaderUserName-${post.id}`).innerText = user.userName;
  document.querySelector(`#postCartDescriptionUserName-${post.id}`).innerText = user.userName;
  document.querySelector(`#addPostLike-${post.id}`).onclick = () => addPostLike(post.id);
  document.querySelector(`#openPost-${post.id}`).onclick = () => showPost(post, user);
  document.querySelector(`#addPostComment-${post.id}`).onclick = () => {
    const inputComment = document.querySelector(`#inputComment-${post.id}`);
    addPostComment(post.id, inputComment.value);
    inputComment.value = '';
    getLastTwoPostCommets(post.id);
  }
  ActiveOnChangePost(post.id, user)
}

const getLastTwoPostCommets = (postId) => {
  firestore.collection(COMMENTS)
    .where('postRef', '==', postId)
    .orderBy('date', 'desc').limit(2)
    .onSnapshot(docRefs => {
      const postComments = document.querySelector(`#postComments-${postId}`);
      postComments.innerHTML = '';
      if (docRefs.size > 0) {
        docRefs.forEach(commentRef => {
          const comment = commentRef.data();
          postComments.innerHTML += `<p><strong>${comment.userName}</strong> ${comment.description}</p>`;
        });
      } else {
        postComments.innerHTML = '<p><small><i>No hay comentarios....</i></small></p>'
      }
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
      const comment = new Comment(currentUser.id, currentUser.userName, value, postId)
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
  const liked = !post.likesRef.includes(currentUser.id);
  docRef.update({
    likes: liked ? post.likes + 1 : post.likes - 1,
    likesRef: liked ?
      firebase.firestore.FieldValue.arrayUnion(currentUser.id)
      : firebase.firestore.FieldValue.arrayRemove(currentUser.id),
  })
}
const ActiveOnChangePost = (postId, user) => {
  firestore.collection(POSTS).doc(postId)
    .onSnapshot(snapShot => {
      const postCommentslink = document.querySelector(`#openPostComment-${postId}`);
      const postLikes = document.querySelector(`#postLikes-${postId}`);
      const postLikeIcon = document.querySelector(`#postLikeIcon-${postId}`)
      const post = { id: postId, ...snapShot.data() };
      document.querySelector(`#openPost-${post.id}`).onclick = () => showPost(post, user);
      const likeIcon = post.likesRef.includes(currentUser.id) ?
        './assets/img/icon-heart-red.png'
        : './assets/img/icon-heart-outline.png';
      postLikes.innerText = post.likes;
      if (post.commentsRef.length > 2) {
        postCommentslink.innerText = `Ver los ${post.commentsRef.length} comentarios`
        postCommentslink.onclick = () => showPost(post, user);
      }
      postLikeIcon.src = likeIcon;
    });
}

const showPost = (post, postUser) => {
  const postCommentAmount = document.querySelector('#postCommentAmount');
  let liked = post.likesRef.includes(currentUser.id) ? true: false;
  const likeIcon = liked?
        './assets/img/icon-heart-red.png'
        : './assets/img/icon-heart-outline.png';
  postImg.src = post.imageUrl;
  postHeader.innerHTML = `
    <img
      class="modal-post__details--user-img"
      src="${postUser.imageUrl}"
      alt="Imagen del usuario">
    <p><b>${postUser.userName}</b></p>
  `;
  postDescription.innerHTML = `
    <img
      class="modal-post__details--user-img"
      src="${postUser.imageUrl}"
      alt="Imagen del usuario">
    <p><strong>${postUser.userName}</strong> ${post.description}</p>
  `;
  modalPostLikeIcon.innerHTML = `<img src="${likeIcon}" alt="icono de favorito">`;
  postCommentAmount.innerHTML = post.commentsRef.length
  modalPostLikes.innerText = post.likes;

  getPostComments(post.id);
  sentComment.onclick = () => {
    const input = document.querySelector('#ModalPostinputComment');
    addPostComment(post.id, input.value)
    input.value = '';
    getPostComments(post.id);
  };
  modalPostLikeIcon.onclick = () => {
    liked = !liked;
    const icon = liked?
        './assets/img/icon-heart-red.png'
        : './assets/img/icon-heart-outline.png';
    post.likes = liked? post.likes + 1 : post.likes - 1;
    modalPostLikeIcon.innerHTML = `<img src="${icon}" alt="icono de favorito">`;
    modalPostLikes.innerText = post.likes;
    addPostLike(post.id);
  }
  setTimeout(() => {
    openPost.style.opacity = '1';
    openPost.style.pointerEvents = 'auto';
  }, 0);
}


const getPostComments = (postId) => {
  firestore.collection(COMMENTS)
    .where('postRef', '==', postId)
    .orderBy('date', 'desc')
    .get().then((docsRef) => {
      postCommentList.innerHTML = '';
      docsRef.forEach(async docRef => {
        await appendPostComment(docRef.data());
      });
    });
}

const appendPostComment = async (comment) => {
  const userRef = await firestore.collection(USERS).doc(comment.userRef).get();
  const user = userRef.data();
  const date = new Date(comment.date.seconds * 1000);
  postCommentList.innerHTML += `
      <div>
        <img
        class="modal-post__details--user-img"
        src="${user.imageUrl}"
        alt="Imagen del usuario">
        <p><strong>${user.userName}</strong> ${comment.description}</p>
      </div>
      <small><i>${date.toLocaleString()}</i></small>
      <br><br>
    `;
}

document.getElementById('close-post').onclick = () => {
  postImg.src = '';
  postHeader.innerHTML = '';
  postDescription.innerHTML = '';
  postCommentList.innerHTML = '';
  modalPostLikes.innerHTML = '';
  modalPostLikeIcon.innerHTML = '';
  // unsubscribe();
  setTimeout(() => {
    openPost.style.opacity = '0';
    openPost.style.pointerEvents = 'none';
  }, 0);
}
document.querySelector('#signOut').onclick = () => {
  auth.signOut();
}
