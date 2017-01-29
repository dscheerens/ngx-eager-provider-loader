import { Injectable, Injector } from '@angular/core';

import { EAGER_PROVIDER } from './eager-provider.token';

@Injectable()
export class EagerProviderLoaderService {

    private loadedProviders: Set<any> = new Set<any>();

    public loadProviders(injector: Injector): void {
        // Obtain the set of tokens for the providers which need to be loaded eagerly.
        const tokens: any[] = injector.get(EAGER_PROVIDER, []);

        // Filter out all tokens for the providers which have already been loaded.
        // Afterwards use the injector to get each of the remaining provider tokens.
        // This forces the corresponding providers to be instantiated.
        tokens
            .filter((token) => !this.loadedProviders.has(token))
            .forEach((token) => {
                injector.get(token);
                this.loadedProviders.add(token);
            });
    }

}
