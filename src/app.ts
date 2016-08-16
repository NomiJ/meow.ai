'use strict';

import * as fs from 'fs';
import * as builder from 'botbuilder';
import * as restify from 'restify';
import {Firebase} from './firebase';
import {User} from './user';
import {logger} from './logger';
import { FirebaseTokenGen } from './firebase-token';
import {Authorize} from './authorize'
import {Request, Response, Next} from 'restify';

const local = process.env.LOCAL_ENV || false;

var l = new logger();
if (!local) {
    l.log = () => {};
}


// Bot Setup

// Setup Restify Server
let server = restify.createServer();


server.use(restify.bodyParser());
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

server.get('/', function respond(request, response, next) {
   response.send('Hello World');
   next();
});


// Create chat bot
let connector = new builder.ChatConnector({
    appId: local ? process.env.MICROSOFT_APP_ID : 'd8f8c4ab-7087-4af7-91b0-2a60571006c2',
    appPassword: local ? process.env.MICROSOFT_APP_PASSWORD : '9SoJSjMt9fSuGVEcDheCptw',
});

let bot = new builder.UniversalBot(connector);


server.post('/api/messages', connector.listen());

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
const luis = {
    id: '001644e2-8254-45af-9d7e-a42416bb61fd',
    key: '2b826a013e3b4ddcac6330141e188d35',
    url: 'https://api.projectoxford.ai/luis/v1/application',
};
const model = `${luis.url}?id=${luis.id}&subscription-key=${luis.key}`;
let recognizer = new builder.LuisRecognizer(model);
let dialog = new builder.IntentDialog({ recognizers: [recognizer] });


// Bots Dialogs
/*
    var intents = new builder.IntentDialog();
    bot.dialog('/', intents);
*/

bot.dialog('/', dialog);

let authorize:Authorize = new Authorize();

dialog.onDefault(builder.DialogAction.send("Hold your horses, I'm being developed ;) "));

dialog.matches('checkEmail', [
    function (session, args, next) {


        l.log(session.message);
        const userID = session.message.user.id;
        let u:User = authorize.getUser(userID)

        if(!u){
           u = new User(JSON.stringify(session.message.address), JSON.stringify(session.message.user), new FirebaseTokenGen().generateToken(userID));
           authorize.putUser(userID,u)
        }

        // check in authorization DB
        if (u.authorize) {

        } else {
        
            let card = new builder.SigninCard(session);
            card.text('You need to authorize me');
            let url = (server.url + "/authorize/" + u.getToken());
            card.button("Connect",url)

            let msg = new builder.Message(session);

            msg.textFormat(builder.TextFormat.xml);
            msg.attachments([card]);

            l.log(card);
            session.send(msg);
        }
  },
]);
