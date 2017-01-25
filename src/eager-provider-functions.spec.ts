import { ClassProvider, Injectable, TypeProvider, ValueProvider } from '@angular/core';

import { eagerProvider, eagerProviderRegistration, eagerProviders } from './eager-provider-functions';

import { EAGER_PROVIDER } from './eager-provider.token';

describe('eagerProviderRegistration() function', () => {

    it('returns the correct provider', () => {

        const providerToken = 'SOME_PROVIDER';

        const provider = eagerProviderRegistration(providerToken);

        expect(provider).toBeDefined();
        expect((<ValueProvider> provider).provide).toBe(EAGER_PROVIDER);
        expect((<ValueProvider> provider).useValue).toBe(providerToken);
        expect((<ValueProvider> provider).multi).toBe(true);

    });

});

describe('eagerProvider() function', () => {

    it('returns the correct providers for type providers', () => {

        const providers = eagerProvider(SomeProvider);

        expect(providers).toBeDefined();
        expect(providers.length).toBe(2);
        expect(providers.some((p) => p === SomeProvider)).toBe(true);
        expect(providers.some((p: ValueProvider) => p.provide === EAGER_PROVIDER && p.useValue === SomeProvider && p.multi)).toBe(true);
    });

    it('returns the correct providers for token based providers', () => {

        const provider: ClassProvider = {
            provide: 'SOME_PROVIDER',
            useClass: SomeProvider
        };

        const providers = eagerProvider(provider);

        expect(providers).toBeDefined();
        expect(providers.length).toBe(2);
        expect(providers.some((p) => p === provider)).toBe(true);
        expect(providers.some((p: ValueProvider) =>
            p.provide === EAGER_PROVIDER && p.useValue === provider.provide && p.multi)).toBe(true);
    });

});

describe('eagerProviders() function', () => {

    it('supports an empty set of providers', () => {
        const providers = eagerProviders();
        expect(providers).toBeDefined();
        expect(providers.length).toBe(0);
    });

    it('supports a non-empty set of providers', () => {

        const provider1: ClassProvider = {
            provide: 'SOME_PROVIDER',
            useClass: SomeProvider
        };

        const provider2: TypeProvider = SomeProvider;

        const providers = eagerProviders(provider1, provider2);
        expect(providers).toBeDefined();
        expect(providers.length).toBe(4);
        expect(providers.some((p) => p === provider1)).toBe(true);
        expect(providers.some((p: ValueProvider) =>
            p.provide === EAGER_PROVIDER && p.useValue === provider1.provide && p.multi)).toBe(true);
        expect(providers.some((p) => p === provider2)).toBe(true);
        expect(providers.some((p: ValueProvider) =>
            p.provide === EAGER_PROVIDER && p.useValue === provider2 && p.multi)).toBe(true);
    });

});

@Injectable()
class SomeProvider {

}
