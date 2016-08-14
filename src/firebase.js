var firebase = require('firebase');
var config = require('./firebase-config');

var fb = {

	init:function(root){

		fb.myFirebaseRef =  firebase.initializeApp(config);
		fb.fbDatabaseRef= fb.myFirebaseRef.database().ref(root || '/');
		
	},

	value:function(){
		return fb.fbDatabaseRef.once('value').then(function(snapshot) {
        	    console.log(snapshot.val());
            	return snapshot.val();
        });		
	}

}
module.exports = fb;