import { Comment } from '../models/comment.js'
import { auth, firestore, fieldValue } from '../services/firebase.js';

const USERS = 'users';
const POSTS = 'posts';
const COMMENTS = 'comments';
const errorLog = [];
let currentUser = {};

// HtmlElements de la pagina principal;
const postList = document.querySelector('#homePosts');

//HtmlElements del modal de open post
const postCommentAmount = document.querySelector('#postCommentAmount');
const postCommentList = document.querySelector('#postCommentList');
const modalPostLikes = document.querySelector('#modalPostLikes');
const modalPostLikeIcon = document.querySelector('#modalPostLikeIcon');

// Verifica que haya un usuario legueado.
auth.onAuthStateChanged(async (userAccount) => {
  if (userAccount) {
    currentUser = { id: userAccount.uid };
    firestore.collection(USERS).doc(userAccount.uid)
      .onSnapshot(function (userRef) {
        currentUser = { ...currentUser, ...userRef.data() }
        document.querySelector('#headerUserFullname').innerText = currentUser.fullName;
        document.querySelector('#headerUserImage').src = currentUser.imageUrl;
      });
    onChangeSearcherInput();
  } else {
    window.location.href = './index.html';
  }
});

//Obtiene todos los post ordenados por fecha.
firestore.collection(POSTS).orderBy('date', 'desc').get().then(async (snapshots) => {
  postList.innerHTML = '';
  snapshots.forEach(async (postRef) => {
    const post = { id: postRef.id, ...postRef.data() };
    appendPostCart(post)
    initPostCart(post);
  })
})

document.querySelector('#changePassword')
  .onclick = () => openModal('open-changePassword');

document.querySelector('#close-changePassword')
  .onclick = () => closeModal('open-changePassword', 'formChangePassword');

// Realiza la operacion del cambio de contraseña.
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

document.getElementById('close-post').onclick = () =>  closeModal('open-post');

document.querySelector('#signOut').onclick = () => {
  auth.signOut();
}

// Agrega el post cart a la vista.
const appendPostCart = (post) => {
  postList.innerHTML += `
      <div class="post-card">
        <div class="post-card--header">
          <a href="./profile.html?id=${post.userRef}">
            <img id="postCartHeaderUserImg-${post.id}" alt="imagen del usuario del post">
            <p id="postCartHeaderUserName-${post.id}"> </p>
          </a>
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
}

// Inicializa las funcionalidades del post cart
const initPostCart = async (post) => {
  getLastTwoPostCommetsByPost(post.id);
  const user = (await firestore.collection(USERS)
    .doc(post.userRef).get()).data();
  document.querySelector(`#postCartHeaderUserImg-${post.id}`).src = user.imageUrl;
  document.querySelector(`#postCartHeaderUserName-${post.id}`).innerText = user.userName;
  document.querySelector(`#postCartDescriptionUserName-${post.id}`).innerText = user.userName;
  document.querySelector(`#addPostLike-${post.id}`).onclick = () => addPostLike(post.id);
  document.querySelector(`#openPost-${post.id}`).onclick = () => showPost(post, user);
  document.querySelector(`#addPostComment-${post.id}`).onclick = () => {
    const inputComment = document.querySelector(`#inputComment-${post.id}`);
    addPostComment(post.id, inputComment.value);
    inputComment.value = '';
    getLastTwoPostCommetsByPost(post.id);
  }
  ActiveOnChangePost(post.id, user)
}

//Obtiene los dos ultimos comentarios por post.
const getLastTwoPostCommetsByPost = (postId) => {
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

const addPostComment = async (postId, value) => {
  if (value !== '') {
    try {
      const comment = new Comment(currentUser.id, currentUser.userName, value, postId)
      const commentRef = await firestore.collection(COMMENTS).add({ ...comment });
      await firestore.collection(POSTS).doc(postId).update({
        commentsRef: fieldValue.arrayUnion(commentRef.id)
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
      fieldValue.arrayUnion(currentUser.id)
      : fieldValue.arrayRemove(currentUser.id),
  })
}

// Observa los cambios de los post;
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

// Abre un modal con todo los datos del post;
const showPost = (post, postUser) => {
  let liked = post.likesRef.includes(currentUser.id) ? true : false;
  showPostInit(post, postUser, liked)
  getPostComments(post.id);
  document.querySelector('#sentComment').onclick = () => {
    const input = document.querySelector('#ModalPostinputComment');
    addPostComment(post.id, input.value);
    postCommentAmount.innerHTML = post.commentsRef.length + 1;
    input.value = '';
    getPostComments(post.id);
  };
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
  openModal('open-post')
}

// Inicializa el modal del post;
const showPostInit = (post, postUser, liked) => {
  const likeIcon = liked ?
    './assets/img/icon-heart-red.png'
    : './assets/img/icon-heart-outline.png';
  document.querySelector('#postImg').src = post.imageUrl;
  document.querySelector('#postHeader').innerHTML = `
    <img
      class="modal-post__details--user-img"
      src="${postUser.imageUrl}"
      alt="Imagen del usuario">
    <p><b>${postUser.userName}</b></p>
  `;
  document.querySelector('#postDescription').innerHTML = `
    <img
      class="modal-post__details--user-img"
      src="${postUser.imageUrl}"
      alt="Imagen del usuario">
    <p><strong>${postUser.userName}</strong> ${post.description}</p>
  `;
  modalPostLikeIcon.innerHTML = `<img src="${likeIcon}" alt="icono de favorito">`;
  postCommentAmount.innerHTML = post.commentsRef.length
  modalPostLikes.innerText = post.likes;
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

//Realiza el cambio de clave.
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

// Verifica que un grupo de campos no esten nulos
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

// Verifica que las claves coincidan.
const validateCofirmPassword = (inputNewPassword, inputConfirmPassword) => {
  if (inputNewPassword.value !== inputConfirmPassword.value) {
    const error = {
      id: inputConfirmPassword.id + 'Error',
      message: '* La contraseña no coincide.'
    };
    addError(error);
  }
}

// Agrega un error al log de errores.
const addError = (error) => {
  const verified = !errorLog
    .some((er) => er.message === error.message && er.id === error.id);
  if (verified) errorLog.push(error);
}

//Muestra los erroer que tiene el log en la vista.
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

// Busca por nombre de usuario que coincidan con el valor cada vez que el usuario introduce un valor.
const onChangeSearcherInput = () => {
  const inputSearch = document.querySelector('#headerSearchInput');
  inputSearch.addEventListener('input', async (event) => {
    const value = event.target.value;
    if (value) {
      const users = await searchUserByUserNameCoincidences(value);
      appendUserToSearchResult(users);
    }else{
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

// busca los primeros 5 usuarios que inicien con el valor suministrado.
const searchUserByUserNameCoincidences = async (value) => {
  const users = [];
  const userRefs = await firestore.collection(USERS).orderBy('userName')
    .startAt(value).endAt(value + '\uf8ff').limit(5).get();
  userRefs.forEach(userRef => {
    users.push({ id: userRef.id, ...userRef.data() })
  });
  return users;
}

// Agrega un listado de usuarios a la vista de resultados del buscador.
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

// Vuelve a mostrar el valor por defecto del lista de resultados del buscador.
const resetSearchResult = () => {
  const results = document.querySelector('#searcherResults');
  results.innerHTML = '<li>No hay resultados.</li>';
}
