import { Publication } from "./publication.js";

export class Comment extends Publication{
  constructor(userRef,description) {
    super(userRef, description);
  }
}