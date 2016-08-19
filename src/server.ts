'use strict';

import * as fs from 'fs';
import {Firebase} from './firebase';
import {logger} from './logger';
import { FirebaseTokenGen } from './firebase-token';
import {User} from './user';
import * as Path from 'path'
import * as express from 'express';  
import { handlebars } from 'consolidate';  
import { Router } from 'vio';

let authDB = new Firebase(null);
const local = process.env.LOCAL_ENV || false;

var l = new logger();
if (!local) {
    l.log = () => {};
}

let app=express();


app.engine('hbs', handlebars);
app.use('/static', express.static(Path.join(__dirname, '../static')));

let router = new Router(app as any, {
    routesRoot: Path.join(__dirname, 'routes'),
    viewsRoot: Path.join(__dirname, '../../views'),
    viewsExtension: '.hbs'
});


app.listen(process.env.port || process.env.PORT || 8080,  () => {
   console.log(`Listening on port ${app.name}...`);
});



