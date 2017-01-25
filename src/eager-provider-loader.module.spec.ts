import { Injectable, NgModule } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';

import { eagerProvider } from './eager-provider-functions';
import { EagerProviderLoaderModule } from './eager-provider-loader.module';

let testProviderInitialized = false;

@Injectable()
class TestProvider {

    constructor() {
        testProviderInitialized = true;
    }

}

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [ ...eagerProvider(TestProvider) ]
})
class TestModule {

}

describe('eager provider loader module', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ TestModule ]
        });
    });

    it('loads eager providers on application startup', inject([TestModule], () => {

        expect(testProviderInitialized).toBe(true);

    }));

});
