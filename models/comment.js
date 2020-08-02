import { Publication } from "./publication";

export class Comment extends Publication{
  constructor(userRef,description) {
    super(userRef, description);
  }
}