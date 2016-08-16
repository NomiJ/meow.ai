import { Controller, Request, get } from 'vio';
import {Authorize} from '../authorize'

export default class extends Controller {
    // http://localhost:1337/authorize/token/XXXXX
    @get({
        path: 'token/:param?'
    })
    authorize(req: Request<any>) {
        let authDB = new Authorize();
        if (authDB.getUser(req.params['param'])) {
            let user = authDB.findUserByToken(req.params['param']);

            return {
                title: 'Meow.Authorize!',
                text: 'Hello ' + user.getName(),
                param: req.params['param'] || 'empty'
            };
        }

    }

}