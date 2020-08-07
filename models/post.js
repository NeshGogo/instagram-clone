import { Publication } from "./publication.js";

export class  Post extends Publication{
  constructor(userRef, userName, description, imageUrl, imageStorageRef, likes = 0, commentsRef = [], likesRef = []) {
    super(userRef, userName,description);
    this.imageUrl = imageUrl;
    this.likes = likes;
    this.commentsRef = commentsRef;
    this.likesRef = likesRef;
    this.imageStorageRef = imageStorageRef;
  }
}