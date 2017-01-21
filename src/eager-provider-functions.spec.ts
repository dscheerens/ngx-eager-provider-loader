import { eagerProviderRegistration } from './eager-provider-functions';

describe('eager provider registration functions', () => {

    describe('eagerProviderRegistration() function', () => {

        it('returns a multi provider', () => {

            const x = eagerProviderRegistration('bla');

            expect(x).toBeDefined();

        });

    });

});
