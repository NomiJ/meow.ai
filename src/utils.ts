import { createHash } from 'crypto';


export function generate_token(data: any) {
    let sha1 = createHash('sha256');
    sha1.update(JSON.stringify(data));
    return sha1.digest('base64').replace(/[\+\/\=]+/g, '');
}
