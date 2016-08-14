'use strict';

// import * as Firebase from 'firebase';
import * as fs from 'fs';
import * as builder from 'botbuilder';
import * as restify from 'restify';
import {Request, Response, Next} from 'restify';

const local = process.env.LOCAL_ENV || false;
console.log('The LOCAL_ENV is ' + local);

if (!local) {
    console.log = () => {};
}

// var myFirebaseRef = new Firebase("https://meow-59086.firebaseio.com/");

// Bot Setup

// Setup Restify Server
let server = restify.createServer();
const content = fs.readFileSync('./sitecontent/html/index.html', {encoding: 'utf-8'});

let web  = {
    sendHtmlResponse: (request: Request, response: Response, next: Next, html: string) => {
        response.setHeader('Content-Type', 'text/html');
        response.writeHead(200);
        response.end(html);
        next();
    },
};

server.get('/authorize', function(request, response, next) {
    web.sendHtmlResponse(request, response, next, content);
});

server.get('/', function respond(request, response, next) {
    const html = 'Hello World';
    web.sendHtmlResponse(request, response, next, html);
});


// Create chat bot
let connector = new builder.ChatConnector({
    appId: local ? process.env.MICROSOFT_APP_ID : 'd8f8c4ab-7087-4af7-91b0-2a60571006c2',
    appPassword: local ? process.env.MICROSOFT_APP_PASSWORD : '9SoJSjMt9fSuGVEcDheCptw',
});

let bot = new builder.UniversalBot(connector);

server.get('/', function respond(req, res, next) {
    res.send('Hello World!');
});

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

let logger = {
    log: function(args: any) {
        console.log(args);
        console.log('--------------------');
    },
};

let authorizationDB: any = {};

dialog.onDefault(builder.DialogAction.send("Hold your horses, I'm being developed ;) ")); // tslint:disable-line

dialog.matches('checkEmail', [
    function (session, args, next) {
        logger.log(session.message);
        const address = session.message.address.channelId;
        authorizationDB[address] = ((!authorizationDB[address]) || 1) ? 0 : 1;

        // check in authorization DB
        if (authorizationDB[address] === 1) {
            session.send('Checking .... ');

        } else {
            // var img = new builder.CardImage.create(session, "./img/authorize.jpg");
            // img.tap(builder.CardAction.openUrl(session, "www.systematicbytes.com"));

            let card = new builder.SigninCard(session);
            card.text('You need to authorize me');
            card.button('Connect', 'https://sb.com');

            let msg = new builder.Message(session);

            msg.textFormat(builder.TextFormat.xml);
            msg.attachments([card]);

            logger.log(card);
            session.send(msg);
        }
  },
]);


server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});
