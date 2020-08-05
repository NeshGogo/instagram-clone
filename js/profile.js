import { firestore, auth, storage } from '../services/firebase.js';
import firebase from '../services/firebase.js';
import { User } from '../models/user.js';
import { Post } from '../models/post.js';
import { Comment } from '../models/comment.js';


const USERS = 'users';
const POSTS = 'posts';
const COMMENTS = 'comments';
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
const btnAddPost = document.querySelector('#addPost');

// HtmlElements del modal de edicion de perfil
const inputUserName = document.querySelector('#inputUserName');
const inputFullName = document.querySelector('#inputFullName');
const inputBiography = document.querySelector('#inputBiography');
const inputUserImageFile = document.querySelector('#inputUserImageFile');
const btnUpdateUser = document.querySelector('#btnUpdateUser');

// HtmlElements del modal de agregar post
const btnCreatePost = document.querySelector('#btnCreatePost');

//HtmlElements del modal de open post
const openPost = document.getElementById('open-post');
const postImg = document.querySelector('#postImg');
const postHeader = document.querySelector('#postHeader');
const postDescription = document.querySelector('#postDescription');
const postCommentList = document.querySelector('#postCommentList');
const postFooter = document.querySelector('#postFooter');
const sentComment = document.querySelector('#sentComment');

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

firestore.collection(POSTS)
  .orderBy('date', 'desc')
  .onSnapshot(querySnapShot => {
    const postList = document.querySelector('#post__list');
    postList.innerHTML = '';
    querySnapShot.forEach(postDoc => {
      const post = { id: postDoc.id, ...postDoc.data() };
      if (post.userRef === currentUserId) {
        postList.innerHTML += `
          <div class="col-xs-12 
            col-sm-8
            col-md-6
            col-lg-4">
                <div class=" post box ">
                  <a id="${post.id}">
                    <img src="${post.imageUrl}" alt="Image de una plicacion" />
                  </a>
                </div>
          </div>
        `;
        setTimeout(() => {
          document.getElementById(post.id).onclick = () => showPost(post);
        }, 0);
      }
    })
  });

const init = (user) => {
  if (user.imageUrl !== '') {
    headerUserImage.src = user.imageUrl;
    userImage.src = user.imageUrl;
  }
  headerUserFullname.innerText = user.fullName;
  userName.innerText = user.userName;
  userFullname.innerText = user.fullName;
  postCount.innerText = user.post;
  userBiography.innerText = user.biography || '';
  userApp = new User(
    user.email,
    user.userName,
    user.fullName,
    user.imageUrl,
    user.biography,
    user.post,
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
    if (userApp.imageUrl === '') {
      storageRef.getDownloadURL().then(url => {
        userApp.imageUrl = url;
        firestore.collection(USERS).doc(currentUserId).set({ ...userApp }, { merge: true });
      });
    } else {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } else {
    await firestore.collection(USERS).doc(currentUserId).set({ ...userApp });
  }
  document.getElementById('close-edit').onclick();
}

btnAddPost.onclick = () => {
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

btnCreatePost.onclick = async () => {
  const inputPostFile = document.querySelector('#inputPostFile');
  const inputPostDescription = document.querySelector('#inputPostDescription');
  const file = inputPostFile.files[0];
  if (file) {
    try {
      const storageRef = storage.ref(`${currentUserId}/posts/${Date.now()}-${file.name}`)
      await storageRef.put(file);
      let url = await storageRef.getDownloadURL();
      const post = new Post(currentUserId, inputPostDescription.value, url);
      await firestore.collection(POSTS).add({ ...post });
      userApp.post += 1;
      await firestore.collection(USERS).doc(currentUserId)
      .update({post: userApp.post});
    } catch (error) {
      console.log(error);
    }
  }
  document.getElementById('close-addPost').onclick();
}

const showPost = (post) => {
  const postCommentAmount =  document.querySelector('#postCommentAmount');
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
  postFooter.innerHTML = `
    <p>${post.likes.length} likes</p>
  `;
  getPostComments(post.id);
  sentComment.onclick = () => addPostComment(post.id);
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
  postFooter.innerHTML = '';
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
      debugger;
      postCommentList.innerHTML = '';
      querySnapshots.forEach(docRef => {
        appendComment(docRef.data());
      });
    });

}
const appendComment = (comment) => {
  firestore.collection(USERS).doc(comment.userRef).get().then(userRef => {
    const user = userRef.data();
    postCommentList.innerHTML += `
      <div>
        <img
        class="modal-post__details--user-img"
        src="${user.imageUrl}"
        alt="Imagen del usuario">
        <p><strong>${user.userName}</strong> ${comment.description}</p>
      </div>
    `;
  });

}
const addPostComment = async (postId) => {
  const inputComment = document.querySelector('#inputComment');
  if (inputComment.value !== '') {
    try {
      const comment = new Comment(currentUserId, inputComment.value, postId)
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