import { Injector, NgModule } from '@angular/core';

import { EAGER_PROVIDER } from './eager-provider.token';

@NgModule()
export class EagerProviderLoaderModule {

	constructor(injector: Injector) {
		// Obtain the set of tokens for the providers which need to be loaded eagerly.
		const eagerProviderTokens: any[] = injector.get(EAGER_PROVIDER, []);

		// Use injector to get each of the providers, which will force them to be instantiated.
		eagerProviderTokens.forEach(injector.get.bind(injector));
	}

}
