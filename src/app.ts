'use strict';

import * as builder from 'botbuilder';
import * as restify from 'restify';
import {Firebase} from './firebase';
import {logger} from './logger';
import { generate_token } from './utils';
import * as gmail from './gmail';

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
    try {
        console.log(session.message);
        const uid = generate_token([session.message.user.name, session.message.user.id]);
        let accessToken = await fb.value(`${uid}/accessToken`);

        let msg = new builder.Message(session);

        if (accessToken) {
            let client = new gmail.Client(accessToken);
            let messages = await client.list();

            let text: string[] = [];

            for (let message of messages) {
                text.push(message.subject);
            }

            msg.text(text.join('n'));
        } else {
            await fb.invite(uid);

            let card = new builder.HeroCard(session);
            const host = 'https://meowcoder.github.io/page/';
            card.text(`You need to<a href="${host}?id=${uid}">authorize me</a>`);

            msg.textFormat(builder.TextFormat.xml);
            msg.text('');
            msg.attachments([card]);
        }

        session.send(msg);
    } catch (err) {
        console.error(err);
    }
}

dialog.matches('checkEmail', [checkMail]);
