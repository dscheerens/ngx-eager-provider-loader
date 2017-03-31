import { Inject, Injector, NgModule } from '@angular/core';

import { EagerProviderLoaderService } from './eager-provider-loader.service';
import { EAGER_PROVIDER } from './eager-provider.token';

function getEagerProviderLoaderService(injector: Injector): EagerProviderLoaderService {
    // Construct the injector stack from the current injector to the root injector.
    const injectorStack = [injector];
    while ((<any> injectorStack[injectorStack.length - 1]).parent) {
        injectorStack.push((<any> injectorStack[injectorStack.length - 1]).parent);
    }

    // Starting at the root injector, descent in the injector tree to find the first injector that provides the EagerProviderLoaderService.
    let loaderService: EagerProviderLoaderService = null;
    while (!loaderService && injectorStack.length) {
        loaderService = injectorStack.pop().get(EagerProviderLoaderService, null);
    }

    return loaderService;
}

function swallowUnused(...anything: any[]) {
    if (!anything) {
        anything = [];
    }
}

@NgModule({
    providers: [EagerProviderLoaderService]
})
export class EagerProviderLoaderModule {

    constructor(injector: Injector, @Inject(EAGER_PROVIDER) eagerProviderTokens: any[]) {

        swallowUnused(eagerProviderTokens);

        // Retrieve the eager provider loader service that is closest to the root injector.
        const eagerProviderLoaderService = getEagerProviderLoaderService(injector);

        // Load the providers marked for eager loading for the current injector.
        eagerProviderLoaderService.loadProviders(injector);
    }

}
