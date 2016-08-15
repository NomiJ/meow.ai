export class User{

	private _authorize:Boolean= false;

	constructor(private address:Object, public token:String){

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