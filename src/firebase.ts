import * as firebase from 'firebase';
import {config} from './firebase-config';
import {User} from './user';

export class Firebase {
    private app: firebase.app.App;
    private database: firebase.database.Reference;

    constructor(root: string) {
        this.app = firebase.initializeApp(config);
        this.database = this.app.database().ref(root || '/users');
    }

    public save(userID: string, user: User) {
        this.database.child(userID).set(user)
    }

    public async exists(userID: string) {
        return (this.database.child(userID))
    }

    public async invite(userID: string) {
        await this.database.child(userID).set({accessToken: ''});
    }

    public async value(userID: string) {
        try {
            let snap = await this.database.child(userID).once('value');
            return snap.val();
        } catch (err) {
            console.error(err);
        }
    }

    public async find(token: string) {
        let u: User = null;
        let snap = await this.database.orderByChild('token')
            .startAt(token)
            .endAt(token)
            .once('value', function (snap) {
                u = snap.val()
            });

        return u;
    }
};
