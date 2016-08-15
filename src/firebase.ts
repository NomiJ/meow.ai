import * as firebase from 'firebase';
import {config} from './firebase-config';

export class Firebase {
    private app: firebase.app.App;
    private database: firebase.database.Reference;

    constructor(root: string) {
        this.app = firebase.initializeApp(config);
        this.database = this.app.database().ref(root || '/');
    }

    public value() {
        return this.database.once('value').then((snapshot) => {
                console.log(snapshot.val());
                return snapshot.val();
        });
    }
};