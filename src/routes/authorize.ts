import { Controller, Request, get } from 'vio';

export default class extends Controller {
    // http://localhost:1337/authorize/token/XXXXX
    @get({
        path: 'token/:param?'
    })
    authorize(req: Request<any>) {
        return {
            title: 'Hello, World!',
            text: 'hello! thank you! thank you very much!',
            param: req.params['token'] || 'empty'
        };
    }
}