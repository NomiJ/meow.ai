'use strict';

import * as builder from 'botbuilder';
import * as restify from 'restify';
import {Firebase} from './firebase';
import {logger} from './logger';
import { generate_token } from './utils';
import * as gmail from './gmail';
import { Luis,AppCredential } from './app.config';


const local = process.env.LOCAL_ENV || false;

let l = new logger();
if (!local) {
    l.log = () => { };
}

let fb = new Firebase(null);

// Bot Setup

// Setup Restify Server
let server = restify.createServer();


server.use(restify.queryParser());
server.use(restify.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});


server.get('/', function respond(request, response, next) {
    response.send('Hello World');
    next();
});


server.get('/__/auth/handler', async function (request, response, next) {
    
    const query = request.params;

    if(query.state)
    {

        let uid = query.state
        let code = query.code

        let client = new gmail.Client();
        const tokens = await client.tokensFromAuthRedirect(code);
        await fb.setCredentials(uid, tokens);
        response.send("<b>Thanks you can close this page now</b>")

    }
    else{
        response.send("<b>We are so not able to authenticate you</b>")
        
    }

    next();
});


// Create chat bot
let connector = new builder.ChatConnector({
    appId: local ? process.env.MICROSOFT_APP_ID : AppCredential.app_id,
    appPassword: local ? process.env.MICROSOFT_APP_PASSWORD : AppCredential.app_pass,
});

let bot = new builder.UniversalBot(connector);


server.post('/api/messages', connector.listen());

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot
const model = `${Luis.url}?id=${Luis.id}&subscription-key=${Luis.key}`;
let recognizer = new builder.LuisRecognizer(model);
let dialog = new builder.IntentDialog({ recognizers: [recognizer] });


// Bots Dialogs

bot.dialog('/', dialog);

dialog.onDefault(builder.DialogAction.send("Hey There, I'm being developed ;) "));


async function checkMail(session: builder.Session) {
    try {
        console.log(session.message);
        const maxNumber = 3;
        const uid = generate_token([session.message.user.name, session.message.user.id]);
        let credentials = await fb.value(uid);

        let msg = new builder.Message(session);
        let mail = new gmail.Client(credentials);

        // TODO: credentials can be invalid and still "true"
        if (credentials) {
            let messages = await mail.list(maxNumber);

            let cards: builder.HeroCard[] = [];

            for (let message of messages) {
                
                let action = builder.CardAction.openUrl(session, "mail.google.com")
                
                let img = builder.CardImage.create(session, "https://bot-framework.azureedge.net/bot-icons-v1/bot-framework-default-10.png");
                img.tap(action);
                
                let card = new builder.HeroCard(session);
                console.log(message)
                
                card.title(message.subject)
                card.subtitle("<i>" + message.from + "</i> | " + message.date)
                card.text(message.snippet)
                card.images([img]);

                cards.push(card)
                
                
            }
            msg.attachmentLayout("carousel")
            msg.attachments(cards);
        } else {
            const url = mail.generateAuthUrl(uid);
            console.log(url)
            msg.textFormat(builder.TextFormat.xml);
            msg.attachments([ 
                new builder.SigninCard(session) 
                    .text("You need to authorize me'") 
                    .button("signin", url) 
            ]); 
        }

        session.send(msg);
    } catch (err) {
        console.error(err);
    }
}

dialog.matches('checkEmail', [checkMail]);
