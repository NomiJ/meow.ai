"use strict";
/* jshint node: true */


var builder = require('botbuilder');
var restify = require('restify');
var fs = require('fs');

var local = process.env.LOCAL_ENV || false;
console.log('The LOCAL_ENV is ' + local);

if(!local){
	console.log = function() {}
}
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server

var server = restify.createServer();


server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: local ? process.env.MICROSOFT_APP_ID : 'd8f8c4ab-7087-4af7-91b0-2a60571006c2',
    appPassword: local ? process.env.MICROSOFT_APP_PASSWORD : '9SoJSjMt9fSuGVEcDheCptw'
});

var bot = new builder.UniversalBot(connector);


server.get('/', function respond(req, res, next) {
            res.send('Hello World!');
        });

server.post('/api/messages', connector.listen());

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://api.projectoxford.ai/luis/v1/application?id=001644e2-8254-45af-9d7e-a42416bb61fd&subscription-key=2b826a013e3b4ddcac6330141e188d35';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

//=========================================================
// Bots Dialogs
//=========================================================
/*
var intents = new builder.IntentDialog();
bot.dialog('/', intents);
*/
bot.dialog('/', dialog);

var loger = {
	log:function(args){
	console.log(args);
	console.log("--------------------");
	}
}

var authorizationDB={};

dialog.onDefault(builder.DialogAction.send("Hold your horses, I'm being developed ;) "));


dialog.matches('checkEmail', [
function (session, args, next) {

	loger.log(session.message)

	var address = session.message.address || session.message.from.address;

	//check in authorization DB
	if(authorizationDB[address] == 1)
	{
		session.send("Checking .... ");
	
	}else
	{
		var card = new builder.SigninCard(session);
		card.button({title:['Connect','Paste the code that you get after authorization'], url:'https://github.com'});

		var msg = new builder.Message(session)
		
		msg.textFormat(builder.TextFormat.xml)
		msg.attachments([card]);

		session.send(msg);
		authorizationDB[address] = 1;


	}

	
  },

]);



