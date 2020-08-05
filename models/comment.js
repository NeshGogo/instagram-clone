import { Publication } from "./publication.js";

export class Comment extends Publication{
  constructor(userRef,description, postRef) {
    super(userRef, description);
    this.postRef = postRef;
  }
}