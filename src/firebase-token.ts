import FirebaseTokenGenerator = require('firebase-token-generator');

import {config} from './firebase-config';


export class FirebaseTokenGen {
  
    private tokenGenerator : FirebaseTokenGenerator;

    constructor() {
        this.tokenGenerator = new FirebaseTokenGenerator(config.apiKey)
    }

    generateToken(uid:string){
        return this.tokenGenerator.createToken({'uid': uid});
    }

    
};
