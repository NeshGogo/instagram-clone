import { User } from "../models/user";
import { environment } from "../env/environment";
let Firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");




export class AuthService {

    private static instance: AuthService = new AuthService();
    private currentUser: User;
    private firebase: any;
    
    private constructor() {
        this.firebase = Firebase.initializeApp(environment.firebaseConfig);
    }

    static getInstance(): AuthService{
        return this.instance;
    }
    getCurrentUser(): User | undefined{
        return this.currentUser;
    }

    addUser(user:User, password:string): boolean{
        return true;
    }

    singIn(email: string, password: string): boolean{
        return true;
    }

    singOut(): void{

    }
}