const google = require('googleapis'); // tslint:disable-line
const googleAuth = require('google-auth-library'); // tslint:disable-line

import { credentials } from './gmail.config';

export class Client {
    private api: any;

    constructor(token: string) {
        let auth = new googleAuth();
        let oauth2 = new auth.OAuth2(
            credentials.client_id,
            credentials.client_secret,
            credentials.redirect_uris[0]
        );

        oauth2.credentials = {access_token: token};

        this.api = google.gmail({
            version: 'v1',
            auth: oauth2,
            params: {userId: 'me'}
        });
    }

    public async list(n=10) {
        let request = await this.gmail('users.messages.list', {maxResults: n});
        let messages: any[] = [];

        for (let message of request.messages) {
            messages.push(await this.getMessage(message.id));
        }

        return messages;
    }

    public async getMessage(id: string) {
        let msg = await this.gmail('users.messages.get', {
            id: id,
            format: 'metadata',
            fields: 'payload/headers,snippet',
            metadataHeaders: ['Date', 'From', 'To', 'Subject']
        });

        for (const header of msg.payload.headers) {
            msg[header.name.toLowerCase()] = header.value;
        }

        return msg;
    }

    public gmail(path: string, options: any = {}) {
        let api = this.api;
        for (const key of path.split('.')) {
            api = api[key];
        }

        return new Promise<any>((resolve, reject) => {
            api(options, (err: any, response: any) => {
                if (err) {
                    reject(new Error(`The API returned an error: ${err}`));
                } else {
                    resolve(response);
                }
            });
        });
    }
}
