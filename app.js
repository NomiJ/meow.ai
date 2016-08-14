"use strict";
/* jshint node: true */

//var Firebase = require("firebase");
var builder = require('botbuilder');
var restify = require('restify');
var fs = require('fs');

//var myFirebaseRef = new Firebase("https://meow-59086.firebaseio.com/");

var local = process.env.LOCAL_ENV || false;
console.log('The LOCAL_ENV is ' + local);

if(!local){
	console.log = function() {}
}
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server

var server = restify.createServer({
	formatters: {

		'text/html': function(req, res, body){
			return body;
		}
	}
});


var content;
fs.readFile('./sitecontent/html/index.html',  function (err, html) {
	if (err) {
		loger.log(err)
		throw err;

	}
	content = html;
	 
});



server
.use(restify.fullResponse())
.use(restify.bodyParser())

var web = {
	sendHtmlResponse:function(request, response, next, html){
		response.writeHeader(200, {"Content-Type": "text/html", 'Content-Length': Buffer.byteLength(html)}); 
		loger.log(html)
		response.write(html);  
		next();
	}
}

server.get('/authorize', function(request, response, next) {  
		web.sendHtmlResponse(request, response, next,content)

});


server.get('/', function respond(request, response, next) {
	var html = "Hello World";
	web.sendHtmlResponse(request, response, next, html)

});


// Create chat bot
var connector = new builder.ChatConnector({
	appId: local ? process.env.MICROSOFT_APP_ID : 'd8f8c4ab-7087-4af7-91b0-2a60571006c2',
	appPassword: local ? process.env.MICROSOFT_APP_PASSWORD : '9SoJSjMt9fSuGVEcDheCptw'
});

var bot = new builder.UniversalBot(connector);



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
	log:function(){
		console.log.apply(console, arguments);
		console.log("--------------------");
	}
}

var authorizationDB={};

dialog.onDefault(builder.DialogAction.send("Hold your horses, I'm being developed ;) "));


dialog.matches('checkEmail', [
	function (session, args, next) {

		loger.log(session.message)
		authorizationDB[address] = ((!authorizationDB[address]) || 1) ? 0 : 1;
		var address = session.message.address || session.message.from.address;

	//check in authorization DB
	if(authorizationDB[address] == 1)
	{
		session.send("Checking .... ");

	}else
	{
		
		var card = new builder.SigninCard(session);
		card.text("You need to authorize me");
		card.button( "Connect",server.url + "/authorize");
		
		var msg = new builder.Message(session)
		
		msg.textFormat(builder.TextFormat.json)
		msg.attachments([card]);

		loger.log(card)
		session.send(msg);
		


	}

	
},

]);

server.listen(process.env.port || process.env.PORT || 3978,  function () {
	loger.log('%s listening to %s', server.name, server.url); 
});


