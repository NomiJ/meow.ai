import {Firebase} from './firebase';

describe('Firebase', () => {
	it('should have a value', () => {
		let fb = new Firebase('/token');
		fb.value().then((val) => {
			expect(token).toEqual('Object');
		}).catch((err) => {logger.log(err)});

		
	});
});