"use strict";
/* jshint node: true */



var finance = require('./src/finance.js');
var countrycodes = require('./src/countrycode.js');
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
// Setup some https server options

var https_options = {
        key: fs.readFileSync('./server.key'), //on current folder
        certificate: fs.readFileSync('./server.crt')
};

    
var server = restify.createServer(/*https_options*/);


server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: local ? process.env.MICROSOFT_APP_ID : '23aacee8-e598-43d3-a422-7b069b2b0c61',
    appPassword: local ? process.env.MICROSOFT_APP_PASSWORD : 'UJzbCZ3senXMBqBtoFZb9Ri'
});

var bot = new builder.UniversalBot(connector);


server.get('/', function respond(req, res, next) {
            res.send('Hello World!');
        });

server.post('/api/messages', connector.listen());

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://api.projectoxford.ai/luis/v1/application?id=a6d98e70-c646-4bbe-93d1-f9082e0ed29b&subscription-key=2b826a013e3b4ddcac6330141e188d35';
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
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. Get Currency Codes from here https://developers.google.com/adwords/api/docs/appendix/currencycodes"));

var loger = {
	log:function(args){
	console.log(args);
	console.log("--------------------");
	}
}

dialog.matches('rate', [
function (session, args, next) {

	var counteriesSchema = builder.EntityRecognizer.findEntity(args.entities, 'countryCode') ;
	var currfrom;
	var currto;
	var curr =1;
	loger.log(args);

	if(counteriesSchema)
	{

		var counteries = builder.EntityRecognizer.findAllEntities(args.entities, 'countryCode');

		loger.log(counteries)

		if(counteries.length == 2)
		{
			currfrom = counteries[0].entity;
			currto= counteries[1].entity;
			

			loger.log(currfrom);
			loger.log(currto);
		
			if(countrycodes.allexists([currfrom,currto])){
				var input = currfrom.toUpperCase()+currto.toUpperCase();
				
		        finance.getrate(input)
	            .then(function(data) {
	            	var res = (curr * data[0].Rate);
	               
	                if(!local){

		                 var img = builder.CardImage.create(session, "https://bot-framework.azureedge.net/bot-icons-v1/bot-framework-default-10.png");
		                 img.tap(builder.CardAction.openUrl(session, "www.systematicbytes.com"));
		            
		                 var card = new builder.HeroCard(session)
		                 card.title("Exchange Rates")
		                 card.subtitle("For :" + data[0].id)
		                 card.text("<b> Result :"+ res +"</b>.")
		                 card.images([img]);
		                
		                 var msg = new builder.Message(session)
		                 msg.textFormat(builder.TextFormat.xml)
		                 msg.attachments([card]);

		                 session.send(msg);

		             }else
	    	         {
	        	      	loger.log(res);
						session.send(res);
	             	}

	            })
        	}
		}
	}else
		session.send("Oops.. kindly check your Currency Code")
	
  },

]);

dialog.matches('changename', [
function (session, args, next) {

	var name = builder.EntityRecognizer.findEntity(args.entities, 'name') ? builder.EntityRecognizer.findEntity(args.entities, 'name').entity : '';
	
	if(name == ''){
		name = "Johnny"
	}

	session.userData.name = name;

	var str = "Yo %s";
    session.send(str, session.userData.name);

  },

]);



