import { Provider } from '@angular/core';

import { EAGER_PROVIDER } from './eager-provider.token';

export function eagerProviderRegistration(token: any): Provider {
	return {
		provide: EAGER_PROVIDER,
		useValue: token,
		multi: true
	};
}

export function eagerProvider(provider: Provider): Provider[] {
	const token = (<any> provider).provide || provider;
	return [provider, eagerProviderRegistration(token)];
}

export function eagerProviders(...providers: Provider[]): Provider[] {
	return providers.map(eagerProvider).reduce((a, b) => a.concat(b));
}
