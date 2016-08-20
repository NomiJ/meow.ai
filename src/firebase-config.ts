import * as path from 'path';


export const config = {
    apiKey: 'AIzaSyBhgvYzhzEpDrI2Uy4mj10VHd6I9Arze88',
    authDomain: 'meow-59086.firebaseapp.com',
    databaseURL: 'https://meow-59086.firebaseio.com',
    storageBucket: 'meow-59086.appspot.com',
    serviceAccount: path.resolve(__dirname, '..', 'config', 'firebase.credentials.json'),
    databaseAuthVariableOverride: {
        uid: 'service-worker'
    }
};
