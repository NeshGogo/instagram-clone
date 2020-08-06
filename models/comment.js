import { Publication } from "./publication.js";

export class Comment extends Publication{
  constructor(userRef,userName,description, postRef) {
    super(userRef, userName,description);
    this.postRef = postRef;
  }
}