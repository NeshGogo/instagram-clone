import { firestore, auth, storage } from '../services/firebase.js';
import firebase from '../services/firebase.js';
import { Post } from '../models/post.js';
import { Comment } from '../models/comment.js';


const USERS = 'users';
const POSTS = 'posts';
const COMMENTS = 'comments';
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
const btnAddPost = document.querySelector('#addPost');

// HtmlElements del modal de edicion de perfil
const inputUserName = document.querySelector('#inputUserName');
const inputFullName = document.querySelector('#inputFullName');
const inputBiography = document.querySelector('#inputBiography');
const inputUserImageFile = document.querySelector('#inputUserImageFile');
const btnUpdateUser = document.querySelector('#btnUpdateUser');

// HtmlElements del modal de agregar post
const btnCreateAndEditPost = document.querySelector('#btnCreateAndEditPost');
const inputPostFile = document.querySelector('#inputPostFile');
const inputPostDescription = document.querySelector('#inputPostDescription');
const addPostTitle = document.querySelector('#addPostTitle');

//HtmlElements del modal de open post
const openPost = document.getElementById('open-post');
const postImg = document.querySelector('#postImg');
const postHeader = document.querySelector('#postHeader');
const postDescription = document.querySelector('#postDescription');
const postCommentList = document.querySelector('#postCommentList');
const sentComment = document.querySelector('#sentComment');
const modalPostLikes = document.querySelector('#modalPostLikes');
const modalPostLikeIcon = document.querySelector('#modalPostLikeIcon');

auth.onAuthStateChanged(async (userAccount) => {
  if (userAccount) {
    userApp = { id: userAccount.uid }
    firestore.collection(USERS).doc(userAccount.uid)
      .onSnapshot(function (userRef) {
        userApp = { ...userApp, ...userRef.data() };
        init();
      });
  } else {
    window.location.href = './index.html';
  }
});

firestore.collection(POSTS)
  .orderBy('date', 'desc')
  .onSnapshot(querySnapShot => {
    const postList = document.querySelector('#post__list');
    postList.innerHTML = '';
    querySnapShot.forEach(postDoc => {
      const post = { id: postDoc.id, ...postDoc.data() };
      if (post.userRef === userApp.id) {
        postList.innerHTML += `
          <div class="col-xs-12 
            col-sm-8
            col-md-6
            col-lg-4">
                <div class=" post box ">
                  <a id="post-${post.id}">
                    <img src="${post.imageUrl}" alt="Image de una plicacion" />
                  </a>
                  <div class="post__options">
                    <a id="postEdit-${post.id}"><img src="./assets/img/icon-edit.svg"></a>
                    <a  id="postDelete-${post.id}"><img src="./assets/img/icon-delete.svg"></a>
                  </div>
                </div>
          </div>
        `;
        setTimeout(() => {
          document.getElementById(`post-${post.id}`).onclick = () => showPost(post);
          document.getElementById(`postEdit-${post.id}`).onclick = () => {
            inputPostDescription.value = post.description;
            inputPostFile.style.display = 'none';
            btnCreateAndEditPost.innerText = 'Actualizar';
            btnCreateAndEditPost.onclick = async () => {
              await updatePost(post.id);
              document.getElementById('close-addPost').onclick();
            }
            addPostTitle.innerText = 'Editar Publicacion';
            showAddPost();
          };
          document.getElementById(`postDelete-${post.id}`).onclick = () => showPost(post);
        }, 0);
      }
    })
  });

const init = () => {
  if (userApp.imageUrl !== '') {
    headerUserImage.src = userApp.imageUrl;
    userImage.src = userApp.imageUrl;
  }else{
    headerUserImage.src = './assets/img/user-account.png';
    userImage.src = './assets/img/user-account.png';
  }

  headerUserFullname.innerText = userApp.fullName;
  userName.innerText = userApp.userName;
  userFullname.innerText = userApp.fullName;
  postCount.innerText = userApp.post;
  userBiography.innerText = userApp.biography || '';
};
const addPostLike = async (postId) => {
  const docRef = firestore.collection(POSTS).doc(postId);
  const post = (await docRef.get()).data();
  const liked = !post.likesRef.includes(userApp.id);
  docRef.update({
    likes: liked ? post.likes + 1 : post.likes - 1,
    likesRef: liked ?
      firebase.firestore.FieldValue.arrayUnion(userApp.id)
      : firebase.firestore.FieldValue.arrayRemove(userApp.id),
  })
}
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
  if (file)
    userApp.imageUrl = await uploadFile(file)

  await firestore.collection(USERS).doc(userApp.id).set({ ...userApp });
  document.getElementById('close-edit').onclick();
}

btnAddPost.onclick = () => {
  inputPostFile.style.display = 'initial';
  btnCreateAndEditPost.innerText = 'Agregar';
  addPostTitle.innerText = 'Agregar Publicacion';
  showAddPost();
  btnCreateAndEditPost.onclick = async () => {
    await addPost();
    document.getElementById('close-addPost').onclick();
  }
};

const showAddPost = () => {
  const openEdit = document.getElementById('open-addPost');
  setTimeout(() => {
    openEdit.style.opacity = '1';
    openEdit.style.pointerEvents = 'auto';
  }, 0);
}

document.getElementById('close-addPost').onclick = () => {
  const openEdit = document.getElementById('open-addPost');
  document.getElementById('formAddPost').reset();
  setTimeout(() => {
    openEdit.style.opacity = '0';
    openEdit.style.pointerEvents = 'none';
  }, 0);
}

const addPost = async () => {
  try {
    const file = inputPostFile.files[0];
    if (file === undefined) return;
    const url = await uploadFile(file, 'posts')
    const post = new Post(userApp.id, userApp.userName, inputPostDescription.value, url);
    await firestore.collection(POSTS).add({ ...post });
    userApp.post += 1;
    await firestore.collection(USERS).doc(userApp.id)
      .update({ post: userApp.post });
  } catch (error) {
    console.log(error);
  }
}
const updatePost = async (postId) => {
  try {
    await firestore.collection(POSTS)
      .doc(postId).update({ description: inputPostDescription.value });
  } catch (error) {
    console.log(error);
  }
}
const uploadFile = async (file, folder = '') => {
  let storageRef;
  if (file === undefined) return;
  if (folder === '') {
    storageRef = storage.ref(`${userApp.id}/profile.${file.name.split('.')[1]}`)
  } else {
    storageRef = storage.ref(`${userApp.id}/${folder}/${Date.now()}-${file.name}`)
  }
  await storageRef.put(file);
  return await storageRef.getDownloadURL();
}
const showPost = (post) => {
  const postCommentAmount = document.querySelector('#postCommentAmount');
  let liked = post.likesRef.includes(userApp.id) ? true : false;
  const likeIcon = liked ?
    './assets/img/icon-heart-red.png'
    : './assets/img/icon-heart-outline.png';
  postImg.src = post.imageUrl;
  postHeader.innerHTML = `
    <img
      class="modal-post__details--user-img"
      src="${userApp.imageUrl}"
      alt="Imagen del usuario">
    <p><b>${userApp.userName}</b></p>
  `;
  postDescription.innerHTML = `
    <img
      class="modal-post__details--user-img"
      src="${userApp.imageUrl}"
      alt="Imagen del usuario">
    <p><strong>${userApp.userName}</strong> ${post.description}</p>
  `;
  postCommentAmount.innerHTML = post.commentsRef.length
  modalPostLikeIcon.innerHTML = `<img src="${likeIcon}" alt="icono de favorito">`;
  modalPostLikes.innerText = post.likes;

  getPostComments(post.id);
  sentComment.onclick = () => addPostComment(post.id);
  modalPostLikeIcon.onclick = () => {
    liked = !liked;
    const icon = liked ?
      './assets/img/icon-heart-red.png'
      : './assets/img/icon-heart-outline.png';
    post.likes = liked ? post.likes + 1 : post.likes - 1;
    modalPostLikeIcon.innerHTML = `<img src="${icon}" alt="icono de favorito">`;
    modalPostLikes.innerText = post.likes;
    addPostLike(post.id);
  }
  setTimeout(() => {
    openPost.style.opacity = '1';
    openPost.style.pointerEvents = 'auto';
  }, 0);
}

document.getElementById('close-post').onclick = () => {
  postImg.src = '';
  postHeader.innerHTML = '';
  postDescription.innerHTML = '';
  postCommentList.innerHTML = '';
  modalPostLikes.innerHTML = '';
  modalPostLikeIcon.innerHTML = '';
  firestore.collection(COMMENTS).onSnapshot(() => { })();
  // unsubscribe();
  setTimeout(() => {
    openPost.style.opacity = '0';
    openPost.style.pointerEvents = 'none';
  }, 0);
}


const getPostComments = (postId) => {
  firestore.collection(COMMENTS)
    .where('postRef', '==', postId)
    .orderBy('date', 'desc')
    .onSnapshot((querySnapshots) => {
      postCommentList.innerHTML = '';
      querySnapshots.forEach(docRef => {
        appendComment(docRef.data());
      });
    });

}
const appendComment = (comment) => {
  firestore.collection(USERS).doc(comment.userRef).get().then(userRef => {
    const user = userRef.data();
    const date = new Date(comment.date.seconds * 1000);
    console.log(date.toLocaleTimeString())
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
  });
}
const addPostComment = async (postId) => {
  const inputComment = document.querySelector('#inputComment');
  if (inputComment.value !== '') {
    try {
      const comment = new Comment(userApp.id, userApp.userName, inputComment.value, postId)
      const commentRef = await firestore.collection(COMMENTS).add({ ...comment });
      await firestore.collection(POSTS).doc(postId).update({
        commentsRef: firebase.firestore.FieldValue.arrayUnion(commentRef.id)
      });
      inputComment.value = '';
    } catch (error) {
      console.log(error);
    }
  }
}

document.querySelector('#signOut').onclick = () => {
  auth.signOut();
}