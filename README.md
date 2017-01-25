[![Build Status](https://api.travis-ci.org/dscheerens/angular-eager-provider-loader.svg?branch=master)](https://travis-ci.org/dscheerens/angular-eager-provider-loader) [![NPM Version](https://img.shields.io/npm/v/angular-eager-provider-loader.svg)](https://www.npmjs.com/package/angular-eager-provider-loader)

# Eager provider / service loader for Angular 2+

This module for Angular 2+ enables your application to eager load providers if necessary.
By default Angular loads all providers in a lazy manner, i.e. only whenever they are used by other components or
services that are instantiated.
While this is actually a good thing and is desirable for the majority of the cases, sometimes you might have a valid
reason to have your provider(s) loaded directly.
This is the case in particular for providers that play an active role in your application, but are never referenced by
other components or providers.
For more information when this is useful and the rationale for this package see the following article: _(coming soon)_

## Installation

To use this module in your application, you first have to install the NPM package, which can be done using the following
command:

```
npm install angular-eager-provider-loader --save
```

When installed, this package provides an UMD bundle (`bundles/index.js`), that can be referenced from the module loader
used by your application.
For example when using [SystemJS](https://github.com/systemjs/systemjs/), add the following entries to the config file:

To the `map` option:
```
'angular-eager-provider-loader': 'node_modules/angular-eager-provider-loader/bundles/'
```

To the `packages` option:
```
'angular-eager-provider-loader': {
    main: 'index.js',
    defaultExtension: 'js'
}
```

## Usage

After having installed the NPM package and updated the configuring of the module loader, you can use module within your
Angular application.
To enable eager loading for your provider(s), first find the `@NgModule` class in which the provider should be loaded.
Usually this is the same module in which the provider is defined, however it could be different module if you want to
eagerly load a provider that is defined in another module which you cannot modify.

Once you've found the module in which the provider should be loaded, import the `EagerProviderLoaderModule`:

```TypeScript
import { EagerProviderLoaderModule } from 'angular-eager-provider-loader';

@NgModule({
    imports: [ EagerProviderLoaderModule ]
})
export class AppModule { /* ... */ }
```

By importing the `EagerProviderLoaderModule` your application will load all providers on startup that have been
registered as eagerly loaded providers.
Although not strictly necessary, it is best to import this module in every module in which you mark providers for eager
loading.
This improves the reusability of those modules, since they don't depend on other modules to import the
`EagerProviderLoaderModule`.

After having imported the `EagerProviderLoaderModule`, you need to define which providers you want to have loaded
eagerly.
This can be done using the following functions:

* `eagerProviderRegistration(token: any): Provider` - Registers a previously defined provider (usually defined in
another module) for eager loading.
The result is a `Provider` which you have to add the `providers` property of the `NgModule` decorator.
* `eagerProvider(provider: Provider): Provider[]` - Registers the specified provider and marks it for eager loading. The
result is an array consisting of two providers which need to be added to the `providers` property of the `NgModule`
decorator. Use this function if you simultaneously wish to define a new provider and have it loaded eagerly.
* `eagerProviders(...providers: Provider[]): Provider[]` - Accepts an arbitrary number of providers which will be
returned as an array of providers that are marked for eager loading.

An example usage for each of these functions is shown in the code example below:

```TypeScript
import { OtherModule, providerFromOtherModule } from './modules/other-module/index';

import { RouteLogger, MyService, AwesomeMyServiceImpl, AnotherCoolService, BadAssService } from './index';

import {
    EagerProviderLoaderModule,
    eagerProviderRegistration,
    eagerProvider,
    eagerProviders,
} from 'angular-eager-provider-loader';

@NgModule({
    imports: [
        OtherModule,
        EagerProviderLoaderModule
    ],
    providers: [
        // Mark the provider identified by the token `providerFromOtherModule` for eager loading.
        // Note that the provider is listed in the providers of the `OtherModule`, so we only have
        // to mark it for eager loading.
        eagerProviderRegistration(providerFromOtherModule),

        // Defines the provider `RouteLogger` and marks it for eager loading. Note that the expression
        // below is equivalent to: ...[RouterLogger, eagerProviderRegistration(RouterLogger)]
        ...eagerProvider(RouteLogger),

        // Defines three providers and marks them for eager loading.
        ...eagerProviders(
            { provide: MyService, useClass: AwesomeMyServiceImpl },
            AnotherCoolService,
            BadAssService
        )
    ]
})
export class AppModule { /* ... */ }
```

## Limitations

Providers that are defined in modules that are lazy loaded by themselves cannot be loaded eagerly with the current
version of this package.
If you mark any of such providers for eager loading within the lazy loaded module itself it will not have any effect.
However, if you mark a provider, defined in a lazy loaded module, for eager loading from within another module that is
loaded when the application is bootstrapped, then you will receive a dependency injection error.

I will look for a method to lift this restriction, such that future versions of the `angular-eager-provider-loader`
package can support lazy loaded modules.
However, if you ever run into this limitation, ask yourself whether it actually makes sense that the provider should
only be loaded when the module itself is loaded.
In most cases I expect that the provider must be loaded on application startup anyway.
If so, you can simply move the eager loading registration to the module that is being used to bootstrap the application
(or to another imported module).

## Troubleshooting

In case your service does not get loaded on application startup, check the following:

* You have marked the provider for eager loading with one of the following functions: `eagerProviderRegistration`,
`eagerProvider`, or `eagerProviders`.
* The provider must not be marked for eager loading in a module that is lazy loaded.
* At least one of the modules that gets loaded on application startup adds the `EagerProviderLoaderModule` to the import
list.
