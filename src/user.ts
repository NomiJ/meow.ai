export class User{

	private _authorize:Boolean= false;
    private _oAuthToken:String = '';
	constructor(private address:string, private user:string, private token:String){
	}

    hasToken(tok:string){
        return tok == this.token;
    }

    gettoken(){
        return this.token;
    }

    getname(){
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

    get oauth_token():String {
        return this._oAuthToken;
    }

    set oauth_token(auth:String) {
         this._oAuthToken=auth;
    }
}