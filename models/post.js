import { Publication } from "./publication.js";

export class  Post extends Publication{
  constructor(userRef, description, imageUrl, likes = [], commentsRef = []) {
    super(userRef, description);
    this.imageUrl = imageUrl;
    this.likes = likes;
    this.commentsRef = commentsRef;
  }
  getLikesCount(){
    return this.likes.length;
  }
  getCommentsCount(){
    return this.commentsRef.length;
  }
}