import {User} from './user';

export class Authorize{
    private authorizationDB : { [id: string] : User; } = {};

    getUser(userID:string){
        return this.authorizationDB[userID];
    }

    putUser(userID:string, user:User){
        this.authorizationDB[userID] = user;
    }
    
    findUserByToken(token:string){
        let u:User = null;
        //slow Comparison, need to change in the future
        for (var key in this.authorizationDB) {
            if (this.authorizationDB.hasOwnProperty(key)) {
                var user = this.authorizationDB[key];
                if(user.hasToken(token)){
                    u = user;break;
                }
            }
        }

        return u;
    }

}