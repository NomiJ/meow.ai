export class User{

	private _authorize:Boolean= false;

	constructor(private address:string, private user:string, private token:String){
	}

    hasToken(tok:string){
        return tok == this.token;
    }

    getToken(){
        return this.token;
    }

    getName(){
        return JSON.parse(this.user).name;
    }

	getaddress():Object {
        return this.address;
    }

    get authorize():Boolean {
        return this._authorize;
    }

    set authorize(auth:Boolean) {
         this._authorize=auth;
    }
}