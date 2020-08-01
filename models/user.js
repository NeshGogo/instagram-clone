
export  class User {
  constructor(
    email,
    userName,
    fullName,
    imageUrl = '',
    biography = '') {
    this.email = email;
    this.userName = userName;
    this.fullName = fullName;
    this.imageUrl = imageUrl;
    this.biography = biography;
  }
}
