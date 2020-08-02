
export class Publication {
  constructor(
    userRef,
    description ='',
  ) {
    this.description = description;
    this.userRef = userRef;
    this.date = new Date();
  }
}