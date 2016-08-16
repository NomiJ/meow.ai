'use strict';

import * as fs from 'fs';
import {Firebase} from './firebase';
import {logger} from './logger';
import { FirebaseTokenGen } from './firebase-token';
import {Authorize} from './authorize'
import {User} from './user';
import * as Path from 'path'
import * as express from 'express';  
import { handlebars } from 'consolidate';  
import { Router } from 'vio';

let authDB = new Authorize();
const local = process.env.LOCAL_ENV || false;

var l = new logger();
if (!local) {
    l.log = () => {};
}

let app=express();


app.engine('hbs', handlebars);
app.use('/static', express.static(Path.join(__dirname, '../static')));

let router = new Router(app, {
    routesRoot: Path.join(__dirname, 'routes'),
    viewsRoot: Path.join(__dirname, '../views'),
    viewsExtension: '.hbs'
});

/*

const content = fs.readFileSync('./sitecontent/html/index.html', {encoding: 'utf-8'});
app.get('/authorize/:token', (req:Request, res:Response) => {

      var token = req.param('token');

    if(authDB.getUser(token)){
        let user = authDB.findUserByToken(token);
        res.status(200)
        res.send('Hello ' + user.getName())        
    }
    else {
        res.status(500)
        res.send('Your Token might have expired, Kindly try again.')
    }
});
*/

app.listen(process.env.port || process.env.PORT || 8080,  () => {
   console.log(`Listening on port ${app.name}...`);
});



