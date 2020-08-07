
export  class User {
  constructor(
    email,
    userName,
    fullName,
    imageUrl = './assets/img/user-account.png',
    imageStorageRef = '',
    biography = '',
    post = 0) {
    this.email = email;
    this.userName = userName;
    this.fullName = fullName;
    this.imageUrl = imageUrl;
    this.biography = biography;
    this.post = post;
    this.imageStorageRef = imageStorageRef;
  }
}
