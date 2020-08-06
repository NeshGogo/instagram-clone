
export class Publication {
  constructor(
    userRef,
    userName,
    description ='',
  ) {
    this.description = description;
    this.userRef = userRef;
    this.date = new Date();
    this.userName = userName;
  }
}