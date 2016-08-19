import { Controller, Request, get } from 'vio';
import {Firebase} from '../firebase'

export default class extends Controller {
    // http://localhost:1337/authorize/token/XXXXX
    @get({
        path: 'token/:param?'
    })
    authorize(req: Request<any>) {
        let authDB = new Firebase(null);
        if (authDB.exists(req.params['param'])) {
            authDB.find(req.params['param']).then((user)=>{
                
            return {
                title: 'Meow.Authorize!',
                text: 'Hello ' + user.getname(),
                token: req.params['param'] || 'empty'
            };
            }).catch((err)=>{
                return {
                title: 'Sorry!',
                text: 'We are having technical troubles',
                token: err || 'empty'
            };
            })

        }
        return {
                title: 'Sorry!',
                text: 'We are unable to find you in our systems',
                token: req.params['param'] || 'empty'
            };
    }

}