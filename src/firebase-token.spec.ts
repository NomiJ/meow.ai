import { FirebaseTokenGen } from './firebase-token';

describe('FirebaseTokenGen', () => {
	it('should generate token name', () => {
		let fbTokenGen = new FirebaseTokenGen();
		let token = fbTokenGen.generateToken("nomi")

		expect(token).not.toEqual('');
	});
});