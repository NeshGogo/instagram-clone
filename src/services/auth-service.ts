import { User } from "../models/user";

export class AuthService {
    private static instance: AuthService = new AuthService();
    private currentUser: User;

    private constructor() {}

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