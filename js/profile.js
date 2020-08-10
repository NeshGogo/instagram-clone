import { firestore, auth, storage, fieldValue } from '../services/firebase.js';
import { Post } from '../models/post.js';
import { Comment } from '../models/comment.js';


const USERS = 'users';
const POSTS = 'posts';
const COMMENTS = 'comments';
const errorLog = [];
let searchedUserId = '';
let searchedUser;
let userApp;
let currentUserId;

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
const infoDeleteUserPicture = document.querySelector('#infoDeleteUserPicture');
const postList = document.querySelector('#post__list');

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
    const searchParams = new URLSearchParams(window.location.search);
    searchedUserId = searchParams.get('id');
    currentUserId = userAccount.uid;
    if(currentUserId === searchedUserId) searchedUserId = null;
    firestore.collection(USERS).doc(currentUserId)
      .onSnapshot((userRef) => {
        userApp = { ...userApp, ...userRef.data() };
        init();
      });
    if (searchedUserId) {
      firestore.collection(USERS).doc(searchedUserId)
        .get().then(searchedUserRef => {
          searchedUser = { ...searchedUserRef.data() };
          init();
        });
    }
  } else {
    window.location.href = './index.html';
  }
});


const init = () => {
  headerUserImage.src = userApp.imageUrl;
  userImage.src = searchedUser?.imageUrl || userApp.imageUrl;
  headerUserFullname.innerText = userApp.fullName;
  userName.innerText = searchedUser?.userName || userApp.userName;
  userFullname.innerText = searchedUser?.fullName || userApp.fullName;
  postCount.innerText = searchedUser ? searchedUser.post : userApp.post;
  userBiography.innerText = searchedUser?.biography || userApp.biography;
  if (searchedUserId) {
    document.getElementById('btnEdit').style.display = 'none';
    document.getElementById('infoDeleteUserPicture').style.display = 'none';
    document.getElementById('addPost').style.display = 'none';
  }
  onChangeSearcherInput();
  getPosts(searchedUserId || currentUserId);
};

const getPosts = (id) => {
  firestore.collection(POSTS)
    .where('userRef', '==', id)
    .orderBy('date', 'desc')
    .onSnapshot(querySnapShot => {
      const postList = document.querySelector('#post__list');
      postList.innerHTML = '';
      querySnapShot.forEach(postDoc => {
        const post = { id: postDoc.id, ...postDoc.data() };
        appendPost(post);
        setTimeout(() => {
          initPost(post);
          if (searchedUserId) {
            const postOption = document.querySelector('.post__options');
            if (postOption)
              postOption.className = 'post__options--none'
          }
        }, 0);
      });

    });
}

const appendPost = (post) => {
  postList.innerHTML += `
    <div
    class="
    col-xs-12
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
}

const initPost = (post) => {
  document.getElementById(`post-${post.id}`).onclick = () => showPost(post);
  document.getElementById(`postEdit-${post.id}`).onclick = () => postEdit(post);
  document.getElementById(`postDelete-${post.id}`).onclick = async () => deletePost(post)
}

const postEdit = (post) => {
  inputPostDescription.value = post.description;
  inputPostFile.style.display = 'none';
  btnCreateAndEditPost.innerText = 'Actualizar';
  btnCreateAndEditPost.onclick = async () => {
    await updatePost(post.id);
    document.getElementById('close-addPost').onclick();
  }
  addPostTitle.innerText = 'Editar Publicacion';
  showAddPost();
}

const deletePost = async (post) => {
  debugger;
  let agreed = await swal({
    title: "Esta seguro?",
    text: "Una vez eliminado, se perdera toda la informacion",
    icon: "warning",
    buttons: ['Cancelar', true],
    dangerMode: true,
  });
  if (!agreed) return;
  await deleteFile(post.imageStorageRef);
  await deleteCommentByPost(post.id)
  await firestore.collection(POSTS).doc(post.id).delete();
  userApp.post = userApp.post - 1;
  await firestore.collection(USERS).doc(currentUserId).update({ ...userApp });
}

const deleteCommentByPost = async (postId) => {
  const comments = await firestore.collection(COMMENTS).where('postRef', '==', postId).get();
  comments.forEach(docRef => {
    firestore.collection(COMMENTS).doc(docRef.id).delete();
  })
}

const addPostLike = async (postId) => {
  const docRef = firestore.collection(POSTS).doc(postId);
  const post = (await docRef.get()).data();
  const liked = !post.likesRef.includes(currentUserId);
  docRef.update({
    likes: liked ? post.likes + 1 : post.likes - 1,
    likesRef: liked ?
      fieldValue.arrayUnion(currentUserId)
      : fieldValue.arrayRemove(currentUserId),
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
  document.querySelector('#editUserForm').reset();
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
    const uploadRef = await uploadFile(file);
    userApp.imageUrl = await uploadRef.getDownloadURL();
    userApp.imageStorageRef = uploadRef.fullPath;
  }
  await firestore.collection(USERS).doc(currentUserId).update({ ...userApp });
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

infoDeleteUserPicture.onclick = async () => {
  debugger;
  if (userApp.imageUrl === './assets/img/user-account.png') {
    swal('Alerta!', 'Debes subir una fotografia para poder eliminarla.', 'warning');
    return;
  }
  let agreed = await swal({
    title: "Esta seguro?",
    text: "Una vez eliminado, usted no podra ver esta imagen nuevamente!",
    icon: "warning",
    buttons: ['Cancelar', true],
    dangerMode: true,
  });
  if (!agreed) return;
  await deleteFile(userApp.imageStorageRef)
  userApp.imageStorageRef = '';
  userApp.imageUrl = './assets/img/user-account.png';
  await firestore.collection(USERS).doc(currentUserId).update({ ...userApp });
}

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
    if (!file) return;
    const uploadRef = await uploadFile(file, 'posts');
    const url = await uploadRef.getDownloadURL();
    const imageStorageRef = uploadRef.fullPath;
    const post = new Post(currentUserId, userApp.userName, inputPostDescription.value, url, imageStorageRef);
    await firestore.collection(POSTS).add({ ...post });
    userApp.post += 1;
    await firestore.collection(USERS).doc(currentUserId)
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
    storageRef = storage.ref(`${currentUserId}/profile.${file.name.split('.')[1]}`)
  } else {
    storageRef = storage.ref(`${currentUserId}/${folder}/${Date.now()}-${file.name}`)
  }
  await storageRef.put(file);
  return storageRef;
}
const deleteFile = async (filestorageRef) => {
  let fileRef = storage.ref().child(filestorageRef);
  try {
    await fileRef.delete();
  } catch (error) {
    console.log(error);
  }
}
const showPost = (post) => {
  const postCommentAmount = document.querySelector('#postCommentAmount');
  let liked = post.likesRef.includes(currentUserId) ? true : false;
  const likeIcon = liked ?
    './assets/img/icon-heart-red.png'
    : './assets/img/icon-heart-outline.png';
  postImg.src = post.imageUrl;
  postHeader.innerHTML = `
    <img
      class="modal-post__details--user-img"
      src="${searchedUser?.imageUrl || userApp.imageUrl}"
      alt="Imagen del usuario">
    <p><b>${searchedUser?.userName || userApp.userName}</b></p>
  `;
  postDescription.innerHTML = `
    <img
      class="modal-post__details--user-img"
      src="${searchedUser?.imageUrl || userApp.imageUrl}"
      alt="Imagen del usuario">
    <p>
      <strong>${searchedUser?.userName || userApp.userName}</strong> 
      ${post.description}
    </p>
  `;
  postCommentAmount.innerHTML = post.commentsRef.length
  modalPostLikeIcon.innerHTML = `<img src="${likeIcon}" alt="icono de favorito">`;
  modalPostLikes.innerText = post.likes;

  getPostComments(post.id);
  sentComment.onclick = () => {
    const input = document.querySelector('#inputComment');
    addPostComment(post.id, input.value)
    input.value = '';
    getPostComments(post.id);
  }
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

document.querySelector('#changePassword')
  .onclick = () => openModal('open-changePassword');

document.querySelector('#close-changePassword')
  .onclick = () => closeModal('open-changePassword', 'formChangePassword');

document.querySelector('#btnChangePassword').onclick = () => {
  const inputsId = [
    'inputLastPassword',
    'inputNewPassword',
    'inputNewPasswordConfirm'
  ];
  const inputLastPassword = document.querySelector('#inputLastPassword');
  const inputNewPassword = document.querySelector('#inputNewPassword');
  const inputNewPasswordConfirm = document.querySelector('#inputNewPasswordConfirm');
  validateInputsNotNull(inputsId);
  validateCofirmPassword(inputNewPassword, inputNewPasswordConfirm);
  if (errorLog.length > 0) {
    showErrors();
    return false;
  }
  changePassword(inputLastPassword.value, inputNewPassword.value);
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

const addPostComment = async (postId, value) => {
  if (value === '') return;
  debugger;
  try {
    const comment = new Comment(currentUserId, userApp.userName, value, postId)
    const commentRef = await firestore.collection(COMMENTS).add({ ...comment });
    await firestore.collection(POSTS).doc(postId).update({
      commentsRef: fieldValue.arrayUnion(commentRef.id)
    });
  } catch (error) {
    console.log(error);
  }

}

const openModal = (tagId) => {
  const modal = document.getElementById(tagId);
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
  }, 0);
}

const closeModal = (tagId, tagFormId = '') => {
  const modal = document.getElementById(tagId);
  if (tagFormId !== '')
    document.getElementById(tagFormId).reset();

  setTimeout(() => {
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
  }, 0);
}
const changePassword = (lastPassword, newPassword) => {
  const user = auth.currentUser;
  auth.signInWithEmailAndPassword(user.email, lastPassword)
    .then(() => {
      user.updatePassword(newPassword)
        .then(() => {
          swal('Excelente!!', 'La contraseña fue cambiada satisfactoriamente', 'success');
          closeModal('open-changePassword', 'formChangePassword');
        })
        .catch(error => {
          if (error.code === 'auth/weak-password') {
            swal(
              'Contraseña debil!',
              'La contraseña debe tener almenos 6 caracteres.',
              'warning'
            );
          }
        });
    })
    .catch(() => swal('Invalido!', 'La contraseña actual es incorrecta', 'error'));
}
const validateInputsNotNull = (inputsId) => {
  inputsId.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input.value === '') {
      const error = {
        id: inputId + 'Error',
        message: '* Este campo es requerido.'
      };
      addError(error);
    }
  });
}

const validateCofirmPassword = (inputNewPassword, inputConfirmPassword) => {
  if (inputNewPassword.value !== inputConfirmPassword.value) {
    const error = {
      id: inputConfirmPassword.id + 'Error',
      message: '* La contraseña no coincide.'
    };
    addError(error);
  }
}
const addError = (error) => {
  const verified = !errorLog
    .some((er) => er.message === error.message && er.id === error.id);
  if (verified) errorLog.push(error);
}

const showErrors = () => {
  errorLog.forEach(error =>
    document.getElementById(error.id).innerHTML = ''
  );
  errorLog.forEach((error) => {
    const element = document.getElementById(error.id);
    element.innerHTML += `
      <p>${error.message}</p>
    `;
  });
  errorLog.length = 0;
}
document.querySelector('#signOut').onclick = () => {
  auth.signOut();
}
const onChangeSearcherInput = () => {
  const inputSearch = document.querySelector('#headerSearchInput');

  inputSearch.addEventListener('change', async (event) => {
    const value = event.target.value;
    if (value) {
      const users = await searchUserByUserNameCoincidences(value);
      appendUserToSearchResult(users);
    } else {
      resetSearchResult();
    }
  });

  inputSearch.addEventListener('focusout', (event) => {
    setTimeout(() => {
      inputSearch.value = '';
      resetSearchResult()
    }, 400);
  })
}

const searchUserByUserNameCoincidences = async (value) => {
  const users = [];
  const userRefs = await firestore.collection(USERS).orderBy('userName')
    .startAt(value).endAt(value + '\uf8ff').limit(5).get();
  userRefs.forEach(userRef => {
    users.push({ id: userRef.id, ...userRef.data() })
  });
  return users;
}

const appendUserToSearchResult = (users) => {
  const results = document.querySelector('#searcherResults');
  results.innerHTML = '';
  if (users.length === 0) resetSearchResult();
  users.forEach(user => {
    results.innerHTML += `
      <li>
        <a href="./profile.html?id=${user.id}">
          <img src="${user.imageUrl}" alt="Imagen del usuario">
          <span>${user.userName}</span>
        </a>
      </li>
    `;
  })
}
const resetSearchResult = () => {
  const results = document.querySelector('#searcherResults');
  results.innerHTML = '<li>No hay resultados.</li>';
}