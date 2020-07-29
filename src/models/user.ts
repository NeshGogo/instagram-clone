export class User {
    constructor(
        public id?: string,
        public email?: string, 
        public userName?: string,
        public displayName?: string,
        public imageUrl?: string,
        public biography?: string,
        public publishingsRef?: string[],
    ) { }

    getPostCount(): number{
        return this.publishingsRef?.length || 0;
    }
}