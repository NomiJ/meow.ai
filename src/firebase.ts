import * as firebase from 'firebase';
import {config} from './firebase-config';


export class Firebase {
    private app: firebase.app.App;
    private database: firebase.database.Reference;

    constructor(root: string) {
        this.app = firebase.initializeApp(config);
        this.database = this.app.database().ref(root || '/');
    }

    public async value() {
        try {
            let snapshot = await this.database.once('value');
            return snapshot.val();
        } catch (err) {
            throw err;
        }
    }

    public save(_obj:any){
        this.database.push(_obj)
    }
};
