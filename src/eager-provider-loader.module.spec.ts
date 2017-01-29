import { Injectable, Injector, NgModule } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';

import { eagerProvider } from './eager-provider-functions';
import { EagerProviderLoaderModule } from './eager-provider-loader.module';

let testProviderInitialized: number;

@Injectable()
class TestProvider {

    constructor() {
        testProviderInitialized++;
    }

}

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [ ...eagerProvider(TestProvider) ]
})
class TestModuleA {

}

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [ ...eagerProvider(TestProvider) ]
})
class TestModuleB {

}

describe('eager provider loader module', () => {

    beforeEach(() => {
        testProviderInitialized = 0;
        TestBed.configureTestingModule({
            imports: [ TestModuleA, TestModuleB ]
        });
    });

    it('loads eager providers on application startup', inject([TestModuleA], () => {

        expect(testProviderInitialized).toBe(1);

    }));

    it('never loads a provider more than once', inject([Injector, TestModuleA, TestModuleB], (injector: Injector) => {

        const loader1 = new EagerProviderLoaderModule(injector);
        const loader2 = new EagerProviderLoaderModule(injector);

        expect(loader1).toBeDefined();
        expect(loader2).toBeDefined();
        expect(testProviderInitialized).toBe(1);

    }));

});
