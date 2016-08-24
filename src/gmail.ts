const google = require('googleapis'); // tslint:disable-line
const googleAuth = require('google-auth-library'); // tslint:disable-line

import { credentials } from './gmail.config';

export class Client {
    private api: any;
    private oauth2: any;

    constructor(creds?: {string: string}) {
        this.oauth2 = new google.auth.OAuth2(
            credentials.client_id,
            credentials.client_secret,
            credentials.redirect_uris[0]
        );

        if (creds) {
            this.oauth2.setCredentials(creds);
        }

        this.api = google.gmail({
            version: 'v1',
            auth: this.oauth2,
            params: {userId: 'me'}
        });
    }

    public generateAuthUrl(uid: string) {
        return this.oauth2.generateAuthUrl({
            access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
            scope: 'https://www.googleapis.com/auth/gmail.readonly',
            state: uid
        });
    }

    public tokensFromAuthRedirect(code: string) {
        return new Promise<any>((resolve, reject) => {
            this.oauth2.getToken(code, (err: any, tokens: any) => {
                if (err) {
                    reject(new Error(`The oauth2 API returned an error: ${err}`));
                }  else {
                    resolve(tokens);
                }
            });
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
