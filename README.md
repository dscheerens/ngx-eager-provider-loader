[![Build Status](https://api.travis-ci.org/dscheerens/angular-eager-provider-loader.svg?branch=master)](https://travis-ci.org/dscheerens/angular-eager-provider-loader) [![NPM Version](https://img.shields.io/npm/v/angular-eager-provider-loader.svg)](https://www.npmjs.com/package/angular-eager-provider-loader)

# Eager provider / service loader for Angular 2+

This module for Angular 2+ enables your application to eager load providers if necessary.
By default Angular loads all providers in a lazy manner, i.e. only whenever they are used by other components or
services that are instantiated.
While this is actually a good thing and is desirable for the majority of the cases, sometimes you might have a valid
reason to have your provider(s) loaded directly.
This is the case in particular for providers that play an active role in your application, but are never referenced by
other components or providers.
For more information when this is useful and the rationale for this package see the following article: [Eager loading in Angular 2](https://github.com/dscheerens/angular-eager-provider-loader/blob/master/eager-loading-in-angular-2.md)

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
        // below is equivalent to: ...[RouteLogger, eagerProviderRegistration(RouteLogger)]
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

### Ahead-of-Time (AoT) compilation support


Unfortunately when using AoT you cannot use function calls for the `@NgModule` metadata, hence it is not possible to use
the `eagerProvider*` functions to generate the eager provider registrations.
This means you'll have to define these registration entries manually in the providers list of your module.
To do so, first import the `EAGER_PROVIDER` token.
With this token you can register a provider for eager loading.
This is illustrated for the `UserService` in the following example:

```TypeScript
import { EagerProviderLoaderModule, EAGER_PROVIDER } from 'angular-eager-provider-loader';

import { UserService } from './shared/user.service';

@NgModule({
	imports: [ EagerProviderLoaderModule ],
	providers: [
		UserService,
		{ provide: EAGER_PROVIDER, useValue: UserService, multi: true }
	]
})
export class AppModule { /* ... */ }
```

Note that you have to define the provider twice: once as you would normally define it and once as the value of multi
provider for the `EAGER_PROVIDER` token.
If you omit the normal provider definition, then Angular will complain about not having a provider for whatever value
you specified in the `useValue` property.
It is important to use the `useValue` property and not the `useClass` property, since this will result in a runtime DI
error, which the eager provider loader cannot prevent.
Also make sure to always set the `multi` property to `true`.

### Lazy module loading support

The eager provider loader package has support for lazy loaded modules.
However, before using eager provider loading for lazy loaded modules ask yourself whether it actually makes sense that
the provider should only be loaded when the module itself is loaded.
In most cases I expect that the provider must be loaded on application startup anyway.
If so, you can simply move the eager loading registration to the module that is being used to bootstrap the application
(or to another imported module).

If you still feel that you need eager provider loading for a lazy loaded module, then you can use it in the same way as
you would for modules that get loaded on application startup.
Just don't forget to import the `EagerProviderLoaderModule` within these lazy loaded modules.

Note that there is a small difference for eager loaded providers compared to normal providers which are defined in lazy
loaded modules.
Normal providers for lazy loaded modules might be instantiated multiple times by Angular itself, e.g. when changing
routes back and forth to lazy loaded routes.
The eager provider loader, however, makes sure that providers marked for eager loading within these lazy loaded modules
will only be instantiated once.

## Troubleshooting

In case your service does not get loaded on application startup, check the following:

* You have marked the provider for eager loading with one of the following functions: `eagerProviderRegistration`,
`eagerProvider`, or `eagerProviders`.
When using AoT, instead of these functions, add a multi provider for the `EAGER_PROVIDER` token.
* If you manually mark a provider for eager loading, either using the `eagerProviderRegistration` function or the
`EAGER_PROVIDER` token, make sure that provider itself is also added to the providers list of the module (or imported
modules).
* The provider is marked for eager loading in a lazy loaded module that simply hasn't been loaded yet.
* At least one of the modules that gets loaded on application startup adds `EagerProviderLoaderModule` to the import
list.
If you use lazy loaded modules, then those also need to import `EagerProviderLoaderModule`.
