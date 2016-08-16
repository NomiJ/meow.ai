import { it } from 'jasmine-await';
import { expect } from 'chai';
import { Firebase } from './firebase';


describe('Firebase', () => {
    it('should have a value', async () => {
        let fb = new Firebase('/token');
        let value = await fb.value();

        expect(value).to.eq('object');
    });
});
