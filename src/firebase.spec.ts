import { it } from 'jasmine-await';
import { expect } from 'chai';
import { Firebase } from './firebase';


describe('Firebase', () => {
    it('should have a value', () => {
        let fb = new Firebase(null);
        /*fb.value().then(()=>{
            expect(value).to.eq('object');
        })*/
    });
});
