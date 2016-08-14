"use strict";
/* jshint node: true */

var builder = require('botbuilder');
var restify = require('restify');
var fb = require('./src/firebase');

var fs = require('fs');

var local = process.env.LOCAL_ENV || false;
console.log('The LOCAL_ENV is ' + local);

if(!local){
	console.log = function() {}
}

var loger = {
	log:function(){
		console.log.apply(console, arguments);
		console.log("--------------------");
	}
}
fb.init('/token')
fb.value().then(function(val){
	
	logger.log(val)

})

 

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server

var server = restify.createServer();


var content =fs.readFileSync('./sitecontent/html/index.html',{encoding: 'utf-8'});



var web = {
	sendHtmlResponse:function(request, response, next, html){
		response.setHeader('Content-Type', 'text/html');
        response.writeHead(200);
        response.end(html);
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


