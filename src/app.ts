'use strict';

import * as fs from 'fs';
import * as builder from 'botbuilder';
import * as restify from 'restify';
import {Firebase} from './firebase';
import {User} from './user';
import {logger} from './logger';
import { generate_token } from './utils';
import {Request, Response, Next} from 'restify';

const local = process.env.LOCAL_ENV || false;

let l = new logger();
if (!local) {
    l.log = () => { };
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

bot.dialog('/', dialog);

let fb = new Firebase(null);
dialog.onDefault(builder.DialogAction.send("Hold your horses, I'm being developed ;) "));


async function checkMail(session: builder.Session) {
    // const userID = session.message.user.name + session.message.user.id;
    const uid = generate_token([session.message.user.name, session.message.user.id]);
    console.log(session.message);

    let accessToken = await fb.value(`${uid}/accessToken`);

    if (accessToken) {
        //  Call Meow Api to get email
        return;
    }

    let card = new builder.HeroCard(session);
    card.text(`You need to<a href="${server.url}/authorize?id=${uid}">authorize me</a>`);

    let msg = new builder.Message(session);

    msg.textFormat(builder.TextFormat.xml);
    msg.text('');
    msg.attachments([card]);

    console.log('session send');
    session.send(msg);
}

dialog.matches('checkEmail', [checkMail]);
